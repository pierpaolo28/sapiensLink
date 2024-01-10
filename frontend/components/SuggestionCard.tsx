import React, { useState } from 'react';
import { diffWords } from 'diff';
import { Card, CardContent, CardActions, Button, Typography, Box, TextField, IconButton, List, ListItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCommentIcon from '@mui/icons-material/AddComment';

import {Suggestion, EditComment} from "@/utils/types"
  
  interface SuggestionCardProps {
    suggestion: Suggestion;
    oldContent: string,
    comments: EditComment[];
    onAccept: (id: number) => void;
    onReject: (id: number) => void;
    onSubmitComment: (commentText: string, suggestionId: number) => void;
    onDeleteComment: (commentId: number) => void;
    currentUserId: number;
  }

  const renderDifferences = (oldText: any, newText: any) => {
    const diffResult = diffWords(oldText, newText);
    return (
      <Box component="div" sx={{ display: 'flex', flexDirection: 'column' }}>
        {diffResult.map((part, index) => {
          const added = part.added ? { backgroundColor: '#ddffdd', display: 'inline' } : {};
          const removed = part.removed ? { backgroundColor: '#ffdddd', display: 'inline', textDecoration: 'line-through' } : {};
          
          return (
            <Box key={index} sx={{ ...added, ...removed }}>
              {part.value}
            </Box>
          );
        })}
      </Box>
    );
  };

  const SuggestionCard: React.FC<SuggestionCardProps> = ({
    suggestion,
    oldContent,
    comments,
    onAccept,
    onReject,
    onSubmitComment,
    onDeleteComment,
    currentUserId,
  }) => {

  // Function to render the comments list
  const renderCommentsList = () => {
    return (
      <List>
        {comments.map((comment) => (
          <ListItem key={comment.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>{comment.text}</Typography>
            {currentUserId === comment.commenter && (
              <IconButton edge="end" aria-label="delete" onClick={() => onDeleteComment(comment.id)}>
                <DeleteIcon />
              </IconButton>
            )}
          </ListItem>
        ))}
      </List>
    );
  };

    const [commentText, setCommentText] = useState('');

  return (

<Card raised sx={{ my: 4 }}>
<CardContent>
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
    <Box sx={{ width: '48%' }}>
      <Typography variant="h6" gutterBottom>Old List</Typography>
      <div dangerouslySetInnerHTML={{ __html: oldContent }} />
    </Box>
    <Box sx={{ width: '48%' }}>
      <Typography variant="h6" gutterBottom>New List</Typography>
      <Typography>{suggestion.suggestion_text}</Typography>
    </Box>
  </Box>
  <Typography variant="h6" gutterBottom>Differences</Typography>
  {/* Render the differences */}
  <Box sx={{ backgroundColor: '#f0f0f0', padding: 2 }}>{renderDifferences(oldContent, suggestion.suggestion_text)}</Box>
  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
    <Button variant="contained" color="primary" onClick={() => onAccept(suggestion.id)}>
      Accept
    </Button>
    <Button variant="contained" color="secondary" onClick={() => onReject(suggestion.id)}>
      Reject
    </Button>
  </Box>
  <Typography variant="h6" gutterBottom>Comments</Typography>
  {/* Render the comments list */}
  {renderCommentsList()}
  {/* Input for new comment */}
  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment"
            // ... other props for the TextField
          />
          <IconButton
            color="primary"
            onClick={(event) => {
              event.preventDefault();
              onSubmitComment(commentText, suggestion.id);
              setCommentText(''); // Clear the input after submitting
            }}
          >
            <AddCommentIcon />
          </IconButton>
        </Box>
</CardContent>
</Card>
  );
};

export default SuggestionCard;


