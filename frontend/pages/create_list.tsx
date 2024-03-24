import React, { useEffect, useState, ChangeEvent } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { SelectChangeEvent } from "@mui/material/Select";
import { Switch } from "@mui/material";
import { EditorState, RichUtils, convertToRaw, convertFromRaw, DraftEditorCommand, DraftHandleValue, ContentBlock } from "draft-js";
import "draft-js/dist/Draft.css";
import { getDefaultKeyBinding, KeyBindingUtil } from 'draft-js';
const { hasCommandModifier } = KeyBindingUtil;
import { AtomicBlockUtils } from 'draft-js';
import createImagePlugin from "draft-js-image-plugin";
import Editor from "draft-js-plugins-editor";
import { Resizable } from "react-resizable";


const imagePlugin = createImagePlugin();
import createResizeablePlugin from 'draft-js-resizeable-plugin';
const resizeablePlugin = createResizeablePlugin();
const plugins = [imagePlugin, resizeablePlugin];

import AppLayout from "@/components/AppLayout";
import { getUserIdFromAccessToken, isUserLoggedIn } from "@/utils/auth";
import { ListForm } from "@/utils/types";
import { topics } from "@/utils/topics";
import { isValidListContent, convertQuillContentToHtml } from "@/utils/html";

export default function CreateListPage() {
  const [listDetails, setListDetails] = useState<ListForm>({
    name: "",
    description: "",
    content: "",
    source: "",
    public: true,
    topic: [],
  });
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorState, setEditorState] = useState(
    EditorState.createEmpty()
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");

    if (!isUserLoggedIn()) {
      window.location.href = "/signin";
    }

    if (id) {
      fetchListData(id);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchListData = async (id: string) => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/update_list_page/${id}/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setListDetails({
          name: data.name,
          description: data.description,
          content: data.content,
          source: data.source,
          public: data.public,
          topic: data.topic.map((topic: any) => topic.name),
        });
        setEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(data.content))));
        setIsUpdateMode(true);
      } else {
        console.error(
          "Error fetching list data:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error fetching list data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyCommand = (
    command: DraftEditorCommand | string,
    editorState: EditorState,
    handleEditorChange: (editorState: EditorState) => void
  ): DraftHandleValue => {
    let newState;
    if (command === "insert-image") {
      console.log("Insert image command");
      // Handle image insertion here
      handleInsertImage();
      return "handled"; // We handle image insertion separately, so we return 'handled'
    }
    else if (command === "toggle-bullet-list") {
      newState = RichUtils.toggleBlockType(editorState, "unordered-list-item");
    } else if (command === "toggle-numbered-list") {
      newState = RichUtils.toggleBlockType(editorState, "ordered-list-item");
    } else {
      newState = RichUtils.handleKeyCommand(editorState, command as DraftEditorCommand);
    }

    if (newState) {
      handleEditorChange(newState);
      return "handled";
    }

    return "not-handled";
  };

  const handleEditorChange = (editorState: EditorState) => {
    setEditorState(editorState);
    const contentState = editorState.getCurrentContent();
    setListDetails((prevDetails) => ({
      ...prevDetails,
      content: JSON.stringify(convertToRaw(contentState)),
    }));
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = event.target;
    setListDetails((prevDetails) => ({
      ...prevDetails,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTopicChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setListDetails((prevDetails) => ({
      ...prevDetails,
      topic: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    let contentHtml: string = listDetails.content;

    // Validate content
    // if (!isValidListContent(listDetails.content)) {
    //   setError("Content must be in bullet or numbered list format.");
    //   return;
    // }
    contentHtml = listDetails.content;

    if (listDetails.name && listDetails.topic && listDetails.topic.length > 0) {
      try {
        const accessToken = localStorage.getItem("access_token");
        let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/create_list_page`;

        if (isUpdateMode) {
          const urlParams = new URLSearchParams(window.location.search);
          const id = urlParams.get("id");
          url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/update_list_page/${id}/`;
        }

        const updatedListDetails = {
          ...listDetails,
          content: contentHtml,
          participants: [getUserIdFromAccessToken()],
          topic: listDetails.topic.map((topicName) => ({ name: topicName })),
        };
        const response = await fetch(url, {
          method: isUpdateMode ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(updatedListDetails),
        });

        if (response.ok) {
          window.location.href = "/list_home";
        } else {
          const responseData = await response.json();

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
      } catch (error) {
        console.error("Error creating/updating list:", error);
        setError("An unexpected error occurred.");
      }
    } else {
      setError(
        "Please fill in all mandatory fields (Name, Content, and Topic)."
      );
    }
  };

  const handleBulletList = () => {
    const newState = RichUtils.toggleBlockType(editorState, 'unordered-list-item');
    handleEditorChange(newState);
  };

  const handleNumberedList = () => {
    const newState = RichUtils.toggleBlockType(editorState, 'ordered-list-item');
    handleEditorChange(newState);
  };

  const handleInsertImage = () => {
    const url = prompt("Enter the URL of the image:");
    if (url) {
      const contentState = editorState.getCurrentContent();
      const contentStateWithEntity = contentState.createEntity(
        "image",
        "IMMUTABLE",
        { src: url }
      );
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
      const newEditorState = EditorState.push(
        editorState,
        contentStateWithEntity,
        'insert-characters'
      );
      setEditorState(AtomicBlockUtils.insertAtomicBlock(
        newEditorState,
        entityKey,
        " "
      ));
    }
  };

  const Media = (props: { block: any }) => {
    const { block } = props;
    const contentState = editorState.getCurrentContent();
    const entity = contentState.getEntity(block.getEntityAt(0));
    const { src } = entity.getData();
  
    const [width, setWidth] = useState<number | string>('auto');
    const [height, setHeight] = useState<number | string>('auto');
  
    const onResize = (event: any, { size }: any) => {
      setWidth(size.width);
      setHeight(size.height);
    };
  
    // Define inline styles for the resizable image
    const imageStyle: React.CSSProperties = {
      maxWidth: '100%',
      maxHeight: '100%',
      width: width === 'auto' ? 'auto' : `${width}px`,
      height: height === 'auto' ? 'auto' : `${height}px`,
      cursor: 'pointer', // Add cursor pointer for resize
      margin: '0 auto', // Center the image horizontally
      objectFit: 'contain', // Maintain aspect ratio while resizing
    };
  
    return (
      <Resizable
        width={Number(width)}
        height={Number(height)}
        onResize={onResize}
        draggableOpts={{ enableUserSelectHack: false }}
      >
        <img src={src} style={imageStyle} />
      </Resizable>
    );
  };
  

  const blockRenderer = (contentBlock: ContentBlock) => {
    const type = contentBlock.getType();
    if (type === 'atomic') {
      const entityKey = contentBlock.getEntityAt(0);
      if (!entityKey) return null;
      const entity = editorState.getCurrentContent().getEntity(entityKey);
      if (entity.getType() === 'IMAGE') {
        return {
          component: Media,
          editable: false,
        };
      }
    }
    return null;
  };
  
  
  if (isLoading) {
    // Render a loading screen while fetching data
    return <div>Loading...</div>;
  }

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ p: 0, pt: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isUpdateMode ? "Update List" : "Create List"}
        </Typography>
        {error && (
          <Typography variant="body1" color="error" gutterBottom>
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={listDetails.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={4}
                value={listDetails.description}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Grid item xs={12}>
                <div>
                  <Button onClick={() => handleBulletList()} variant="outlined">Bullet List</Button>
                  <Button onClick={() => handleNumberedList()} variant="outlined">Numbered List</Button>
                  <Button onClick={() => handleInsertImage()} variant="outlined">Insert Image</Button>
                </div>
              </Grid>

              <div style={{ marginBottom: "10px" }}>
                <InputLabel id="content-label">Content *</InputLabel>
              </div>
              <FormControl fullWidth>
              <Editor
  editorState={editorState}
  onChange={handleEditorChange}
  plugins={plugins}
  blockRendererFn={blockRenderer}
  handleKeyCommand={(command: string, editorState: EditorState) => {
    if (command === 'toggle-bullet-list' || command === 'toggle-numbered-list') {
      handleKeyCommand(command, editorState, handleEditorChange);
      return 'handled';
    } else if (command === 'insert-image') { // Handle insert-image command
      handleInsertImage();
      return 'handled';
    }
    return 'not-handled';
  }}
  placeholder="Write something..."
/>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Source"
                name="source"
                value={listDetails.source}
                onChange={handleInputChange}
                placeholder="e.g., https://ppiconsulting.dev"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={listDetails.public}
                    onChange={handleInputChange}
                    name="public"
                  />
                }
                label="Public"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="topic-label">Topic *</InputLabel>
                <Select
                  labelId="topic-label"
                  id="topic-select"
                  multiple
                  value={listDetails.topic}
                  onChange={handleTopicChange}
                  name="topic"
                  renderValue={(selected) => selected.join(", ")}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 224,
                        width: 250,
                      },
                    },
                  }}
                >
                  {topics.map((topic) => (
                    <MenuItem key={topic.value} value={topic.value}>
                      {topic.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
            >
              <Button variant="outlined" color={"error"} href="/list_home">
                Cancel
              </Button>
              <Button variant="contained" color="primary" type="submit">
                {isUpdateMode ? "Update" : "Submit"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Container>
    </AppLayout>
  );
}





const styleMap = {
  CODE: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
};

function getBlockStyle(block: any) {
  switch (block.getType()) {
    case "blockquote":
      return "RichEditor-blockquote";
    default:
      return null;
  }
}