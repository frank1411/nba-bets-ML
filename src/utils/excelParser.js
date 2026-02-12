import * as XLSX from 'xlsx';

export const parseExcelData = async () => {
    try {
        const response = await fetch('/nba_data.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);

        const sheetName = 'NBA';
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Dynamic Parsing Logic
        let globalStats = { picks: 0, acierto: 0, yield: 0 };
        let tableEndRow = rawData.length;

        // 1. Find Global Stats by keywords in Column A (index 0)
        rawData.forEach((row, index) => {
            if (!row || !row[0]) return;
            const label = row[0].toString().trim().toLowerCase();

            if (label.includes('picks') || label === 'picks') {
                globalStats.picks = row[1] || 0;
                tableEndRow = Math.min(tableEndRow, index); // Data table must end before stats
            } else if (label.includes('acierto') || label === 'acierto') {
                globalStats.acierto = (row[1] || 0) * 100;
            } else if (label.includes('yield') || label === 'yield') {
                globalStats.yield = (row[1] || 0) * 100;
            }
        });

        // Process Table Data
        // Header is row 0. Data starts at row 1.
        // We slice from row 1 up to the start of the stats section (tableEndRow)
        let lastValidDate = null;
        const potentialDataRows = rawData.slice(1, tableEndRow);

        const tableData = potentialDataRows.map((row, index) => {
            // Excel Date Serial to JS Date
            let dateValue = row[1];
            let dateObj = null;

            if (typeof dateValue === 'number') {
                // Create date as UTC Midnight to avoid timezone shifts
                const date = new Date(Math.round((dateValue - 25569) * 86400 * 1000));
                dateObj = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
                lastValidDate = dateObj;
            } else if (typeof dateValue === 'string' && dateValue.trim() !== '') {
                const date = new Date(dateValue);
                // Handle DD/MM/YYYY or YYYY-MM-DD
                if (dateValue.includes('/')) {
                    const parts = dateValue.split('/');
                    // Assuming DD/MM/YYYY
                    if (parts.length === 3) dateObj = new Date(Date.UTC(parts[2], parts[1] - 1, parts[0]));
                } else {
                    dateObj = new Date(dateValue);
                }

                if (!dateObj || isNaN(dateObj)) dateObj = new Date(dateValue); // Fallback

                if (dateObj && !isNaN(dateObj)) {
                    dateObj = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate()));
                    lastValidDate = dateObj;
                }
            } else {
                dateObj = lastValidDate;
            }

            // Only include row if at least we have a team/jugada (column H -> index 7)
            if (!row[7]) return null;

            return {
                id: index,
                date: dateObj,
                dateStr: dateObj instanceof Date && !isNaN(dateObj) ?
                    `${dateObj.getUTCDate().toString().padStart(2, '0')}/${(dateObj.getUTCMonth() + 1).toString().padStart(2, '0')}/${dateObj.getUTCFullYear()}` : 'N/A',
                stake: row[2],
                cuota: row[3],
                profit: row[4],
                yield: row[5],
                amount: row[6],
                team: row[7],
                isWin: row[4] > 0,
            };
        }).filter(item => item !== null && item.date !== null && !isNaN(item.date.getTime()) && item.date.getFullYear() >= 2024);

        return { globalStats, tableData };
    } catch (error) {
        console.error('Error parsing excel:', error);
        return null;
    }
};
