import * as XLSX from 'xlsx';

export const parseExcelData = async () => {
    try {
        const response = await fetch('/nba_data.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);

        const sheetName = 'NBA';
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Extract Global Metrics
        // Based on analysis: Row 1015 has Picks, 1017 has Acierto, 1019 has Yield
        const globalStats = {
            picks: rawData[1015]?.[1] || 0,
            acierto: (rawData[1017]?.[1] || 0) * 100, // Format as %
            yield: (rawData[1019]?.[1] || 0) * 100,  // Format as %
        };

        // Process Table Data
        // Header is row 0. Data starts at row 1.
        let lastValidDate = null;
        const tableData = rawData.slice(1, 1011).map((row, index) => {
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
                dateObj = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
                lastValidDate = dateObj;
            } else {
                dateObj = lastValidDate;
            }

            // Only include row if at least we have a team/jugada (column H)
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
        }).filter(item => item !== null && item.date !== null);

        return { globalStats, tableData };
    } catch (error) {
        console.error('Error parsing excel:', error);
        return null;
    }
};
