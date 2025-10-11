import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    Button,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Avatar,
    Tooltip,
    Menu,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    LinearProgress,
    Grid,
    Checkbox,
} from '@mui/material';
import {
    Search as SearchIcon,
    MoreVert as MoreVertIcon,
    Block as BlockIcon,
    CheckCircle as UnbanIcon,
    History as HistoryIcon,
    Edit as EditIcon,
    Download as DownloadIcon,
    FilterList as FilterIcon,
    Schedule as ScheduleIcon,
    Person as PersonIcon,
    AdminPanelSettings as AdminIcon,
    Visibility as ViewIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import { router } from '@inertiajs/react';

const BannedUsersTab = ({ bannedUsers, stats, onUnbanUser, onModifyBan, onViewHistory }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [banTypeFilter, setBanTypeFilter] = useState('');
    const [durationFilter, setDurationFilter] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [bulkActionDialog, setBulkActionDialog] = useState(false);
    const [bulkAction, setBulkAction] = useState('');

    // Glassmorphism styles
    const glassmorphismCard = {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    };

    // Handle search
    const handleSearch = (value) => {
        setSearchTerm(value);
        setPage(0);
    };

    // Handle filter changes
    const handleFilter = (filterType, value) => {
        if (filterType === 'banType') setBanTypeFilter(value);
        if (filterType === 'duration') setDurationFilter(value);
        setPage(0);
    };

    // Handle menu actions
    const handleMenuClick = (event, user) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedUser(null);
    };

    // Handle user selection
    const handleSelectUser = (userId) => {
        setSelectedUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedUsers(filteredUsers.map(user => user.id));
        } else {
            setSelectedUsers([]);
        }
    };

    // Filter users based on search and filters
    const filteredUsers = bannedUsers.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesBanType = !banTypeFilter || 
                              (banTypeFilter === 'ip' && user.ban_details?.ip_ban) ||
                              (banTypeFilter === 'account' && !user.ban_details?.ip_ban);
        
        const matchesDuration = !durationFilter ||
                               (durationFilter === 'permanent' && !user.ban_details?.expires_at) ||
                               (durationFilter === 'temporary' && user.ban_details?.expires_at);

        return matchesSearch && matchesBanType && matchesDuration;
    });

    // Get paginated users
    const paginatedUsers = filteredUsers.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    // Format remaining time
    const formatRemainingTime = (expiresAt) => {
        if (!expiresAt) return 'Permanente';
        
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry - now;
        
        if (diff <= 0) return 'Expirado';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h`;
    };

    // Handle CSV export
    const handleExport = () => {
        const csvData = [];
        csvData.push(['ID', 'Nombre', 'Email', 'Motivo', 'Tipo', 'Fecha Suspensión', 'Expira', 'Suspendido Por']);
        
        filteredUsers.forEach(user => {
            csvData.push([
                user.id,
                user.name,
                user.email,
                user.ban_details?.reason || 'N/A',
                user.ban_details?.ip_ban ? 'IP + Cuenta' : 'Cuenta',
                user.ban_details?.created_at ? new Date(user.ban_details.created_at).toLocaleDateString('es-ES') : 'N/A',
                user.ban_details?.expires_at ? new Date(user.ban_details.expires_at).toLocaleDateString('es-ES') : 'Permanente',
                user.ban_details?.banned_by_name || 'Sistema'
            ]);
        });

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `usuarios_suspendidos_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Handle bulk actions
    const handleBulkAction = () => {
        if (bulkAction === 'unban') {
            selectedUsers.forEach(userId => {
                const user = bannedUsers.find(u => u.id === userId);
                if (user) onUnbanUser(user);
            });
        }
        setBulkActionDialog(false);
        setSelectedUsers([]);
        setBulkAction('');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Statistics Cards */}
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <motion.div whileHover={{ scale: 1.02 }}>
                        <Card sx={{ ...glassmorphismCard, p: 3, textAlign: 'center' }}>
                            <BlockIcon sx={{ fontSize: 40, color: '#E53E3E', mb: 1 }} />
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A202C' }}>
                                {stats.total_banned || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#718096' }}>
                                Total Suspendidos
                            </Typography>
                        </Card>
                    </motion.div>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <motion.div whileHover={{ scale: 1.02 }}>
                        <Card sx={{ ...glassmorphismCard, p: 3, textAlign: 'center' }}>
                            <ScheduleIcon sx={{ fontSize: 40, color: '#ED8936', mb: 1 }} />
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A202C' }}>
                                {stats.temporary_bans || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#718096' }}>
                                Suspensiones Temporales
                            </Typography>
                        </Card>
                    </motion.div>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <motion.div whileHover={{ scale: 1.02 }}>
                        <Card sx={{ ...glassmorphismCard, p: 3, textAlign: 'center' }}>
                            <BlockIcon sx={{ fontSize: 40, color: '#9F7AEA', mb: 1 }} />
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A202C' }}>
                                {stats.permanent_bans || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#718096' }}>
                                Suspensiones Permanentes
                            </Typography>
                        </Card>
                    </motion.div>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <motion.div whileHover={{ scale: 1.02 }}>
                        <Card sx={{ ...glassmorphismCard, p: 3, textAlign: 'center' }}>
                            <AdminIcon sx={{ fontSize: 40, color: '#38B2AC', mb: 1 }} />
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A202C' }}>
                                {stats.ip_bans || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#718096' }}>
                                Suspensiones por IP
                            </Typography>
                        </Card>
                    </motion.div>
                </Grid>
            </Grid>

            {/* Search and Filters */}
            <Card sx={{ ...glassmorphismCard, p: 3 }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            placeholder="Buscar usuarios suspendidos..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#718096' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Tipo</InputLabel>
                            <Select
                                value={banTypeFilter}
                                label="Tipo"
                                onChange={(e) => handleFilter('banType', e.target.value)}
                                sx={{
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                }}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                <MenuItem value="account">Solo Cuenta</MenuItem>
                                <MenuItem value="ip">IP + Cuenta</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Duración</InputLabel>
                            <Select
                                value={durationFilter}
                                label="Duración"
                                onChange={(e) => handleFilter('duration', e.target.value)}
                                sx={{
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                }}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                <MenuItem value="temporary">Temporales</MenuItem>
                                <MenuItem value="permanent">Permanentes</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                onClick={handleExport}
                                sx={{
                                    borderRadius: '12px',
                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                    color: '#718096',
                                }}
                            >
                                Exportar
                            </Button>
                            {selectedUsers.length > 0 && (
                                <Button
                                    variant="contained"
                                    startIcon={<UnbanIcon />}
                                    onClick={() => setBulkActionDialog(true)}
                                    sx={{
                                        borderRadius: '12px',
                                        backgroundColor: '#48BB78',
                                        '&:hover': { backgroundColor: '#38A169' }
                                    }}
                                >
                                    Levantar ({selectedUsers.length})
                                </Button>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Card>

            {/* Banned Users Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card sx={{ ...glassmorphismCard, overflow: 'hidden' }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                            indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
                                            onChange={handleSelectAll}
                                        />
                                    </TableCell>
                                    <TableCell>Usuario</TableCell>
                                    <TableCell>Motivo</TableCell>
                                    <TableCell>Tipo</TableCell>
                                    <TableCell>Tiempo Restante</TableCell>
                                    <TableCell>Suspendido Por</TableCell>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell align="center">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedUsers.map((user) => (
                                    <TableRow 
                                        key={user.id}
                                        sx={{ 
                                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                                        }}
                                    >
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={() => handleSelectUser(user.id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar sx={{ width: 40, height: 40, backgroundColor: '#E53E3E' }}>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {user.name}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#718096' }}>
                                                        {user.email}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={user.ban_details?.reason || 'Sin motivo especificado'}>
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        maxWidth: 200, 
                                                        overflow: 'hidden', 
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {user.ban_details?.reason || 'Sin motivo especificado'}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.ban_details?.ip_ban ? 'IP + Cuenta' : 'Cuenta'}
                                                size="small"
                                                color={user.ban_details?.ip_ban ? 'error' : 'warning'}
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={formatRemainingTime(user.ban_details?.expires_at)}
                                                size="small"
                                                color={user.ban_details?.expires_at ? 'info' : 'error'}
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {user.ban_details?.banned_by_name || 'Sistema'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {user.ban_details?.created_at ? new Date(user.ban_details.created_at).toLocaleDateString('es-ES') : 'N/A'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                onClick={(e) => handleMenuClick(e, user)}
                                                sx={{ color: '#718096' }}
                                            >
                                                <MoreVertIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        component="div"
                        count={filteredUsers.length}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                        rowsPerPageOptions={[10, 15, 25, 50]}
                        sx={{
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            '& .MuiTablePagination-toolbar': {
                                color: '#718096'
                            }
                        }}
                    />
                </Card>
            </motion.div>

            {/* Context Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: {
                        ...glassmorphismCard,
                        minWidth: 180,
                    }
                }}
            >
                <MenuItem onClick={() => {
                    onViewHistory(selectedUser);
                    handleMenuClose();
                }}>
                    <HistoryIcon sx={{ mr: 1, fontSize: 18 }} />
                    Ver Historial
                </MenuItem>
                <MenuItem onClick={() => {
                    onModifyBan(selectedUser);
                    handleMenuClose();
                }}>
                    <EditIcon sx={{ mr: 1, fontSize: 18 }} />
                    Modificar Suspensión
                </MenuItem>
                <MenuItem 
                    onClick={() => {
                        onUnbanUser(selectedUser);
                        handleMenuClose();
                    }}
                    sx={{ color: '#48BB78' }}
                >
                    <UnbanIcon sx={{ mr: 1, fontSize: 18 }} />
                    Levantar Suspensión
                </MenuItem>
            </Menu>

            {/* Bulk Action Dialog */}
            <Dialog
                open={bulkActionDialog}
                onClose={() => setBulkActionDialog(false)}
                PaperProps={{
                    sx: {
                        ...glassmorphismCard,
                        minWidth: 400,
                    }
                }}
            >
                <DialogTitle>Acción Masiva</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        ¿Estás seguro de que quieres levantar la suspensión de {selectedUsers.length} usuario(s)?
                    </Typography>
                    <Alert severity="info">
                        Esta acción no se puede deshacer. Los usuarios podrán acceder al sistema inmediatamente.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBulkActionDialog(false)}>
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleBulkAction}
                        variant="contained"
                        color="success"
                    >
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BannedUsersTab;
