import React, { useState, useEffect, useMemo } from 'react';
import { parseExcelData } from './utils/excelParser';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
    Target, TrendingUp, Percent, Calendar, Search, ChevronLeft, ChevronRight
} from 'lucide-react';

const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
};

const App = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
    const [viewMode, setViewMode] = useState('weekly'); // 'weekly' or 'range'
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const result = await parseExcelData();
            if (result) {
                setData(result);
                if (result.tableData.length > 0) {
                    const dates = result.tableData.map(d => d.date);
                    const minDate = new Date(Math.min(...dates));
                    const maxDate = new Date(Math.max(...dates));
                    setStartDate(minDate.toISOString().split('T')[0]);
                    setEndDate(maxDate.toISOString().split('T')[0]);
                }
            }
            setLoading(false);
        };
        loadData();
    }, []);

    const handleDateChange = (type, value) => {
        if (type === 'start') setStartDate(value);
        else setEndDate(value);
        setViewMode('range');
    };

    const filteredData = useMemo(() => {
        if (!data) return [];
        return data.tableData.filter(item => {
            const dateStr = item.date.toISOString().split('T')[0];
            return (!startDate || dateStr >= startDate) && (!endDate || dateStr <= endDate);
        });
    }, [data, startDate, endDate]);

    const weeks = useMemo(() => {
        if (filteredData.length === 0) return [];
        const groups = {};
        filteredData.forEach(item => {
            const weekId = getWeekNumber(item.date);
            if (!groups[weekId]) {
                groups[weekId] = { id: weekId, items: [], label: `Semana ${weekId.split('-W')[1]} (${item.date.getFullYear()})` };
            }
            groups[weekId].items.push(item);
        });
        return Object.values(groups).sort((a, b) => b.id.localeCompare(a.id));
    }, [filteredData]);

    useEffect(() => {
        setCurrentWeekIndex(0);
    }, [weeks]);

    const currentWeek = weeks[currentWeekIndex];
    const itemsToShow = useMemo(() => {
        if (viewMode === 'weekly' && currentWeek) return currentWeek.items;
        return filteredData;
    }, [viewMode, currentWeek, filteredData]);

    const chartData = useMemo(() => {
        let cumulativeProfit = 0;
        return [...itemsToShow].sort((a, b) => a.date - b.date).map(item => {
            cumulativeProfit += item.profit || 0;
            return {
                date: item.dateStr,
                profit: Number(cumulativeProfit.toFixed(2)),
            };
        });
    }, [itemsToShow]);

    const currentStats = useMemo(() => {
        if (!data) return { picks: 0, acierto: 0, yield: 0 };
        if (itemsToShow.length === 0) return { picks: 0, acierto: 0, yield: 0 };

        const wins = itemsToShow.filter(i => i.isWin).length;
        const total = itemsToShow.length;
        const totalStake = itemsToShow.reduce((acc, i) => acc + (i.stake || 0), 0);
        const totalProfit = itemsToShow.reduce((acc, i) => acc + (i.profit || 0), 0);

        return {
            picks: total,
            acierto: total > 0 ? (wins / total) * 100 : 0,
            yield: totalStake > 0 ? (totalProfit / totalStake) * 100 : 0,
        };
    }, [data, itemsToShow]);

    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}-${month}-${year}`;
    };

    const [viewMonth, setViewMonth] = useState(new Date());

    const CalendarWidget = () => {
        const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
        const startDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

        const year = viewMonth.getFullYear();
        const month = viewMonth.getMonth();
        const totalDays = daysInMonth(year, month);
        const startDay = startDayOfMonth(year, month);

        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const dayLabels = ["D", "L", "M", "M", "J", "V", "S"];

        const isSelected = (d) => {
            const dateStr = new Date(year, month, d).toISOString().split('T')[0];
            return dateStr === startDate || dateStr === endDate;
        };

        const isInRange = (d) => {
            if (!startDate || !endDate) return false;
            const current = new Date(year, month, d).toISOString().split('T')[0];
            return current > startDate && current < endDate;
        };

        const handleDayClick = (d) => {
            const selectedDate = new Date(Date.UTC(year, month, d)).toISOString().split('T')[0];

            if (!startDate || (startDate && endDate)) {
                setStartDate(selectedDate);
                setEndDate('');
            } else {
                if (selectedDate < startDate) {
                    setEndDate(startDate);
                    setStartDate(selectedDate);
                } else {
                    setEndDate(selectedDate);
                }
            }
            setViewMode('range');
        };

        const changeMonth = (offset) => {
            setViewMonth(new Date(year, month + offset, 1));
        };

        const calendarDays = [];
        for (let i = 0; i < startDay; i++) calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        for (let d = 1; d <= totalDays; d++) {
            const selected = isSelected(d);
            const inRange = isInRange(d);
            calendarDays.push(
                <div
                    key={d}
                    className={`calendar-day ${selected ? 'selected' : ''} ${inRange ? 'in-range' : ''}`}
                    onClick={() => handleDayClick(d)}
                >
                    {d}
                </div>
            );
        }

        return (
            <div className="calendar-widget">
                <div className="calendar-header">
                    <button className="calendar-nav-btn" onClick={() => changeMonth(-1)}><ChevronLeft size={16} /></button>
                    <div className="calendar-month-year">{monthNames[month]}</div>
                    <button className="calendar-nav-btn" onClick={() => changeMonth(1)}><ChevronRight size={16} /></button>
                </div>
                <div className="calendar-grid">
                    {dayLabels.map(l => <div key={l} className="calendar-day-label">{l}</div>)}
                    {calendarDays}
                </div>
                <div className="calendar-footer">
                    <div>{startDate ? `${formatDateDisplay(startDate)} ` : 'Inicia'} - {endDate ? formatDateDisplay(endDate) : 'Fin'}</div>
                    <div className="calendar-reset" onClick={() => { setStartDate(''); setEndDate(''); }}>Limpiar</div>
                </div>
            </div>
        );
    };

    if (loading) return <div className="loading-container">Iniciando Dashboard Premium...</div>;
    if (!data) return <div className="loading-container">Error al cargar datos. Verifica el archivo Excel.</div>;

    return (
        <div className="app-container" onClick={() => setIsDatePickerOpen(false)}>
            <header className="dashboard-header">
                <div>
                    <h1>NBA Bets Intel</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Visualización interactiva de rendimiento</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} onClick={(e) => e.stopPropagation()}>
                    <div className="view-mode-toggle">
                        <button
                            className={`mode-btn ${viewMode === 'weekly' ? 'active' : ''}`}
                            onClick={() => setViewMode('weekly')}
                        >
                            <Calendar size={16} /> Vista Semanal
                        </button>
                        <button
                            className={`mode-btn ${viewMode === 'range' ? 'active' : ''}`}
                            onClick={() => setViewMode('range')}
                        >
                            <TrendingUp size={16} /> Periodo Libre
                        </button>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <button
                            className={`calendar-btn ${isDatePickerOpen ? 'active' : ''}`}
                            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                        >
                            <Calendar size={18} />
                            <span>{viewMode === 'range' ? (startDate && endDate ? `${formatDateDisplay(startDate)} al ${formatDateDisplay(endDate)}` : 'Seleccionar Periodo') : 'Cambiar Fechas'}</span>
                        </button>

                        {isDatePickerOpen && (
                            <div className="date-picker-popover">
                                <CalendarWidget />
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <section className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label"><Target size={20} /> Picks {viewMode === 'weekly' ? 'Semana' : 'Periodo'}</div>
                    <div className="stat-value">{currentStats.picks}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label"><Percent size={20} /> Acierto</div>
                    <div className="stat-value" style={{ color: '#0ea5e9' }}>
                        {currentStats.acierto.toFixed(2)}%
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label"><TrendingUp size={20} /> Yield</div>
                    <div className="stat-value" style={{ color: currentStats.yield >= 0 ? '#00ff88' : '#ef4444' }}>
                        {currentStats.yield.toFixed(2)}%
                    </div>
                </div>
            </section>

            <section className="chart-container">
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>
                    Evolución de Beneficio Neto ({viewMode === 'weekly' ? 'Semana' : 'Periodo Selección'})
                </h3>
                <ResponsiveContainer width="100%" height="90%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="var(--text-secondary)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                        />
                        <YAxis
                            stroke="var(--text-secondary)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => `$${val}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#161a22',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                            itemStyle={{ color: 'var(--accent-color)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="profit"
                            stroke="var(--accent-color)"
                            fillOpacity={1}
                            fill="url(#colorProfit)"
                            strokeWidth={3}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </section>

            {viewMode === 'weekly' && weeks.length > 0 && (
                <div className="nba-pagination-v2">
                    <button
                        className="pagination-btn"
                        onClick={() => setCurrentWeekIndex(prev => Math.min(prev + 1, weeks.length - 1))}
                        disabled={currentWeekIndex === weeks.length - 1}
                    >
                        <ChevronLeft size={20} /> Semana Anterior
                    </button>
                    <div className="week-label">{currentWeek?.label}</div>
                    <button
                        className="pagination-btn"
                        onClick={() => setCurrentWeekIndex(prev => Math.max(prev - 1, 0))}
                        disabled={currentWeekIndex === 0}
                    >
                        Semana Siguiente <ChevronRight size={20} />
                    </button>
                </div>
            )}

            <section className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Equipo / Jugada</th>
                            <th>Cuota</th>
                            <th>Stake</th>
                            <th>Beneficio</th>
                            <th>Yield %</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemsToShow.slice().reverse().map((item) => (
                            <tr key={item.id}>
                                <td>{item.dateStr}</td>
                                <td style={{ fontWeight: 600 }}>{item.team}</td>
                                <td>{item.cuota}</td>
                                <td>{item.stake}</td>
                                <td className={item.isWin ? 'win' : 'loss'}>
                                    {item.profit > 0 ? `+${item.profit.toFixed(2)}` : item.profit.toFixed(2)}
                                </td>
                                <td>{(item.yield * 100).toFixed(2)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

export default App;
