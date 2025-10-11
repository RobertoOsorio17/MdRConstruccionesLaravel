import React, { useRef, useState, useEffect, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
    Box,
    Paper,
    Typography,
    useTheme,
    alpha,
    Stack,
    Chip,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Fullscreen as FullscreenIcon,
    FullscreenExit as FullscreenExitIcon,
    Save as SaveIcon,
    FormatSize as WordCountIcon
} from '@mui/icons-material';

const ProfessionalEditor = ({
    value = '',
    onChange,
    placeholder = "Escribe tu contenido aquí...",
    height = 500,
    error = false,
    helperText = "",
    autoSave = true,
    onSave = null,
    showWordCount = true,
    allowFullscreen = true,
    readonly = false
}) => {
    const theme = useTheme();
    const quillRef = useRef(null);
    const autoSaveTimeoutRef = useRef(null);
    
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [autoSaving, setAutoSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    // Custom image handler
    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('folder', 'uploads');

                try {
                    const response = await fetch('/admin/media/upload', {
                        method: 'POST',
                        headers: {
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        },
                        body: formData,
                    });

                    const result = await response.json();
                    if (result.success) {
                        const quill = quillRef.current.getEditor();
                        const range = quill.getSelection();
                        quill.insertEmbed(range.index, 'image', result.file.url);
                    }
                } catch (error) {
                    console.error('Error uploading image:', error);
                }
            }
        };
    };

    // Quill modules configuration
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                ['blockquote', 'code-block'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                [{ 'direction': 'rtl' }],
                [{ 'align': [] }],
                ['link', 'image', 'video'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        },
        clipboard: {
            matchVisual: false,
        }
    }), []);

    // Quill formats
    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'script',
        'blockquote', 'code-block',
        'list', 'bullet',
        'indent',
        'direction', 'align',
        'link', 'image', 'video'
    ];

    // Handle content change
    const handleChange = (content, delta, source, editor) => {
        const text = editor.getText();
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        
        setWordCount(words.length);
        setCharCount(text.length);
        
        if (onChange) {
            onChange(content);
        }
    };

    // Auto-save functionality
    useEffect(() => {
        if (autoSave && onSave && value) {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
            
            autoSaveTimeoutRef.current = setTimeout(async () => {
                setAutoSaving(true);
                try {
                    await onSave(value);
                    setLastSaved(new Date());
                } catch (error) {
                    console.error('Auto-save failed:', error);
                } finally {
                    setAutoSaving(false);
                }
            }, 3000);
        }

        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, [value, autoSave, onSave]);

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    return (
        <Box
            sx={{
                position: isFullscreen ? 'fixed' : 'relative',
                top: isFullscreen ? 0 : 'auto',
                left: isFullscreen ? 0 : 'auto',
                right: isFullscreen ? 0 : 'auto',
                bottom: isFullscreen ? 0 : 'auto',
                zIndex: isFullscreen ? 9999 : 'auto',
                backgroundColor: isFullscreen ? theme.palette.background.default : 'transparent',
                padding: isFullscreen ? 2 : 0,
            }}
        >
            {/* Status Bar */}
            <Paper
                elevation={2}
                sx={{
                    mb: 1,
                    p: 1,
                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    {showWordCount && (
                        <>
                            <Chip
                                icon={<WordCountIcon />}
                                label={`${wordCount} palabras`}
                                size="small"
                                variant="outlined"
                            />
                            <Chip
                                label={`${charCount} caracteres`}
                                size="small"
                                variant="outlined"
                            />
                        </>
                    )}
                    
                    {autoSaving && (
                        <Chip
                            icon={<SaveIcon />}
                            label="Guardando..."
                            size="small"
                            color="primary"
                        />
                    )}
                    
                    {lastSaved && !autoSaving && (
                        <Typography variant="caption" color="text.secondary">
                            Guardado: {lastSaved.toLocaleTimeString()}
                        </Typography>
                    )}
                </Stack>
                
                {allowFullscreen && (
                    <Tooltip title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}>
                        <IconButton size="small" onClick={toggleFullscreen}>
                            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                        </IconButton>
                    </Tooltip>
                )}
            </Paper>

            {/* Quill Editor */}
            <Box
                sx={{
                    border: error ? `2px solid ${theme.palette.error.main}` : `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                    borderRadius: 2,
                    overflow: 'hidden',
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(10px)',
                    '& .ql-toolbar': {
                        backgroundColor: alpha(theme.palette.background.default, 0.8),
                        backdropFilter: 'blur(10px)',
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        borderRadius: '8px 8px 0 0',
                    },
                    '& .ql-container': {
                        borderRadius: '0 0 8px 8px',
                        fontSize: '16px',
                        fontFamily: theme.typography.body1.fontFamily,
                    },
                    '& .ql-editor': {
                        minHeight: isFullscreen ? '80vh' : `${height - 100}px`,
                        color: theme.palette.text.primary,
                        '&.ql-blank::before': {
                            color: theme.palette.text.secondary,
                            fontStyle: 'italic',
                        },
                        '& h1, & h2, & h3, & h4, & h5, & h6': {
                            fontFamily: theme.typography.h1.fontFamily,
                            fontWeight: 600,
                            marginTop: '1.5em',
                            marginBottom: '0.5em',
                        },
                        '& h1': { fontSize: '2rem' },
                        '& h2': { fontSize: '1.5rem' },
                        '& h3': { fontSize: '1.25rem' },
                        '& blockquote': {
                            borderLeft: `4px solid ${theme.palette.primary.main}`,
                            paddingLeft: '16px',
                            margin: '16px 0',
                            fontStyle: 'italic',
                            background: alpha(theme.palette.primary.main, 0.05),
                            padding: '12px 16px',
                            borderRadius: '0 8px 8px 0',
                        },
                        '& pre': {
                            background: alpha(theme.palette.grey[900], 0.9),
                            color: theme.palette.common.white,
                            padding: '16px',
                            borderRadius: '8px',
                            overflow: 'auto',
                        },
                        '& img': {
                            maxWidth: '100%',
                            height: 'auto',
                            borderRadius: '8px',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                            margin: '8px 0',
                        },
                        '& p': {
                            marginBottom: '1em',
                        },
                        '& ul, & ol': {
                            paddingLeft: '2em',
                        },
                    },
                    '& .ql-snow .ql-tooltip': {
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                        borderRadius: '8px',
                        boxShadow: theme.shadows[4],
                    },
                }}
            >
                <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={value}
                    onChange={handleChange}
                    modules={modules}
                    formats={formats}
                    placeholder={placeholder}
                    readOnly={readonly}
                />
            </Box>

            {/* Helper Text */}
            {helperText && (
                <Typography 
                    variant="caption" 
                    color={error ? "error" : "text.secondary"}
                    sx={{ mt: 1, display: 'block' }}
                >
                    {helperText}
                </Typography>
            )}
        </Box>
    );
};

export default ProfessionalEditor;
