import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import {
    Box,
    Container,
    Paper,
    Tabs,
    Tab,
    Typography,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Person as PersonIcon,
    Security as SecurityIcon,
    Devices as DevicesIcon,
    Link as LinkIcon,
    Notifications as NotificationsIcon,
    Lock as PrivacyIcon
} from '@mui/icons-material';


// Import tab components
import PersonalInfoTab from '@/Components/Profile/PersonalInfoTab';
import SecurityTab from '@/Components/Profile/SecurityTab';
import DevicesTab from '@/Components/Profile/DevicesTabNew';
import ConnectedAccountsTab from '@/Components/Profile/ConnectedAccountsTab';
import NotificationsTab from '@/Components/Profile/NotificationsTab';
import PrivacyTab from '@/Components/Profile/PrivacyTab';

const Settings = ({
    user,
    mustVerifyEmail,
    status,
    devices = [],
    deviceStats = {},
    connectedAccounts = [],
    hasPassword = true,
    twoFactorEnabled = false,
    recoveryCodes = [],
    notificationSettings = {},
    privacySettings = {},
    force2FASetup = false
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Get tab from URL or localStorage
    const getInitialTab = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const tabFromUrl = urlParams.get('tab');
        if (tabFromUrl) return tabFromUrl;

        // If 2FA setup is mandatory, force security tab
        if (force2FASetup) return 'security';

        const savedTab = localStorage.getItem('settings_active_tab');
        return savedTab || 'personal';
    };
    
    const [activeTab, setActiveTab] = useState(getInitialTab());

    // Update URL and localStorage when tab changes
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        localStorage.setItem('settings_active_tab', newValue);
        
        // Update URL without reload
        const url = new URL(window.location);
        url.searchParams.set('tab', newValue);
        window.history.pushState({}, '', url);
    };

    // Tab configuration
    const tabs = [
        { value: 'personal', label: 'Información Personal', icon: <PersonIcon /> },
        { value: 'security', label: 'Seguridad', icon: <SecurityIcon /> },
        { value: 'devices', label: 'Dispositivos', icon: <DevicesIcon /> },
        { value: 'notifications', label: 'Notificaciones', icon: <NotificationsIcon /> },
        { value: 'privacy', label: 'Privacidad', icon: <PrivacyIcon /> },
        { value: 'accounts', label: 'Cuentas Conectadas', icon: <LinkIcon /> }
    ];

    // Render tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'personal':
                return <PersonalInfoTab user={user} mustVerifyEmail={mustVerifyEmail} status={status} />;
            case 'security':
                return (
                    <SecurityTab
                        user={user}
                        twoFactorEnabled={twoFactorEnabled}
                        recoveryCodes={recoveryCodes}
                        force2FASetup={force2FASetup}
                    />
                );
            case 'devices':
                return <DevicesTab devices={devices} stats={deviceStats} />;
            case 'accounts':
                return (
                    <ConnectedAccountsTab 
                        connectedAccounts={connectedAccounts}
                        hasPassword={hasPassword}
                    />
                );
            case 'notifications':
                return <NotificationsTab settings={notificationSettings} />;
            case 'privacy':
                return <PrivacyTab settings={privacySettings} user={user} />;
            default:
                return <PersonalInfoTab user={user} mustVerifyEmail={mustVerifyEmail} status={status} />;
        }
    };

    return (
        <MainLayout>
            <Head title="Configuración" />

            <Container maxWidth="lg" sx={{ py: 8 }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>

                    <Typography variant="h4" component="h1" fontWeight="bold">
                        Configuración de Cuenta
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Gestiona tu información personal, seguridad y preferencias
                    </Typography>
                </Box>

                <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                    {/* Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            variant={isMobile ? 'scrollable' : 'standard'}
                            scrollButtons={isMobile ? 'auto' : false}
                            sx={{
                                px: 2,
                                '& .MuiTab-root': {
                                    minHeight: 64,
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    fontWeight: 500
                                }
                            }}
                        >
                            {tabs.map((tab) => (
                                <Tab
                                    key={tab.value}
                                    value={tab.value}
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {tab.icon}
                                            {!isMobile && tab.label}
                                        </Box>
                                    }
                                    icon={isMobile ? tab.icon : undefined}
                                    iconPosition="start"
                                />
                            ))}
                        </Tabs>
                    </Box>

                    {/* Tab Content */}
                    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                        {renderTabContent()}
                    </Box>
                </Paper>
            </Container>
        </MainLayout>
    );
};

export default Settings;

