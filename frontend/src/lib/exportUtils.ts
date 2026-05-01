/**
 * Shared export utilities — CSV download and browser print (PDF).
 * Import from here instead of duplicating in each reports page.
 */

/** Download an array of rows as a CSV file */
export function downloadCSV(
  headers: string[],
  rows: (string | number | null | undefined)[][],
  filename: string,
): void {
  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${String(v ?? 'N/A').replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

/** Open a browser print dialog with a formatted HTML table */
export function printHTMLTable(options: {
  title: string
  subtitle?: string
  headers: string[]
  rows: (string | number | null | undefined)[][]
}): void {
  const { title, subtitle, headers, rows } = options
  const thead = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`
  const tbody = rows
    .map(row => `<tr>${row.map(v => `<td>${v ?? 'N/A'}</td>`).join('')}</tr>`)
    .join('')
  const html = `<!DOCTYPE html><html><head><title>${title}</title>
    <style>
      body { font-family: sans-serif; padding: 20px; }
      h1 { color: #1B3D2F; margin-bottom: 4px; }
      p { color: #666; font-size: 12px; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; font-size: 12px; }
      th { background: #1B3D2F; color: white; }
      tr:nth-child(even) { background: #f9f9f9; }
    </style>
  </head><body>
    <h1>${title}</h1>
    <p>${subtitle ?? ''} Generated: ${new Date().toLocaleString()} | ${rows.length} records</p>
    <table><thead>${thead}</thead><tbody>${tbody}</tbody></table>
  </body></html>`
  const w = window.open('', '_blank')
  if (w) { w.document.write(html); w.document.close(); w.print() }
}

/** Export trips to CSV */
export function exportTripsCSV(trips: any[], filename: string, includeCollege = false): void {
  const headers = [
    'Date', 'Destination', 'Requester',
    ...(includeCollege ? ['Department', 'College'] : ['Department']),
    'Status', 'Fuel Cost (ETB)', 'Distance (km)', 'Passengers',
  ]
  const rows = trips.map(t => [
    t.startDateTime ? new Date(t.startDateTime).toLocaleDateString() : 'N/A',
    t.destination || 'N/A',
    t.requester?.name || 'N/A',
    t.requester?.department?.name || 'N/A',
    ...(includeCollege ? [t.requester?.college?.name || 'N/A'] : []),
    t.state?.replace(/_/g, ' ') || 'N/A',
    t.actualFuelCost ? Number(t.actualFuelCost).toFixed(2) : 'N/A',
    t.actualDistance ? Number(t.actualDistance).toFixed(1) : 'N/A',
    t.passengerCount ?? 'N/A',
  ])
  downloadCSV(headers, rows, filename)
}

/** Print trips as PDF via browser print */
export function printTripsReport(trips: any[], title: string, includeCollege = false): void {
  const headers = [
    'Date', 'Destination', 'Requester',
    ...(includeCollege ? ['Department'] : []),
    'Status', 'Fuel Cost',
  ]
  const rows = trips.map(t => [
    t.startDateTime ? new Date(t.startDateTime).toLocaleDateString() : 'N/A',
    t.destination || 'N/A',
    t.requester?.name || 'N/A',
    ...(includeCollege ? [t.requester?.department?.name || 'N/A'] : []),
    t.state?.replace(/_/g, ' ') || 'N/A',
    t.actualFuelCost ? `ETB ${Number(t.actualFuelCost).toFixed(2)}` : 'N/A',
  ])
  printHTMLTable({ title, subtitle: `Total trips: ${trips.length}`, headers, rows })
}
