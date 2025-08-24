'use client'

import { useState } from 'react'

interface ExportDataProps {
  data: any[]
  filename?: string
  onExport?: (format: string, data: any[]) => void
}

export default function ExportData({ data, filename = 'export', onExport }: ExportDataProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToJSON = () => {
    setIsExporting(true)
    try {
      const dataStr = JSON.stringify(data, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
      onExport?.('json', data)
    } catch (error) {
      console.error('Export to JSON failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportToCSV = () => {
    setIsExporting(true)
    try {
      if (data.length === 0) return

      const headers = Object.keys(data[0])
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header]
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value || ''
          }).join(',')
        )
      ].join('\n')

      const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
      onExport?.('csv', data)
    } catch (error) {
      console.error('Export to CSV failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportToExcel = () => {
    setIsExporting(true)
    try {
      // Simple Excel-like format using tab-separated values
      if (data.length === 0) return

      const headers = Object.keys(data[0])
      const excelContent = [
        headers.join('\t'),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header]
            return value || ''
          }).join('\t')
        )
      ].join('\n')

      const dataBlob = new Blob([excelContent], { type: 'application/vnd.ms-excel' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.xls`
      link.click()
      URL.revokeObjectURL(url)
      onExport?.('excel', data)
    } catch (error) {
      console.error('Export to Excel failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={exportToJSON}
        disabled={isExporting || data.length === 0}
        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
      >
        {isExporting ? '⏳' : '📄'} JSON
      </button>
      
      <button
        onClick={exportToCSV}
        disabled={isExporting || data.length === 0}
        className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
      >
        {isExporting ? '⏳' : '📊'} CSV
      </button>
      
      <button
        onClick={exportToExcel}
        disabled={isExporting || data.length === 0}
        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
      >
        {isExporting ? '⏳' : '📈'} Excel
      </button>
    </div>
  )
}
