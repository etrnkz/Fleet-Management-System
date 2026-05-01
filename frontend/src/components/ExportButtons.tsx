'use client'

interface ExportButtonsProps {
  onPDF: () => void
  onExcel: () => void
  className?: string
}

export default function ExportButtons({ onPDF, onExcel, className = '' }: ExportButtonsProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      <button
        onClick={onPDF}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center gap-2 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Export PDF
      </button>
      <button
        onClick={onExcel}
        className="px-4 py-2 bg-[#1B3D2F] text-white rounded-lg hover:bg-[#152e22] text-sm font-medium flex items-center gap-2 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export Excel
      </button>
    </div>
  )
}
