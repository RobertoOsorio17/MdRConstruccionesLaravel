import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    InputAdornment,
    IconButton,
    Chip,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Checkbox,
    Menu,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Grid,
    Tooltip,
    Badge,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    LinearProgress,
    Tabs,
    Tab,
    Collapse,
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as AddIcon,
    FilterList as FilterIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Block as BlockIcon,
    CheckCircle as UnbanIcon,
    Download as DownloadIcon,
    PersonAdd as PersonAddIcon,
    Group as GroupIcon,
    CheckCircle as ActiveIcon,
    Block as BannedIcon,
    AdminPanelSettings as AdminIcon,
    Person as UserIcon,
    Edit as EditorIcon,
    PersonSearch as ImpersonateIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import AdminLayoutNew from '../../Layouts/AdminLayoutNew';
import BanUserModal from '../../Components/Admin/BanUserModal';
import ModifyBanModal from '../../Components/Admin/ModifyBanModal';
import BanHistoryModal from '../../Components/Admin/BanHistoryModal';
import BannedUsersTab from '../../Components/Admin/BannedUsersTab';
import ImpersonationConfirmDialog from '../../Components/Admin/ImpersonationConfirmDialog';

const UserManagement = () => {
    const { users, stats, roles, filters, flash } = usePage().props;
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');
    const [banFilter, setBanFilter] = useState(filters.ban_status || '');
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [bulkActionDialog, setBulkActionDialog] = useState(false);
    const [bulkAction, setBulkAction] = useState('');
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // New state for tabs and ban modal
    const [currentTab, setCurrentTab] = useState(0);
    const [banModalOpen, setBanModalOpen] = useState(false);
    const [userToBan, setUserToBan] = useState(null);
    const [banLoading, setBanLoading] = useState(false);

    // State for modify ban modal
    const [modifyBanModalOpen, setModifyBanModalOpen] = useState(false);
    const [userToModifyBan, setUserToModifyBan] = useState(null);
    const [modifyBanLoading, setModifyBanLoading] = useState(false);

    // State for ban history modal
    const [banHistoryModalOpen, setBanHistoryModalOpen] = useState(false);
    const [userForBanHistory, setUserForBanHistory] = useState(null);

    // State for impersonation dialog
    const [impersonationDialogOpen, setImpersonationDialogOpen] = useState(false);
    const [userToImpersonate, setUserToImpersonate] = useState(null);

    // Glassmorphism styles
    const glassmorphismCard = {
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    };

    const statsCardStyle = {
        ...glassmorphismCard,
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.5)',
        },
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((value) => {
            router.get(route('admin.users.index'), {
                ...filters,
                search: value,
            }, {
                preserveState: true,
                replace: true,
            });
        }, 300),
        [filters]
    );

    // Handle search with debouncing
    const handleSearch = (value) => {
        setSearchTerm(value);
        debouncedSearch(value);
    };

    // Debounce utility function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Handle filters
    const handleFilter = (filterType, value) => {
        const newFilters = { ...filters };
        newFilters[filterType] = value;
        
        if (filterType === 'role') setRoleFilter(value);
        if (filterType === 'ban_status') setBanFilter(value);
        
        router.get(route('admin.users.index'), newFilters, {
            preserveState: true,
            replace: true,
        });
    };

    // Handle user selection
    const handleSelectUser = (userId) => {
        setSelectedUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectAll = () => {
        if (selectedUsers.length === users.data.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.data.map(user => user.id));
        }
    };

    // Handle CSV export
    const handleExport = () => {
        try {
            // Prepare CSV data
            const csvData = [];
            csvData.push(['ID', 'Nombre', 'Email', 'Rol', 'Estado de Suspensión', 'Fecha de Registro', 'Último Login']);

            users.data.forEach(user => {
                csvData.push([
                    user.id,
                    user.name,
                    user.email,
                    user.role || user.roles?.map(r => r.name).join(', ') || 'N/A',
                    user.is_banned ? 'Suspendido' : 'Activo',
                    new Date(user.created_at).toLocaleDateString('es-ES'),
                    user.last_login_at ? new Date(user.last_login_at).toLocaleDateString('es-ES') : 'Nunca'
                ]);
            });

            // Convert to CSV string
            const csvContent = csvData.map(row =>
                row.map(field => `"${field}"`).join(',')
            ).join('\n');

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Error al exportar los datos');
        }
    };

    // Get role icon
    const getRoleIcon = (role, roles) => {
        if (role === 'admin' || roles.includes('admin')) {
            return <AdminIcon sx={{ fontSize: 16, color: '#E53E3E' }} />;
        } else if (role === 'editor' || roles.includes('editor')) {
            return <EditorIcon sx={{ fontSize: 16, color: '#3182CE' }} />;
        }
        return <UserIcon sx={{ fontSize: 16, color: '#718096' }} />;
    };

    // Get ban status color
    const getBanStatusColor = (isBanned) => {
        return isBanned ? '#E53E3E' : '#48BB78';
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

    // Handle user actions
    const handleViewUser = (user) => {
        router.visit(route('admin.users.show', user.id));
        handleMenuClose();
    };

    const handleEditUser = (user) => {
        router.visit(route('admin.users.edit', user.id));
        handleMenuClose();
    };

    const handleDeleteUser = (user) => {
        setUserToDelete(user);
        setDeleteDialog(true);
        handleMenuClose();
    };

    const handleBanUser = (user) => {
        setUserToBan(user);
        setBanModalOpen(true);
        handleMenuClose();
    };

    const handleImpersonateUser = (user) => {
        setUserToImpersonate(user);
        setImpersonationDialogOpen(true);
        handleMenuClose();
    };

    // Handle ban confirmation from modal
    const handleBanConfirm = (banData) => {
        setBanLoading(true);
        router.post(route('admin.users.ban', userToBan.id), banData, {
            onSuccess: () => {
                setBanModalOpen(false);
                setUserToBan(null);
                setBanLoading(false);
                // Refresh the page to show updated status
                router.reload();
            },
            onError: () => {
                setBanLoading(false);
            }
        });
    };

    const handleUnbanUser = (user) => {
        if (confirm('¿Estás seguro de que quieres levantar la suspensión de este usuario?')) {
            router.post(route('admin.users.unban', user.id), {}, {
                onSuccess: () => {
                    // Refresh the page to show updated status
                    router.reload();
                }
            });
        }
        handleMenuClose();
    };

    // Handle modify ban
    const handleModifyBan = (user) => {
        setUserToModifyBan(user);
        setModifyBanModalOpen(true);
    };

    // Handle modify ban confirmation from modal
    const handleModifyBanConfirm = (banData) => {
        setModifyBanLoading(true);
        router.patch(route('admin.users.ban.modify', userToModifyBan.id), banData, {
            onSuccess: () => {
                setModifyBanModalOpen(false);
                setUserToModifyBan(null);
                setModifyBanLoading(false);
            },
            onError: () => {
                setModifyBanLoading(false);
            }
        });
    };

    const confirmDelete = () => {
        if (userToDelete) {
            router.delete(route('admin.users.destroy', userToDelete.id), {
                onSuccess: () => {
                    setDeleteDialog(false);
                    setUserToDelete(null);
                }
            });
        }
    };

    // Handle bulk actions
    const handleBulkAction = () => {
        if (selectedUsers.length === 0) return;
        setBulkActionDialog(true);
    };

    const executeBulkAction = () => {
        router.post(route('admin.users.bulk-action'), {
            action: bulkAction,
            user_ids: selectedUsers,
        }, {
            onSuccess: () => {
                setBulkActionDialog(false);
                setBulkAction('');
                setSelectedUsers([]);
            }
        });
    };

    // Statistics cards data
    const statsCards = [
        {
            title: 'Total Usuarios',
            value: stats.total,
            icon: <GroupIcon />,
            color: '#4299E1',
            subtitle: `${stats.new_this_month} nuevos este mes`
        },
        {
            title: 'Usuarios Activos',
            value: stats.active,
            icon: <ActiveIcon />,
            color: '#48BB78',
            subtitle: `${Math.round((stats.active / stats.total) * 100)}% del total`
        },
        {
            title: 'Usuarios Suspendidos',
            value: stats.banned,
            icon: <BannedIcon />,
            color: '#E53E3E',
            subtitle: `${Math.round((stats.banned / stats.total) * 100)}% del total`
        },
        {
            title: 'Administradores',
            value: stats.admins,
            icon: <AdminIcon />,
            color: '#9F7AEA',
            subtitle: `${Math.round((stats.admins / stats.total) * 100)}% del total`
        },
    ];

    return (
        <AdminLayoutNew>
            <Head title="Gestión de Usuarios" />
            
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ padding: '24px' }}
            >
                {/* Header */}
                <motion.div variants={itemVariants}>
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 600, color: '#2D3748', mb: 1 }}>
                                    Gestión de Usuarios
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#718096' }}>
                                    Administra usuarios, roles y permisos del sistema
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                startIcon={<PersonAddIcon />}
                                onClick={() => router.visit(route('admin.users.create'))}
                                sx={{
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 3,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                                    }
                                }}
                            >
                                Nuevo Usuario
                            </Button>
                        </Box>
                    </Box>
                </motion.div>

                {/* Flash Messages */}
                <AnimatePresence>
                    {flash?.success && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{ marginBottom: '24px' }}
                        >
                            <Alert severity="success" sx={{ borderRadius: '12px' }}>
                                {flash.success}
                            </Alert>
                        </motion.div>
                    )}
                    {flash?.error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{ marginBottom: '24px' }}
                        >
                            <Alert severity="error" sx={{ borderRadius: '12px' }}>
                                {flash.error}
                            </Alert>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tab Navigation */}
                <motion.div variants={itemVariants}>
                    <Card sx={{ ...glassmorphismCard, mb: 4 }}>
                        <Tabs
                            value={currentTab}
                            onChange={(e, newValue) => setCurrentTab(newValue)}
                            sx={{
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#667eea',
                                    height: 3,
                                    borderRadius: '3px',
                                },
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    color: '#718096',
                                    '&.Mui-selected': {
                                        color: '#667eea',
                                    },
                                },
                                px: 2,
                            }}
                        >
                            <Tab
                                label={`Todos los Usuarios (${stats.total})`}
                                icon={<GroupIcon />}
                                iconPosition="start"
                            />
                            <Tab
                                label={`Usuarios Suspendidos (${stats.banned || 0})`}
                                icon={<BannedIcon />}
                                iconPosition="start"
                            />
                        </Tabs>
                    </Card>
                </motion.div>

                {/* Tab Content */}
                {currentTab === 0 && (
                    <>
                        {/* Statistics Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {statsCards.map((stat, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <motion.div variants={itemVariants}>
                                <Card sx={statsCardStyle}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'between', mb: 2 }}>
                                            <Box sx={{ 
                                                p: 1.5, 
                                                borderRadius: '12px', 
                                                bgcolor: alpha(stat.color, 0.1),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {React.cloneElement(stat.icon, { 
                                                    sx: { fontSize: 24, color: stat.color } 
                                                })}
                                            </Box>
                                        </Box>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#2D3748', mb: 1 }}>
                                            {stat.value}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#4A5568', fontWeight: 500, mb: 1 }}>
                                            {stat.title}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#718096' }}>
                                            {stat.subtitle}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>

                {/* Filters and Search */}
                <motion.div variants={itemVariants}>
                    <Card sx={{ ...glassmorphismCard, mb: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Grid container spacing={3} alignItems="center">
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        placeholder="Buscar usuarios..."
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
                                        <InputLabel>Rol</InputLabel>
                                        <Select
                                            value={roleFilter}
                                            label="Rol"
                                            onChange={(e) => handleFilter('role', e.target.value)}
                                            sx={{
                                                borderRadius: '12px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            }}
                                        >
                                            <MenuItem value="">Todos</MenuItem>
                                            <MenuItem value="admin">Administrador</MenuItem>
                                            <MenuItem value="editor">Editor</MenuItem>
                                            <MenuItem value="user">Usuario</MenuItem>
                                            {roles.map(role => (
                                                <MenuItem key={role.id} value={role.name}>
                                                    {role.display_name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <FormControl fullWidth>
                                        <InputLabel>Estado</InputLabel>
                                        <Select
                                            value={banFilter}
                                            label="Estado"
                                            onChange={(e) => handleFilter('ban_status', e.target.value)}
                                            sx={{
                                                borderRadius: '12px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            }}
                                        >
                                            <MenuItem value="">Todos</MenuItem>
                                            <MenuItem value="active">Activos</MenuItem>
                                            <MenuItem value="banned">Suspendidos</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                        {selectedUsers.length > 0 && (
                                            <Button
                                                variant="outlined"
                                                onClick={handleBulkAction}
                                                sx={{
                                                    borderRadius: '12px',
                                                    textTransform: 'none',
                                                    borderColor: '#667eea',
                                                    color: '#667eea',
                                                }}
                                            >
                                                Acciones ({selectedUsers.length})
                                            </Button>
                                        )}
                                        <Button
                                            variant="outlined"
                                            startIcon={<DownloadIcon />}
                                            onClick={handleExport}
                                            sx={{
                                                borderRadius: '12px',
                                                textTransform: 'none',
                                                borderColor: '#48BB78',
                                                color: '#48BB78',
                                            }}
                                        >
                                            Exportar
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Users Table */}
                <motion.div variants={itemVariants}>
                    <Card sx={glassmorphismCard}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                indeterminate={selectedUsers.length > 0 && selectedUsers.length < users.data.length}
                                                checked={users.data.length > 0 && selectedUsers.length === users.data.length}
                                                onChange={handleSelectAll}
                                            />
                                        </TableCell>
                                        <TableCell>Usuario</TableCell>
                                        <TableCell>Rol</TableCell>
                                        <TableCell>Estado de Suspensión</TableCell>
                                        <TableCell>Último Login</TableCell>
                                        <TableCell>Registro</TableCell>
                                        <TableCell align="center">Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.data.map((user) => (
                                        <TableRow
                                            key={user.id}
                                            hover
                                            selected={selectedUsers.includes(user.id)}
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                }
                                            }}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selectedUsers.includes(user.id)}
                                                    onChange={() => handleSelectUser(user.id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Badge
                                                        overlap="circular"
                                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                        variant="dot"
                                                        sx={{
                                                            '& .MuiBadge-badge': {
                                                                backgroundColor: user.is_online ? '#48BB78' : '#CBD5E0',
                                                                width: 12,
                                                                height: 12,
                                                                borderRadius: '50%',
                                                                border: '2px solid white',
                                                            }
                                                        }}
                                                    >
                                                        <Avatar
                                                            src={user.avatar}
                                                            sx={{ width: 40, height: 40 }}
                                                        >
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </Avatar>
                                                    </Badge>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#2D3748' }}>
                                                            {user.name}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: '#718096' }}>
                                                            {user.email}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {getRoleIcon(user.role, user.roles)}
                                                    <Chip
                                                        label={user.roles.length > 0 ? user.roles.join(', ') : (user.role || 'Usuario')}
                                                        size="small"
                                                        sx={{
                                                            textTransform: 'capitalize',
                                                            fontWeight: 500,
                                                        }}
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.is_banned ? 'Suspendido' : 'Activo'}
                                                    size="small"
                                                    icon={user.is_banned ? <BannedIcon sx={{ fontSize: 16 }} /> : <ActiveIcon sx={{ fontSize: 16 }} />}
                                                    sx={{
                                                        backgroundColor: alpha(getBanStatusColor(user.is_banned), 0.1),
                                                        color: getBanStatusColor(user.is_banned),
                                                        fontWeight: 600,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ color: '#4A5568' }}>
                                                    {user.last_login_at
                                                        ? new Date(user.last_login_at).toLocaleDateString('es-ES')
                                                        : 'Nunca'
                                                    }
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ color: '#4A5568' }}>
                                                    {new Date(user.created_at).toLocaleDateString('es-ES')}
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

                        {/* Pagination */}
                        <TablePagination
                            component="div"
                            count={users.total}
                            page={users.current_page - 1}
                            onPageChange={(e, page) => {
                                router.get(route('admin.users.index'), {
                                    ...filters,
                                    page: page + 1,
                                });
                            }}
                            rowsPerPage={users.per_page}
                            onRowsPerPageChange={(e) => {
                                router.get(route('admin.users.index'), {
                                    ...filters,
                                    per_page: e.target.value,
                                });
                            }}
                            rowsPerPageOptions={[10, 15, 25, 50]}
                            labelRowsPerPage="Filas por página:"
                            labelDisplayedRows={({ from, to, count }) =>
                                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                            }
                        />
                    </Card>
                </motion.div>
                    </>
                )}

                {/* Banned Users Tab */}
                {currentTab === 1 && (
                    <motion.div variants={itemVariants}>
                        <BannedUsersTab
                            bannedUsers={users.data.filter(user => user.is_banned)}
                            stats={{
                                total_banned: stats.banned || 0,
                                temporary_bans: users.data.filter(user => user.is_banned && user.ban_details?.expires_at).length,
                                permanent_bans: users.data.filter(user => user.is_banned && !user.ban_details?.expires_at).length,
                                ip_bans: users.data.filter(user => user.is_banned && user.ban_details?.ip_ban).length,
                            }}
                            onUnbanUser={handleUnbanUser}
                            onModifyBan={handleModifyBan}
                            onViewHistory={(user) => {
                                setUserForBanHistory(user);
                                setBanHistoryModalOpen(true);
                            }}
                        />
                    </motion.div>
                )}

                {/* Ban User Modal */}
                <BanUserModal
                    open={banModalOpen}
                    onClose={() => {
                        setBanModalOpen(false);
                        setUserToBan(null);
                    }}
                    user={userToBan}
                    onConfirm={handleBanConfirm}
                    loading={banLoading}
                />

                {/* Modify Ban Modal */}
                <ModifyBanModal
                    open={modifyBanModalOpen}
                    onClose={() => {
                        setModifyBanModalOpen(false);
                        setUserToModifyBan(null);
                    }}
                    user={userToModifyBan}
                    onConfirm={handleModifyBanConfirm}
                    loading={modifyBanLoading}
                />

                {/* Ban History Modal */}
                <BanHistoryModal
                    open={banHistoryModalOpen}
                    onClose={() => {
                        setBanHistoryModalOpen(false);
                        setUserForBanHistory(null);
                    }}
                    user={userForBanHistory}
                />

                {/* Context Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                        sx: {
                            ...glassmorphismCard,
                            minWidth: 160,
                        }
                    }}
                >
                    <MenuItem onClick={() => handleViewUser(selectedUser)}>
                        <ViewIcon sx={{ mr: 1, fontSize: 18 }} />
                        Ver Detalles
                    </MenuItem>
                    <MenuItem onClick={() => handleEditUser(selectedUser)}>
                        <EditIcon sx={{ mr: 1, fontSize: 18 }} />
                        Editar
                    </MenuItem>
                    {selectedUser &&
                     !selectedUser.is_banned &&
                     !selectedUser.roles?.some(role => {
                        // Handle both string array and object array formats
                        const roleName = typeof role === 'string' ? role : role.name;
                        return ['admin', 'super-admin'].includes(roleName);
                    }) && (
                        <MenuItem
                            onClick={() => handleImpersonateUser(selectedUser)}
                            sx={{ color: '#805AD5' }}
                        >
                            <ImpersonateIcon sx={{ mr: 1, fontSize: 18 }} />
                            Impersonar
                        </MenuItem>
                    )}
                    {selectedUser && !selectedUser.is_banned ? (
                        <MenuItem
                            onClick={() => handleBanUser(selectedUser)}
                            sx={{ color: '#E53E3E' }}
                        >
                            <BlockIcon sx={{ mr: 1, fontSize: 18 }} />
                            Suspender Usuario
                        </MenuItem>
                    ) : (
                        <MenuItem
                            onClick={() => handleUnbanUser(selectedUser)}
                            sx={{ color: '#48BB78' }}
                        >
                            <UnbanIcon sx={{ mr: 1, fontSize: 18 }} />
                            Levantar Suspensión
                        </MenuItem>
                    )}
                    <MenuItem
                        onClick={() => handleDeleteUser(selectedUser)}
                        sx={{ color: '#E53E3E' }}
                    >
                        <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
                        Eliminar
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
                    <DialogTitle>
                        Acción en Lote
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" sx={{ mb: 2, color: '#718096' }}>
                            Selecciona una acción para aplicar a {selectedUsers.length} usuarios seleccionados:
                        </Typography>
                        <FormControl fullWidth>
                            <InputLabel>Acción</InputLabel>
                            <Select
                                value={bulkAction}
                                label="Acción"
                                onChange={(e) => setBulkAction(e.target.value)}
                                sx={{ borderRadius: '12px' }}
                            >
                                <MenuItem value="activate">Activar Usuarios</MenuItem>
                                <MenuItem value="deactivate">Desactivar Usuarios</MenuItem>
                                <MenuItem value="delete" sx={{ color: '#E53E3E' }}>
                                    Eliminar Usuarios
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setBulkActionDialog(false)}
                            sx={{ textTransform: 'none' }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={executeBulkAction}
                            variant="contained"
                            disabled={!bulkAction}
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                                background: bulkAction === 'delete'
                                    ? 'linear-gradient(135deg, #E53E3E 0%, #C53030 100%)'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            }}
                        >
                            Ejecutar
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={deleteDialog}
                    onClose={() => setDeleteDialog(false)}
                    PaperProps={{
                        sx: {
                            ...glassmorphismCard,
                            minWidth: 400,
                        }
                    }}
                >
                    <DialogTitle sx={{ color: '#E53E3E' }}>
                        Confirmar Eliminación
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body1">
                            ¿Estás seguro de que deseas eliminar al usuario{' '}
                            <strong>{userToDelete?.name}</strong>?
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, color: '#718096' }}>
                            Esta acción no se puede deshacer.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setDeleteDialog(false)}
                            sx={{ textTransform: 'none' }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={confirmDelete}
                            variant="contained"
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #E53E3E 0%, #C53030 100%)',
                            }}
                        >
                            Eliminar
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Impersonation Confirmation Dialog */}
                <ImpersonationConfirmDialog
                    open={impersonationDialogOpen}
                    onClose={() => {
                        setImpersonationDialogOpen(false);
                        setUserToImpersonate(null);
                    }}
                    user={userToImpersonate}
                />
            </motion.div>
        </AdminLayoutNew>
    );
};

export default UserManagement;
