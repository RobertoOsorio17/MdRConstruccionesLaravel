import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayoutNew from '@/Layouts/AdminLayoutNew';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Snackbar,
  Stack,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Avatar,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  alpha,
  Skeleton,
  Fade,
  Zoom,
  Slide,
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Check as ApproveIcon,
  Flag as SpamIcon,
  Visibility as ViewIcon,
  Refresh as ResetIcon,
  Close as CloseIcon,
  ViewList as ViewListIcon,
  ViewAgenda as ViewCardsIcon,
  DensitySmall as DensityIcon,
  Comment as CommentIcon,
  ThumbUp as ThumbUpIcon,
  Block as BlockIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  Article as ArticleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  HelpOutline as HelpIcon,
  Keyboard as KeyboardIcon,
  FilterList as FilterIcon,
  GetApp as ExportIcon,
  ChatBubbleOutline as EmptyCommentIcon,
  Celebration as CelebrationIcon,
  Reply as ReplyIcon,
} from '@mui/icons-material';

// Admin Comments Moderation Hub (Rediseño completo)
// - Panel lateral de filtros (estado, post, eliminados, búsqueda)
// - KPIs superiores
// - Vista tabla o tarjetas con selección y acciones masivas
// - Drawer de detalle del comentario
// - Paginación conservando filtros

const STATUS_LABEL = {
  approved: 'Aprobado',
  pending: 'Pendiente',
  rejected: 'Rechazado',
  spam: 'Spam',
};

const statusColor = (status) => {
  switch (status) {
    case 'approved':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'error';
    case 'spam':
      return 'error';
    default:
      return 'default';
  }
};

// ============================================================================
// COMPONENTES AUXILIARES PREMIUM
// ============================================================================

// Contador animado para KPIs
const AnimatedCounter = ({ value, duration = 1000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (start === end) return;

    const totalFrames = Math.round(duration / 16); // 60fps
    const increment = (end - start) / totalFrames;
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      start += increment;
      setCount(Math.floor(start));

      if (frame === totalFrames) {
        clearInterval(counter);
        setCount(end);
      }
    }, 16);

    return () => clearInterval(counter);
  }, [value, duration]);

  return <span>{count}</span>;
};

// Resaltador de texto para búsqueda
const HighlightText = ({ text, highlight }) => {
  if (!highlight?.trim()) return <>{text}</>;

  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <Box
            key={i}
            component="span"
            sx={{
              backgroundColor: 'warning.light',
              color: 'warning.contrastText',
              px: 0.5,
              borderRadius: 0.5,
              fontWeight: 600,
            }}
          >
            {part}
          </Box>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

// Estado vacío ilustrado
const EmptyState = ({ icon: Icon = EmptyCommentIcon, title, description }) => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          px: 3,
        }}
      >
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.dark, 0.05)})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <Icon sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.5) }} />
        </Box>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={400}>
          {description}
        </Typography>
      </Box>
    </motion.div>
  );
};

// Skeleton loader para tarjetas
const SkeletonCard = () => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        background: alpha(theme.palette.background.paper, 0.6),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 2,
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Skeleton variant="circular" width={40} height={40} />
          <Box flex={1}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
        </Stack>
        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
        <Stack direction="row" spacing={1}>
          <Skeleton variant="rounded" width={80} height={32} />
          <Skeleton variant="rounded" width={100} height={32} />
        </Stack>
      </Stack>
    </Paper>
  );
};

// Skeleton loader para tabla
const SkeletonTable = ({ rows = 5 }) => (
  <TableContainer>
    <Table>
      <TableHead>
        <TableRow>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <TableCell key={i}>
              <Skeleton variant="text" width="80%" />
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i}>
            {[1, 2, 3, 4, 5, 6].map((j) => (
              <TableCell key={j}>
                <Skeleton variant="text" width={j === 2 ? '100%' : '60%'} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

// Diálogo de confirmación premium
const ConfirmDialog = ({ open, onClose, onConfirm, title, description, confirmText = 'Confirmar', confirmColor = 'primary', icon: Icon }) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          background: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        },
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {Icon && (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${alpha(theme.palette[confirmColor]?.main || theme.palette.primary.main, 0.1)}, ${alpha(theme.palette[confirmColor]?.dark || theme.palette.primary.dark, 0.05)})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon color={confirmColor} />
            </Box>
          )}
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancelar
        </Button>
        <Button onClick={onConfirm} variant="contained" color={confirmColor} autoFocus>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const CommentsIndex = ({ comments, posts, stats, filters }) => {
  const theme = useTheme();

  // Filtros iniciales desde el servidor
  const [search, setSearch] = useState(filters?.search || '');
  const [status, setStatus] = useState(filters?.status || '');
  const [postId, setPostId] = useState(filters?.post || '');
  const [deletedStatus, setDeletedStatus] = useState(filters?.deleted_status || 'active');

  // Preferencias de vista
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [density, setDensity] = useState('compact'); // 'comfortable' | 'compact'

  // Selección y snackbar
  const [selected, setSelected] = useState(new Set());
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Drawer de detalle
  const [drawer, setDrawer] = useState({ open: false, comment: null });

  // Expandir comentarios inline
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Diálogo de atajos
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Diálogo de confirmación
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, data: null });

  // Celebración de éxito
  const [showCelebration, setShowCelebration] = useState(false);

  const searchRef = useRef(null);

  useEffect(() => {
    const vm = localStorage.getItem('admin_comments_viewMode');
    const dn = localStorage.getItem('admin_comments_density');
    if (vm === 'table' || vm === 'cards') setViewMode(vm);
    if (dn === 'comfortable' || dn === 'compact') setDensity(dn);
  }, []);

  useEffect(() => {
    localStorage.setItem('admin_comments_viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('admin_comments_density', density);
  }, [density]);

  const initialRows = useMemo(() => (comments?.data || []), [comments]);
  const [items, setItems] = useState(initialRows);
  useEffect(() => {
    setItems(initialRows);
  }, [initialRows]);

  const showMsg = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const buildUrlWithParams = (extra = {}, overrides = {}) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', extra.page ? String(extra.page) : '1');
    const s = overrides.search ?? search;
    const st = overrides.status ?? status;
    const p = overrides.post ?? postId;
    const del = overrides.deleted_status ?? deletedStatus;
    if (s) url.searchParams.set('search', s); else url.searchParams.delete('search');
    if (st) url.searchParams.set('status', st); else url.searchParams.delete('status');
    if (p) url.searchParams.set('post', p); else url.searchParams.delete('post');
    if (del) url.searchParams.set('deleted_status', del); else url.searchParams.delete('deleted_status');
    return url;
  };

  const applyFilters = () => {
    const url = buildUrlWithParams({ page: 1 });
    window.location.href = url.toString();
  };

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setPostId('');
    setDeletedStatus('active');
    const url = new URL(window.location.href);
    url.search = '';
    window.location.href = url.toString();
  };

  const onPageChange = (_e, page) => {
    const url = buildUrlWithParams({ page });
    window.location.href = url.toString();
  };

  const toggleSelectAll = (checked) => {
    if (checked) setSelected(new Set(items.map((r) => r.id)));
    else setSelected(new Set());
  };

  const toggleSelect = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const handleStatusChange = async (commentId, newStatus) => {
    setLoading(true);
    try {
      const res = await fetch(`/admin/comments/${commentId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Error servidor');
      // Optimistic update
      setItems((prev) => prev.map((it) => (it.id === commentId ? { ...it, status: newStatus } : it)));
      setDrawer((d) => (d.comment && d.comment.id === commentId ? { ...d, comment: { ...d.comment, status: newStatus } } : d));

      // Celebración si es aprobación
      if (newStatus === 'approved') {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      }

      showMsg('Estado actualizado correctamente', 'success');
    } catch (e) {
      showMsg('No se pudo actualizar el estado', 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (commentId) => {
    setConfirmDialog({
      open: true,
      action: 'delete',
      data: commentId,
    });
  };

  const handleDelete = async (commentId) => {
    setConfirmDialog({ open: false, action: null, data: null });
    setLoading(true);
    try {
      const res = await fetch(`/admin/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });
      if (!res.ok) throw new Error('Error servidor');
      // Marcar como eliminado localmente
      const deletedAt = new Date().toISOString();
      setItems((prev) => prev.map((it) => (it.id === commentId ? { ...it, deleted_at: deletedAt } : it)));
      setDrawer((d) => (d.comment && d.comment.id === commentId ? { ...d, comment: { ...d.comment, deleted_at: deletedAt } } : d));

      // Mostrar mensaje con efecto liquid glass
      showMsg('✓ El comentario ha sido eliminado correctamente', 'success');
    } catch (e) {
      showMsg('No se pudo eliminar el comentario', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para responder a comentarios
  const handleReply = (comment) => {
    // Abrir el drawer con el comentario y enfocar en respuesta
    setDrawer({ open: true, comment });
    // Scroll al formulario de respuesta después de un pequeño delay
    setTimeout(() => {
      const replySection = document.getElementById('reply-section');
      if (replySection) {
        replySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  };

  const handleRestore = async (commentId) => {
    setLoading(true);
    try {
      const res = await fetch(`/admin/comments/${commentId}/restore`, {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });
      if (!res.ok) throw new Error('Error servidor');
      setItems((prev) => prev.map((it) => (it.id === commentId ? { ...it, deleted_at: null } : it)));
      setDrawer((d) => (d.comment && d.comment.id === commentId ? { ...d, comment: { ...d.comment, deleted_at: null } } : d));
      showMsg('Comentario restaurado correctamente', 'success');
    } catch (e) {
      showMsg('No se pudo restaurar', 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmBulkAction = (action) => {
    if (selected.size === 0) {
      showMsg('Selecciona al menos un comentario', 'warning');
      return;
    }
    setConfirmDialog({
      open: true,
      action: `bulk_${action}`,
      data: Array.from(selected),
    });
  };

  const bulkAction = async (action) => {
    setConfirmDialog({ open: false, action: null, data: null });

    if (selected.size === 0) {
      showMsg('Selecciona al menos un comentario', 'warning');
      return;
    }
    const ids = Array.from(selected);
    setLoading(true);
    try {
      let url = '';
      let method = 'POST';
      let body = { comment_ids: ids };
      if (action === 'approve') {
        url = '/admin/comments/bulk-approve';
      } else if (action === 'spam') {
        url = '/admin/comments/bulk-spam';
      } else if (action === 'delete') {
        // Laravel define esta ruta como DELETE; usamos override con _method
        url = '/admin/comments/bulk-delete';
        body = { _method: 'DELETE', comment_ids: ids };
      }
      if (!url) return;
      const headers = {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      };
      if (action === 'delete') headers['X-HTTP-Method-Override'] = 'DELETE';
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Error servidor');
      // Actualizar localmente de forma básica
      if (action === 'approve') {
        setItems((prev) => prev.map((it) => (ids.includes(it.id) ? { ...it, status: 'approved' } : it)));
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      } else if (action === 'spam') {
        setItems((prev) => prev.map((it) => (ids.includes(it.id) ? { ...it, status: 'spam' } : it)));
      } else if (action === 'delete') {
        const now = new Date().toISOString();
        setItems((prev) => prev.map((it) => (ids.includes(it.id) ? { ...it, deleted_at: now } : it)));
      }
      setSelected(new Set());
      showMsg(`Acción masiva completada: ${ids.length} comentario(s) procesado(s)`, 'success');
    } catch (e) {
      showMsg('No se pudo completar la acción masiva', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return '—';
    // El backend ya envía d/m/Y H:i, lo mostramos tal cual
    return value;
  };

  const openDrawer = (comment) => setDrawer({ open: true, comment });
  const closeDrawer = () => setDrawer({ open: false, comment: null });

  const RowActions = ({ c }) => (
    <Stack direction="row" spacing={1} justifyContent="flex-end">
      {c.status !== 'approved' && (
        <Tooltip title="Aprobar">
          <IconButton size="small" color="success" onClick={() => handleStatusChange(c.id, 'approved')}>
            <ApproveIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {c.status !== 'spam' && (
        <Tooltip title="Marcar como spam">
          <IconButton size="small" color="error" onClick={() => handleStatusChange(c.id, 'spam')}>
            <SpamIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Responder">
        <IconButton
          size="small"
          color="primary"
          onClick={() => handleReply(c)}
          sx={{
            background: alpha(theme.palette.primary.main, 0.1),
            backdropFilter: 'blur(10px)',
            '&:hover': {
              background: alpha(theme.palette.primary.main, 0.2),
              transform: 'scale(1.1)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <ReplyIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Ver detalle">
        <IconButton size="small" onClick={() => openDrawer(c)}>
          <ViewIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Eliminar">
        <IconButton size="small" color="error" onClick={() => confirmDelete(c.id)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );

  const densityRowSx = density === 'compact' ? { py: 0.5 } : { py: 1.25 };

  // Tabs rápidas por estado
  const [tab, setTab] = useState(() => {
    if (status === 'pending') return 1;
    if (status === 'approved') return 2;
    if (status === 'rejected') return 3;
    if (status === 'spam') return 4;
    return 0; // Todos
  });

  const onChangeTab = (_e, v) => {
    setTab(v);
    const map = { 0: '', 1: 'pending', 2: 'approved', 3: 'rejected', 4: 'spam' };
    const nextStatus = map[v];
    setStatus(nextStatus);
    // Aplicar inmediatamente manteniendo los otros filtros (evitar race con setState)
    const url = buildUrlWithParams({ page: 1 }, { status: nextStatus });
    window.location.href = url.toString();
  };

  // Atajos de teclado mejorados
  useEffect(() => {
    const handler = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')) return;
      const key = e.key.toLowerCase();

      // ? para ayuda
      if (key === '?' || (e.shiftKey && key === '/')) {
        e.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      // / o s para buscar
      if (key === '/' || key === 's') {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }

      // Acciones masivas (solo si hay selección)
      if (selected.size > 0) {
        if (key === 'a' || key === 'enter') {
          e.preventDefault();
          bulkAction('approve');
        } else if (key === 'r') {
          e.preventDefault();
          bulkAction('spam');
        } else if (key === 'delete' || key === 'd') {
          e.preventDefault();
          bulkAction('delete');
        } else if (key === 'escape') {
          e.preventDefault();
          setSelected(new Set());
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected]);

  // Toggle expandir comentario
  const toggleExpand = (id) => {
    const next = new Set(expandedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedRows(next);
  };

  return (
    <AdminLayoutNew title="Gestión de Comentarios">
      <Head title="Comentarios - Admin" />

      {/* Loading bar */}
      {loading && <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }} />}

      {/* Encabezado + KPIs con glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Gestión de Comentarios
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Modera, filtra y gestiona conversaciones de tu comunidad
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<HelpIcon />}
              onClick={() => setShortcutsOpen(true)}
              sx={{ textTransform: 'none' }}
            >
              Atajos (?)
            </Button>
          </Stack>
        </Box>

        {/* KPIs - CSS Grid */}
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, mb: 3 }}>
          <motion.div whileHover={{ scale: 1.03, y: -5 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
            <Paper elevation={0} sx={{
              p: 2.5,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.primary.dark, 0.08)})`,
              backdropFilter: 'blur(30px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
              '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light}, ${theme.palette.primary.main})`, backgroundSize: '200% 100%', animation: 'shimmer 3s ease-in-out infinite' },
              '&::after': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: `radial-gradient(circle at top right, ${alpha(theme.palette.primary.light, 0.2)}, transparent 50%)`, pointerEvents: 'none' },
              '@keyframes shimmer': { '0%, 100%': { backgroundPosition: '0% 0%' }, '50%': { backgroundPosition: '100% 0%' } },
            }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    <AnimatedCounter value={stats?.total ?? items.length} />
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Total Comentarios</Typography>
                </Box>
                <CommentIcon sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.4), position: 'relative', zIndex: 1 }} />
              </Stack>
            </Paper>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03, y: -5 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
            <Paper elevation={0} sx={{
              p: 2.5,
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.15)}, ${alpha(theme.palette.warning.dark, 0.08)})`,
              backdropFilter: 'blur(30px)',
              border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `0 8px 32px ${alpha(theme.palette.warning.main, 0.15)}`,
              '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.warning.light}, ${theme.palette.warning.main})`, backgroundSize: '200% 100%', animation: 'shimmer 3s ease-in-out infinite' },
              '&::after': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(circle at top right, ${alpha(theme.palette.warning.light, 0.2)}, transparent 50%)`, pointerEvents: 'none' },
            }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography variant="h4" fontWeight={700} color="warning.main">
                    <AnimatedCounter value={stats?.pending ?? 0} />
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Pendientes</Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: alpha(theme.palette.warning.main, 0.4), position: 'relative', zIndex: 1 }} />
              </Stack>
            </Paper>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03, y: -5 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
            <Paper elevation={0} sx={{
              p: 2.5,
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.15)}, ${alpha(theme.palette.success.dark, 0.08)})`,
              backdropFilter: 'blur(30px)',
              border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `0 8px 32px ${alpha(theme.palette.success.main, 0.15)}`,
              '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light}, ${theme.palette.success.main})`, backgroundSize: '200% 100%', animation: 'shimmer 3s ease-in-out infinite' },
              '&::after': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(circle at top right, ${alpha(theme.palette.success.light, 0.2)}, transparent 50%)`, pointerEvents: 'none' },
            }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    <AnimatedCounter value={stats?.approved ?? 0} />
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Aprobados</Typography>
                </Box>
                <ThumbUpIcon sx={{ fontSize: 40, color: alpha(theme.palette.success.main, 0.4), position: 'relative', zIndex: 1 }} />
              </Stack>
            </Paper>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03, y: -5 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
            <Paper elevation={0} sx={{
              p: 2.5,
              background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.15)}, ${alpha(theme.palette.error.dark, 0.08)})`,
              backdropFilter: 'blur(30px)',
              border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `0 8px 32px ${alpha(theme.palette.error.main, 0.15)}`,
              '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${theme.palette.error.main}, ${theme.palette.error.light}, ${theme.palette.error.main})`, backgroundSize: '200% 100%', animation: 'shimmer 3s ease-in-out infinite' },
              '&::after': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(circle at top right, ${alpha(theme.palette.error.light, 0.2)}, transparent 50%)`, pointerEvents: 'none' },
            }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography variant="h4" fontWeight={700} color="error.main">
                    <AnimatedCounter value={(stats?.spam ?? 0) + (stats?.deleted ?? 0)} />
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Spam/Eliminados</Typography>
                </Box>
                <BlockIcon sx={{ fontSize: 40, color: alpha(theme.palette.error.main, 0.3) }} />
              </Stack>
            </Paper>
          </motion.div>
        </Box>

        {/* Chips de filtros activos */}
        {(search || status || postId || deletedStatus !== 'active') && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mt: 2,
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.08)}, ${alpha(theme.palette.info.dark, 0.05)})`,
                backdropFilter: 'blur(25px)',
                border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                borderRadius: 3,
                boxShadow: `0 4px 20px ${alpha(theme.palette.info.main, 0.1)}`,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.info.main, 0.5)}, transparent)`,
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mr: 1 }}>
                  Filtros activos:
                </Typography>
                {search && (
                  <Chip
                    label={`Búsqueda: "${search}"`}
                    size="small"
                    onDelete={() => {
                      setSearch('');
                      const url = buildUrlWithParams({ page: 1 }, { search: '' });
                      window.location.href = url.toString();
                    }}
                    sx={{
                      background: alpha(theme.palette.primary.main, 0.1),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    }}
                  />
                )}
                {status && (
                  <Chip
                    label={`Estado: ${STATUS_LABEL[status] || status}`}
                    size="small"
                    onDelete={() => {
                      setStatus('');
                      const url = buildUrlWithParams({ page: 1 }, { status: '' });
                      window.location.href = url.toString();
                    }}
                    sx={{
                      background: alpha(theme.palette.warning.main, 0.1),
                      border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                    }}
                  />
                )}
                {postId && (
                  <Chip
                    label={`Post: ${posts?.find(p => p.id === parseInt(postId))?.title || postId}`}
                    size="small"
                    onDelete={() => {
                      setPostId('');
                      const url = buildUrlWithParams({ page: 1 }, { post: '' });
                      window.location.href = url.toString();
                    }}
                    sx={{
                      background: alpha(theme.palette.success.main, 0.1),
                      border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                    }}
                  />
                )}
                {deletedStatus !== 'active' && (
                  <Chip
                    label={`Eliminación: ${deletedStatus === 'deleted' ? 'Solo eliminados' : 'Todos'}`}
                    size="small"
                    onDelete={() => {
                      setDeletedStatus('active');
                      const url = buildUrlWithParams({ page: 1 }, { deleted_status: 'active' });
                      window.location.href = url.toString();
                    }}
                    sx={{
                      background: alpha(theme.palette.error.main, 0.1),
                      border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                    }}
                  />
                )}
                <Button
                  size="small"
                  startIcon={<CloseIcon />}
                  onClick={resetFilters}
                  sx={{ ml: 'auto', textTransform: 'none' }}
                >
                  Limpiar todo
                </Button>
              </Stack>
            </Paper>
          </motion.div>
        )}
      </motion.div>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'minmax(260px, 3fr) minmax(0, 9fr)', lg: 'minmax(280px, 2.8fr) minmax(0, 9.2fr)' } }}>
        {/* Panel lateral de filtros con glassmorphism */}
        <Box>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.85)})`,
                backdropFilter: 'blur(30px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                borderRadius: 3,
                position: 'sticky',
                top: 80,
                boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Stack spacing={2.5}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                    <FilterIcon fontSize="small" color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      Filtros
                    </Typography>
                  </Stack>
                  {/* Tabs rápidas */}
                  <Tabs
                    value={tab}
                    onChange={onChangeTab}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{
                      '& .MuiTab-root': {
                        minHeight: 40,
                        textTransform: 'none',
                        fontSize: '0.875rem',
                      }
                    }}
                  >
                    <Tab label={`Todos (${stats?.total ?? items.length})`} />
                    <Tab label={`Pendientes (${stats?.pending ?? 0})`} />
                    <Tab label={`Aprobados (${stats?.approved ?? 0})`} />
                    <Tab label={`Rechazados (${stats?.rejected ?? 0})`} />
                    <Tab label={`Spam (${stats?.spam ?? 0})`} />
                  </Tabs>
                </Box>

                <Divider />

                <TextField
                  inputRef={searchRef}
                  label="Buscar comentarios"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Autor, email o contenido..."
                  size="small"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') applyFilters();
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />

                <FormControl fullWidth size="small">
                  <InputLabel id="status-label">Estado</InputLabel>
                  <Select
                    labelId="status-label"
                    label="Estado"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    sx={{
                      background: alpha(theme.palette.background.default, 0.5),
                    }}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="pending">Pendiente</MenuItem>
                    <MenuItem value="approved">Aprobado</MenuItem>
                    <MenuItem value="rejected">Rechazado</MenuItem>
                    <MenuItem value="spam">Spam</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel id="post-filter-label">Post</InputLabel>
                  <Select
                    labelId="post-filter-label"
                    label="Post"
                    value={postId}
                    onChange={(e) => setPostId(e.target.value)}
                    sx={{
                      background: alpha(theme.palette.background.default, 0.5),
                    }}
                  >
                    <MenuItem value="">Todos los posts</MenuItem>
                    {(posts || []).map((p) => (
                      <MenuItem key={p.id} value={String(p.id)}>{p.title}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel id="deleted-label">Eliminación</InputLabel>
                  <Select
                    labelId="deleted-label"
                    label="Eliminación"
                    value={deletedStatus}
                    onChange={(e) => setDeletedStatus(e.target.value)}
                    sx={{
                      background: alpha(theme.palette.background.default, 0.5),
                    }}
                  >
                    <MenuItem value="active">Solo activos</MenuItem>
                    <MenuItem value="deleted">Solo eliminados</MenuItem>
                    <MenuItem value="all">Todos</MenuItem>
                  </Select>
                </FormControl>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    onClick={applyFilters}
                    startIcon={<SearchIcon />}
                    fullWidth
                    disabled={loading}
                  >
                    Aplicar
                  </Button>
                  <Tooltip title="Limpiar todos los filtros">
                    <IconButton
                      color="secondary"
                      onClick={resetFilters}
                      disabled={loading}
                      sx={{
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      }}
                    >
                      <ResetIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>

                <Divider />

                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                    Vista
                  </Typography>
                  <ToggleButtonGroup
                    size="small"
                    exclusive
                    fullWidth
                    value={viewMode}
                    onChange={(_e, v) => v && setViewMode(v)}
                  >
                    <ToggleButton value="table" aria-label="Vista tabla">
                      <ViewListIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Tabla
                    </ToggleButton>
                    <ToggleButton value="cards" aria-label="Vista tarjetas">
                      <ViewCardsIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Tarjetas
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                    Densidad
                  </Typography>
                  <ToggleButtonGroup
                    size="small"
                    exclusive
                    fullWidth
                    value={density}
                    onChange={(_e, v) => v && setDensity(v)}
                  >
                    <ToggleButton value="comfortable" aria-label="Densidad cómoda">
                      <DensityIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Cómoda
                    </ToggleButton>
                    <ToggleButton value="compact" aria-label="Densidad compacta">
                      <DensityIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Compacta
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <Button
                  variant="outlined"
                  startIcon={<ExportIcon />}
                  href="/admin/comment-management/export"
                  fullWidth
                  sx={{ textTransform: 'none' }}
                >
                  Exportar datos
                </Button>
              </Stack>
            </Paper>
          </motion.div>
        </Box>

        {/* Contenido principal con glassmorphism */}
        <Box>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: 2,
              }}
            >
              {/* Barra de acciones masivas mejorada */}
              <AnimatePresence>
                {selected.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert
                      severity="info"
                      icon={<KeyboardIcon />}
                      sx={{
                        mb: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.dark, 0.05)})`,
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                      }}
                      action={
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Tooltip title="Aprobar seleccionados (A)">
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => confirmBulkAction('approve')}
                              startIcon={<ApproveIcon />}
                              disabled={loading}
                            >
                              Aprobar ({selected.size})
                            </Button>
                          </Tooltip>
                          <Tooltip title="Marcar como spam (R)">
                            <Button
                              size="small"
                              variant="contained"
                              color="warning"
                              onClick={() => confirmBulkAction('spam')}
                              startIcon={<SpamIcon />}
                              disabled={loading}
                            >
                              Spam ({selected.size})
                            </Button>
                          </Tooltip>
                          <Tooltip title="Eliminar seleccionados (D)">
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              onClick={() => confirmBulkAction('delete')}
                              startIcon={<DeleteIcon />}
                              disabled={loading}
                            >
                              Eliminar ({selected.size})
                            </Button>
                          </Tooltip>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setSelected(new Set())}
                            disabled={loading}
                          >
                            Cancelar (Esc)
                          </Button>
                        </Stack>
                      }
                    >
                      <strong>{selected.size}</strong> comentario{selected.size !== 1 ? 's' : ''} seleccionado{selected.size !== 1 ? 's' : ''}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

            {/* Tabla mejorada con expansión inline */}
            {viewMode === 'table' && (
              <TableContainer sx={{ maxHeight: '70vh', overflow: 'auto', borderRadius: 2, background: alpha(theme.palette.background.paper, 0.6), backdropFilter: 'blur(8px)', border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Table size={density === 'compact' ? 'small' : 'medium'}>
                  <TableHead sx={{ '& th': { position: 'sticky', top: 0, zIndex: 2, background: alpha(theme.palette.background.paper, 0.85), backdropFilter: 'blur(6px)' } }}>
                    <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.05) }}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={selected.size > 0 && selected.size < items.length}
                          checked={items.length > 0 && selected.size === items.length}
                          onChange={(e) => toggleSelectAll(e.target.checked)}
                        />
                      </TableCell>
                      <TableCell><Typography variant="subtitle2" fontWeight={600}>Autor</Typography></TableCell>
                      <TableCell><Typography variant="subtitle2" fontWeight={600}>Comentario</Typography></TableCell>
                      <TableCell><Typography variant="subtitle2" fontWeight={600}>Post</Typography></TableCell>
                      <TableCell><Typography variant="subtitle2" fontWeight={600}>Estado</Typography></TableCell>
                      <TableCell><Typography variant="subtitle2" fontWeight={600}>Fecha</Typography></TableCell>
                      <TableCell align="right"><Typography variant="subtitle2" fontWeight={600}>Acciones</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((c, idx) => {
                      const authorName = c.user?.name || c.author_name || 'Invitado';
                      const initials = authorName?.charAt(0)?.toUpperCase?.() || '?';
                      const commentText = c.body || '';
                      const postTitle = c.post?.title || '—';
                      const isDeleted = !!c.deleted_at;
                      const isExpanded = expandedRows.has(c.id);
                      const isLongComment = commentText.length > 100;

                      return (
                        <React.Fragment key={c.id}>
                          <TableRow
                            hover
                            sx={{
                              ...densityRowSx,
                              background: selected.has(c.id) ? alpha(theme.palette.primary.main, 0.05) : (idx % 2 ? alpha(theme.palette.action.hover, 0.04) : 'transparent'),
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                background: alpha(theme.palette.primary.main, 0.08),
                              }
                            }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selected.has(c.id)}
                                onChange={() => toggleSelect(c.id)}
                                color="primary"
                              />
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                  }}
                                >
                                  {initials}
                                </Avatar>
                                <Stack>
                                  <Typography
                                    variant="body2"
                                    fontWeight={600}
                                    component="a"
                                    href={`/admin/comments/${c.id}`}
                                    sx={{
                                      textDecoration: 'none',
                                      color: 'text.primary',
                                      '&:hover': {
                                        color: 'primary.main',
                                        textDecoration: 'underline',
                                      }
                                    }}
                                  >
                                    {authorName}
                                  </Typography>
                                  {c.author_email && (
                                    <Typography variant="caption" color="text.secondary">
                                      {c.author_email}
                                    </Typography>
                                  )}
                                </Stack>
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ maxWidth: 400 }}>
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: isExpanded ? 'unset' : 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  <HighlightText text={commentText} highlight={search} />
                                </Typography>
                                {isLongComment && (
                                  <Button
                                    size="small"
                                    onClick={() => toggleExpand(c.id)}
                                    endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    sx={{ mt: 0.5, textTransform: 'none', fontSize: '0.75rem' }}
                                  >
                                    {isExpanded ? 'Ver menos' : 'Ver más'}
                                  </Button>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ maxWidth: 200 }}>
                              <Tooltip title={postTitle}>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <ArticleIcon fontSize="small" color="action" />
                                  <Typography variant="body2" noWrap>
                                    {postTitle}
                                  </Typography>
                                </Stack>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                                <Chip
                                  size="small"
                                  label={STATUS_LABEL[c.status] || c.status}
                                  color={statusColor(c.status)}
                                  sx={{ fontWeight: 600 }}
                                />
                                {isDeleted && (
                                  <Chip
                                    size="small"
                                    label="Eliminado"
                                    color="error"
                                    variant="outlined"
                                  />
                                )}
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(c.created_at)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <RowActions c={c} />
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      );
                    })}
                    {items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <EmptyState
                            icon={EmptyCommentIcon}
                            title="No hay comentarios"
                            description="Ajusta los filtros o limpia la búsqueda para ver más resultados"
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Tarjetas mejoradas con animaciones */}
            {viewMode === 'cards' && (
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
                <AnimatePresence>
                  {items.map((c, index) => {
                    const authorName = c.user?.name || c.author_name || 'Invitado';
                    const initials = authorName?.charAt(0)?.toUpperCase?.() || '?';
                    const postTitle = c.post?.title || '—';
                    const isDeleted = !!c.deleted_at;

                    return (
                      <Box key={c.id}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ y: -4 }}
                        >
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              height: '100%',
                              background: selected.has(c.id)
                                ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.primary.dark, 0.08)})`
                                : `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
                              backdropFilter: 'blur(25px)',
                              border: `1px solid ${selected.has(c.id) ? alpha(theme.palette.primary.main, 0.4) : alpha(theme.palette.divider, 0.15)}`,
                              borderRadius: 3,
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              position: 'relative',
                              overflow: 'hidden',
                              boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: `radial-gradient(circle at top left, ${alpha(theme.palette.primary.light, 0.1)}, transparent 60%)`,
                                pointerEvents: 'none',
                                opacity: selected.has(c.id) ? 1 : 0,
                                transition: 'opacity 0.3s ease',
                              },
                              '&:hover': {
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                                boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
                                transform: 'translateY(-2px)',
                                '&::before': {
                                  opacity: 1,
                                },
                              }
                            }}
                          >
                            <Stack spacing={2} sx={{ height: '100%' }}>
                              {/* Header */}
                              <Stack direction="row" spacing={1.5} alignItems="flex-start" justifyContent="space-between">
                                <Stack direction="row" spacing={1.5} alignItems="center" flex={1}>
                                  <Checkbox
                                    size="small"
                                    checked={selected.has(c.id)}
                                    onChange={() => toggleSelect(c.id)}
                                    color="primary"
                                  />
                                  <Avatar
                                    sx={{
                                      width: 36,
                                      height: 36,
                                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                      fontSize: '0.875rem',
                                      fontWeight: 600,
                                    }}
                                  >
                                    {initials}
                                  </Avatar>
                                  <Stack flex={1} minWidth={0}>
                                    <Typography variant="body2" fontWeight={700} noWrap>
                                      {authorName}
                                    </Typography>
                                    {c.author_email && (
                                      <Typography variant="caption" color="text.secondary" noWrap>
                                        {c.author_email}
                                      </Typography>
                                    )}
                                  </Stack>
                                </Stack>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <Chip
                                    size="small"
                                    label={STATUS_LABEL[c.status] || c.status}
                                    color={statusColor(c.status)}
                                    sx={{ fontWeight: 600 }}
                                  />
                                  {isDeleted && (
                                    <Chip size="small" label="Del" color="error" variant="outlined" />
                                  )}
                                </Stack>
                              </Stack>

                              {/* Comentario */}
                              <Box
                                sx={{
                                  flexGrow: 1,
                                  p: 1.5,
                                  background: alpha(theme.palette.background.default, 0.5),
                                  borderRadius: 1,
                                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                }}
                              >
                                <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6 }}>
                                  <HighlightText text={c.body} highlight={search} />
                                </Typography>
                              </Box>

                              {/* Footer */}
                              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                <Tooltip title={postTitle}>
                                  <Stack direction="row" spacing={0.5} alignItems="center" flex={1} minWidth={0}>
                                    <ArticleIcon fontSize="small" color="action" />
                                    <Typography variant="caption" color="text.secondary" noWrap>
                                      {postTitle}
                                    </Typography>
                                  </Stack>
                                </Tooltip>
                                <Stack direction="row" spacing={0.5}>
                                  <Tooltip title="Responder">
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => handleReply(c)}
                                      sx={{
                                        background: alpha(theme.palette.primary.main, 0.1),
                                        backdropFilter: 'blur(10px)',
                                        '&:hover': {
                                          background: alpha(theme.palette.primary.main, 0.2),
                                          transform: 'scale(1.1)',
                                        },
                                        transition: 'all 0.3s ease',
                                      }}
                                    >
                                      <ReplyIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Ver detalle">
                                    <IconButton size="small" onClick={() => openDrawer(c)}>
                                      <ViewIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  {c.status !== 'approved' && (
                                    <Tooltip title="Aprobar">
                                      <IconButton
                                        size="small"
                                        color="success"
                                        onClick={() => handleStatusChange(c.id, 'approved')}
                                        disabled={loading}
                                      >
                                        <ApproveIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                  {c.status !== 'spam' && (
                                    <Tooltip title="Spam">
                                      <IconButton
                                        size="small"
                                        color="warning"
                                        onClick={() => handleStatusChange(c.id, 'spam')}
                                        disabled={loading}
                                      >
                                        <SpamIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                  <Tooltip title="Eliminar">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => confirmDelete(c.id)}
                                      disabled={loading}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </Stack>

                              {/* Fecha */}
                              <Typography variant="caption" color="text.secondary" textAlign="right">
                                {formatDate(c.created_at)}
                              </Typography>
                            </Stack>
                          </Paper>
                        </motion.div>
                      </Box>
                    );
                  })}
                </AnimatePresence>
                {items.length === 0 && (
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <EmptyState
                      icon={EmptyCommentIcon}
                      title="No hay comentarios"
                      description="Ajusta los filtros o limpia la búsqueda para ver más resultados"
                    />
                  </Box>
                )}
              </Box>
            )}

            {/* Paginación */}
            {comments?.last_page > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                  count={comments.last_page}
                  page={comments.current_page || 1}
                  onChange={onPageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </Paper>
        </motion.div>
        </Box>
      </Box>

      {/* Drawer de detalle */}
      <Drawer anchor="right" open={drawer.open} onClose={closeDrawer} PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}>
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6">Detalle del comentario</Typography>
            <IconButton onClick={closeDrawer}><CloseIcon /></IconButton>
          </Stack>
          <Divider sx={{ mb: 2 }} />

          {drawer.comment ? (
            <Stack spacing={2} sx={{ flexGrow: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar>{(drawer.comment.user?.name || drawer.comment.author_name || '?').charAt(0).toUpperCase()}</Avatar>
                <Box>
                  <Typography variant="subtitle2">{drawer.comment.user?.name || drawer.comment.author_name || 'Invitado'}</Typography>
                  {drawer.comment.author_email && (
                    <Typography variant="caption" color="text.secondary">{drawer.comment.author_email}</Typography>
                  )}
                </Box>
              </Stack>

              <Stack direction="row" spacing={1}>
                <Chip size="small" label={STATUS_LABEL[drawer.comment.status] || drawer.comment.status} color={statusColor(drawer.comment.status)} />
                {drawer.comment.deleted_at && <Chip size="small" label="Eliminado" color="error" variant="outlined" />}
              </Stack>

              <Box>
                <Typography variant="caption" color="text.secondary">Comentario</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>{drawer.comment.body}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Post</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>{drawer.comment.post?.title || '—'}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Creado</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>{formatDate(drawer.comment.created_at)}</Typography>
              </Box>

              <Divider />

              <Stack direction="row" spacing={1}>
                {drawer.comment.status !== 'approved' && (
                  <Button variant="contained" color="success" onClick={() => handleStatusChange(drawer.comment.id, 'approved')} startIcon={<ApproveIcon />}>Aprobar</Button>
                )}
                {drawer.comment.status !== 'spam' && (
                  <Button variant="outlined" color="warning" onClick={() => handleStatusChange(drawer.comment.id, 'spam')} startIcon={<SpamIcon />}>Spam</Button>
                )}
                {!drawer.comment.deleted_at ? (
                  <Button variant="outlined" color="error" onClick={() => handleDelete(drawer.comment.id)} startIcon={<DeleteIcon />}>Eliminar</Button>
                ) : (
                  <Button variant="contained" color="primary" onClick={() => handleRestore(drawer.comment.id)}>Restaurar</Button>
                )}
              </Stack>

              <Box>
                <Button href={`/admin/comments/${drawer.comment.id}`} sx={{ mt: 1 }} size="small">
                  Abrir página del comentario
                </Button>
              </Box>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">Selecciona un comentario para ver su detalle</Typography>
          )}
        </Box>
      </Drawer>

      {/* Diálogo de atajos de teclado */}
      <Dialog
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <KeyboardIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Atajos de Teclado
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                background: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Usa estos atajos para moderar comentarios más rápidamente
              </Typography>
            </Paper>

            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2">Buscar comentarios</Typography>
                <Chip label="/ o S" size="small" variant="outlined" />
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2">Aprobar seleccionados</Typography>
                <Chip label="A o Enter" size="small" variant="outlined" color="success" />
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2">Marcar como spam</Typography>
                <Chip label="R" size="small" variant="outlined" color="warning" />
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2">Eliminar seleccionados</Typography>
                <Chip label="D o Delete" size="small" variant="outlined" color="error" />
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2">Limpiar selección</Typography>
                <Chip label="Esc" size="small" variant="outlined" />
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2">Mostrar esta ayuda</Typography>
                <Chip label="?" size="small" variant="outlined" color="primary" />
              </Stack>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShortcutsOpen(false)} variant="contained">
            Entendido
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogos de confirmación */}
      <ConfirmDialog
        open={confirmDialog.open && confirmDialog.action === 'delete'}
        onClose={() => setConfirmDialog({ open: false, action: null, data: null })}
        onConfirm={() => handleDelete(confirmDialog.data)}
        title="Confirmar eliminación"
        description="¿Estás seguro de que deseas eliminar este comentario? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        confirmColor="error"
        icon={DeleteIcon}
      />

      <ConfirmDialog
        open={confirmDialog.open && confirmDialog.action === 'bulk_approve'}
        onClose={() => setConfirmDialog({ open: false, action: null, data: null })}
        onConfirm={() => bulkAction('approve')}
        title="Aprobar comentarios"
        description={`¿Deseas aprobar ${selected.size} comentario${selected.size !== 1 ? 's' : ''}?`}
        confirmText="Aprobar"
        confirmColor="success"
        icon={ApproveIcon}
      />

      <ConfirmDialog
        open={confirmDialog.open && confirmDialog.action === 'bulk_spam'}
        onClose={() => setConfirmDialog({ open: false, action: null, data: null })}
        onConfirm={() => bulkAction('spam')}
        title="Marcar como spam"
        description={`¿Deseas marcar ${selected.size} comentario${selected.size !== 1 ? 's' : ''} como spam?`}
        confirmText="Marcar spam"
        confirmColor="warning"
        icon={SpamIcon}
      />

      <ConfirmDialog
        open={confirmDialog.open && confirmDialog.action === 'bulk_delete'}
        onClose={() => setConfirmDialog({ open: false, action: null, data: null })}
        onConfirm={() => bulkAction('delete')}
        title="Eliminar comentarios"
        description={`¿Estás seguro de que deseas eliminar ${selected.size} comentario${selected.size !== 1 ? 's' : ''}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        confirmColor="error"
        icon={DeleteIcon}
      />

      {/* Efecto de celebración */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10000,
              pointerEvents: 'none',
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.9)}, ${alpha(theme.palette.success.dark, 0.95)})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 60px ${alpha(theme.palette.success.main, 0.6)}`,
              }}
            >
              <CelebrationIcon sx={{ fontSize: 60, color: 'white' }} />
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          variant="filled"
          sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette[snackbar.severity]?.main || theme.palette.info.main, 0.9)}, ${alpha(theme.palette[snackbar.severity]?.dark || theme.palette.info.dark, 0.95)})`,
            backdropFilter: 'blur(10px)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AdminLayoutNew>
  );
};

export default CommentsIndex;
