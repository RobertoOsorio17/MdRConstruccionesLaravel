// Script para limpiar y reiniciar el tracking de posts
// Ejecutar en la consola del navegador

console.log('🧹 LIMPIANDO DATOS DE TRACKING...');

// Limpiar localStorage
const STORAGE_KEY = 'mdr_post_tracking';
const oldData = localStorage.getItem(STORAGE_KEY);

if (oldData) {
    console.log('📊 Datos anteriores encontrados:', JSON.parse(oldData));
    localStorage.removeItem(STORAGE_KEY);
    console.log('✅ Datos limpiados exitosamente');
} else {
    console.log('ℹ️  No se encontraron datos anteriores');
}

// Verificar que esté limpio
const checkData = localStorage.getItem(STORAGE_KEY);
console.log('🔍 Verificación:', checkData === null ? 'LIMPIO ✅' : 'AÚN HAY DATOS ❌');

console.log('');
console.log('📋 INSTRUCCIONES:');
console.log('1. Actualiza la página actual');
console.log('2. Permanece al menos 10 segundos leyendo');
console.log('3. Navega a otro post del blog');
console.log('4. Los posts anteriores deberían aparecer marcados como "Leído"');
console.log('5. Durante la lectura, el post NO aparece en localStorage hasta salir');
console.log('');
console.log('Para verificar el localStorage después: localStorage.getItem("mdr_post_tracking")');
console.log('Para ver el estado actual de tracking: showTrackingData()');

// Función auxiliar para mostrar el estado actual
window.showTrackingData = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        const parsed = JSON.parse(data);
        console.log('📊 Datos actuales de tracking:');
        console.log(`📚 Total de posts visitados: ${Object.keys(parsed).length}`);
        Object.values(parsed).forEach(post => {
            const timeInMinutes = Math.round(post.averageTimeSpent / 1000 / 60 * 10) / 10;
            console.log(`  - ${post.title}: ${post.visits} visitas, ${timeInMinutes}min promedio`);
        });
    } else {
        console.log('📊 No hay datos de tracking guardados');
    }
    
    console.log('');
    console.log('💡 Recuerda: El post actual NO aparece en localStorage hasta que salgas de él');
    console.log('💡 Debes permanecer al menos 10 segundos para que se registre como visitado');
};