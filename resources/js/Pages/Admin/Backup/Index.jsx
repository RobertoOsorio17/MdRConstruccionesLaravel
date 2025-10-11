import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    alpha,
    useTheme,
} from '@mui/material';
import {
    CloudDownload,
    Delete,
    Add,
    Storage,
    Schedule,
    CleaningServices,
    Backup as BackupIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function BackupIndex({ backups, stats }) {
    const theme = useTheme();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [backupType, setBackupType] = useState('full');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedBackup, setSelectedBackup] = useState(null);
    const [loading, setLoading] = useState(false);

    // Glassmorphism style
    const glassStyle = {
        background: alpha('#ffffff', 0.7),
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        border: `1px solid ${alpha('#ffffff', 0.3)}`,
        boxShadow: `0 8px 32px 0 ${alpha('#000000', 0.1)}`,
    };

    const handleCreateBackup = () => {
        setLoading(true);
        router.post(route('admin.backup.create'), {
            type: backupType,
        }, {
            onFinish: () => {
                setLoading(false);
                setCreateDialogOpen(false);
            },
        });
    };

    const handleDownload = (filename) => {
        window.location.href = route('admin.backup.download', filename);
    };

    const handleDelete = () => {
        if (!selectedBackup) return;

        setLoading(true);
        router.delete(route('admin.backup.destroy', selectedBackup.name), {
            onFinish: () => {
                setLoading(false);
                setDeleteDialogOpen(false);
                setSelectedBackup(null);
            },
        });
    };

    const handleClean = () => {
        if (confirm('Are you sure you want to clean old backups? This action cannot be undone.')) {
            setLoading(true);
            router.post(route('admin.backup.clean'), {}, {
                onFinish: () => setLoading(false),
            });
        }
    };

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card sx={{ ...glassStyle, height: '100%' }}>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {title}
                            </Typography>
                            <Typography variant="h4" fontWeight="bold" color={color}>
                                {value}
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                background: alpha(color, 0.1),
                                borderRadius: 2,
                                p: 1.5,
                            }}
                        >
                            <Icon sx={{ color, fontSize: 32 }} />
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </motion.div>
    );

    return (
        <AdminLayout>
            <Head title="Backup Management" />

            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Backup Management
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Create, manage and restore system backups
                        </Typography>
                    </Box>

                    <Box display="flex" gap={2}>
                        <Button
                            variant="outlined"
                            startIcon={<CleaningServices />}
                            onClick={handleClean}
                            disabled={loading}
                        >
                            Clean Old Backups
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => setCreateDialogOpen(true)}
                            disabled={loading}
                        >
                            Create Backup
                        </Button>
                    </Box>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Backups"
                            value={stats.total_backups}
                            icon={BackupIcon}
                            color={theme.palette.primary.main}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Size"
                            value={stats.total_size}
                            icon={Storage}
                            color={theme.palette.success.main}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Newest Backup"
                            value={stats.newest_backup ? new Date(stats.newest_backup.date).toLocaleDateString() : 'N/A'}
                            icon={Schedule}
                            color={theme.palette.info.main}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Storage Disk"
                            value={stats.disk_name.toUpperCase()}
                            icon={Storage}
                            color={theme.palette.warning.main}
                        />
                    </Grid>
                </Grid>

                {/* Backups Table */}
                <Card sx={glassStyle}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Available Backups
                        </Typography>

                        {backups.length === 0 ? (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                No backups found. Create your first backup to get started.
                            </Alert>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><strong>Filename</strong></TableCell>
                                            <TableCell><strong>Size</strong></TableCell>
                                            <TableCell><strong>Created</strong></TableCell>
                                            <TableCell align="right"><strong>Actions</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {backups.map((backup) => (
                                            <TableRow key={backup.name} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {backup.name}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={backup.size}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {new Date(backup.date).toLocaleString()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => handleDownload(backup.name)}
                                                        title="Download"
                                                    >
                                                        <CloudDownload />
                                                    </IconButton>
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => {
                                                            setSelectedBackup(backup);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                        title="Delete"
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </CardContent>
                </Card>
            </Box>

            {/* Create Backup Dialog */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Backup</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Backup Type</InputLabel>
                        <Select
                            value={backupType}
                            label="Backup Type"
                            onChange={(e) => setBackupType(e.target.value)}
                        >
                            <MenuItem value="full">Full Backup (Database + Files)</MenuItem>
                            <MenuItem value="database">Database Only</MenuItem>
                            <MenuItem value="files">Files Only</MenuItem>
                        </Select>
                    </FormControl>
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Creating a backup may take several minutes depending on the size of your data.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateBackup}
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Backup'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the backup <strong>{selectedBackup?.name}</strong>?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDelete}
                        variant="contained"
                        color="error"
                        disabled={loading}
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </AdminLayout>
    );
}

