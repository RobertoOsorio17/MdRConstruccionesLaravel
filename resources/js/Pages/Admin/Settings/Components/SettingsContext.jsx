import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
} from 'react';

const SettingsContext = createContext(null);

const INITIAL_ACTION = 'HYDRATE';
const ACTIONS = {
    SET_VALUE: 'SET_VALUE',
    SET_ACTIVE_GROUP: 'SET_ACTIVE_GROUP',
    SET_SEARCH: 'SET_SEARCH',
    RESET_GROUP: 'RESET_GROUP',
    RESET_KEY: 'RESET_KEY',
    RESET_ALL: 'RESET_ALL',
    SET_ERRORS: 'SET_ERRORS',
    SET_SAVING: 'SET_SAVING',
    SET_SAVE_STATUS: 'SET_SAVE_STATUS',
    SET_PREVIEW_OPEN: 'SET_PREVIEW_OPEN',
    SET_MAINTENANCE_OPEN: 'SET_MAINTENANCE_OPEN',
    SET_SIDEBAR_OPEN: 'SET_SIDEBAR_OPEN',
    COMMIT_CHANGES: 'COMMIT_CHANGES',
    HYDRATE: INITIAL_ACTION,
};

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);
const FALSE_VALUES = new Set(['0', 'false', 'no', 'off', '']);

// Deep clone that preserves dates and handles complex objects
function deepClone(value) {
    if (value === null || value === undefined) {
        return null;
    }

    // Handle Date objects
    if (value instanceof Date) {
        return new Date(value.getTime());
    }

    // Handle Arrays
    if (Array.isArray(value)) {
        return value.map(item => deepClone(item));
    }

    // Handle Objects
    if (typeof value === 'object') {
        const cloned = {};
        for (const key in value) {
            if (value.hasOwnProperty(key)) {
                cloned[key] = deepClone(value[key]);
            }
        }
        return cloned;
    }

    // Handle primitives (string, number, boolean)
    return value;
}

function areValuesEqual(a, b) {
    if (a === b) {
        return true;
    }

    if (typeof a === 'boolean' || typeof b === 'boolean') {
        return Boolean(a) === Boolean(b);
    }

    if (a === null || b === null || a === undefined || b === undefined) {
        return (a ?? null) === (b ?? null);
    }

    if (typeof a === 'number' || typeof b === 'number') {
        return Number(a) === Number(b);
    }

    if (
        Array.isArray(a) ||
        Array.isArray(b) ||
        (typeof a === 'object' && a !== null) ||
        (typeof b === 'object' && b !== null)
    ) {
        try {
            return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
        } catch (error) {
            return false;
        }
    }

    return String(a ?? '') === String(b ?? '');
}

function coerceBoolean(value) {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'number') {
        return value === 1;
    }

    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();

        if (TRUE_VALUES.has(normalized)) {
            return true;
        }

        if (FALSE_VALUES.has(normalized)) {
            return false;
        }
    }

    return Boolean(value);
}

function coerceJson(value, fallback = null) {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }

    if (Array.isArray(value) || typeof value === 'object') {
        return value;
    }

    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        } catch (error) {
            return fallback ?? value;
        }
    }

    return fallback ?? value;
}

function coerceSettingValue(type, value) {
    switch (type) {
        case 'boolean':
            return coerceBoolean(value);
        case 'integer':
        case 'number': {
            if (value === null || value === undefined || value === '') {
                return null;
            }
            const numeric = Number(value);
            return Number.isNaN(numeric) ? null : numeric;
        }
        case 'float': {
            if (value === null || value === undefined || value === '') {
                return null;
            }
            const floatValue = parseFloat(value);
            return Number.isNaN(floatValue) ? null : floatValue;
        }
        case 'datetime': {
            if (value === null || value === undefined || value === '') {
                return null;
            }
            // Convert "YYYY-MM-DD HH:MM:SS" to "YYYY-MM-DDTHH:MM" for datetime-local input
            if (typeof value === 'string') {
                try {
                    const date = new Date(value.replace(' ', 'T'));
                    if (isNaN(date.getTime())) return null;

                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');

                    return `${year}-${month}-${day}T${hours}:${minutes}`;
                } catch (error) {
                    return null;
                }
            }
            return value;
        }
        case 'json':
            return coerceJson(value, null);
        case 'array': {
            const parsed = coerceJson(value, []);
            return Array.isArray(parsed) ? parsed : [];
        }
        default:
            return value ?? null;
    }
}

function normalizeGroupMeta(key, meta = {}) {
    return {
        key,
        label: meta.label ?? key,
        description: meta.description ?? '',
        icon: meta.icon ?? 'settings',
    };
}

function normalizeSetting(setting) {
    const normalized = {
        ...setting,
        value: coerceSettingValue(setting.type, setting.value),
    };

    if (!normalized.group) {
        normalized.group = setting.group;
    }

    return normalized;
}

function buildBaseGroups(settingsData = {}, groupsMeta = {}) {
    const normalized = [];
    const seen = new Set();

    const pushGroup = (groupKey, items, meta = {}) => {
        const normalizedItems = (items ?? []).map((item) => {
            const normalizedItem = normalizeSetting(item);
            return {
                ...normalizedItem,
                group: normalizedItem.group ?? groupKey,
            };
        });

        normalized.push({
            ...normalizeGroupMeta(groupKey, meta),
            settings: normalizedItems,
        });

        seen.add(groupKey);
    };

    Object.entries(groupsMeta ?? {}).forEach(([groupKey, meta]) => {
        pushGroup(groupKey, settingsData[groupKey] ?? [], meta);
    });

    Object.entries(settingsData ?? {}).forEach(([groupKey, items]) => {
        if (seen.has(groupKey)) {
            return;
        }

        pushGroup(groupKey, items, {});
    });

    if (normalized.length === 0) {
        pushGroup('general', settingsData.general ?? [], {
            label: 'General',
            description: 'Configuraciones generales',
            icon: 'settings',
        });
    }

    return normalized;
}

function buildInitialState(baseGroups) {
    const values = {};

    baseGroups.forEach((group) => {
        group.settings.forEach((setting) => {
            values[setting.key] = setting.value ?? null;
        });
    });

    const firstGroup = baseGroups[0]?.key ?? null;

    return {
        activeGroup: firstGroup,
        search: '',
        values,
        originalValues: deepClone(values),
        dirty: {},
        errors: {},
        isSaving: false,
        saveStatus: 'idle',
        previewOpen: false,
        maintenanceOpen: false,
        sidebarOpen: false,
        lastSavedAt: null,
    };
}

function reducer(state, action) {
    switch (action.type) {
        case ACTIONS.HYDRATE:
            return {
                ...action.payload,
                lastSavedAt: state.lastSavedAt,
                saveStatus: state.saveStatus,
                previewOpen: false,
                maintenanceOpen: false,
                sidebarOpen: false,
            };

        case ACTIONS.SET_ACTIVE_GROUP:
            return {
                ...state,
                activeGroup: action.payload,
                sidebarOpen: false,
            };

        case ACTIONS.SET_SEARCH:
            return {
                ...state,
                search: action.payload,
            };

        case ACTIONS.SET_SIDEBAR_OPEN:
            return {
                ...state,
                sidebarOpen: action.payload,
            };

        case ACTIONS.SET_PREVIEW_OPEN:
            return {
                ...state,
                previewOpen: action.payload,
            };

        case ACTIONS.SET_MAINTENANCE_OPEN:
            return {
                ...state,
                maintenanceOpen: action.payload,
            };

        case ACTIONS.SET_SAVING:
            return {
                ...state,
                isSaving: action.payload,
            };

        case ACTIONS.SET_SAVE_STATUS:
            return {
                ...state,
                saveStatus: action.payload,
            };

        case ACTIONS.SET_ERRORS:
            return {
                ...state,
                errors: action.payload ?? {},
            };

        case ACTIONS.SET_VALUE: {
            const { key, value } = action.payload;
            const nextValues = {
                ...state.values,
                [key]: value,
            };

            const nextErrors = { ...state.errors };
            delete nextErrors[key];

            const dirty = { ...state.dirty };
            const isDifferent = !areValuesEqual(
                value,
                state.originalValues[key] ?? null,
            );

            if (isDifferent) {
                dirty[key] = true;
            } else {
                delete dirty[key];
            }

            return {
                ...state,
                values: nextValues,
                dirty,
                errors: nextErrors,
                saveStatus: 'idle',
            };
        }

        case ACTIONS.RESET_GROUP: {
            const { keys } = action.payload;
            const nextValues = { ...state.values };
            const nextDirty = { ...state.dirty };
            const nextErrors = { ...state.errors };

            keys.forEach((key) => {
                nextValues[key] = state.originalValues[key] ?? null;
                delete nextDirty[key];
                delete nextErrors[key];
            });

            return {
                ...state,
                values: nextValues,
                dirty: nextDirty,
                errors: nextErrors,
                saveStatus: 'idle',
            };
        }

        case ACTIONS.RESET_KEY: {
            const { key } = action.payload;

            const nextValues = {
                ...state.values,
                [key]: state.originalValues[key] ?? null,
            };

            const nextDirty = { ...state.dirty };
            const nextErrors = { ...state.errors };

            delete nextDirty[key];
            delete nextErrors[key];

            return {
                ...state,
                values: nextValues,
                dirty: nextDirty,
                errors: nextErrors,
                saveStatus: 'idle',
            };
        }

        case ACTIONS.RESET_ALL:
            return {
                ...state,
                values: deepClone(state.originalValues),
                dirty: {},
                errors: {},
                saveStatus: 'idle',
            };

        case ACTIONS.COMMIT_CHANGES:
            return {
                ...state,
                originalValues: deepClone(state.values),
                dirty: {},
                errors: {},
                saveStatus: 'success',
                isSaving: false,
                lastSavedAt: new Date().toISOString(),
            };

        default:
            return state;
    }
}

function enhanceGroups(baseGroups, state) {
    const searchTerm = state.search.trim().toLowerCase();
    const searchActive = searchTerm.length > 0;

    const groups = baseGroups.map((group) => {
        const hydratedSettings = group.settings.map((setting) => {
            const key = setting.key;

            return {
                ...setting,
                value: state.values[key],
                originalValue: state.originalValues[key],
                isDirty: Boolean(state.dirty[key]),
                error: state.errors[key] ?? null,
            };
        });

        const visibleSettings = searchActive
            ? hydratedSettings.filter((setting) => matchesSearch(setting, searchTerm))
            : hydratedSettings;

        const dirtyCount = hydratedSettings.reduce(
            (accumulator, setting) => accumulator + (setting.isDirty ? 1 : 0),
            0,
        );

        return {
            key: group.key,
            label: group.label,
            description: group.description,
            icon: group.icon,
            settings: hydratedSettings,
            visibleSettings,
            dirtyCount,
            totalSettings: hydratedSettings.length,
            matchCount: visibleSettings.length,
        };
    });

    const contentGroups = searchActive
        ? groups.filter((group) => group.matchCount > 0)
        : groups;

    return {
        sidebarGroups: groups,
        contentGroups,
        searchActive,
    };
}

function matchesSearch(setting, term) {
    const haystack = [
        setting.label,
        setting.description,
        setting.key,
        formatValue(setting.value),
    ]
        .join(' ')
        .toLowerCase();

    return haystack.includes(term);
}

function formatValue(value) {
    if (value === null || value === undefined) {
        return '';
    }

    if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
    }

    if (Array.isArray(value) || typeof value === 'object') {
        try {
            return JSON.stringify(value);
        } catch (error) {
            return '';
        }
    }

    return String(value);
}

export const useSettings = () => {
    const context = useContext(SettingsContext);

    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }

    return context;
};

export function SettingsProvider({ settings, groups, children }) {
    const baseGroups = useMemo(
        () => buildBaseGroups(settings, groups),
        [settings, groups],
    );

    const initialState = useMemo(
        () => buildInitialState(baseGroups),
        [baseGroups],
    );

    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        dispatch({
            type: ACTIONS.HYDRATE,
            payload: buildInitialState(baseGroups),
        });
    }, [baseGroups]);

    const groupData = useMemo(
        () => enhanceGroups(baseGroups, state),
        [baseGroups, state],
    );

    const dirtyKeys = useMemo(
        () => Object.keys(state.dirty ?? {}),
        [state.dirty],
    );

    const dirtyPayload = useMemo(() => {
        const payload = {};

        dirtyKeys.forEach((key) => {
            payload[key] = state.values[key];
        });

        return payload;
    }, [dirtyKeys, state.values]);

    const maintenanceValues = useMemo(() => {
        const scoped = {};

        Object.entries(state.values).forEach(([key, value]) => {
            if (key.startsWith('maintenance_')) {
                scoped[key] = value;
            }
        });

        return scoped;
    }, [state.values]);

    const groupLookup = useMemo(() => {
        const lookup = {};

        baseGroups.forEach((group) => {
            lookup[group.key] = group;
        });

        return lookup;
    }, [baseGroups]);

    const setActiveGroup = useCallback(
        (groupKey) => {
            dispatch({ type: ACTIONS.SET_ACTIVE_GROUP, payload: groupKey });
        },
        [],
    );

    const setSearch = useCallback((term) => {
        dispatch({ type: ACTIONS.SET_SEARCH, payload: term });
    }, []);

    const setSidebarOpen = useCallback((open) => {
        dispatch({ type: ACTIONS.SET_SIDEBAR_OPEN, payload: open });
    }, []);

    const setPreviewOpen = useCallback((open) => {
        dispatch({ type: ACTIONS.SET_PREVIEW_OPEN, payload: open });
    }, []);

    const setMaintenanceOpen = useCallback((open) => {
        dispatch({ type: ACTIONS.SET_MAINTENANCE_OPEN, payload: open });
    }, []);

    const setSaving = useCallback((isSaving) => {
        dispatch({ type: ACTIONS.SET_SAVING, payload: isSaving });
    }, []);

    const setSaveStatus = useCallback((status) => {
        dispatch({ type: ACTIONS.SET_SAVE_STATUS, payload: status });
    }, []);

    const setErrors = useCallback((errors) => {
        dispatch({ type: ACTIONS.SET_ERRORS, payload: errors });
    }, []);

    const commitChanges = useCallback(() => {
        dispatch({ type: ACTIONS.COMMIT_CHANGES });
    }, []);

    const resetAll = useCallback(() => {
        dispatch({ type: ACTIONS.RESET_ALL });
    }, []);

    const resetGroup = useCallback(
        (groupKey) => {
            const group = groupLookup[groupKey];

            if (!group) {
                return;
            }

            const keys = group.settings.map((setting) => setting.key);

            dispatch({
                type: ACTIONS.RESET_GROUP,
                payload: { groupKey, keys },
            });
        },
        [groupLookup],
    );

    const resetSetting = useCallback((key) => {
        dispatch({
            type: ACTIONS.RESET_KEY,
            payload: { key },
        });
    }, []);

    const updateValue = useCallback((key, value) => {
        dispatch({
            type: ACTIONS.SET_VALUE,
            payload: { key, value },
        });
    }, []);

    const availableGroupKeys = useMemo(
        () => groupData.contentGroups.map((group) => group.key),
        [groupData.contentGroups],
    );

    useEffect(() => {
        if (
            state.activeGroup &&
            availableGroupKeys.includes(state.activeGroup)
        ) {
            return;
        }

        if (availableGroupKeys.length > 0) {
            setActiveGroup(availableGroupKeys[0]);
        }
    }, [availableGroupKeys, setActiveGroup, state.activeGroup]);

    const contextValue = useMemo(
        () => ({
            state,
            baseGroups,
            groupData,
            dirtyPayload,
            maintenanceValues,
            dirtyCount: dirtyKeys.length,
            hasUnsavedChanges: dirtyKeys.length > 0,
            setActiveGroup,
            setSearch,
            setSidebarOpen,
            setPreviewOpen,
            setMaintenanceOpen,
            setSaving,
            setSaveStatus,
            setErrors,
            updateValue,
            resetAll,
            resetGroup,
            resetSetting,
            commitChanges,
        }),
        [
            state,
            baseGroups,
            groupData,
            dirtyPayload,
            maintenanceValues,
            dirtyKeys.length,
            setActiveGroup,
            setSearch,
            setSidebarOpen,
            setPreviewOpen,
            setMaintenanceOpen,
            setSaving,
            setSaveStatus,
            setErrors,
            updateValue,
            resetAll,
            resetGroup,
            resetSetting,
            commitChanges,
        ],
    );

    return (
        <SettingsContext.Provider value={contextValue}>
            {children}
        </SettingsContext.Provider>
    );
}
