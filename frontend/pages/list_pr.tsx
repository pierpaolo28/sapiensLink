import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SuggestionCard from '@/components/SuggestionCard';
import { Box, Button, TextField, Typography } from '@mui/material';
import { Container } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';


import AppLayout from "@/components/AppLayout";
import { ListPrPageResponse, EditComment } from '@/utils/types';
import { getUserIdFromAccessToken } from "@/utils/auth";


const ListPrPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [listData, setListData] = useState<ListPrPageResponse | null>(null);
  const [newSuggestionText, setNewSuggestionText] = useState('');
  const [commentsMap, setCommentsMap] = useState<Map<number, EditComment[]>>(new Map());
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);

  useEffect(() => {
    if (listData) {
      // Create a mapping of suggestion IDs to comments
      const newCommentsMap = new Map();
      listData.pr_comments.forEach((comment) => {
        const commentsForSuggestion = newCommentsMap.get(comment.edit_suggestion) || [];
        newCommentsMap.set(comment.edit_suggestion, [...commentsForSuggestion, comment]);
      });
      setCommentsMap(newCommentsMap);
    }
  }, [listData]);

  const fetchData = async () => {
    const accessToken = localStorage.getItem('access_token');
    // Fetch the data for the list when the component mounts and when the id changes
    fetch(`http://localhost/api/list_pr_page/${id}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      }
    })
      .then(response => response.json())
      .then(data => setListData(data))
      .catch(error => console.error('Error fetching list data:', error));
  }

  useEffect(() => {
    if (id) {
        fetchData()
    }
  }, [id]);

  const handleAcceptSuggestion = async (suggestionId: any) => {
    const accessToken = localStorage.getItem('access_token');
    
    try {
      const response = await fetch(`http://localhost/api/approve_suggestion_action/${suggestionId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          // Include other headers if required by your API
        },
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      console.log(`Suggestion ${suggestionId} accepted.`);
      fetchData()
  
    } catch (error) {
      console.error('Error accepting suggestion:', error);
    }
  };
  
  const handleRejectSuggestion = async (suggestionId: any) => {
    const accessToken = localStorage.getItem('access_token');
    
    try {
      const response = await fetch(`http://localhost/api/decline_suggestion_action/${suggestionId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          // Include other headers if required by your API
        },
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      console.log(`Suggestion ${suggestionId} rejected.`);
      fetchData()
  
    } catch (error) {
      console.error('Error rejecting suggestion:', error);
    }
  };
  

  const handleNewSuggestionSubmit = async () => {
    const accessToken = localStorage.getItem('access_token');
    const payload = {
      edit_suggestion: {
        list: id,
        suggested_by: getUserIdFromAccessToken(),
        suggestion_text: newSuggestionText,
      },
    };

    try {
      const response = await fetch(`http://localhost/api/list_pr_page/${id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Clear the form and reload the suggestions
      setNewSuggestionText('');
      fetchData()
    } catch (error) {
      console.error('Error submitting new suggestion:', error);
    }
  };

  const handleNewCommentSubmit = async (commentText: string, suggestionId: number) => {
    const accessToken = localStorage.getItem('access_token');
    const payload = {
      comment: {
        text: commentText,
        edit_suggestion: suggestionId,
        commenter: getUserIdFromAccessToken(),
      },
    };

    try {
      const response = await fetch(`http://localhost/api/list_pr_page/${id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Clear the form and reload the comments
      fetchData()
    } catch (error) {
      console.error('Error submitting new comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    const accessToken = localStorage.getItem('access_token');
    
    try {
      const response = await fetch(`http://localhost/api/delete_pr_comment_action/${commentId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      // Update the commentsMap to remove the deleted comment
      setCommentsMap((prevCommentsMap) => {
        const newCommentsMap = new Map(prevCommentsMap);
        newCommentsMap.forEach((comments, suggestionId) => {
          const filteredComments = comments.filter((comment) => comment.id !== commentId);
          newCommentsMap.set(suggestionId, filteredComments);
        });
        return newCommentsMap;
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const goToNextSuggestion = () => {
    setCurrentSuggestionIndex((prevIndex) => 
      prevIndex < listData!.suggestions.length - 1 ? prevIndex + 1 : prevIndex
    );
  };

  const goToPreviousSuggestion = () => {
    setCurrentSuggestionIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
  };
  

  if (!listData) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <AppLayout>
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Typography variant="h4" gutterBottom>
        Edit Suggestions for List {listData.list.name}
      </Typography>
      <Typography variant="h4" gutterBottom>
                                        Suggestion {currentSuggestionIndex + 1}
                                    </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Button
          onClick={goToPreviousSuggestion}
          disabled={currentSuggestionIndex === 0}
          sx={{ marginRight: 'auto' }}
        >
          <ArrowBackIosIcon />
        </Button>
        {listData && listData.suggestions.length > 0 && (
        <SuggestionCard
          key={listData.suggestions[currentSuggestionIndex].id}
          suggestion={listData.suggestions[currentSuggestionIndex]}
          oldContent={listData.list.content}
          comments={commentsMap.get(listData.suggestions[currentSuggestionIndex].id) || []}
          onAccept={handleAcceptSuggestion}
          onReject={handleRejectSuggestion}
          onSubmitComment={handleNewCommentSubmit}
          onDeleteComment={handleDeleteComment}
          currentUserId={getUserIdFromAccessToken()}
        />
      )}
      <Button
          onClick={goToNextSuggestion}
          disabled={currentSuggestionIndex === listData.suggestions.length - 1}
          sx={{ marginLeft: 'auto' }}
        >
          <ArrowForwardIosIcon />
        </Button>
      </Box>
      <TextField
        label="New Suggestion"
        variant="outlined"
        fullWidth
        value={newSuggestionText}
        onChange={(e) => setNewSuggestionText(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" color="primary" onClick={handleNewSuggestionSubmit}>
        Submit Suggestion
      </Button>
      </Container>
    </AppLayout>
  );
};

export default ListPrPage;
