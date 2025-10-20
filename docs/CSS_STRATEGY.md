# 🎨 Estrategia CSS - MDR Construcciones

**Versión:** 1.0  
**Fecha:** Octubre 2025  
**Estado:** Activo

---

## 📌 Decisión Principal

**Usamos Material-UI (MUI) como base principal de estilos con Tailwind CSS como complemento para utilidades rápidas.**

---

## 🎯 Enfoque: MUI como Base

### ¿Por Qué MUI?

✅ **Ventajas:**
- Sistema de componentes robusto y probado
- Tematización poderosa y centralizada
- Excelente para aplicaciones complejas
- Componentes de alta calidad (Modals, Drawers, DataGrid)
- Accesibilidad integrada (ARIA, keyboard navigation)
- TypeScript support completo
- Documentación exhaustiva

✅ **Ya invertimos en MUI:**
- Gran parte del sitio ya usa MUI
- Equipo familiarizado con la API
- Muchos componentes personalizados ya construidos

---

## 📋 Reglas de Uso

### ✅ **USAR MUI PARA:**

#### 1. Componentes Complejos
```jsx
// ✅ BIEN: Usar componentes MUI para elementos complejos
import { 
  Dialog, 
  Drawer, 
  Table, 
  Tabs, 
  Menu, 
  Autocomplete 
} from '@mui/material';

<Dialog open={open} onClose={handleClose}>
  <DialogTitle>Título</DialogTitle>
  <DialogContent>Contenido</DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>Cerrar</Button>
  </DialogActions>
</Dialog>
```

#### 2. Sistema de Grid y Layout
```jsx
// ✅ BIEN: Grid system de MUI
import { Container, Grid, Box } from '@mui/material';

<Container maxWidth="lg">
  <Grid container spacing={3}>
    <Grid item xs={12} md={6}>
      <Box>Contenido</Box>
    </Grid>
  </Grid>
</Container>
```

#### 3. Formularios
```jsx
// ✅ BIEN: Componentes de formulario de MUI
import { 
  TextField, 
  Select, 
  Checkbox, 
  Radio, 
  Switch 
} from '@mui/material';

<TextField
  label="Nombre"
  variant="outlined"
  fullWidth
  error={!!errors.name}
  helperText={errors.name}
/>
```

#### 4. Tipografía
```jsx
// ✅ BIEN: Typography component con variants
import { Typography } from '@mui/material';

<Typography variant="h1" component="h1" gutterBottom>
  Título Principal
</Typography>

<Typography variant="body1" color="text.secondary">
  Texto de cuerpo
</Typography>
```

#### 5. Botones y Acciones
```jsx
// ✅ BIEN: Botones con MUI
import { Button, IconButton, Fab } from '@mui/material';

<Button variant="contained" color="primary" size="large">
  Acción Principal
</Button>

<Button variant="outlined" color="secondary">
  Acción Secundaria
</Button>
```

#### 6. Feedback y Notificaciones
```jsx
// ✅ BIEN: Componentes de feedback de MUI
import { 
  Snackbar, 
  Alert, 
  CircularProgress, 
  Skeleton 
} from '@mui/material';

<Snackbar open={open} autoHideDuration={6000}>
  <Alert severity="success">
    ¡Operación exitosa!
  </Alert>
</Snackbar>
```

---

### ⚠️ **EVITAR CON MUI:**

#### ❌ NO usar `sx` prop en exceso
```jsx
// ❌ MAL: Demasiados estilos inline con sx
<Box
  sx={{
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: 3,
    margin: 4,
    backgroundColor: 'primary.main',
    borderRadius: 2,
    boxShadow: 3,
    // ... 20 líneas más de estilos
  }}
>
  Contenido
</Box>

// ✅ BIEN: Extraer a componente con styled o usar clases
import { styled } from '@mui/material/styles';

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  padding: theme.spacing(3),
  // ... resto de estilos
}));

<StyledBox>Contenido</StyledBox>
```

#### ❌ NO usar makeStyles (deprecated en MUI v5)
```jsx
// ❌ MAL: makeStyles está deprecated
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  }
}));

// ✅ BIEN: Usar styled o sx moderadamente
import { styled } from '@mui/material/styles';

const Root = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
}));
```

---

## 🎨 Tailwind como Complemento

### ✅ **USAR TAILWIND PARA:**

#### 1. Utilidades de Espaciado Rápido
```jsx
// ✅ BIEN: Utilities de Tailwind para spacing rápido
<div className="p-4 mb-6">
  <h2 className="text-2xl font-bold mb-2">Título</h2>
  <p className="text-gray-600">Descripción</p>
</div>
```

#### 2. Responsive Design Rápido
```jsx
// ✅ BIEN: Breakpoints de Tailwind
<div className="w-full md:w-1/2 lg:w-1/3">
  Contenido responsive
</div>

<img 
  className="w-full h-48 md:h-64 lg:h-96 object-cover rounded-lg" 
  src="/image.jpg" 
  alt="Imagen" 
/>
```

#### 3. Prototipado Rápido
```jsx
// ✅ BIEN: Para mockups y prototipos rápidos
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <span className="text-lg font-semibold">Título</span>
  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
    Acción
  </button>
</div>
```

#### 4. Estados Hover y Focus Simples
```jsx
// ✅ BIEN: Estados simples con Tailwind
<button className="px-4 py-2 bg-blue-600 text-white rounded transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Botón
</button>
```

---

### ❌ **NO USAR TAILWIND PARA:**

#### ❌ Componentes complejos reutilizables
```jsx
// ❌ MAL: Demasiadas clases Tailwind
<button className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
  Botón Complejo
</button>

// ✅ BIEN: Usar componente MUI
import { Button } from '@mui/material';

<Button variant="contained" color="primary" size="large">
  Botón Complejo
</Button>
```

#### ❌ Formularios
```jsx
// ❌ MAL: Formularios con Tailwind
<input 
  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
  type="text"
  placeholder="Nombre"
/>

// ✅ BIEN: Usar TextField de MUI
<TextField
  label="Nombre"
  variant="outlined"
  fullWidth
/>
```

---

## 🔀 Flowchart de Decisión

```
¿Necesito un componente?
│
├─ ¿Es un componente de UI complejo? (Modal, Drawer, Table, etc.)
│  └─ SÍ → Usar MUI Component
│
├─ ¿Es un formulario o input?
│  └─ SÍ → Usar MUI TextField/Select/etc.
│
├─ ¿Es un layout/grid?
│  └─ SÍ → Usar MUI Grid/Container/Box
│
├─ ¿Es tipografía?
│  └─ SÍ → Usar MUI Typography
│
├─ ¿Es un botón/acción?
│  └─ SÍ → Usar MUI Button
│
├─ ¿Necesito solo spacing/sizing rápido?
│  └─ SÍ → Usar Tailwind utilities (p-4, mb-2, etc.)
│
├─ ¿Es responsive design simple?
│  └─ SÍ → Usar Tailwind breakpoints (md:w-1/2)
│
└─ ¿Es prototipado rápido temporal?
   └─ SÍ → Usar Tailwind, luego refactorizar a MUI si se vuelve permanente
```

---

## 💡 Patrones Recomendados

### Patrón 1: Componente Base con MUI + Tailwind Utilities
```jsx
import { Card, CardContent, Typography } from '@mui/material';

export default function ProjectCard({ project }) {
  return (
    <Card className="mb-4">
      <CardContent>
        <Typography variant="h5" className="mb-2">
          {project.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mb-4">
          {project.description}
        </Typography>
        <div className="flex gap-2">
          {project.tags.map(tag => (
            <Chip key={tag} label={tag} size="small" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Patrón 2: Layout con MUI Grid + Tailwind Spacing
```jsx
import { Container, Grid } from '@mui/material';

export default function ServicesSection({ services }) {
  return (
    <Container maxWidth="lg" className="py-16">
      <Grid container spacing={4}>
        {services.map(service => (
          <Grid item xs={12} md={6} lg={4} key={service.id}>
            <ServiceCard service={service} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
```

### Patrón 3: Formulario con MUI + Validación
```jsx
import { TextField, Button, Box } from '@mui/material';

export default function ContactForm() {
  return (
    <Box component="form" className="space-y-4">
      <TextField
        label="Nombre"
        variant="outlined"
        fullWidth
        required
      />
      <TextField
        label="Email"
        type="email"
        variant="outlined"
        fullWidth
        required
      />
      <TextField
        label="Mensaje"
        multiline
        rows={4}
        variant="outlined"
        fullWidth
        required
      />
      <Button 
        variant="contained" 
        color="primary" 
        size="large"
        fullWidth
        type="submit"
      >
        Enviar
      </Button>
    </Box>
  );
}
```

---

## 🎨 Acceso al Tema

### En Componentes MUI
```jsx
import { Box } from '@mui/material';

// Opción 1: Usar theme en sx prop
<Box
  sx={(theme) => ({
    backgroundColor: theme.palette.primary.main,
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
  })}
>
  Contenido
</Box>

// Opción 2: Usar hooks
import { useTheme } from '@mui/material/styles';

function MyComponent() {
  const theme = useTheme();
  
  return (
    <Box sx={{ color: theme.palette.primary.main }}>
      Contenido
    </Box>
  );
}
```

### Acceder a Design System Directamente
```jsx
import designSystem from '@/theme/designSystem';

// Para casos especiales donde necesites los tokens raw
const customGradient = {
  background: designSystem.gradients.hero,
  boxShadow: designSystem.shadows.xl,
};
```

---

## 📚 Recursos

### Documentación Oficial
- [MUI Documentation](https://mui.com/)
- [MUI Customization Guide](https://mui.com/material-ui/customization/theming/)
- [Tailwind Documentation](https://tailwindcss.com/)

### Archivos del Proyecto
- `/resources/js/theme/designSystem.js` - Design tokens
- `/resources/js/theme/muiTheme.js` - Tema MUI unificado
- `/resources/js/theme/GlobalThemeProvider.jsx` - Provider global
- `/tailwind.config.js` - Configuración de Tailwind

---

## ✅ Checklist de Revisión de Código

Antes de hacer commit, verifica:

- [ ] ¿Los componentes complejos usan MUI?
- [ ] ¿Los formularios usan TextField/Select de MUI?
- [ ] ¿La tipografía usa Typography component?
- [ ] ¿Los botones usan Button component?
- [ ] ¿El uso de `sx` prop es moderado? (< 5 propiedades)
- [ ] ¿Tailwind se usa solo para utilities básicas?
- [ ] ¿No hay `makeStyles` (deprecated)?
- [ ] ¿Los colores vienen del tema, no hardcodeados?

---

## 🚀 Próximos Pasos

1. **Refactorizar componentes existentes** que usen mezcla inconsistente
2. **Crear biblioteca de componentes** comunes reutilizables
3. **Documentar componentes custom** en Storybook (futuro)
4. **Training del equipo** en el nuevo enfoque

---

**Última actualización:** Octubre 2025  
**Mantenedor:** Equipo de Desarrollo Frontend
