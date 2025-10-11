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

const TinyMCEProfessional = ({
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
    const [isLoading, setIsLoading] = useState(true);

    // TinyMCE configuration with API key
    const editorConfig = {
        height: isFullscreen ? '85vh' : Math.max(height, 500),
        menubar: true,
        plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons',
            'codesample', 'quickbars', 'autosave', 'save'
        ],
        toolbar: [
            'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough',
            'link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography',
            'align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat | fullscreen'
        ],
        quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
        quickbars_insert_toolbar: 'quickimage quicktable',
        toolbar_mode: 'sliding',
        contextmenu: 'link image table',
        skin: theme.palette.mode === 'dark' ? 'oxide-dark' : 'oxide',
        content_css: theme.palette.mode === 'dark' ? 'dark' : 'default',
        
        // Content styling
        // Content styling to match frontend exactly (Blog/Show.jsx)
        content_style: `
            body {
                font-family: ${theme.typography.body1.fontFamily};
                font-size: 1.1rem;
                line-height: 1.8;
                color: ${theme.palette.text.secondary};
                background-color: ${theme.palette.background.paper};
                padding: 20px;
                max-width: none;
                margin: 0;
            }
            h1, h2, h3, h4, h5, h6 {
                font-family: ${theme.typography.h1.fontFamily};
                color: ${theme.palette.text.primary};
                font-weight: 700;
                margin-top: 32px;
                margin-bottom: 16px;
            }
            h1 { font-size: 2.5rem; font-weight: 700; }
            h2 { font-size: 2.2rem; font-weight: 700; }
            h3 { font-size: 1.8rem; font-weight: 700; }
            h4 { font-size: 1.4rem; font-weight: 700; }
            h5 { font-size: 1.125rem; font-weight: 600; }
            h6 { font-size: 1rem; font-weight: 600; }
            p {
                font-size: 1.1rem;
                line-height: 1.8;
                margin-bottom: 16px;
                color: ${theme.palette.text.secondary};
            }
            blockquote {
                border-left: 4px solid ${theme.palette.primary.main};
                padding-left: 24px;
                padding-top: 16px;
                padding-bottom: 16px;
                margin: 24px 0;
                font-style: italic;
                font-size: 1.2rem;
                background: ${alpha(theme.palette.primary.main, 0.05)};
                border-radius: 0 8px 8px 0;
            }
            ul, ol {
                padding-left: 24px;
                margin-bottom: 16px;
            }
            ul li, ol li {
                font-size: 1.1rem;
                line-height: 1.8;
                margin-bottom: 8px;
                color: ${theme.palette.text.secondary};
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
                box-shadow: ${theme.shadows[4]};
                margin: 24px 0;
            }
            table {
                border-collapse: collapse;
                width: 100%;
                margin: 24px 0;
                border: 1px solid ${alpha(theme.palette.divider, 0.3)};
                border-radius: 8px;
                overflow: hidden;
            }
            table td, table th {
                border: 1px solid ${alpha(theme.palette.divider, 0.3)};
                padding: 12px;
                text-align: left;
                font-size: 1.1rem;
                line-height: 1.8;
            }
            table th {
                background: ${alpha(theme.palette.primary.main, 0.1)};
                font-weight: 600;
                color: ${theme.palette.text.primary};
            }
            table td {
                color: ${theme.palette.text.secondary};
            }
            a {
                color: ${theme.palette.primary.main};
                text-decoration: none;
            }
            a:hover {
                text-decoration: underline;
            }
            strong, b {
                font-weight: 700;
                color: ${theme.palette.text.primary};
            }
            em, i {
                font-style: italic;
            }
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
        
        // Media handling
        media_live_embeds: true,
        media_url_resolver: (data, resolve) => {
            if (data.url.indexOf('youtube.com') !== -1 || data.url.indexOf('youtu.be') !== -1) {
                const videoId = data.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
                if (videoId) {
                    resolve({
                        html: `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId[1]}" frameborder="0" allowfullscreen></iframe>`
                    });
                }
            } else if (data.url.indexOf('vimeo.com') !== -1) {
                const videoId = data.url.match(/vimeo\.com\/(\d+)/);
                if (videoId) {
                    resolve({
                        html: `<iframe width="560" height="315" src="https://player.vimeo.com/video/${videoId[1]}" frameborder="0" allowfullscreen></iframe>`
                    });
                }
            }
        },
        
        // Advanced features
        template_cdate_format: '[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]',
        template_mdate_format: '[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]',
        image_advtab: true,
        link_list: [
            { title: 'Inicio', value: '/' },
            { title: 'Blog', value: '/blog' },
            { title: 'Servicios', value: '/servicios' },
            { title: 'Proyectos', value: '/proyectos' },
            { title: 'Contacto', value: '/contacto' }
        ],
        image_list: '/admin/media/list',
        
        // Auto-save
        autosave_ask_before_unload: true,
        autosave_interval: '30s',
        autosave_prefix: '{path}{query}-{id}-',
        autosave_restore_when_empty: false,
        autosave_retention: '2m',
        
        // Accessibility
        a11y_advanced_options: true,
        
        // Performance
        convert_urls: false,
        remove_script_host: false,
        
        // Placeholder
        placeholder: placeholder,
        
        // Events
        setup: (editor) => {
            editor.on('init', () => {
                setIsLoading(false);
            });
            
            editor.on('change keyup', () => {
                const content = editor.getContent();
                const wordCount = editor.plugins.wordcount ? editor.plugins.wordcount.getCount() : 0;
                const charCount = content.replace(/<[^>]*>/g, '').length;
                
                setWordCount(wordCount);
                setCharCount(charCount);
                
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
                elevation={0}
                sx={{
                    mb: 2,
                    p: 2,
                    backgroundColor: alpha(theme.palette.background.paper, 0.6),
                    backdropFilter: 'blur(20px)',
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                        transform: 'none', // Sin elevación al hover
                    }
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
                    border: error ? `2px solid ${theme.palette.error.main}` : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    borderRadius: 3,
                    overflow: 'hidden',
                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: 'blur(20px)',
                    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
                    transition: 'all 0.3s ease',
                    minHeight: isFullscreen ? '90vh' : '500px',
                    '&:hover': {
                        boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.15)}`,
                        transform: 'none', // Sin elevación al hover
                    },
                    '& .tox-tinymce': {
                        border: 'none !important',
                        borderRadius: '12px !important',
                        minHeight: isFullscreen ? '85vh' : '450px !important',
                    },
                    '& .tox-toolbar': {
                        backgroundColor: `${alpha(theme.palette.background.default, 0.9)} !important`,
                        backdropFilter: 'blur(20px) !important',
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)} !important`,
                        padding: '12px !important',
                    },
                    '& .tox-toolbar__group': {
                        margin: '0 8px !important',
                    },
                    '& .tox-edit-area': {
                        padding: '0 !important',
                    },
                    '& .tox-edit-area__iframe': {
                        backgroundColor: `${theme.palette.background.paper} !important`,
                        minHeight: isFullscreen ? '75vh' : '400px !important',
                    },
                    '& .tox-statusbar': {
                        backgroundColor: `${alpha(theme.palette.background.default, 0.7)} !important`,
                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)} !important`,
                        padding: '8px 16px !important',
                    }
                }}
            >
                <Editor
                    apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
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

export default TinyMCEProfessional;
