import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../../css/quill-custom.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Typography,
    IconButton,
    useTheme,
    alpha,
    Stack,
    Chip,
    Tabs,
    Tab,
    Switch,
    FormControlLabel,
    LinearProgress,
    Alert,
    Tooltip,
    Divider,
    Paper
} from '@mui/material';
import {
    Image as ImageIcon,
    Link as LinkIcon,
    Close as CloseIcon,
    Search as SearchIcon,
    Code as CodeIcon,
    TableChart as TableIcon,
    VideoLibrary as VideoIcon,
    Undo as UndoIcon,
    Redo as RedoIcon,
    Save as SaveIcon,
    Fullscreen as FullscreenIcon,
    FullscreenExit as FullscreenExitIcon,
    FormatSize as WordCountIcon,
    CloudUpload as UploadIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const RichTextEditor = ({
    value,
    onChange,
    placeholder = "Escribe tu contenido aquí...",
    height = 400,
    error = false,
    helperText = "",
    mediaFiles = [],
    onSave = null,
    autoSave = true,
    showWordCount = true,
    allowFullscreen = true
}) => {
    const theme = useTheme();
    const quillRef = useRef(null);
    const autoSaveTimeoutRef = useRef(null);

    // Dialog states
    const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [tableDialogOpen, setTableDialogOpen] = useState(false);
    const [videoDialogOpen, setVideoDialogOpen] = useState(false);
    const [codeDialogOpen, setCodeDialogOpen] = useState(false);

    // Form states
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [codeContent, setCodeContent] = useState('');
    const [codeLanguage, setCodeLanguage] = useState('javascript');
    const [tableRows, setTableRows] = useState(3);
    const [tableCols, setTableCols] = useState(3);

    // Editor states
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSourceCode, setShowSourceCode] = useState(false);
    const [sourceCode, setSourceCode] = useState('');
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [autoSaving, setAutoSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);

    // Enhanced toolbar configuration
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                [{ 'direction': 'rtl' }],
                [{ 'align': [] }],
                ['blockquote', 'code-block'],
                ['link', 'image', 'video'],
                ['clean']
            ],
            handlers: {
                'image': handleImageClick,
                'link': handleLinkClick,
                'video': handleVideoClick
            }
        },
        clipboard: {
            matchVisual: false,
        },
        history: {
            delay: 1000,
            maxStack: 100,
            userOnly: true
        },
        syntax: {
            highlight: text => hljs.highlightAuto(text).value,
        }
    }), []);

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image', 'video', 'color', 'background',
        'align', 'direction', 'code-block',
        'script'
    ];

    // Enhanced handler functions
    function handleImageClick() {
        setMediaDialogOpen(true);
    }

    function handleLinkClick() {
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();
        if (range) {
            const text = quill.getText(range.index, range.length);
            setLinkText(text);
        }
        setLinkDialogOpen(true);
    }

    function handleVideoClick() {
        setVideoDialogOpen(true);
    }

    function handleTableClick() {
        setTableDialogOpen(true);
    }

    function handleCodeClick() {
        setCodeDialogOpen(true);
    }

    function handleUndo() {
        const quill = quillRef.current.getEditor();
        quill.history.undo();
    }

    function handleRedo() {
        const quill = quillRef.current.getEditor();
        quill.history.redo();
    }

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
            }, 3000); // Auto-save after 3 seconds of inactivity
        }

        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, [value, autoSave, onSave]);

    // Word count calculation
    useEffect(() => {
        if (value) {
            const text = value.replace(/<[^>]*>/g, ''); // Remove HTML tags
            const words = text.trim().split(/\s+/).filter(word => word.length > 0);
            setWordCount(words.length);
            setCharCount(text.length);
        } else {
            setWordCount(0);
            setCharCount(0);
        }
    }, [value]);

    // Enhanced insert functions
    const insertImage = useCallback((imageUrl) => {
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();
        quill.insertEmbed(range.index, 'image', imageUrl);
        setMediaDialogOpen(false);
    }, []);

    const insertLink = useCallback(() => {
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();

        if (linkText && linkUrl) {
            quill.deleteText(range.index, range.length);
            quill.insertText(range.index, linkText, 'link', linkUrl);
        } else if (linkUrl) {
            quill.insertText(range.index, linkUrl, 'link', linkUrl);
        }

        setLinkDialogOpen(false);
        setLinkUrl('');
        setLinkText('');
    }, [linkUrl, linkText]);

    const insertVideo = useCallback(() => {
        if (!videoUrl) return;

        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();

        // Convert YouTube/Vimeo URLs to embed format
        let embedUrl = videoUrl;
        if (videoUrl.includes('youtube.com/watch')) {
            const videoId = videoUrl.split('v=')[1]?.split('&')[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (videoUrl.includes('vimeo.com/')) {
            const videoId = videoUrl.split('vimeo.com/')[1];
            embedUrl = `https://player.vimeo.com/video/${videoId}`;
        }

        quill.insertEmbed(range.index, 'video', embedUrl);
        setVideoDialogOpen(false);
        setVideoUrl('');
    }, [videoUrl]);

    const insertTable = useCallback(() => {
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();

        // Create table HTML
        let tableHTML = '<table style="border-collapse: collapse; width: 100%;">';
        for (let i = 0; i < tableRows; i++) {
            tableHTML += '<tr>';
            for (let j = 0; j < tableCols; j++) {
                tableHTML += '<td style="border: 1px solid #ddd; padding: 8px;">&nbsp;</td>';
            }
            tableHTML += '</tr>';
        }
        tableHTML += '</table>';

        quill.clipboard.dangerouslyPasteHTML(range.index, tableHTML);
        setTableDialogOpen(false);
    }, [tableRows, tableCols]);

    const insertCodeBlock = useCallback(() => {
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();

        quill.insertText(range.index, codeContent, 'code-block', true);
        setCodeDialogOpen(false);
        setCodeContent('');
    }, [codeContent]);

    // File upload handler
    const handleFileUpload = useCallback(async (files) => {
        setUploading(true);
        setUploadProgress(0);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
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
                    insertImage(result.file.url);
                }

                setUploadProgress(((i + 1) / files.length) * 100);
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }

        setUploading(false);
        setUploadProgress(0);
    }, [insertImage]);

    // Source code toggle
    const toggleSourceCode = useCallback(() => {
        if (showSourceCode) {
            onChange(sourceCode);
            setShowSourceCode(false);
        } else {
            setSourceCode(value || '');
            setShowSourceCode(true);
        }
    }, [showSourceCode, sourceCode, value, onChange]);

    // Fullscreen toggle
    const toggleFullscreen = useCallback(() => {
        setIsFullscreen(!isFullscreen);
    }, [isFullscreen]);

    const filteredMediaFiles = mediaFiles.filter(file =>
        file.type === 'image' &&
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            {/* Enhanced Toolbar */}
            <Paper
                elevation={2}
                sx={{
                    mb: 1,
                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    overflow: 'hidden'
                }}
            >
                <Box sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    {/* Custom toolbar buttons */}
                    <Tooltip title="Deshacer">
                        <IconButton size="small" onClick={handleUndo}>
                            <UndoIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Rehacer">
                        <IconButton size="small" onClick={handleRedo}>
                            <RedoIcon />
                        </IconButton>
                    </Tooltip>

                    <Divider orientation="vertical" flexItem />

                    <Tooltip title="Insertar tabla">
                        <IconButton size="small" onClick={() => setTableDialogOpen(true)}>
                            <TableIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Insertar video">
                        <IconButton size="small" onClick={() => setVideoDialogOpen(true)}>
                            <VideoIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Bloque de código">
                        <IconButton size="small" onClick={() => setCodeDialogOpen(true)}>
                            <CodeIcon />
                        </IconButton>
                    </Tooltip>

                    <Divider orientation="vertical" flexItem />

                    <FormControlLabel
                        control={
                            <Switch
                                size="small"
                                checked={showSourceCode}
                                onChange={toggleSourceCode}
                            />
                        }
                        label="HTML"
                        sx={{ mr: 1 }}
                    />

                    {allowFullscreen && (
                        <Tooltip title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}>
                            <IconButton size="small" onClick={toggleFullscreen}>
                                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                            </IconButton>
                        </Tooltip>
                    )}

                    {/* Auto-save indicator */}
                    {autoSave && (
                        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                            {autoSaving && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <SaveIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                                    <Typography variant="caption" color="primary">
                                        Guardando...
                                    </Typography>
                                </Box>
                            )}
                            {lastSaved && !autoSaving && (
                                <Typography variant="caption" color="text.secondary">
                                    Guardado: {lastSaved.toLocaleTimeString()}
                                </Typography>
                            )}
                        </Box>
                    )}
                </Box>
            </Paper>

            {/* Editor Container */}
            <Box
                sx={{
                    border: error ? `2px solid ${theme.palette.error.main}` : `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                    borderRadius: 2,
                    overflow: 'hidden',
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(10px)',
                    height: isFullscreen ? 'calc(100vh - 200px)' : 'auto',
                    '& .ql-toolbar': {
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        backgroundColor: alpha(theme.palette.background.default, 0.5),
                        backdropFilter: 'blur(5px)',
                    },
                    '& .ql-container': {
                        borderTop: 'none',
                        fontSize: '16px',
                        fontFamily: theme.typography.body1.fontFamily,
                        height: isFullscreen ? 'calc(100vh - 280px)' : 'auto',
                    },
                    '& .ql-editor': {
                        minHeight: isFullscreen ? 'calc(100vh - 280px)' : height,
                        padding: theme.spacing(2),
                        '&.ql-blank::before': {
                            color: theme.palette.text.secondary,
                            fontStyle: 'normal',
                        }
                    }
                }}
            >
                {showSourceCode ? (
                    <TextField
                        multiline
                        fullWidth
                        value={sourceCode}
                        onChange={(e) => setSourceCode(e.target.value)}
                        placeholder="Editar código HTML..."
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'transparent',
                                border: 'none',
                                '& fieldset': { border: 'none' },
                            },
                            '& .MuiInputBase-input': {
                                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                                fontSize: '14px',
                                minHeight: isFullscreen ? 'calc(100vh - 280px)' : height,
                                padding: theme.spacing(2),
                            }
                        }}
                    />
                ) : (
                    <ReactQuill
                        ref={quillRef}
                        theme="snow"
                        value={value}
                        onChange={onChange}
                        modules={modules}
                        formats={formats}
                        placeholder={placeholder}
                    />
                )}
            </Box>

            {/* Status Bar */}
            <Paper
                elevation={1}
                sx={{
                    mt: 1,
                    p: 1,
                    backgroundColor: alpha(theme.palette.background.paper, 0.7),
                    backdropFilter: 'blur(5px)',
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {showWordCount && (
                        <>
                            <Typography variant="caption" color="text.secondary">
                                <WordCountIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                                {wordCount} palabras
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {charCount} caracteres
                            </Typography>
                        </>
                    )}
                    {uploading && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                                variant="determinate"
                                value={uploadProgress}
                                sx={{ width: 100, height: 4 }}
                            />
                            <Typography variant="caption" color="primary">
                                {Math.round(uploadProgress)}%
                            </Typography>
                        </Box>
                    )}
                </Box>

                {helperText && (
                    <Typography
                        variant="caption"
                        color={error ? "error" : "text.secondary"}
                    >
                        {helperText}
                    </Typography>
                )}
            </Paper>

            {/* Media Selection Dialog */}
            <Dialog
                open={mediaDialogOpen}
                onClose={() => setMediaDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: alpha(theme.palette.background.paper, 0.95),
                        backdropFilter: 'blur(20px)',
                        borderRadius: 3,
                    }
                }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" fontWeight="bold">
                            Seleccionar Imagen
                        </Typography>
                        <IconButton onClick={() => setMediaDialogOpen(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                
                <DialogContent>
                    <Stack spacing={3}>
                        {/* Search */}
                        <TextField
                            fullWidth
                            placeholder="Buscar imágenes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                        />

                        {/* Images Grid */}
                        <Grid container spacing={2}>
                            {filteredMediaFiles.map((file, index) => (
                                <Grid item xs={6} sm={4} md={3} key={index}>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Card
                                            sx={{
                                                cursor: 'pointer',
                                                backgroundColor: alpha(theme.palette.background.paper, 0.7),
                                                backdropFilter: 'blur(10px)',
                                                '&:hover': {
                                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                }
                                            }}
                                            onClick={() => insertImage(file.url)}
                                        >
                                            <CardMedia
                                                component="img"
                                                height="120"
                                                image={file.url}
                                                alt={file.name}
                                                sx={{ objectFit: 'cover' }}
                                            />
                                            <CardContent sx={{ p: 1 }}>
                                                <Typography variant="caption" noWrap>
                                                    {file.name}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            ))}
                        </Grid>

                        {filteredMediaFiles.length === 0 && (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                <Typography color="text.secondary">
                                    No se encontraron imágenes
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setMediaDialogOpen(false)}>
                        Cancelar
                    </Button>
                    <Button 
                        variant="outlined"
                        href="/admin/media"
                        target="_blank"
                        startIcon={<ImageIcon />}
                    >
                        Gestionar Medios
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Link Dialog */}
            <Dialog
                open={linkDialogOpen}
                onClose={() => setLinkDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: alpha(theme.palette.background.paper, 0.95),
                        backdropFilter: 'blur(20px)',
                        borderRadius: 3,
                    }
                }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinkIcon />
                        <Typography variant="h6" fontWeight="bold">
                            Insertar Enlace
                        </Typography>
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Texto del enlace"
                            value={linkText}
                            onChange={(e) => setLinkText(e.target.value)}
                            placeholder="Texto que aparecerá como enlace"
                        />
                        <TextField
                            fullWidth
                            label="URL *"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://ejemplo.com"
                            type="url"
                        />
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setLinkDialogOpen(false)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={insertLink}
                        disabled={!linkUrl}
                    >
                        Insertar Enlace
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Video Dialog */}
            <Dialog
                open={videoDialogOpen}
                onClose={() => setVideoDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: alpha(theme.palette.background.paper, 0.95),
                        backdropFilter: 'blur(20px)',
                        borderRadius: 3,
                    }
                }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VideoIcon />
                        <Typography variant="h6" fontWeight="bold">
                            Insertar Video
                        </Typography>
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label="URL del video *"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            placeholder="https://youtube.com/watch?v=... o https://vimeo.com/..."
                            type="url"
                            helperText="Soporta YouTube, Vimeo y URLs de video directo"
                        />
                        {videoUrl && (
                            <Alert severity="info">
                                El video se insertará como un elemento embebido en el contenido.
                            </Alert>
                        )}
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setVideoDialogOpen(false)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={insertVideo}
                        disabled={!videoUrl}
                    >
                        Insertar Video
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Table Dialog */}
            <Dialog
                open={tableDialogOpen}
                onClose={() => setTableDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: alpha(theme.palette.background.paper, 0.95),
                        backdropFilter: 'blur(20px)',
                        borderRadius: 3,
                    }
                }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TableIcon />
                        <Typography variant="h6" fontWeight="bold">
                            Insertar Tabla
                        </Typography>
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Número de filas"
                            type="number"
                            value={tableRows}
                            onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value) || 1))}
                            inputProps={{ min: 1, max: 20 }}
                        />
                        <TextField
                            fullWidth
                            label="Número de columnas"
                            type="number"
                            value={tableCols}
                            onChange={(e) => setTableCols(Math.max(1, parseInt(e.target.value) || 1))}
                            inputProps={{ min: 1, max: 10 }}
                        />
                        <Alert severity="info">
                            Se creará una tabla de {tableRows} filas × {tableCols} columnas
                        </Alert>
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setTableDialogOpen(false)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={insertTable}
                    >
                        Insertar Tabla
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Code Dialog */}
            <Dialog
                open={codeDialogOpen}
                onClose={() => setCodeDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: alpha(theme.palette.background.paper, 0.95),
                        backdropFilter: 'blur(20px)',
                        borderRadius: 3,
                    }
                }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CodeIcon />
                        <Typography variant="h6" fontWeight="bold">
                            Insertar Bloque de Código
                        </Typography>
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            select
                            fullWidth
                            label="Lenguaje"
                            value={codeLanguage}
                            onChange={(e) => setCodeLanguage(e.target.value)}
                            SelectProps={{ native: true }}
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                            <option value="php">PHP</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="sql">SQL</option>
                            <option value="bash">Bash</option>
                            <option value="json">JSON</option>
                            <option value="xml">XML</option>
                        </TextField>
                        <TextField
                            fullWidth
                            multiline
                            rows={8}
                            label="Código"
                            value={codeContent}
                            onChange={(e) => setCodeContent(e.target.value)}
                            placeholder="Escribe tu código aquí..."
                            sx={{
                                '& .MuiInputBase-input': {
                                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                                    fontSize: '14px',
                                }
                            }}
                        />
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setCodeDialogOpen(false)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={insertCodeBlock}
                        disabled={!codeContent.trim()}
                    >
                        Insertar Código
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RichTextEditor;
