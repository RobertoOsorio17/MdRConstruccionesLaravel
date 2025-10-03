import { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Alert,
    Paper,
    Grid,
    IconButton,
    Tooltip,
    CircularProgress,
} from '@mui/material';
import { ContentCopy, Refresh, Download, CheckCircle } from '@mui/icons-material';

export default function RecoveryCodesDisplay({ recoveryCodes, onRegenerate, onComplete, loading }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const codesText = recoveryCodes.join('\n');
        navigator.clipboard.writeText(codesText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const codesText = recoveryCodes.join('\n');
        const blob = new Blob([codesText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recovery-codes.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <Box>
            <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                    <strong>Important:</strong> Save these recovery codes in a secure location.
                </Typography>
                <Typography variant="body2">
                    You can use these codes to access your account if you lose access to your authenticator app.
                    Each code can only be used once.
                </Typography>
            </Alert>

            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    bgcolor: 'grey.100',
                    border: '2px dashed',
                    borderColor: 'warning.main',
                    mb: 3,
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="h3">
                        Recovery Codes
                    </Typography>
                    <Box>
                        <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
                            <IconButton onClick={handleCopy} size="small">
                                {copied ? <CheckCircle color="success" /> : <ContentCopy />}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Download as text file">
                            <IconButton onClick={handleDownload} size="small">
                                <Download />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Generate new codes">
                            <IconButton onClick={onRegenerate} size="small" disabled={loading}>
                                {loading ? <CircularProgress size={20} /> : <Refresh />}
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                <Grid container spacing={2}>
                    {recoveryCodes.map((code, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                            <Paper
                                elevation={1}
                                sx={{
                                    p: 1.5,
                                    textAlign: 'center',
                                    fontFamily: 'monospace',
                                    fontSize: '1.1rem',
                                    bgcolor: 'background.paper',
                                }}
                            >
                                {code}
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    Make sure you've saved these codes before continuing. You won't be able to see them again.
                </Typography>
            </Alert>

            <Button
                variant="contained"
                onClick={onComplete}
                fullWidth
            >
                I've Saved My Recovery Codes
            </Button>
        </Box>
    );
}

