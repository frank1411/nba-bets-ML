# Dashboard Interactivo de Apuestas NBA

Este proyecto transformará el archivo Excel de seguimiento de apuestas en una aplicación web moderna, interactiva y accesible de forma remota. La aplicación permitirá visualizar tendencias por semana y mes, así como explorar los datos detallados de los partidos.

## Proposed Changes

### [Backend/Data Layer]
- Implementar un servicio de carga y parsing orientado exclusivamente a la pestaña `NBA`.
- **Mapeo de Datos**:
    - Tabla Principal: Filas 1 a 1010, columnas B a H (`Fecha`, `Stake`, `Cuota`, `Beneficio`, `Yield`, `$`, `Equipo`).
    - Métricas Globales: Extraer `Picks` (celda B1016), `Acierto` (celda B1018) y `Yield` (celda B1020).
- Normalizar las fechas para permitir el filtrado dinámico.

### [Frontend - UI/UX]
- **Tecnología**: Vite + React + Vanilla CSS + Recharts + Lucide React (iconos).
- **Estética**: Estilo "Premium Sports Analytics" (Oscuro, acentos en verde neón/azul, glassmorphism).
- **Componentes**:
    - `GlobalStats`: Tarjetas superiores para Picks (1010), Acierto (53.47%) y Yield (4.35%).
    - `DateFilter`: Rango interactivo (Start/End Date) que actualiza todo el dashboard.
    - `TrendChart`: Gráfico sincronizado con el modo de vista activo (Semanal o Rango Personalizado).
    - `ViewToggle`: Interruptor para alternar entre "Vista Semanal" y "Rango Personalizado".
    - `WeeklyPaginator`: Navegación por semanas, activa solo en modo semanal.
    - `PicksTable`: Muestra los datos filtrados según el modo activo.

## Verification Plan

### Automated Tests
- Verificar que el parser de Excel extrae correctamente los nombres de las columnas y los valores de las celdas clave del archivo proporcionado.
- `npm run dev` para validar la carga inicial y la respuesta de los filtros.

### Manual Verification
- **Prueba de Filtros**: Seleccionar diferentes semanas y meses en el dashboard y verificar que las métricas (`Over Visitantes`, `Over Local`, etc.) coinciden con los valores del archivo Excel original.
- **Responsividad**: Probar la visualización en diferentes tamaños de pantalla (móvil y escritorio) para asegurar que el dashboard sea "remoto" y fácil de usar en cualquier dispositivo.
- **Interactividad**: Validar que los gráficos muestran información al pasar el cursor (tooltips) y que los efectos de hover en las tarjetas funcionen suavemente.
