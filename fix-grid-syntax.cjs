/**
 * Script para corregir la sintaxis de Grid de MUI v6 a v5
 * Convierte <Grid size={{ xs: 12 }}> a <Grid item xs={12}>
 */

const fs = require('fs');
const path = require('path');

const files = [
  './resources/js/Pages/User/Profile.jsx',
  './resources/js/Pages/User/Dashboard.jsx',
  './resources/js/Pages/Testimonials/Index.jsx',
  './resources/js/Pages/Services/Show.jsx',
  './resources/js/Pages/Services/Index.jsx',
  './resources/js/Pages/Projects/Show.jsx',
  './resources/js/Pages/Projects/Index.jsx',
  './resources/js/Pages/Profile/Devices.jsx',
  './resources/js/Pages/Pages/ContactNew.jsx',
  './resources/js/Pages/Errors/NotFound.jsx',
  './resources/js/Pages/Blog/Show.jsx',
  './resources/js/Pages/Admin/UserShow.jsx',
  './resources/js/Pages/Admin/UserManagement.jsx',
  './resources/js/Pages/Admin/UserEdit.jsx',
  './resources/js/Pages/Admin/UserCreate.jsx',
  './resources/js/Pages/Admin/Services/Form.jsx',
  './resources/js/Pages/Admin/Tags/Index.jsx',
  './resources/js/Pages/Admin/ServiceManagement.jsx',
  './resources/js/Pages/Admin/ProjectManagement.jsx',
  './resources/js/Pages/Admin/Posts/Show.jsx',
  './resources/js/Pages/Admin/Posts/Index.jsx',
  './resources/js/Pages/Admin/Posts/Create.jsx',
  './resources/js/Pages/Admin/Categories/Index.jsx',
  './resources/js/Pages/Admin/Media/Index.jsx',
  './resources/js/Pages/Admin/DashboardNew.jsx',
  './resources/js/Pages/Admin/Dashboard.jsx',
  './resources/js/Pages/Admin/Comments/Reports.jsx',
  './resources/js/Pages/Admin/Comments/Index.jsx',
  './resources/js/Components/Admin/UserCommentsTab.jsx',
  './resources/js/Components/StatsSection.jsx',
  './resources/js/Components/TrustSection.jsx',
  './resources/js/Components/User/Tabs/LikedPostsTab.jsx',
  './resources/js/Components/User/Tabs/PostsTab.jsx',
  './resources/js/Components/Services/GlassmorphismHero.jsx',
  './resources/js/Components/Admin/SkeletonLoaders.jsx',
  './resources/js/Components/ML/RecommendationsWidget.jsx',
  './resources/js/Components/Layout/PremiumFooter.jsx',
  './resources/js/Components/Home/FeaturedServicesSection.jsx',
  './resources/js/Components/Home/MeetTheTeamSection.jsx',
  './resources/js/Components/Admin/BanUserModal.jsx',
  './resources/js/Components/Admin/BannedUsersTab.jsx'
];

let totalFixed = 0;

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    // Patrón para encontrar <Grid size={{ ... }}>
    // Convertir a <Grid item xs={} sm={} md={} lg={} xl={}>
    let newContent = content;
    
    // Reemplazar <Grid size={{ xs: 12, md: 6 }}> a <Grid item xs={12} md={6}>
    newContent = newContent.replace(
      /<Grid\s+size=\{\{\s*([^}]+)\s*\}\}/g,
      (match, props) => {
        // Extraer propiedades individuales
        const propsObj = {};
        const propMatches = props.matchAll(/(\w+):\s*(\d+|"[^"]*")/g);
        
        for (const propMatch of propMatches) {
          propsObj[propMatch[1]] = propMatch[2];
        }
        
        // Construir nueva sintaxis
        const newProps = Object.entries(propsObj)
          .map(([key, value]) => `${key}={${value}}`)
          .join(' ');
        
        return `<Grid item ${newProps}`;
      }
    );
    
    // Eliminar comentarios de "✅ FIX: Use new Grid API"
    newContent = newContent.replace(/\s*\{\/\*\s*✅ FIX: Use new Grid API\s*\*\/\}\s*\n/g, '\n');
    
    if (newContent !== content) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log(`✅ Fixed: ${file}`);
      totalFixed++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log(`\n✅ Total files fixed: ${totalFixed}`);
