import React, { useState } from 'react';
import {
    TextField,
    Switch,
    FormControlLabel,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Typography,
    Paper,
    Chip,
    Stack,
    FormHelperText,
    IconButton,
    Tooltip,
    Autocomplete,
    alpha,
    useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
    Error as ErrorIcon,
    CheckCircle as CheckCircleIcon,
    HistoryRounded as HistoryIcon,
    ReplayRounded as ReplayIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import FileUploadField from './FileUploadField';

const asBoolean = (value) => {
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'number') {
        return value === 1;
    }
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
    }
    return Boolean(value);
};

// Extract maxLength from validation rules
const getMaxLength = (validationRules) => {
    if (!validationRules) return null;

    const rules = Array.isArray(validationRules) ? validationRules : [];

    for (const rule of rules) {
        if (typeof rule === 'string') {
            const match = rule.match(/^max:(\d+)$/);
            if (match) return parseInt(match[1], 10);
        }
    }

    return null;
};

// Extract min/max for numeric fields
const getNumericConstraints = (validationRules) => {
    if (!validationRules) return {};

    const rules = Array.isArray(validationRules) ? validationRules : [];
    const constraints = {};

    for (const rule of rules) {
        if (typeof rule === 'string') {
            const minMatch = rule.match(/^min:(\d+)$/);
            const maxMatch = rule.match(/^max:(\d+)$/);

            if (minMatch) constraints.min = parseInt(minMatch[1], 10);
            if (maxMatch) constraints.max = parseInt(maxMatch[1], 10);
        }
    }

    return constraints;
};

const SettingField = ({
    setting,
    value,
    onChange,
    error,
    disabled = false,
    onOpenHistory,
    onReset,
}) => {
    const theme = useTheme();
    const [showPassword, setShowPassword] = useState(false);
    const [jsonError, setJsonError] = useState(null);

    const handleChange = (nextValue) => {
        if (onChange) {
            onChange(setting.key, nextValue);
        }
    };

    const isModified = Boolean(setting.isDirty);
    const hasError = Boolean(error);
    const maxLength = getMaxLength(setting.validation_rules);
    const numericConstraints = getNumericConstraints(setting.validation_rules);

    // Build helper text with character counter for text fields
    const buildHelperText = () => {
        const parts = [];

        if (error) {
            parts.push(error);
        } else if (setting.helper_text) {
            parts.push(setting.helper_text);
        }

        // Add character counter for string/text fields
        if ((setting.type === 'string' || setting.type === 'text') && maxLength) {
            const currentLength = (value ?? '').length;
            parts.push(`${currentLength}/${maxLength} caracteres`);
        }

        return parts.join(' • ');
    };

    const helperText = buildHelperText();

    const inputStyles = {
        '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
                backgroundColor: (theme) => theme.palette.background.paper,
                boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.primary.main, 0.08)}`,
            },
            '&.Mui-focused': {
                backgroundColor: (theme) => theme.palette.background.paper,
                boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.primary.main, 0.12)}`,
            },
        },
    };

    // Glassmorphism styles for Select dropdown menu
    const selectMenuProps = {
        PaperProps: {
            sx: {
                backgroundColor: alpha(theme.palette.background.paper, 0.95),
                backdropFilter: 'blur(20px)',
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.15)}`,
                mt: 1,
                '& .MuiMenuItem-root': {
                    borderRadius: 1,
                    mx: 1,
                    my: 0.5,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                    '&.Mui-selected': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.16),
                        },
                    },
                },
            },
        },
    };

    const renderField = () => {
        switch (setting.type) {
            case 'boolean': {
                const checked = asBoolean(value);
                return (
                    <Stack spacing={1}>
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                p: 1.5,
                                borderRadius: 2,
                                backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.6),
                                backdropFilter: 'blur(10px)',
                                border: '1px solid',
                                borderColor: (theme) => alpha(theme.palette.divider, 0.1),
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.8),
                                    boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                                },
                            }}
                        >
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={checked}
                                        onChange={(event) => handleChange(event.target.checked)}
                                        disabled={disabled}
                                    />
                                }
                                label={
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="body2" fontWeight={500}>
                                            {checked ? 'Activado' : 'Desactivado'}
                                        </Typography>
                                        {checked && (
                                            <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />
                                        )}
                                    </Stack>
                                }
                            />
                        </Box>
                        {hasError ? (
                            <FormHelperText error>{error}</FormHelperText>
                        ) : helperText ? (
                            <FormHelperText>{helperText}</FormHelperText>
                        ) : null}
                    </Stack>
                );
            }

            case 'select': {
                // Ensure options is an object, not an array
                const options = setting.options || {};
                const optionEntries = Object.entries(options);

                // Use Autocomplete for selects with more than 10 options
                const useAutocomplete = optionEntries.length > 10;

                if (useAutocomplete) {
                    const autocompleteOptions = optionEntries.map(([optionValue, optionLabel]) => ({
                        value: optionValue,
                        label: optionLabel,
                    }));

                    const selectedOption = autocompleteOptions.find(opt => opt.value === value) || null;

                    return (
                        <Autocomplete
                            fullWidth
                            options={autocompleteOptions}
                            value={selectedOption}
                            onChange={(event, newValue) => handleChange(newValue?.value || '')}
                            getOptionLabel={(option) => option.label || ''}
                            isOptionEqualToValue={(option, value) => option.value === value?.value}
                            disabled={disabled}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={setting.label}
                                    error={hasError}
                                    helperText={hasError ? error : helperText}
                                    sx={inputStyles}
                                />
                            )}
                            sx={{
                                '& .MuiAutocomplete-inputRoot': {
                                    ...inputStyles['& .MuiOutlinedInput-root'],
                                },
                            }}
                        />
                    );
                }

                return (
                    <FormControl fullWidth error={hasError} disabled={disabled} sx={inputStyles}>
                        <InputLabel>{setting.label}</InputLabel>
                        <Select
                            value={value ?? ''}
                            label={setting.label}
                            onChange={(event) => handleChange(event.target.value)}
                            displayEmpty
                            MenuProps={selectMenuProps}
                        >
                            <MenuItem value="" disabled>
                                Selecciona una opción
                            </MenuItem>
                            {optionEntries.map(([optionValue, optionLabel]) => (
                                <MenuItem key={optionValue} value={optionValue}>
                                    {optionLabel}
                                </MenuItem>
                            ))}
                        </Select>
                        {helperText && <FormHelperText>{helperText}</FormHelperText>}
                    </FormControl>
                );
            }

            case 'file':
                return (
                    <Stack spacing={1.5}>
                        <FileUploadField
                            settingKey={setting.key}
                            currentValue={value}
                            accept={setting.options?.accept || 'image/*'}
                            maxSize={setting.options?.maxSize || 2048}
                            onUploadSuccess={(newPath) => handleChange(newPath)}
                            onChange={(newPath) => handleChange(newPath)}
                        />
                        {helperText && <FormHelperText>{helperText}</FormHelperText>}
                        {hasError && <FormHelperText error>{error}</FormHelperText>}
                    </Stack>
                );

            case 'text': {
                const currentLength = (value ?? '').length;
                const showCounter = maxLength && maxLength > 0;
                const counterText = showCounter ? `${currentLength}/${maxLength}` : '';
                const combinedHelperText = [
                    helperText,
                    showCounter && `Máximo ${maxLength} caracteres`,
                    counterText
                ].filter(Boolean).join(' • ');

                return (
                    <TextField
                        fullWidth
                        multiline
                        minRows={4}
                        value={value ?? ''}
                        onChange={(event) => handleChange(event.target.value)}
                        error={hasError}
                        helperText={hasError ? error : combinedHelperText}
                        disabled={disabled}
                        placeholder={`Ingresa ${setting.label?.toLowerCase() || ''}`.trim()}
                        inputProps={{ maxLength: maxLength || undefined }}
                        sx={inputStyles}
                    />
                );
            }

            case 'email': {
                const currentLength = (value ?? '').length;
                const showCounter = maxLength && maxLength > 0;
                const counterText = showCounter ? `${currentLength}/${maxLength}` : '';
                const combinedHelperText = [
                    helperText,
                    showCounter && `Máximo ${maxLength} caracteres`,
                    counterText
                ].filter(Boolean).join(' • ');

                return (
                    <TextField
                        fullWidth
                        type="email"
                        value={value ?? ''}
                        onChange={(event) => handleChange(event.target.value)}
                        error={hasError}
                        helperText={hasError ? error : combinedHelperText}
                        disabled={disabled}
                        placeholder="correo@dominio.com"
                        inputProps={{ maxLength: maxLength || undefined }}
                        sx={inputStyles}
                    />
                );
            }

            case 'url': {
                const currentLength = (value ?? '').length;
                const showCounter = maxLength && maxLength > 0;
                const counterText = showCounter ? `${currentLength}/${maxLength}` : '';
                const combinedHelperText = [
                    helperText,
                    showCounter && `Máximo ${maxLength} caracteres`,
                    counterText
                ].filter(Boolean).join(' • ');

                return (
                    <TextField
                        fullWidth
                        type="url"
                        value={value ?? ''}
                        onChange={(event) => handleChange(event.target.value)}
                        error={hasError}
                        helperText={hasError ? error : combinedHelperText}
                        disabled={disabled}
                        placeholder="https://sitio.com"
                        inputProps={{ maxLength: maxLength || undefined }}
                        sx={inputStyles}
                    />
                );
            }

            case 'integer':
            case 'number': {
                // Determine unit based on setting key
                let unit = '';
                const key = setting.key?.toLowerCase() || '';
                if (key.includes('duration') || key.includes('timeout') || key.includes('ttl') || key.includes('cache')) {
                    if (key.includes('lockout')) {
                        unit = 'minutos';
                    } else {
                        unit = 'segundos';
                    }
                } else if (key.includes('retention') || key.includes('days')) {
                    unit = 'días';
                } else if (key.includes('size') || key.includes('upload')) {
                    unit = 'KB';
                } else if (key.includes('length') || key.includes('min') || key.includes('max')) {
                    unit = 'caracteres';
                } else if (key.includes('per_page') || key.includes('limit')) {
                    unit = 'elementos';
                }

                const constraints = [];
                if (numericConstraints.min !== undefined) {
                    constraints.push(`Mínimo: ${numericConstraints.min}${unit ? ' ' + unit : ''}`);
                }
                if (numericConstraints.max !== undefined) {
                    constraints.push(`Máximo: ${numericConstraints.max}${unit ? ' ' + unit : ''}`);
                }

                const combinedHelperText = [
                    helperText,
                    ...constraints
                ].filter(Boolean).join(' • ');

                return (
                    <TextField
                        fullWidth
                        type="number"
                        value={value ?? ''}
                        onChange={(event) => handleChange(event.target.value)}
                        error={hasError}
                        helperText={hasError ? error : combinedHelperText}
                        disabled={disabled}
                        inputProps={{
                            min: numericConstraints.min,
                            max: numericConstraints.max,
                        }}
                        sx={inputStyles}
                    />
                );
            }

            case 'password':
                return (
                    <TextField
                        fullWidth
                        type={showPassword ? 'text' : 'password'}
                        value={value ?? ''}
                        onChange={(event) => handleChange(event.target.value)}
                        error={hasError}
                        helperText={helperText}
                        disabled={disabled}
                        placeholder="••••••••"
                        InputProps={{
                            endAdornment: (
                                <IconButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                    size="small"
                                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                >
                                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                            ),
                        }}
                        sx={inputStyles}
                    />
                );

            case 'datetime':
                return (
                    <TextField
                        fullWidth
                        type="datetime-local"
                        value={value ?? ''}
                        onChange={(event) => handleChange(event.target.value)}
                        error={hasError}
                        helperText={helperText}
                        disabled={disabled}
                        InputLabelProps={{ shrink: true }}
                        sx={inputStyles}
                    />
                );

            case 'json':
                return (
                    <TextField
                        fullWidth
                        multiline
                        minRows={6}
                        value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value ?? ''}
                        onChange={(event) => {
                            const inputValue = event.target.value;
                            setJsonError(null);

                            if (!inputValue.trim()) {
                                handleChange(null);
                                return;
                            }

                            try {
                                const parsed = JSON.parse(inputValue);
                                handleChange(parsed);
                            } catch (parseError) {
                                setJsonError(`JSON inválido: ${parseError.message}`);
                                handleChange(inputValue);
                            }
                        }}
                        error={hasError || Boolean(jsonError)}
                        helperText={jsonError || (hasError ? error : helperText || 'Formato JSON válido')}
                        disabled={disabled}
                        sx={{
                            ...inputStyles,
                            '& .MuiOutlinedInput-root': {
                                ...inputStyles['& .MuiOutlinedInput-root'],
                                fontFamily: '"Fira Code", "Courier New", monospace',
                                fontSize: '0.875rem',
                            },
                        }}
                    />
                );

            default:
                return (
                    <TextField
                        fullWidth
                        value={value ?? ''}
                        onChange={(event) => handleChange(event.target.value)}
                        error={hasError}
                        helperText={helperText}
                        disabled={disabled}
                        placeholder={`Ingresa ${setting.label?.toLowerCase() || ''}`.trim()}
                        inputProps={{ maxLength: maxLength || undefined }}
                        sx={inputStyles}
                    />
                );
        }
    };
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            whileHover={{ y: -1 }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, md: 2.25 },
                    borderRadius: 2.5,
                    border: '1.5px solid',
                    borderColor: hasError
                        ? (theme) => alpha(theme.palette.error.main, 0.4)
                        : isModified
                        ? (theme) => alpha(theme.palette.primary.main, 0.4)
                        : (theme) => alpha(theme.palette.divider, 0.15),
                    backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(12px)',
                    boxShadow: (theme) =>
                        hasError
                            ? `0 4px 20px ${alpha(theme.palette.error.main, 0.12)}`
                            : isModified
                            ? `0 4px 20px ${alpha(theme.palette.primary.main, 0.08)}`
                            : `0 2px 12px ${alpha(theme.palette.common.black, 0.04)}`,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: hasError
                            ? (theme) =>
                                  `linear-gradient(90deg, ${theme.palette.error.main}, ${theme.palette.error.light})`
                            : isModified
                            ? (theme) =>
                                  `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
                            : 'transparent',
                        opacity: 0.8,
                    },
                    '&:hover': {
                        borderColor: hasError
                            ? (theme) => alpha(theme.palette.error.main, 0.5)
                            : isModified
                            ? (theme) => alpha(theme.palette.primary.main, 0.5)
                            : (theme) => alpha(theme.palette.primary.main, 0.25),
                        boxShadow: (theme) =>
                            hasError
                                ? `0 6px 24px ${alpha(theme.palette.error.main, 0.15)}`
                                : `0 6px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
                    },
                }}
            >
                <Stack spacing={2}>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                    >
                        <Box sx={{ flex: 1 }}>
                            <Typography
                                variant="body1"
                                fontWeight={600}
                                sx={{
                                    mb: 0.25,
                                    fontSize: '0.95rem',
                                    background: (theme) =>
                                        `linear-gradient(135deg, ${theme.palette.text.primary}, ${alpha(
                                            theme.palette.primary.main,
                                            0.8
                                        )})`,
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                {setting.label}
                            </Typography>
                            {setting.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, fontSize: '0.85rem' }}>
                                    {setting.description}
                                </Typography>
                            )}
                        </Box>
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            flexWrap="wrap"
                            sx={{ gap: 1 }}
                        >
                            {isModified && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                >
                                    <Chip
                                        label="Modificado"
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        sx={{
                                            backdropFilter: 'blur(10px)',
                                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                            borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                                            fontWeight: 600,
                                        }}
                                    />
                                </motion.div>
                            )}
                            {setting.required && (
                                <Chip
                                    label="Requerido"
                                    size="small"
                                    color="error"
                                    variant="outlined"
                                    sx={{
                                        backdropFilter: 'blur(10px)',
                                        backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1),
                                        borderColor: (theme) => alpha(theme.palette.error.main, 0.3),
                                        fontWeight: 600,
                                    }}
                                />
                            )}
                            {hasError && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                >
                                    <Chip
                                        icon={<ErrorIcon sx={{ fontSize: 16 }} />}
                                        label="Revisar"
                                        size="small"
                                        color="error"
                                        sx={{
                                            backdropFilter: 'blur(10px)',
                                            backgroundColor: (theme) => alpha(theme.palette.error.main, 0.15),
                                            fontWeight: 600,
                                        }}
                                    />
                                </motion.div>
                            )}
                            {onOpenHistory && (
                                <Tooltip title="Ver historial de cambios">
                                    <span>
                                        <IconButton
                                            size="small"
                                            onClick={() => onOpenHistory(setting)}
                                            sx={{
                                                borderRadius: 2,
                                                backgroundColor: (theme) =>
                                                    alpha(theme.palette.primary.main, 0.12),
                                                color: 'primary.main',
                                                '&:hover': {
                                                    backgroundColor: (theme) =>
                                                        alpha(theme.palette.primary.main, 0.2),
                                                },
                                            }}
                                        >
                                            <HistoryIcon fontSize="small" />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            )}
                            {onReset && (
                                <Tooltip title="Restablecer valor original">
                                    <span>
                                        <IconButton
                                            size="small"
                                            onClick={() => onReset(setting)}
                                            disabled={!isModified || disabled}
                                            sx={{
                                                borderRadius: 2,
                                                backgroundColor: (theme) =>
                                                    alpha(theme.palette.text.primary, 0.06),
                                                '&:hover': {
                                                    backgroundColor: (theme) =>
                                                        alpha(theme.palette.text.primary, 0.12),
                                                },
                                            }}
                                        >
                                            <ReplayIcon fontSize="small" />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            )}
                        </Stack>
                    </Stack>

                    <Box>{renderField()}</Box>

                    {process.env.NODE_ENV === 'development' && (
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'text.secondary',
                                fontFamily: 'monospace',
                                opacity: 0.6,
                                fontSize: '0.7rem',
                            }}
                        >
                            Key: {setting.key}
                        </Typography>
                    )}
                </Stack>
            </Paper>
        </motion.div>
    );
};

export default SettingField;


