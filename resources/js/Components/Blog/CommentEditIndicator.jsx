import React, { useState } from 'react';
import {
    Box,
    Chip,
    Tooltip,
    Typography,
    IconButton,
    alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

/**
 * CommentEditIndicator Component
 * Displays an elegant indicator when a comment has been edited
 * Shows edit timestamp, reason, and edit count
 * 
 * @param {Object} comment - The comment object with edit information
 * @param {Function} onViewHistory - Optional callback to view edit history
 */
export default function CommentEditIndicator({ comment, onViewHistory }) {
    const theme = useTheme();
    const [showDetails, setShowDetails] = useState(false);

    if (!comment.edited_at) {
        return null;
    }

    const editedDate = comment.edited_at_human || comment.edited_at;
    const hasReason = comment.edit_reason && comment.edit_reason.trim().length > 0;
    const editCount = comment.edit_count || 1;

    return (
        <Box
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                mt: 1,
                p: 1,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.info.light, 0.05)} 100%)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                    background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.08)} 0%, ${alpha(theme.palette.info.light, 0.08)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                },
            }}
        >
            {/* Edit Icon */}
            <EditIcon 
                sx={{ 
                    fontSize: 16, 
                    color: theme.palette.info.main,
                    opacity: 0.8,
                }} 
            />

            {/* Edit Text */}
            <Typography
                variant="caption"
                sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                    fontSize: '0.75rem',
                }}
            >
                Editado {editedDate}
            </Typography>

            {/* Edit Count Badge */}
            {editCount > 1 && (
                <Chip
                    label={`${editCount}x`}
                    size="small"
                    sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        backgroundColor: alpha(theme.palette.info.main, 0.1),
                        color: theme.palette.info.main,
                        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    }}
                />
            )}

            {/* Reason Tooltip */}
            {hasReason && (
                <Tooltip
                    title={
                        <Box sx={{ p: 0.5 }}>
                            <Typography variant="caption" fontWeight="600" display="block" gutterBottom>
                                Motivo de la edición:
                            </Typography>
                            <Typography variant="caption" display="block">
                                {comment.edit_reason}
                            </Typography>
                        </Box>
                    }
                    arrow
                    placement="top"
                >
                    <InfoOutlinedIcon
                        sx={{
                            fontSize: 16,
                            color: theme.palette.info.main,
                            cursor: 'pointer',
                            opacity: 0.7,
                            transition: 'opacity 0.2s',
                            '&:hover': {
                                opacity: 1,
                            },
                        }}
                    />
                </Tooltip>
            )}

            {/* View History Button */}
            {onViewHistory && (
                <Tooltip title="Ver historial de ediciones" arrow>
                    <IconButton
                        size="small"
                        onClick={onViewHistory}
                        sx={{
                            ml: 0.5,
                            width: 24,
                            height: 24,
                            color: theme.palette.info.main,
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.info.main, 0.1),
                            },
                        }}
                    >
                        <HistoryIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    );
}

