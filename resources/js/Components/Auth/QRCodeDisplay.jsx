import { Box, TextField, Button, Typography, CircularProgress, Alert } from '@mui/material';
import { QrCode2 } from '@mui/icons-material';

export default function QRCodeDisplay({ qrCode, confirmCode, setConfirmCode, onConfirm, loading }) {
    return (
        <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                    <strong>Step 1:</strong> Install an authenticator app on your phone (Google Authenticator, Authy, or similar)
                </Typography>
                <Typography variant="body2">
                    <strong>Step 2:</strong> Scan the QR code below with your authenticator app
                </Typography>
            </Alert>

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    p: 3,
                    bgcolor: 'background.default',
                    borderRadius: 2,
                    mb: 3,
                }}
            >
                {qrCode?.svg ? (
                    <div dangerouslySetInnerHTML={{ __html: qrCode.svg }} />
                ) : (
                    <Box sx={{ textAlign: 'center' }}>
                        <QrCode2 sx={{ fontSize: 100, color: 'text.disabled' }} />
                        <Typography variant="body2" color="text.secondary">
                            Loading QR Code...
                        </Typography>
                    </Box>
                )}
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <strong>Step 3:</strong> Enter the 6-digit code from your authenticator app to confirm setup
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <TextField
                    label="Verification Code"
                    value={confirmCode}
                    onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    fullWidth
                    inputProps={{
                        maxLength: 6,
                        pattern: '[0-9]*',
                        inputMode: 'numeric',
                    }}
                    helperText="Enter the 6-digit code from your authenticator app"
                />
                <Button
                    variant="contained"
                    onClick={onConfirm}
                    disabled={loading || confirmCode.length !== 6}
                    startIcon={loading && <CircularProgress size={20} />}
                    sx={{ minWidth: 120, height: 56 }}
                >
                    Confirm
                </Button>
            </Box>
        </Box>
    );
}

