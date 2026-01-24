'use client'

import { useState, useRef } from 'react'
import { Search, Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface GameResult {
  id: number
  name: string
  imageUrl: string | null
  released: string | null
  platforms: string[]
}

interface ImageSelectorProps {
  currentImageUrl: string
  itemName: string
  consoleName?: string
  onImageSelect: (imageUrl: string) => void
}

export default function ImageSelector({
  currentImageUrl,
  itemName,
  consoleName,
  onImageSelect,
}: ImageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'search' | 'upload'>('search')
  const [searchQuery, setSearchQuery] = useState(itemName)
  const [searchResults, setSearchResults] = useState<GameResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setError(null)

    try {
      const params = new URLSearchParams({ q: searchQuery })
      if (consoleName) {
        params.append('console', consoleName)
      }

      const response = await fetch(`/api/images/search?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search')
      }

      setSearchResults(data.games || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      onImageSelect(data.imageUrl)
      setIsOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSelectImage = (imageUrl: string) => {
    onImageSelect(imageUrl)
    setIsOpen(false)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Item Image
      </label>

      {/* Current Image Preview */}
      <div className="flex items-start gap-4">
        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border">
          {currentImageUrl ? (
            <img
              src={currentImageUrl}
              alt="Current"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = ''
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={currentImageUrl}
            onChange={(e) => onImageSelect(e.target.value)}
            placeholder="Enter image URL or use search/upload"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
          />
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Search className="w-4 h-4 mr-2" />
            Search or Upload Image
          </button>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Select Image
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('search')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'search'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Search className="w-4 h-4 inline mr-2" />
                Search Games
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'upload'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Upload Image
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {activeTab === 'search' ? (
                <div className="space-y-4">
                  {/* Search Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Search for game cover art..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                    <button
                      onClick={handleSearch}
                      disabled={isSearching}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSearching ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Search className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {consoleName && (
                    <p className="text-sm text-gray-500">
                      Searching for {consoleName} games
                    </p>
                  )}

                  {/* Search Results */}
                  {searchResults.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {searchResults.map((game) => (
                        <button
                          key={game.id}
                          onClick={() =>
                            game.imageUrl && handleSelectImage(game.imageUrl)
                          }
                          disabled={!game.imageUrl}
                          className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                            game.imageUrl
                              ? 'hover:border-blue-500 cursor-pointer'
                              : 'opacity-50 cursor-not-allowed border-gray-200'
                          }`}
                        >
                          {game.imageUrl ? (
                            <img
                              src={game.imageUrl}
                              alt={game.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <p className="text-white text-xs font-medium line-clamp-2">
                              {game.name}
                            </p>
                            {game.released && (
                              <p className="text-gray-300 text-xs">
                                {game.released.split('-')[0]}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : isSearching ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                      <p className="text-gray-500 mt-2">Searching...</p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>Search for a game to see cover art</p>
                      <p className="text-sm mt-1">
                        Powered by RAWG Video Games Database
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isUploading
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    {isUploading ? (
                      <div>
                        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
                        <p className="text-gray-600 mt-2">Uploading...</p>
                      </div>
                    ) : (
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer block"
                      >
                        <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                        <p className="text-gray-600 mt-2">
                          Click to upload an image
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          JPEG, PNG, WebP, or GIF (max 5MB)
                        </p>
                      </label>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 text-center">
                    Use this for consoles, controllers, and accessories that
                    aren't found in the game database.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
