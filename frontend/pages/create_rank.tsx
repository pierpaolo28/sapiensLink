import * as React from "react";
import DOMPurify from "dompurify";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import IconButton from "@mui/material/IconButton";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import Select from "@mui/material/Select";
import { SelectChangeEvent } from "@mui/material/Select";

import AppLayout from "@/components/AppLayout";
import { CreateRankFormData, ContentItem } from "@/utils/types";
import { getUserIdFromAccessToken, isUserLoggedIn } from "@/utils/auth";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
// Dynamically import ReactQuill only on the client side
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const CreateRankForm = () => {
  const [selectedTopics, setSelectedTopics] = React.useState<string[]>([]);
  const [elements, setElements] = React.useState<string[]>([""]);
  const [formData, setFormData] = React.useState<CreateRankFormData>({
    name: "",
    description: "",
    topic: [],
    contributors: [],
    content: {},
  });
  const [error, setError] = React.useState<string | null>(null);
  const [currentElement, setCurrentElement] = React.useState("");
  const [editingElementIndex, setEditingElementIndex] = React.useState<
    number | null
  >(null);
  const [currentEditedElement, setCurrentEditedElement] = React.useState("");

  React.useEffect(() => {
    // Check if the user is logged in
    if (!isUserLoggedIn()) {
      // Redirect to the sign-in page
      window.location.href = "/signin";
    }
  }, [formData]);

  const handleTopicChange = (event: SelectChangeEvent<string[]>) => {
    const selectedTopicsData = (event.target.value as string[]).map(
      (topicName) => ({ name: topicName })
    );
    setSelectedTopics(event.target.value as string[]);
    handleFormChange("topic", selectedTopicsData);
  };

  const handleFormChange = (field: keyof CreateRankFormData, value: any) => {
    if (field === "name") {
      const contributorsArray = [getUserIdFromAccessToken()];
      setFormData((prevData) => ({
        ...prevData,
        name: value,
        contributors: contributorsArray,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [field]: value,
      }));
    }
  };

  const removeElement = (indexToRemove: number) => {
    const newElements = elements.filter((_, index) => index !== indexToRemove);

    const newContent: { [key: string]: ContentItem } = {};
    newElements.forEach((element, index) => {
      // Skip adding elements with empty content
      if (element.trim() !== "") {
        const key = String.fromCharCode("a".charCodeAt(0) + index);
        newContent[key] = {
          element: element,
          user_id: getUserIdFromAccessToken(),
        };
      }
    });

    setElements(newElements);
    handleFormChange("content", newContent);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Reset error state on each submission attempt
    setError(null);

    // Check if the mandatory fields are filled
    if (formData.name && formData.topic && formData.topic.length > 0) {
      try {
        const accessToken = localStorage.getItem("access_token");
        const response = await fetch("http://localhost/api/create_rank_page/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          window.location.href = "/rank_home";
        } else {
          // Handle server-side errors
          const responseData = await response.json();

          if (responseData.error) {
            if (responseData.error === "Similar ranks found") {
              // Display a user-friendly error message for similar ranks
              setError(
                `Similar ranks found. Please check the existing ranks: ${responseData.similar_ranks
                  .map(
                    (rank: any) =>
                      "<a key=" +
                      rank.id +
                      ' href="/rank/' +
                      rank.id +
                      '">' +
                      rank.name +
                      "</a>"
                  )
                  .join(", ")}`
              );
            } else {
              setError(responseData.message || "Failed to submit the form");
            }
          } else {
            let errorMessage = "";

            if (responseData.name) {
              errorMessage += responseData.name + " ";
            }

            if (responseData.description) {
              errorMessage += responseData.description + " ";
            }

            if (responseData.content) {
              errorMessage += responseData.content + " ";
            }

            if (errorMessage) {
              setError(errorMessage);
            } else {
              setError("Failed to submit the form");
            }
          }
        }
      } catch (error) {
        console.error("Error submitting the form", error);
        setError("An unexpected error occurred.");
      }
    } else {
      setError("Please fill in all mandatory fields (Name and Topic).");
    }
  };

  const handleQuillKeyDown = (event: any) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addElement();
    }
  };

  const handleEditQuillKeyDown = (event: any, index: any) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveEditedElement(index);
    }
  };

  const addElement = () => {
    if (currentElement.trim() !== "") {
      // Sanitize the input
      let sanitizedElement = currentElement
        .replace(/<br>/g, "")
        .replace(/<\/p><p>/g, "")
        .replace(/<p><br><\/p>$/, "");

      // Add the element to the elements array
      const newElements = [...elements, sanitizedElement];
      setElements(newElements);
      setCurrentElement("");

      // Update formData.content with the new element
      const newContent = { ...formData.content };
      const key = String.fromCharCode("a".charCodeAt(0) + elements.length); // Calculate the next key based on the length of the elements array

      newContent[key] = {
        element: sanitizedElement,
        user_id: getUserIdFromAccessToken(),
      };

      // Update the formData state
      handleFormChange("content", newContent);
    } else {
      // Handle the case where the element is empty
      alert("Please enter some text before adding an element.");
    }
  };

  const saveEditedElement = (index: any) => {
    if (currentEditedElement.trim() !== "") {
      // Sanitize the input
      let sanitizedElement = currentEditedElement
        .replace(/<br>/g, "")
        .replace(/<\/p><p>/g, "")
        .replace(/<p><br><\/p>$/, "");

      // Update the elements array
      const newElements = [...elements];
      newElements[index] = sanitizedElement;
      setElements(newElements);

      // Update the content object
      const newContent = { ...formData.content };
      const key = String.fromCharCode("a".charCodeAt(0) + index); // Use the existing key for the element being edited

      newContent[key] = {
        element: sanitizedElement,
        user_id: getUserIdFromAccessToken(),
      };

      // Update the formData state
      handleFormChange("content", newContent);
      // Exit the editing mode
      setEditingElementIndex(null);
      setCurrentEditedElement("");
    } else {
      // Handle the case where the edited element is empty
      alert("Please enter some text to save the edited element.");
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create Rank
        </Typography>
        {error && (
          <Typography
            variant="body1"
            color="error"
            gutterBottom
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(error) }}
          />
        )}
        <Box
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <TextField
            required
            fullWidth
            id="name"
            label="Name"
            margin="normal"
            variant="outlined"
            value={formData.name}
            onChange={(e) => handleFormChange("name", e.target.value)}
          />
          <TextField
            fullWidth
            id="description"
            label="Description"
            multiline
            rows={4}
            placeholder="Enter description..."
            margin="normal"
            variant="outlined"
            value={formData.description}
            onChange={(e) => handleFormChange("description", e.target.value)}
          />
          <div style={{ marginBottom: "10px" }}>
            <InputLabel id="content-label">Content</InputLabel>
          </div>
          <Box
            sx={{ display: "flex", alignItems: "center", mt: 2, width: "100%" }}
          >
            <Box sx={{ flexGrow: 1, mr: 1 }}>
              {" "}
              {/* flexGrow allows the box to expand, mr adds some margin to the right */}
              <ReactQuill
                value={currentElement}
                onChange={setCurrentElement}
                onKeyDown={handleQuillKeyDown}
                theme="snow"
                modules={{
                  toolbar: [
                    ["bold", "italic", "underline", "strike"],
                    ["link"],
                  ],
                }}
              />
            </Box>
            <IconButton
              onClick={addElement}
              color="primary"
              aria-label="add"
              sx={{ flexShrink: 0 }}
            >
              {" "}
              {/* flexShrink ensures the button doesn't shrink */}
              <AddCircleOutlineIcon />
            </IconButton>
          </Box>

          {/* Elements list */}
          {elements.map(
            (element, index) =>
              element && (
                <Box
                  key={index}
                  sx={{ display: "flex", alignItems: "center", mt: 2 }}
                >
                  {editingElementIndex === index ? (
                    <>
                      <Box sx={{ flexGrow: 1, mr: 1 }}>
                        <ReactQuill
                          value={currentEditedElement}
                          onChange={(value) => setCurrentEditedElement(value)}
                          onKeyDown={(event) =>
                            handleEditQuillKeyDown(event, index)
                          }
                          theme="snow"
                          modules={{
                            toolbar: [
                              ["bold", "italic", "underline", "strike"],
                              ["link"],
                            ],
                          }}
                        />
                      </Box>
                      <IconButton
                        onClick={() => saveEditedElement(index)}
                        color="primary"
                      >
                        <CheckIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <Box
                        sx={(theme) => ({
                          flexGrow: 1,
                          mr: 1,
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.1)"
                              : "rgba(0,0,0,0.03)",
                          px: 1,
                          borderRadius: 1,
                        })}
                      >
                        <Typography
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(element),
                          }}
                        />
                      </Box>
                      <IconButton
                        onClick={() => {
                          setCurrentEditedElement(element);
                          setEditingElementIndex(index);
                        }}
                        color="default"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => removeElement(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </Box>
              )
          )}
          <FormControl
            required
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{ mt: 2 }}
          >
            <InputLabel id="topic-label">Topic</InputLabel>
            <Select
              labelId="topic-label"
              id="topic"
              multiple
              value={selectedTopics}
              onChange={handleTopicChange}
            >
              <MenuItem value="topic1">Topic 1</MenuItem>
              <MenuItem value="topic2">Topic 2</MenuItem>
              {/* ... other topics */}
            </Select>
          </FormControl>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button variant="outlined" color="error" href="/rank_home">
              Cancel
            </Button>
            <Button variant="contained" color="primary" type="submit">
              Submit
            </Button>
          </Box>
        </Box>
      </Container>
    </AppLayout>
  );
};

export default CreateRankForm;
