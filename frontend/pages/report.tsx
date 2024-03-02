import React, { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import AppLayout from "@/components/AppLayout";
import { getUserIdFromAccessToken } from "@/utils/auth";

const ReportForm = () => {
  const [reportDescription, setReportDescription] = useState("");
  const [itemType, setItemType] = useState("");
  const [itemId, setItemId] = useState("");

  useEffect(() => {
    // Extract item type and ID from the previous URL
    const previousUrl = document.referrer;
    const url = new URL(previousUrl);

    let extractedItemType = "";
    let extractedItemId = "";

    if (url.pathname.includes("/rank")) {
      extractedItemType = "rank";
    } else if (url.pathname.includes("/list")) {
      extractedItemType = "list";
    } else {
      extractedItemType = "unknown";
    }

    const urlParams = new URLSearchParams(url.search);
    const idParam = urlParams.get("id");

    if (idParam) {
      extractedItemId = idParam;
    }

    setItemType(extractedItemType);
    setItemId(extractedItemId);
  }, []);

  const handleReportSubmit = async () => {
    try {
      // Fetch the item ID from the current URL
      const accessToken = localStorage.getItem("access_token");
      const userId = getUserIdFromAccessToken();

      if (itemType == "rank") {
        // Perform the API call directly in the component
        await fetch(`http://localhost/api/report_rank_page/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            reason: reportDescription,
            rank: itemId,
            user: userId,
          }),
        });
        window.location.href = "/rank_home";
      } else if (itemType == "list") {
        // Perform the API call directly in the component
        await fetch(`http://localhost/api/report_list_page/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            reason: reportDescription,
            rank: itemId,
            user: userId,
          }),
        });
        window.location.href = "/list_home";
      } else {
        console.error("Wrong item type");
      }
    } catch (error) {
      // Handle errors or show an error message to the user
      console.error("Error submitting report:", error);
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="sm" sx={{ px: 0, pt: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Report form for: TODO
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          TODO: Write Community conditions for valid report
        </Typography>
        <Box component="form" noValidate autoComplete="off">
          <TextField
            fullWidth
            id="report-reason"
            label="Report Description"
            multiline
            rows={4}
            placeholder="Describe the issue..."
            margin="normal"
            variant="outlined"
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
          />
          <Box mt={2}>
            <Button
              size={"large"}
              variant="contained"
              color="primary"
              onClick={handleReportSubmit}
            >
              Report
            </Button>
          </Box>
        </Box>
      </Container>
    </AppLayout>
  );
};

export default ReportForm;
