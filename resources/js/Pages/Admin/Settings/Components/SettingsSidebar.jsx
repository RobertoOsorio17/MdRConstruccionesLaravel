import React from 'react';
import {
    alpha,
    Box,
    Chip,
    Divider,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    TextField,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import {
    RefreshRounded as RefreshIcon,
    SearchRounded as SearchIcon,
    Settings as SettingsIcon,
    Business as BusinessIcon,
    Email as EmailIcon,
    Security as SecurityIcon,
    Share as ShareIcon,
    Build as BuildIcon,
    Storage as StorageIcon,
    Tune as TuneIcon,
    Speed as SpeedIcon,
    TravelExplore as SeoIcon,
    Article as ArticleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const iconRegistry = {
    settings: SettingsIcon,
    general: SettingsIcon,
    business: BusinessIcon,
    company: BusinessIcon,
    email: EmailIcon,
    security: SecurityIcon,
    share: ShareIcon,
    social: ShareIcon,
    build: BuildIcon,
    maintenance: BuildIcon,
    storage: StorageIcon,
    backup: StorageIcon,
    api: TuneIcon,
    performance: SpeedIcon,
    search: SeoIcon,
    seo: SeoIcon,
    article: ArticleIcon,
    blog: ArticleIcon,
};

const MotionListItem = motion(ListItem);

const SettingsSidebar = ({
    groups,
    activeGroup,
    searchTerm,
    onSelectGroup,
    onSearchChange,
    onResetGroup,
}) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                p: 2.5,
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.background.paper, 0.75),
                border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                backdropFilter: 'blur(16px)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <TextField
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Buscar configuración…"
                size="small"
                fullWidth
                variant="outlined"
                sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.background.default, 0.6),
                        backdropFilter: 'blur(6px)',
                    },
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                        </InputAdornment>
                    ),
                }}
            />

            <List
                disablePadding
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    pr: 0.5,
                    '&::-webkit-scrollbar': {
                        width: 6,
                    },
                    '&::-webkit-scrollbar-thumb': {
                        borderRadius: 3,
                        background: alpha(theme.palette.text.secondary, 0.2),
                    },
                }}
            >
                {groups.map((group, index) => {
                    const IconComponent =
                        iconRegistry[group.icon] ?? SettingsIcon;
                    const isActive = group.key === activeGroup;
                    const showMatches =
                        group.matchCount !== group.totalSettings &&
                        group.matchCount > 0;

                    return (
                        <MotionListItem
                            key={group.key}
                            disablePadding
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                                duration: 0.28,
                                delay: index * 0.04,
                            }}
                        >
                            <ListItemButton
                                selected={isActive}
                                onClick={() => onSelectGroup(group.key)}
                                sx={{
                                    borderRadius: 2,
                                    alignItems: 'flex-start',
                                    mb: 1,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    backgroundColor: isActive
                                        ? alpha(theme.palette.primary.main, 0.12)
                                        : 'transparent',
                                    '&:hover': {
                                        backgroundColor: alpha(
                                            theme.palette.primary.main,
                                            0.16,
                                        ),
                                        transform: 'translateX(6px)',
                                        '& .sidebar-icon': {
                                            transform: 'scale(1.1)',
                                            boxShadow: `0 4px 12px ${alpha(
                                                theme.palette.primary.main,
                                                0.3,
                                            )}`,
                                        },
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 36, mt: 0.4 }}>
                                    <Box
                                        className="sidebar-icon"
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: isActive
                                                ? `linear-gradient(135deg, ${alpha(
                                                      theme.palette.primary.main,
                                                      0.2,
                                                  )}, ${alpha(theme.palette.primary.light, 0.1)})`
                                                : `linear-gradient(135deg, ${alpha(
                                                      theme.palette.primary.main,
                                                      0.08,
                                                  )}, ${alpha(theme.palette.primary.light, 0.04)})`,
                                            border: `2px solid ${alpha(
                                                theme.palette.primary.main,
                                                isActive ? 0.4 : 0.15,
                                            )}`,
                                            color: isActive
                                                ? theme.palette.primary.main
                                                : alpha(theme.palette.primary.main, 0.7),
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        }}
                                    >
                                        <IconComponent sx={{ fontSize: 20 }} />
                                    </Box>
                                </ListItemIcon>

                                <ListItemText
                                    primary={
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                        >
                                            <Typography
                                                variant="subtitle2"
                                                fontWeight={600}
                                                sx={{
                                                    color: isActive
                                                        ? theme.palette.primary.main
                                                        : theme.palette.text.primary,
                                                }}
                                            >
                                                {group.label}
                                            </Typography>
                                            {group.dirtyCount > 0 && (
                                                <Chip
                                                    size="small"
                                                    label={group.dirtyCount}
                                                    color="warning"
                                                    variant="filled"
                                                    sx={{
                                                        borderRadius: 2,
                                                        fontWeight: 700,
                                                        fontSize: '0.7rem',
                                                        height: 20,
                                                        minWidth: 20,
                                                        '& .MuiChip-label': {
                                                            px: 0.75,
                                                        },
                                                        backgroundColor: alpha(
                                                            theme.palette.warning.main,
                                                            0.2,
                                                        ),
                                                        color: theme.palette.warning.main,
                                                        border: `1px solid ${alpha(
                                                            theme.palette.warning.main,
                                                            0.4,
                                                        )}`,
                                                    }}
                                                />
                                            )}
                                        </Stack>
                                    }
                                    secondary={
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                display: 'block',
                                                color: alpha(
                                                    theme.palette.text.secondary,
                                                    0.8,
                                                ),
                                            }}
                                        >
                                            {group.description}
                                        </Typography>
                                    }
                                />

                                <Stack spacing={1} alignItems="flex-end">
                                    <Chip
                                        size="small"
                                        label={`${group.totalSettings}`}
                                        sx={{
                                            borderRadius: 2,
                                            fontWeight: 600,
                                            backgroundColor: alpha(
                                                theme.palette.primary.main,
                                                isActive ? 0.2 : 0.08,
                                            ),
                                            color: theme.palette.primary.main,
                                        }}
                                    />
                                    {showMatches && (
                                        <Chip
                                            size="small"
                                            label={`${group.matchCount} coinciden`}
                                            variant="outlined"
                                            sx={{
                                                borderRadius: 2,
                                                borderColor: alpha(
                                                    theme.palette.primary.light,
                                                    0.4,
                                                ),
                                                color: theme.palette.primary.light,
                                            }}
                                        />
                                    )}
                                </Stack>
                            </ListItemButton>
                        </MotionListItem>
                    );
                })}
            </List>

            <Divider sx={{ my: 2 }} />

            <Tooltip title="Restablecer el grupo activo">
                <span>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                            Opciones de grupo
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={() => onResetGroup(activeGroup)}
                            disabled={!activeGroup}
                            aria-label="Restablecer grupo activo"
                            sx={{
                                borderRadius: 2,
                                backgroundColor: alpha(
                                    theme.palette.primary.main,
                                    0.12,
                                ),
                                '&:hover': {
                                    backgroundColor: alpha(
                                        theme.palette.primary.main,
                                        0.22,
                                    ),
                                },
                            }}
                        >
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                </span>
            </Tooltip>
        </Box>
    );
};

export default SettingsSidebar;
