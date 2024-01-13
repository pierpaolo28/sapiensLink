import React, { useState, useEffect } from 'react';
import { TextField, FormControlLabel, Switch } from '@mui/material';

interface BulletNumberTextAreaProps {
    onContentChange: (content: string) => void;
  }

  const BulletNumberTextArea: React.FC<BulletNumberTextAreaProps> = ({ onContentChange }) => {
    const [rawText, setRawText] = useState(''); // Stores the unformatted text
    const [isNumbered, setIsNumberedLocal] = useState(false);

    useEffect(() => {
        onContentChange(formatText(rawText, isNumbered)); // Call the callback whenever the content changes
      }, [rawText, isNumbered, onContentChange]);


    const formatText = (inputText: any, applyNumbering: any) => {
        let lines = inputText.split(/\r?\n/);
        lines = lines.filter((line: any) => line.trim() !== ''); // Remove empty lines

        // Regular expression to match URLs (HTTP or HTTPS)
        const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;

        let formattedLines = [];
        let currentNumber = 1; // Initialize the currentNumber

        for (let i = 0; i < lines.length; i++) {
            if (urlRegex.test(lines[i])) {
                // If it's a URL, add it to the previous line
                formattedLines[formattedLines.length - 1] += ` ${lines[i]}`;
            } else {
                // If it's not a URL, add bullet or number with a single space and start a new line
                const formattedLine = applyNumbering ? `${currentNumber}. ${lines[i].trim()}` : `• ${lines[i].trim()}`;
                formattedLines.push(formattedLine);
                currentNumber++; // Increment the currentNumber
            }
        }

        return formattedLines.join('\n');
    };

    const handleInputChange = (event: any) => {
        event.preventDefault();
    };


    const handlePaste = (event: any) => {
        event.preventDefault();
        let pastedText = event.clipboardData.getData('text');

        // Remove pre-existing bullet points and numbers
        const bulletPointRegex = /^[*-]\s+/gm; // Matches bullet points like '* ' or '- '
        const numberedListRegex = /^\d+\.\s+/gm; // Matches numbered list like '1. '

        // Replace bullet points and numbers with empty strings
        pastedText = pastedText.replace(bulletPointRegex, '');
        pastedText = pastedText.replace(numberedListRegex, '');

        setRawText(pastedText);
    };


    const handleFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsNumberedLocal(event.target.checked); // Update local state
      };

    return (
        <div>
            <FormControlLabel
                control={
                    <Switch
                        checked={isNumbered}
                        onChange={handleFormatChange}
                        name="numberedFormat"
                        color="primary"
                    />
                }
                label={isNumbered ? "Numbered List" : "Bulleted List"}
            />
            <TextField
                multiline
                fullWidth
                variant="outlined"
                value={formatText(rawText, isNumbered)} // Apply formatting when rendering
                onChange={handleInputChange}
                onPaste={handlePaste}
                placeholder="Paste list here..."
            />

        </div>
    );
};

export default BulletNumberTextArea;
