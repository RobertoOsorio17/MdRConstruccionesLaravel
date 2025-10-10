import React from 'react';
import { Head } from '@inertiajs/react';
import { Container, Typography, Box } from '@mui/material';
import AdminLayoutNew from '@/Layouts/AdminLayoutNew';
import MLDashboard from '@/Components/ML/Admin/MLDashboard';

/**
 * Página de administración del sistema ML
 * Ruta: /admin/ml/dashboard
 */
const MLDashboardPage = ({ auth }) => {
    return (
        <AdminLayoutNew user={auth.user}>
            <Head title="Panel ML - Administración" />
            
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <MLDashboard />
            </Container>
        </AdminLayoutNew>
    );
};

export default MLDashboardPage;

