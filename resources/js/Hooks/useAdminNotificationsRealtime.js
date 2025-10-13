import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';

// Small utility to play a short beep using Web Audio API
function playBeep(volume = 0.2, duration = 120, frequency = 880) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.connect(g);
        g.connect(ctx.destination);
        g.gain.value = volume;
        o.frequency.value = frequency;
        o.start();
        setTimeout(() => {
            o.stop();
            ctx.close();
        }, duration);
    } catch (_) {
        // No-op if AudioContext is not available
    }
}

export default function useAdminNotificationsRealtime() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [dndEnabled, setDndEnabled] = useState(() => {
        const saved = localStorage.getItem('admin.notifications.dnd');
        return saved === '1';
    });

    const lastIdRef = useRef(0);
    const pollingRef = useRef(false);
    const cancelledRef = useRef(false);

    const fetchRecent = useCallback(async () => {
        try {
            const recentUrl = typeof route === 'function' ? route('admin.api.notifications.recent') : '/admin/api/notifications/recent';
            const { data } = await axios.get(recentUrl);
            const mapped = (data.notifications || []).map(n => ({ ...n, showAsToast: false }));
            setNotifications(mapped);
            setUnreadCount(data.unread_count || 0);
            lastIdRef.current = data.last_id || 0;
        } catch (e) {
            setError('No se pudieron cargar las notificaciones');
        } finally {
            setLoading(false);
        }
    }, []);

    const poll = useCallback(async () => {
        if (pollingRef.current || cancelledRef.current) return;
        pollingRef.current = true;
        try {
            // Long poll wait for up to 25s
            const waitUrl = typeof route === 'function' ? route('admin.api.notifications.wait-updates') : '/admin/api/notifications/wait-updates';
            const { data } = await axios.get(waitUrl, {
                params: { last_id: lastIdRef.current, timeout: 25 },
                timeout: 30000,
            });

            if (cancelledRef.current) return;

            const changed = !!data.changed;

            if (changed) {
                const newItems = (data.new_notifications || []).map(n => ({ ...n, showAsToast: true }));
                if (newItems.length > 0) {
                    // Sound feedback unless DND
                    if (!dndEnabled) {
                        // Play a quick double beep for emphasis
                        playBeep(0.15, 90, 880);
                        setTimeout(() => playBeep(0.12, 90, 660), 120);
                    }
                    setNotifications(prev => {
                        const combined = [...newItems, ...prev];
                        // Deduplicate by id
                        const seen = new Set();
                        const unique = [];
                        for (const n of combined) {
                            if (!seen.has(n.id)) {
                                seen.add(n.id);
                                unique.push(n);
                            }
                        }
                        return unique.slice(0, 50);
                    });
                    lastIdRef.current = data.last_id || lastIdRef.current;
                }
                setUnreadCount(typeof data.unread_count === 'number' ? data.unread_count : unreadCount);
            }
        } catch (e) {
            // Swallow network timeouts silently; retry
        } finally {
            pollingRef.current = false;
            if (!cancelledRef.current) {
                // Immediately start next long poll for near real-time
                poll();
            }
        }
    }, [dndEnabled, unreadCount]);

    const markAsRead = useCallback(async (id) => {
        try {
            const readUrl = typeof route === 'function' ? route('admin.api.notifications.read', id) : `/admin/api/notifications/${id}/read`;
            await axios.patch(readUrl);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (_) {}
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            const markAllUrl = typeof route === 'function' ? route('admin.api.notifications.mark-all-read') : '/admin/api/notifications/mark-all-read';
            await axios.patch(markAllUrl);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (_) {}
    }, []);

    const deleteNotification = useCallback(async (id) => {
        try {
            const deleteUrl = typeof route === 'function' ? route('admin.api.notifications.destroy', id) : `/admin/api/notifications/${id}`;
            await axios.delete(deleteUrl);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (_) {}
    }, []);

    const toggleDnd = useCallback(() => {
        setDndEnabled(prev => {
            const next = !prev;
            localStorage.setItem('admin.notifications.dnd', next ? '1' : '0');
            return next;
        });
    }, []);

    useEffect(() => {
        cancelledRef.current = false;
        fetchRecent().then(() => poll());
        return () => {
            cancelledRef.current = true;
        };
    }, [fetchRecent, poll]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        dndEnabled,
        toggleDnd,
    };
}
