import React, { useRef, useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
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

const SimpleRichEditor = ({
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
    const editorRef = useRef(null);
    const autoSaveTimeoutRef = useRef(null);
    
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [autoSaving, setAutoSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    // Simplified TinyMCE configuration without API key requirements
    const editorConfig = {
        height: isFullscreen ? '90vh' : height,
        menubar: false, // Disable menubar to avoid API key issues
        plugins: [
            'lists', 'link', 'image', 'charmap', 'preview',
            'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'wordcount',
            'codesample', 'emoticons'
        ],
        toolbar: [
            'undo redo | formatselect | bold italic underline strikethrough',
            'alignleft aligncenter alignright alignjustify | outdent indent',
            'numlist bullist | forecolor backcolor | link image media table',
            'charmap emoticons | codesample | preview code fullscreen'
        ],
        toolbar_mode: 'wrap',
        
        // Content styling
        content_style: `
            body { 
                font-family: ${theme.typography.body1.fontFamily}; 
                font-size: 16px; 
                line-height: 1.6;
                color: ${theme.palette.text.primary};
                background-color: ${theme.palette.background.paper};
                padding: 20px;
                max-width: none;
            }
            h1, h2, h3, h4, h5, h6 { 
                font-family: ${theme.typography.h1.fontFamily}; 
                color: ${theme.palette.text.primary};
                margin-top: 1.5em;
                margin-bottom: 0.5em;
            }
            h1 { font-size: 2rem; font-weight: 700; }
            h2 { font-size: 1.5rem; font-weight: 600; }
            h3 { font-size: 1.25rem; font-weight: 600; }
            blockquote {
                border-left: 4px solid ${theme.palette.primary.main};
                padding-left: 16px;
                margin: 16px 0;
                font-style: italic;
                background: ${alpha(theme.palette.primary.main, 0.05)};
                padding: 12px 16px;
                border-radius: 0 8px 8px 0;
            }
            code {
                background: ${alpha(theme.palette.grey[500], 0.1)};
                padding: 2px 6px;
                border-radius: 4px;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            }
            pre {
                background: ${alpha(theme.palette.grey[900], 0.9)};
                color: ${theme.palette.common.white};
                padding: 16px;
                border-radius: 8px;
                overflow-x: auto;
                margin: 16px 0;
            }
            img {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
                margin: 8px 0;
            }
            table {
                border-collapse: collapse;
                width: 100%;
                margin: 16px 0;
                border: 1px solid ${alpha(theme.palette.divider, 0.3)};
            }
            table td, table th {
                border: 1px solid ${alpha(theme.palette.divider, 0.3)};
                padding: 12px;
                text-align: left;
            }
            table th {
                background: ${alpha(theme.palette.primary.main, 0.1)};
                font-weight: 600;
            }
            p { margin: 0 0 1em 0; }
            ul, ol { margin: 0 0 1em 0; padding-left: 2em; }
            li { margin: 0.25em 0; }
        `,
        
        // Image handling
        images_upload_handler: async (blobInfo, progress) => {
            return new Promise(async (resolve, reject) => {
                const formData = new FormData();
                formData.append('file', blobInfo.blob(), blobInfo.filename());
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
                        resolve(result.file.url);
                    } else {
                        reject(result.message || 'Error al subir la imagen');
                    }
                } catch (error) {
                    reject('Error al subir la imagen: ' + error.message);
                }
            });
        },
        
        // Basic settings
        branding: false,
        elementpath: false,
        resize: true,
        statusbar: true,
        
        // Placeholder
        placeholder: placeholder,
        
        // Events
        setup: (editor) => {
            editor.on('change keyup', () => {
                const content = editor.getContent();
                const text = content.replace(/<[^>]*>/g, '');
                const words = text.trim().split(/\s+/).filter(word => word.length > 0);
                
                setWordCount(words.length);
                setCharCount(text.length);
                
                if (onChange) {
                    onChange(content);
                }
            });
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
        // Trigger editor resize after fullscreen toggle
        setTimeout(() => {
            if (editorRef.current) {
                editorRef.current.getEditor().execCommand('mceAutoResize');
            }
        }, 100);
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

            {/* TinyMCE Editor */}
            <Box
                sx={{
                    border: error ? `2px solid ${theme.palette.error.main}` : `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                    borderRadius: 2,
                    overflow: 'hidden',
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(10px)',
                    '& .tox-tinymce': {
                        border: 'none !important',
                        borderRadius: '8px !important',
                    },
                    '& .tox-toolbar': {
                        backgroundColor: `${alpha(theme.palette.background.default, 0.8)} !important`,
                        backdropFilter: 'blur(10px) !important',
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)} !important`,
                    },
                    '& .tox-statusbar': {
                        backgroundColor: `${alpha(theme.palette.background.default, 0.5)} !important`,
                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)} !important`,
                    }
                }}
            >
                <Editor
                    onInit={(evt, editor) => editorRef.current = editor}
                    value={value}
                    init={editorConfig}
                    disabled={readonly}
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

export default SimpleRichEditor;
