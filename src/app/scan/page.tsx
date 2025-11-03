'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Camera, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'
import { BrowserMultiFormatReader } from '@zxing/library'

export default function BarcodeScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)

  // Check if device supports camera
  const [hasCamera, setHasCamera] = useState(false)

  useEffect(() => {
    // Check if device has camera
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      setHasCamera(true)
    }

    // Initialize barcode reader
    codeReaderRef.current = new BrowserMultiFormatReader()

    // Cleanup on unmount
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset()
      }
    }
  }, [])

  const startScanning = async () => {
    try {
      setError(null)
      setIsScanning(true)
      
      if (!codeReaderRef.current) {
        setError('Barcode scanner not initialized')
        setIsScanning(false)
        return
      }

      // Start continuous scanning
      await codeReaderRef.current.decodeFromVideoDevice(
        null, // Use default camera
        videoRef.current!,
        (result, error) => {
          if (result) {
            const code = result.getText()
            handleBarcodeDetected(code)
          }
          if (error && error.name !== 'NotFoundException') {
            console.error('Scanning error:', error)
          }
        }
      )
    } catch (err) {
      setError('Unable to access camera. Please ensure camera permissions are granted.')
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset()
    }
    setIsScanning(false)
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const handleBarcodeDetected = async (code: string) => {
    if (code === scannedCode) return // Prevent duplicate scans
    
    setScannedCode(code)
    setIsLoading(true)
    stopScanning()

    try {
      const response = await fetch(`/api/items/barcode/${code}`)
      const data = await response.json()

      if (response.ok && data.item) {
        setScanResult({ type: 'found', item: data.item })
      } else {
        setScanResult({ type: 'not_found', barcode: code })
      }
    } catch (err) {
      setError('Failed to check barcode. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetScanner = () => {
    setScannedCode(null)
    setScanResult(null)
    setError(null)
    setIsLoading(false)
  }

  const openThirdPartySearch = (barcode: string) => {
    // You can customize these URLs to your preferred third-party services
    const searchUrls = [
      `https://www.google.com/search?q=${barcode}+video+game+price`,
      `https://www.ebay.com/sch/i.html?_nkw=${barcode}`,
      `https://www.amazon.com/s?k=${barcode}`
    ]
    
    // Open the first search URL (Google search)
    window.open(searchUrls[0], '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/items"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to What We Buy
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Scan Barcode
          </h1>
          <p className="text-gray-600">
            Scan the UPC barcode on your gaming items to see if we buy them and get instant pricing.
          </p>
        </div>

        {/* Camera Access Check */}
        {!hasCamera && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="font-semibold text-red-800">Camera Not Available</h3>
            </div>
            <p className="text-red-700">
              Your device doesn't support camera access or camera permissions are not granted. 
              Please use a mobile device with camera access to scan barcodes.
            </p>
          </div>
        )}

        {/* Scanner Interface */}
        {hasCamera && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            {!isScanning && !scanResult && (
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Camera className="h-12 w-12 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Scan</h2>
                <p className="text-gray-600 mb-6">
                  Position the barcode within the camera view to scan it automatically.
                </p>
                <button
                  onClick={startScanning}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Start Scanning
                </button>
              </div>
            )}

            {/* Camera View */}
            {isScanning && (
              <div className="text-center">
                <div className="relative bg-black rounded-lg overflow-hidden mb-6">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-white border-dashed w-48 h-32 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">Position barcode here</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={stopScanning}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Stop Scanning
                </button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Checking barcode...</p>
              </div>
            )}

            {/* Scan Results */}
            {scanResult && (
              <div className="space-y-6">
                {scanResult.type === 'found' ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                      <h3 className="text-xl font-bold text-green-800">We Buy This Item!</h3>
                    </div>
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{scanResult.item.name}</h4>
                      <p className="text-gray-600 mb-3">{scanResult.item.category.name}</p>
                      <div className="text-2xl font-bold text-green-600">
                        We Pay: ${scanResult.item.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link
                        href={`/items/${scanResult.item.id}`}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-center font-semibold"
                      >
                        View Details & Pricing
                      </Link>
                      <Link
                        href="/contact"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center font-semibold"
                      >
                        Get Quote
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <AlertCircle className="h-6 w-6 text-yellow-600 mr-2" />
                      <h3 className="text-xl font-bold text-yellow-800">Item Not Found</h3>
                    </div>
                    <p className="text-yellow-700 mb-4">
                      We don't currently buy this item, but you can check other sources for pricing.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => openThirdPartySearch(scanResult.barcode)}
                        className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors font-semibold flex items-center justify-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Search Online
                      </button>
                      <Link
                        href="/contact"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center font-semibold"
                      >
                        Contact Us
                      </Link>
                    </div>
                  </div>
                )}
                
                <div className="text-center">
                  <button
                    onClick={resetScanner}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Scan Another Item
                  </button>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
                <button
                  onClick={resetScanner}
                  className="mt-3 text-red-600 hover:text-red-800 transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Start Scanning</h3>
              <p className="text-gray-600 text-sm">
                Tap "Start Scanning" and allow camera access when prompted.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Position Barcode</h3>
              <p className="text-gray-600 text-sm">
                Point your camera at the UPC barcode on the game or console.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Get Results</h3>
              <p className="text-gray-600 text-sm">
                See our pricing if we buy it, or get links to check other sources.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
