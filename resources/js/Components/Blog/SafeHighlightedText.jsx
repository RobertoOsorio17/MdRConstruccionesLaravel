import React from 'react';
import { Box } from '@mui/material';

/**
 * ✅ SECURITY FIX: Safe component for displaying highlighted search results
 * 
 * This component safely renders highlighted text without using dangerouslySetInnerHTML,
 * preventing XSS attacks while maintaining the highlighting functionality.
 * 
 * @param {string} text - The text to display
 * @param {string} highlightedText - The pre-highlighted text from backend (optional)
 * @param {string} query - The search query to highlight (optional)
 * @param {object} sx - MUI sx prop for styling
 */
const SafeHighlightedText = ({ text, highlightedText, query, sx = {} }) => {
    // If we have pre-highlighted text from backend, parse it safely
    if (highlightedText && highlightedText.includes('<mark')) {
        return <SafeHighlightParser html={highlightedText} sx={sx} />;
    }
    
    // If we have a query, highlight it client-side (safe)
    if (query && text) {
        return <ClientSideHighlight text={text} query={query} sx={sx} />;
    }
    
    // Otherwise, just render the text
    return <Box component="span" sx={sx}>{text}</Box>;
};

/**
 * Safely parse backend-highlighted HTML by extracting only <mark> tags
 */
const SafeHighlightParser = ({ html, sx }) => {
    // Extract text and mark positions from HTML
    const parts = [];
    let currentIndex = 0;
    const markRegex = /<mark[^>]*>(.*?)<\/mark>/gi;
    let match;
    
    // Create a temporary div to safely extract text content
    const tempDiv = document.createElement('div');
    tempDiv.textContent = html; // This escapes any HTML
    const safeText = tempDiv.textContent;
    
    // Now parse the original HTML for mark tags
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const textContent = doc.body.textContent || '';
    
    // Find all mark elements
    const marks = doc.querySelectorAll('mark');
    const markedTexts = Array.from(marks).map(mark => mark.textContent);
    
    // Build parts array with highlighted sections
    let searchFrom = 0;
    markedTexts.forEach(markedText => {
        const index = textContent.indexOf(markedText, searchFrom);
        if (index !== -1) {
            // Add text before mark
            if (index > searchFrom) {
                parts.push({
                    text: textContent.substring(searchFrom, index),
                    highlighted: false
                });
            }
            // Add marked text
            parts.push({
                text: markedText,
                highlighted: true
            });
            searchFrom = index + markedText.length;
        }
    });
    
    // Add remaining text
    if (searchFrom < textContent.length) {
        parts.push({
            text: textContent.substring(searchFrom),
            highlighted: false
        });
    }
    
    return (
        <Box component="span" sx={sx}>
            {parts.map((part, index) => (
                part.highlighted ? (
                    <Box
                        key={index}
                        component="mark"
                        sx={{
                            backgroundColor: 'rgba(255, 235, 59, 0.4)',
                            color: 'inherit',
                            padding: '2px 4px',
                            borderRadius: '4px',
                            fontWeight: 700
                        }}
                    >
                        {part.text}
                    </Box>
                ) : (
                    <React.Fragment key={index}>{part.text}</React.Fragment>
                )
            ))}
        </Box>
    );
};

/**
 * Client-side highlighting (completely safe, no HTML parsing)
 */
const ClientSideHighlight = ({ text, query, sx }) => {
    if (!query || !text) {
        return <Box component="span" sx={sx}>{text}</Box>;
    }
    
    // Split query into words
    const words = query.toLowerCase().split(/\s+/).filter(w => w.length >= 2);
    
    if (words.length === 0) {
        return <Box component="span" sx={sx}>{text}</Box>;
    }
    
    // Find all matches
    const parts = [];
    let currentText = text;
    let currentIndex = 0;
    
    // Create a map of positions to highlight
    const highlights = [];
    words.forEach(word => {
        let searchIndex = 0;
        while (true) {
            const index = currentText.toLowerCase().indexOf(word, searchIndex);
            if (index === -1) break;
            
            highlights.push({
                start: index,
                end: index + word.length,
                word: currentText.substring(index, index + word.length)
            });
            
            searchIndex = index + word.length;
        }
    });
    
    // Sort and merge overlapping highlights
    highlights.sort((a, b) => a.start - b.start);
    const merged = [];
    highlights.forEach(h => {
        if (merged.length === 0) {
            merged.push(h);
        } else {
            const last = merged[merged.length - 1];
            if (h.start <= last.end) {
                // Merge overlapping
                last.end = Math.max(last.end, h.end);
                last.word = currentText.substring(last.start, last.end);
            } else {
                merged.push(h);
            }
        }
    });
    
    // Build parts array
    let lastEnd = 0;
    merged.forEach(h => {
        // Add text before highlight
        if (h.start > lastEnd) {
            parts.push({
                text: currentText.substring(lastEnd, h.start),
                highlighted: false
            });
        }
        // Add highlighted text
        parts.push({
            text: h.word,
            highlighted: true
        });
        lastEnd = h.end;
    });
    
    // Add remaining text
    if (lastEnd < currentText.length) {
        parts.push({
            text: currentText.substring(lastEnd),
            highlighted: false
        });
    }
    
    return (
        <Box component="span" sx={sx}>
            {parts.map((part, index) => (
                part.highlighted ? (
                    <Box
                        key={index}
                        component="mark"
                        sx={{
                            backgroundColor: 'rgba(255, 235, 59, 0.4)',
                            color: 'inherit',
                            padding: '2px 4px',
                            borderRadius: '4px',
                            fontWeight: 700
                        }}
                    >
                        {part.text}
                    </Box>
                ) : (
                    <React.Fragment key={index}>{part.text}</React.Fragment>
                )
            ))}
        </Box>
    );
};

export default SafeHighlightedText;

