'use client'

import React, { useState, useEffect } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, Download, Trash2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

interface CSVFile {
  name: string
  size?: number
  lastModified?: string
}

interface ImportResult {
  success: boolean
  imported: number
  updated: number
  errors: string[]
  warnings: string[]
}

export default function CSVImporter() {
  const [files, setFiles] = useState<CSVFile[]>([])
  const [selectedFile, setSelectedFile] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [options, setOptions] = useState({
    updateExisting: false,
    clearExisting: false,
    confirmClear: false
  })

  // Load available CSV files
  const loadFiles = async () => {
    try {
      const response = await fetch('/api/admin/import-csv')
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files.map((filename: string) => ({ name: filename })))
      }
    } catch (error) {
      toast.error('Failed to load CSV files')
    }
  }

  useEffect(() => {
    loadFiles()
  }, [])

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Please select a CSV file')
      return
    }

    setIsLoading(true)
    setImportResult(null)

    try {
      const response = await fetch('/api/admin/import-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: selectedFile,
          options
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setImportResult(result)
        if (result.success) {
          toast.success(`Import completed! ${result.imported} items imported, ${result.updated} items updated`)
        } else {
          toast.error('Import completed with errors')
        }
      } else {
        toast.error(result.error || 'Import failed')
      }
    } catch (error) {
      toast.error('Failed to import CSV')
    } finally {
      setIsLoading(false)
    }
  }

  const createSampleTemplate = async () => {
    try {
      const response = await fetch('/api/admin/import-csv', {
        method: 'PUT'
      })

      if (response.ok) {
        toast.success('Sample CSV template created!')
        loadFiles() // Refresh file list
      } else {
        toast.error('Failed to create sample template')
      }
    } catch (error) {
      toast.error('Failed to create sample template')
    }
  }

  const downloadSample = () => {
    // This would typically download the sample file
    toast.success('Sample CSV template is available in the data/csv directory')
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">CSV Import</h2>
        <p className="text-gray-600">
          Import items from CSV files. Place your CSV files in the <code className="bg-gray-100 px-2 py-1 rounded">data/csv</code> directory.
        </p>
      </div>

      {/* File Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select CSV File
        </label>
        <div className="flex gap-4 items-center">
          <select
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
          >
            <option value="">Choose a CSV file...</option>
            {files.map((file) => (
              <option key={file.name} value={file.name}>
                {file.name}
              </option>
            ))}
          </select>
          <button
            onClick={loadFiles}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="Refresh file list"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        {files.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            No CSV files found. Create a sample template or add CSV files to the data/csv directory.
          </p>
        )}
      </div>

      {/* Import Options */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Import Options</h3>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.updateExisting}
              onChange={(e) => setOptions({ ...options, updateExisting: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Update existing items (by name, console, and category)
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.clearExisting}
              onChange={(e) => setOptions({ ...options, clearExisting: e.target.checked, confirmClear: false })}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Clear all existing items before import
            </span>
          </label>
          
          {options.clearExisting && (
            <div className="ml-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.confirmClear}
                  onChange={(e) => setOptions({ ...options, confirmClear: e.target.checked })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-red-700 font-medium">
                  I understand this will delete ALL existing items
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleImport}
          disabled={!selectedFile || isLoading || (options.clearExisting && !options.confirmClear)}
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </>
          )}
        </button>

        <button
          onClick={createSampleTemplate}
          className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FileText className="h-4 w-4 mr-2" />
          Create Sample Template
        </button>

        <button
          onClick={downloadSample}
          className="flex items-center px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Sample
        </button>
      </div>

      {/* Import Results */}
      {importResult && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Import Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">Imported</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{importResult.imported}</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <RefreshCw className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">Updated</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{importResult.updated}</p>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-sm font-medium text-red-800">Errors</span>
              </div>
              <p className="text-2xl font-bold text-red-900">{importResult.errors.length}</p>
            </div>
          </div>

          {/* Errors */}
          {importResult.errors.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-red-800 mb-2">Errors:</h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                {importResult.errors.map((error, index) => (
                  <p key={index} className="text-sm text-red-700 mb-1">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {importResult.warnings.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Warnings:</h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                {importResult.warnings.map((warning, index) => (
                  <p key={index} className="text-sm text-yellow-700 mb-1">
                    {warning}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">CSV Format Instructions</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Required columns:</strong> name, price, consoleType, console, category</p>
          <p><strong>Optional columns:</strong> description, imageUrl, barcode, condition, notes</p>
          <p><strong>File location:</strong> Place CSV files in the <code>data/csv</code> directory</p>
          <p><strong>Price format:</strong> Use numbers only (e.g., 25.99, not $25.99)</p>
        </div>
      </div>
    </div>
  )
}
