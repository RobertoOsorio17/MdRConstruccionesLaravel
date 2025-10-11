import React from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    Chip,
    Avatar,
    Rating,
    Paper,
    Divider,
    Stack,
} from '@mui/material';
import {
    Build as BuildIcon,
    Phone as PhoneIcon,
    WhatsApp as WhatsAppIcon,
    CheckCircle as CheckIcon,
    Bathtub as BathtubIcon,
    Kitchen as KitchenIcon,
    Apartment as ApartmentIcon,
    ArrowForward as ArrowIcon,
    Star as StarIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link } from '@inertiajs/react';
import AnimatedSection from '@/Components/AnimatedSection';
import ProcessSection from '@/Components/ProcessSection';
import StatsSection from '@/Components/StatsSection';
import TrustSection from '@/Components/TrustSection';
import MicroInteractions from '@/Components/MicroInteractions';

// Nuevos componentes para la estructura "De la Promesa a la Prueba"
import EnhancedHeroSection from '@/Components/Home/EnhancedHeroSection';
import SocialProofBar from '@/Components/Home/SocialProofBar';
import TestimonialsSection from '@/Components/Home/TestimonialsSection';
import FeaturedServicesSection from '@/Components/Home/FeaturedServicesSection';
import FeaturedProjectsSection from '@/Components/Home/FeaturedProjectsSection';
import WhyChooseUsSection from '@/Components/Home/WhyChooseUsSection';
import BrandsSection from '@/Components/Home/BrandsSection';
import InvestmentGuideSection from '@/Components/Home/InvestmentGuideSection';
import MeetTheTeamSection from '@/Components/Home/MeetTheTeamSection';
import BlogSection from '@/Components/Home/BlogSection';
import { useHomeData, useReducedMotion } from '@/Components/Home/useHomeData';

export default function Welcome({ services = [], featuredProjects = [], latestPosts = [], stats = {}, seo = {} }) {
    // Obtener datos enriquecidos del hook
    const { 
        featuredServices: defaultServices, 
        testimonials, 
        blogPosts, 
        featuredProjects: defaultProjects, 
        whyChooseUs,
        socialProof,
        heroBenefits
    } = useHomeData();
    
    // Hook para detectar preferencia de movimiento reducido
    const prefersReducedMotion = useReducedMotion();

    // Usar datos del servidor si están disponibles, sino usar los por defecto
    const featuredServices = services.length > 0 ? services.filter(service => service.featured) : defaultServices;
    const projectsToShow = featuredProjects.length > 0 ? featuredProjects : defaultProjects;
    const postsToShow = latestPosts.length > 0 ? latestPosts : blogPosts;

    return (
        <MainLayout>
            <Head title={seo.title || "Inicio - MDR Construcciones"} />
            
            <MicroInteractions prefersReducedMotion={prefersReducedMotion}>
                {/* NUEVA ESTRUCTURA: "De la Promesa a la Prueba" */}
                
                {/* 1. Hero Section: La Gran Promesa */}
                <EnhancedHeroSection 
                    socialProof={socialProof}
                    heroBenefits={heroBenefits}
                    prefersReducedMotion={prefersReducedMotion}
                />

                {/* 2. Social Proof Bar: Credibilidad Instantánea */}
                <SocialProofBar 
                    socialProof={socialProof}
                    prefersReducedMotion={prefersReducedMotion}
                />

                {/* 3. Testimonials Section: La Prueba Humana (PRIORITARIA) */}
                <TestimonialsSection 
                    testimonials={testimonials}
                    prefersReducedMotion={prefersReducedMotion}
                />

                {/* 4. Featured Services Section: ¿Qué hacemos exactamente? */}
                <FeaturedServicesSection 
                    services={featuredServices}
                    prefersReducedMotion={prefersReducedMotion}
                />

                {/* 5. Featured Projects Section: La Prueba Visual (CRÍTICA) */}
                <FeaturedProjectsSection 
                    projects={projectsToShow}
                    prefersReducedMotion={prefersReducedMotion}
                />

                {/* 6. Why Choose Us Section: La Diferenciación Racional (Mejorada) */}
                <WhyChooseUsSection 
                    whyChooseUs={whyChooseUs}
                    prefersReducedMotion={prefersReducedMotion}
                />

                {/* 6.5. Brands Section: Brand Association - Transferencia de Confianza */}
                <BrandsSection 
                    prefersReducedMotion={prefersReducedMotion}
                />

                {/* 7. Process Section: ¿Cómo trabajamos? (Mantener) */}
                <ProcessSection />

                {/* 7.5. Investment Guide: Calculadora de Presupuesto para Cualificar Leads */}
                <InvestmentGuideSection 
                    prefersReducedMotion={prefersReducedMotion}
                />

                {/* 8. Blog Section: Demostración de Autoridad */}
                <BlogSection 
                    blogPosts={postsToShow}
                    prefersReducedMotion={prefersReducedMotion}
                />

                {/* 8.5. Meet The Team: Humanizar la Marca */}
                <MeetTheTeamSection 
                    prefersReducedMotion={prefersReducedMotion}
                />

                {/* 9. Final CTA Section: La Conversión (Mantener) */}
                <TrustSection />
            </MicroInteractions>
            
        </MainLayout>
    );
}