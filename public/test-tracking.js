// Test del sistema de seguimiento de posts para invitados
// Ejecutar en la consola del navegador

console.log('=== TEST DEL SISTEMA DE SEGUIMIENTO DE POSTS ===');

// Simular datos de un post
const mockPost = {
    id: 1,
    title: 'Test Post Title',
    slug: 'test-post-title',
    categories: [
        { id: 1, name: 'Tecnología', slug: 'tecnologia' },
        { id: 2, name: 'Innovación', slug: 'innovacion' }
    ],
    tags: [
        { id: 1, name: 'React', slug: 'react' },
        { id: 2, name: 'JavaScript', slug: 'javascript' }
    ],
    excerpt: 'Este es un extracto de prueba',
    cover_image: 'https://example.com/image.jpg'
};

// Verificar localStorage
const STORAGE_KEY = 'mdr_post_tracking';

// Limpiar datos previos para el test
localStorage.removeItem(STORAGE_KEY);

// Test 1: Verificar que localStorage esté limpio
console.log('1. Estado inicial de localStorage:', localStorage.getItem(STORAGE_KEY));

// Test 2: Simular seguimiento de post
const trackingData = {
    [mockPost.id]: {
        id: mockPost.id,
        title: mockPost.title,
        slug: mockPost.slug,
        categories: mockPost.categories,
        tags: mockPost.tags,
        excerpt: mockPost.excerpt,
        cover_image: mockPost.cover_image,
        visits: 1,
        lastVisit: Date.now(),
        totalTimeSpent: 120000, // 2 minutos
        averageTimeSpent: 120000,
        firstVisit: Date.now() - 86400000 // Hace 1 día
    }
};

localStorage.setItem(STORAGE_KEY, JSON.stringify(trackingData));

console.log('2. Datos guardados en localStorage:', localStorage.getItem(STORAGE_KEY));

// Test 3: Verificar parsing de datos
try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    console.log('3. Datos parseados correctamente:', parsed);
    console.log('   - Post ID:', parsed[mockPost.id].id);
    console.log('   - Título:', parsed[mockPost.id].title);
    console.log('   - Visitas:', parsed[mockPost.id].visits);
    console.log('   - Tiempo promedio:', parsed[mockPost.id].averageTimeSpent / 1000, 'segundos');
} catch (error) {
    console.error('3. Error al parsear datos:', error);
}

// Test 4: Simular múltiples posts
const multiplePostsData = {
    1: {
        id: 1,
        title: 'Post sobre React',
        categories: [{ id: 1, name: 'Frontend' }],
        tags: [{ id: 1, name: 'React' }],
        visits: 3,
        totalTimeSpent: 300000,
        averageTimeSpent: 100000,
        lastVisit: Date.now()
    },
    2: {
        id: 2,
        title: 'Post sobre Laravel',
        categories: [{ id: 2, name: 'Backend' }],
        tags: [{ id: 2, name: 'Laravel' }],
        visits: 2,
        totalTimeSpent: 240000,
        averageTimeSpent: 120000,
        lastVisit: Date.now() - 3600000 // Hace 1 hora
    },
    3: {
        id: 3,
        title: 'Post sobre Bases de Datos',
        categories: [{ id: 2, name: 'Backend' }],
        tags: [{ id: 3, name: 'MySQL' }],
        visits: 1,
        totalTimeSpent: 180000,
        averageTimeSpent: 180000,
        lastVisit: Date.now() - 7200000 // Hace 2 horas
    }
};

localStorage.setItem(STORAGE_KEY, JSON.stringify(multiplePostsData));

console.log('4. Múltiples posts guardados:', Object.keys(multiplePostsData).length);

// Test 5: Algoritmo de recomendaciones simulado
const currentPostId = 4;
const mockAllPosts = [
    { id: 5, title: 'Nuevo Post React', categories: [{ id: 1, name: 'Frontend' }], tags: [{ id: 1, name: 'React' }], views_count: 150, likes_count: 12 },
    { id: 6, title: 'Nuevo Post Laravel', categories: [{ id: 2, name: 'Backend' }], tags: [{ id: 2, name: 'Laravel' }], views_count: 200, likes_count: 8 },
    { id: 7, title: 'Post sobre Python', categories: [{ id: 2, name: 'Backend' }], tags: [{ id: 4, name: 'Python' }], views_count: 100, likes_count: 5 },
    { id: 8, title: 'Post sobre CSS', categories: [{ id: 1, name: 'Frontend' }], tags: [{ id: 5, name: 'CSS' }], views_count: 80, likes_count: 3 }
];

function simulateRecommendationAlgorithm(currentPostId, visitedPosts, allPosts) {
    const visited = Object.values(visitedPosts);
    const visitedIds = visited.map(post => post.id);
    
    console.log('Posts ya leídos:', visitedIds);
    
    // Filtrar posts no leídos primero
    const unreadPosts = allPosts.filter(post => 
        post.id !== currentPostId && !visitedIds.includes(post.id)
    );
    
    console.log('Posts no leídos disponibles:', unreadPosts.length);
    
    // Posts leídos interesantes (como fallback)
    const interestingReadPosts = allPosts.filter(post => {
        if (post.id === currentPostId || !visitedIds.includes(post.id)) return false;
        
        const visitedPost = visited.find(v => v.id === post.id);
        return visitedPost && (
            visitedPost.averageTimeSpent > 120000 || // Más de 2 minutos
            visitedPost.visits > 1 // Múltiples visitas
        );
    });
    
    console.log('Posts leídos pero interesantes:', interestingReadPosts.length);
    
    // Combinar candidatos
    let candidatePosts = [...unreadPosts, ...interestingReadPosts];
    
    // Calcular pesos de categorías y tags
    const categoryWeights = {};
    const tagWeights = {};
    
    visited.forEach(post => {
        const timeWeight = Math.min(post.averageTimeSpent / 60000, 5);
        const visitWeight = Math.min(post.visits, 3);
        const combinedWeight = timeWeight * visitWeight;
        
        post.categories.forEach(cat => {
            categoryWeights[cat.id] = (categoryWeights[cat.id] || 0) + combinedWeight;
        });
        
        post.tags.forEach(tag => {
            tagWeights[tag.id] = (tagWeights[tag.id] || 0) + combinedWeight;
        });
    });
    
    console.log('5. Pesos calculados:');
    console.log('   - Categorías:', categoryWeights);
    console.log('   - Tags:', tagWeights);
    
    // Calcular puntuaciones
    const scoredPosts = candidatePosts
        .map(post => {
            let score = 0;
            const isRead = visitedIds.includes(post.id);
            const readPenalty = isRead ? 0.3 : 1.0; // Posts leídos tienen 30% del score
            
            // Puntuación base
            score += (post.views_count || 0) * 0.01 * readPenalty;
            score += (post.likes_count || 0) * 0.5 * readPenalty;
            
            // Puntuación por categorías
            post.categories.forEach(cat => {
                score += (categoryWeights[cat.id] || 0) * 3 * readPenalty;
            });
            
            // Puntuación por tags
            post.tags.forEach(tag => {
                score += (tagWeights[tag.id] || 0) * 2 * readPenalty;
            });
            
            return {
                ...post,
                recommendationScore: score,
                isRead: isRead,
                readPenalty: readPenalty
            };
        })
        .sort((a, b) => {
            // Priorizar posts no leídos
            if (a.isRead !== b.isRead) {
                return a.isRead ? 1 : -1;
            }
            return b.recommendationScore - a.recommendationScore;
        });
    
    console.log('6. Posts recomendados (priorizando no leídos):');
    scoredPosts.forEach((post, index) => {
        const status = post.isRead ? '📖 LEÍDO' : '🆕 NUEVO';
        const penalty = post.isRead ? ` (Penalización: ${Math.round((1 - post.readPenalty) * 100)}%)` : '';
        console.log(`   ${index + 1}. ${status} ${post.title} - Puntuación: ${post.recommendationScore.toFixed(2)}${penalty}`);
    });
    
    return scoredPosts;
}

simulateRecommendationAlgorithm(currentPostId, multiplePostsData, mockAllPosts);

console.log('=== TEST COMPLETADO ===');
console.log('Para limpiar los datos de test: localStorage.removeItem("mdr_post_tracking")');

// Función de limpieza
window.cleanTestData = () => {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Datos de test eliminados');
};