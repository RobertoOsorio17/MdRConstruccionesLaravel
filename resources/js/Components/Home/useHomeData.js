import { useState, useEffect } from 'react';

// Hook personalizado para gestionar datos de la página Home - VERSIÓN PREMIUM
export const useHomeData = () => {
  // Datos de servicios destacados con beneficios específicos
  const featuredServicesData = [
    {
      id: 1,
      title: "Reformas Integrales",
      description: "Transformamos completamente tu hogar con acabados premium y diseño personalizado que refleja tu estilo único.",
      icon: "BuildIcon",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?fm=webp&w=800&q=80",
      featured: true,
      benefits: ["Diseño 100% personalizado", "Materiales de primera calidad", "Garantía integral 5 años", "Gestión completa de permisos"]
    },
    {
      id: 2,
      title: "Cocinas de Lujo",
      description: "Cocinas que combinan funcionalidad extrema con elegancia atemporal, usando los mejores materiales del mercado.",
      icon: "KitchenIcon",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?fm=webp&w=800&q=80",
      featured: true,
      benefits: ["Electrodomésticos premium", "Diseño ergonómico avanzado", "Materiales sostenibles", "Iluminación LED integrada"]
    },
    {
      id: 3,
      title: "Baños Premium",
      description: "Espacios de bienestar que combinan relajación y tecnología, con materiales nobles y acabados impecables.",
      icon: "BathtubIcon",
      image: "https://images.unsplash.com/photo-1620626011761-996317b8d101?fm=webp&w=800&q=80",
      featured: true,
      benefits: ["Hidromasaje y spa", "Domótica integrada", "Máxima eficiencia energética", "Materiales antideslizantes"]
    }
  ];

  // Datos de testimonios premium con detalles del proyecto
  const testimonialsData = [
    {
      id: 1,
      name: "María González",
      role: "Propietaria",
      project: "Reforma Integral en Pozuelo",
      location: "Pozuelo de Alarcón, Madrid",
      rating: 5,
      quote: "MDR Construcciones transformó completamente nuestro hogar. El resultado superó todas nuestras expectativas.",
      comment: "Desde el primer día, el equipo de MDR demostró un nivel de profesionalidad excepcional. No solo cumplieron los plazos acordados, sino que la calidad del trabajo es simplemente impresionante. Ahora tenemos la casa de nuestros sueños, y cada detalle refleja el cuidado y la experiencia que pusieron en el proyecto.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?fm=webp&w=150&q=80",
      projectImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?fm=webp&w=400&q=80",
      investment: "45.000€",
      duration: "6 semanas",
      featured: true
    },
    {
      id: 2,
      name: "Carlos Ruiz",
      role: "Empresario",
      project: "Reforma de Oficinas Corporativas",
      location: "Chamberí, Madrid",
      rating: 5,
      quote: "Profesionales serios y responsables. La transformación de nuestras oficinas fue impecable.",
      comment: "Necesitábamos renovar nuestras oficinas manteniendo la operatividad del negocio. MDR organizó el trabajo de manera que pudimos seguir funcionando sin interrupciones. El resultado final es espectacular: un espacio moderno, funcional y que transmite la profesionalidad que buscábamos.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?fm=webp&w=150&q=80",
      projectImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?fm=webp&w=400&q=80",
      investment: "28.000€",
      duration: "4 semanas",
      featured: true
    },
    {
      id: 3,
      name: "Ana Martín",
      role: "Arquitecta",
      project: "Cocina de Diseño Vanguardista",
      location: "Retiro, Madrid",
      rating: 5,
      quote: "Como arquitecta, puedo asegurar que su trabajo es excepcional. Atención al detalle impecable.",
      comment: "He trabajado con muchos contratistas a lo largo de mi carrera, pero la precisión y el cuidado que MDR pone en cada detalle es verdaderamente excepcional. La cocina que diseñamos juntos se ha convertido en el corazón de mi hogar, combinando funcionalidad profesional con belleza estética.",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?fm=webp&w=150&q=80",
      projectImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?fm=webp&w=400&q=80",
      investment: "22.000€",
      duration: "3 semanas",
      featured: true
    }
  ];

  // Datos del blog
  const blogPostsData = [
    {
      id: 1,
      title: "Tendencias en Reformas 2024: El Futuro del Hogar",
      excerpt: "Descubre las últimas tendencias en diseño de interiores y tecnología del hogar que marcarán el 2024.",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?fm=webp&w=800&q=80",
      category: "Tendencias",
      slug: "tendencias-reformas-2024",
      published_at: "2024-01-15",
      read_time: "5 min"
    },
    {
      id: 2,
      title: "Cómo Planificar una Reforma Integral sin Estrés",
      excerpt: "Guía completa para organizar tu reforma paso a paso y evitar los errores más comunes.",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?fm=webp&w=800&q=80",
      category: "Guías",
      slug: "planificar-reforma-integral",
      published_at: "2024-01-10",
      read_time: "8 min"
    },
    {
      id: 3,
      title: "Materiales Sostenibles: Construyendo el Futuro",
      excerpt: "La importancia de elegir materiales ecológicos en la construcción moderna y sus beneficios.",
      image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?fm=webp&w=800&q=80",
      category: "Sostenibilidad",
      slug: "materiales-sostenibles",
      published_at: "2024-01-05",
      read_time: "6 min"
    }
  ];

  // Datos de proyectos destacados con información detallada
  const featuredProjectsData = [
    {
      id: 1,
      title: "Villa Moderna en Pozuelo",
      description: "Reforma integral de 300m² que combina diseño contemporáneo con funcionalidad familiar, creando espacios que fluyen naturalmente.",
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?fm=webp&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?fm=webp&w=800&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?fm=webp&w=800&q=80",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?fm=webp&w=800&q=80",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?fm=webp&w=800&q=80",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?fm=webp&w=800&q=80"
      ],
      location: "Pozuelo de Alarcón",
      area: "300m²",
      category: "Reforma Integral",
      year: "2024",
      investment: "120.000€",
      duration: "12 semanas",
      highlights: ["Cocina americana premium", "Suite principal con vestidor", "Jardín paisajístico", "Domótica integrada"],
      featured: true,
      slug: "villa-moderna-pozuelo"
    },
    {
      id: 2,
      title: "Loft Industrial en Malasaña",
      description: "Transformación de un espacio industrial en un moderno loft urbano que conserva el carácter original mientras abraza la funcionalidad contemporánea.",
      image: "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?fm=webp&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?fm=webp&w=800&q=80",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?fm=webp&w=800&q=80",
        "https://images.unsplash.com/photo-1560449752-09b16b7085e3?fm=webp&w=800&q=80",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?fm=webp&w=800&q=80"
      ],
      location: "Malasaña, Madrid Centro",
      area: "150m²",
      category: "Conversión",
      year: "2023",
      investment: "85.000€",
      duration: "8 semanas",
      highlights: ["Techos altos preservados", "Cocina integrada", "Zona de trabajo", "Iluminación industrial"],
      featured: true,
      slug: "loft-industrial-malasana"
    },
    {
      id: 3,
      title: "Oficinas Corporativas Premium",
      description: "Diseño de espacios de trabajo que potencian la productividad y el bienestar, integrando tecnología avanzada con diseño sostenible.",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?fm=webp&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?fm=webp&w=800&q=80",
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?fm=webp&w=800&q=80",
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?fm=webp&w=800&q=80",
        "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?fm=webp&w=800&q=80"
      ],
      location: "Las Rozas",
      area: "500m²",
      category: "Comercial",
      year: "2023",
      investment: "150.000€",
      duration: "10 semanas",
      highlights: ["Salas de reunión acústicas", "Zona de descanso", "Tecnología integrada", "Eficiencia energética"],
      featured: true,
      slug: "oficinas-corporativas-premium"
    }
  ];

  // Datos de razones para elegir MDR con enfoque en diferenciación (layout zig-zag)
  const whyChooseUsData = [
    {
      icon: "CheckIcon",
      title: "25+ Años de Maestría",
      description: "Décadas perfeccionando cada técnica, cada proceso, cada detalle que marca la diferencia entre una reforma y una transformación excepcional.",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?fm=webp&w=600&q=80",
      highlights: ["500+ proyectos completados", "Equipo certificado", "Técnicas innovadoras"]
    },
    {
      icon: "StarIcon",
      title: "Materiales de Élite",
      description: "Seleccionamos únicamente los mejores materiales del mercado global, garantizando durabilidad, belleza y sostenibilidad en cada proyecto.",
      image: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?fm=webp&w=600&q=80",
      highlights: ["Proveedores premium", "Certificación de calidad", "Sostenibilidad garantizada"]
    },
    {
      icon: "ScheduleIcon",
      title: "Plazos Sagrados",
      description: "Cumplimos religiosamente los tiempos acordados porque entendemos que tu tiempo es valioso y las promesas deben cumplirse.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fm=webp&w=600&q=80",
      highlights: ["Planificación detallada", "Seguimiento diario", "Sin retrasos"]
    }
  ];

  return {
    featuredServices: featuredServicesData,
    testimonials: testimonialsData,
    blogPosts: blogPostsData,
    featuredProjects: featuredProjectsData,
    whyChooseUs: whyChooseUsData,
    // Social Proof data para la barra de credibilidad instantánea
    socialProof: {
      yearsOfExperience: 25,
      projectsCompleted: 500,
      clientSatisfaction: 98,
      averageRating: 4.9,
      certifications: ["ISO 9001", "CEOE", "Construcción Sostenible"],
      awards: ["Premio Construcción Madrid 2023", "Empresa Responsable 2024"]
    },
    // Beneficios para el Hero mejorado
    heroBenefits: [
      { icon: "CheckIcon", text: "Calidad Premium", color: "success" },
      { icon: "ScheduleIcon", text: "Plazos Garantizados", color: "info" },
      { icon: "StarIcon", text: "Satisfacción 100%", color: "warning" }
    ]
  };
};

// Hook para animaciones con reduced motion
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(query.matches);

    const handleChange = (event) => {
      setPrefersReducedMotion(event.matches);
    };

    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

// Hook para efectos de parallax
export const useParallax = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollY;
};