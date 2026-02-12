# Walkthrough: Dashboard NBA Intel

He transformado tu archivo Excel en un dashboard web interactivo y moderno. A continuación, presento los detalles del proyecto y cómo utilizarlo.

## Características Implementadas

### 1. Panel de Métricas Globales
Tarjetas interactivas con estética premium que muestran los indicadores clave extraídos directamente de la pestaña `NBA`:
- **Picks Totales**: 1010
- **Acierto**: 53.47% (con indicador visual de color)
- **Yield**: 4.35% (resaltado en verde neón cuando es positivo)

### 2. Gráfico de Evolución
Visualización dinámica del beneficio neto acumulado a lo largo del tiempo. 
- Permite ver tendencias de rendimiento.
- Se actualiza automáticamente al filtrar por fechas o equipos.

### 3. Filtros Interactivos
- **Rango de Fechas**: Controla el inicio y fin del periodo que deseas analizar. Las métricas se recalculan en tiempo real para el periodo seleccionado.
- **Buscador de Equipos**: Encuentra rápidamente el historial de un equipo específico o un tipo de jugada.

### 4. Calendario Interactivo Estilo Almanaque
He sustituido los controles de fecha estándar por un componente personalizado de alto rendimiento:
- **Diseño Almanaque**: Un calendario visual e intuitivo que permite navegar por meses y seleccionar días con un solo clic.
- **Selección de Rango**: Selecciona el día de inicio y fin directamente en la rejilla. El rango se resalta visualmente para mayor claridad.
- **Sincronización Inteligente**: Al definir un rango, el dashboard pasa automáticamente a "Periodo Libre", recalculando picks, acierto y el gráfico de evolución al instante.
- **Limpieza Rápida**: Incluye un control de "Limpiar" para resetear los filtros y volver a la visualización completa.

### 5. Modos de Vista: Semanal vs Personalizado
He implementado una solución robusta para el manejo de fechas:
- **Forward-fill**: Asegura que las celdas combinadas en Excel se procesen para todas las filas.
- **Sincronización UTC**: He forzado el uso de UTC en todo el sistema para evitar que el ajuste de zona horaria (-04:00) desplace registros al día anterior. Esto ha resuelto la visibilidad del **9 de febrero** en la semana actual.

## Verificación de Funcionamiento

He confirmado el éxito de la corrección:
1. El **09/02/2026** ahora es plenamente visible en la tabla.
2. La **Semana Actual** muestra correctamente **18 Picks** (combinando el 9 y 10 de febrero).
3. El contador de **Picks Totales** se mantiene íntegro en **1010**.

![Dashboard Final - Calendario Almanaque Personalizado](/Users/franklinsantaella/.gemini/antigravity/brain/a9949b96-a832-46d1-90b4-cc43928166a2/final_verification_calendar_1770753124412.png)

### Verificación Final (Despliegue Local)
El dashboard se ha desplegado exitosamente en el entorno local (`/proyectos/nba-bets-ML`). Se ha verificado que:
- La carga de datos Excel es **dinámica** y robusta ante cambios en el número de filas.
- El formato de fecha `DD-MM-AAAA` se respeta en toda la interfaz.
- Los gráficos y estadísticas se recalculan correctamente al modificar el archivo fuente.

![Dashboard Final Local](/Users/franklinsantaella/.gemini/antigravity/brain/a9949b96-a832-46d1-90b4-cc43928166a2/dashboard_rendered_successfully_1770917145876.png)

## Cómo Ejecutar el Proyecto
Para ver el dashboard en tu navegador, ejecuta los siguientes comandos en la terminal:

```bash
cd /Users/franklinsantaella/.gemini/antigravity/playground/quantum-constellation
npm run dev
```

Luego, abre el enlace que aparecerá (usualmente `http://localhost:5173`).
