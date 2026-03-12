'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send, ShoppingBag, X, Trash2, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSellList } from '@/contexts/SellListContext'
import { trackGenerateLead, trackGoogleAdsLeadConversion } from '@/lib/gtag'

const MAX_UPLOAD_IMAGES = 10
const MAX_UPLOAD_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_UPLOAD_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export default function ContactPage() {
  const { items: sellListItems, removeItem, clearList, totalValue, itemCount } = useSellList()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = new FormData()
      payload.append('name', formData.name)
      payload.append('email', formData.email)
      payload.append('phone', formData.phone)
      payload.append('subject', formData.subject)
      payload.append('message', formData.message)
      payload.append('sellListItems', JSON.stringify(sellListItems.map(item => ({
        name: item.name,
        conditionLabel: item.conditionLabel,
        category: item.category,
        consoleName: item.consoleName,
        price: item.price,
        quantity: item.quantity
      }))))
      payload.append('sellListTotal', totalValue.toString())
      photoFiles.forEach(file => payload.append('photos', file, file.name))

      const response = await fetch('/api/contact', {
        method: 'POST',
        body: payload,
      })

      const result = await response.json()

      if (response.ok) {
        const leadValue = totalValue > 0 ? totalValue : undefined
        trackGenerateLead({
          value: leadValue,
          currency: 'CAD',
          leadSource: 'contact_form',
        })
        trackGoogleAdsLeadConversion({
          value: leadValue,
          currency: 'CAD',
          leadSource: 'contact_form',
        })
        toast.success(result.message)
      } else {
        throw new Error(result.error || 'Failed to send message')
      }
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
      setPhotoFiles([])
    } catch (error: any) {
      toast.error(error?.message || 'Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) {
      setPhotoFiles([])
      return
    }

    const trimmedFiles = selectedFiles.slice(0, MAX_UPLOAD_IMAGES)
    if (selectedFiles.length > MAX_UPLOAD_IMAGES) {
      toast.error(`Only ${MAX_UPLOAD_IMAGES} images can be uploaded.`)
    }

    for (const file of trimmedFiles) {
      if (!ALLOWED_UPLOAD_MIME_TYPES.has(file.type)) {
        toast.error(`Unsupported file type: ${file.name}`)
        e.target.value = ''
        setPhotoFiles([])
        return
      }
      if (file.size > MAX_UPLOAD_IMAGE_SIZE_BYTES) {
        toast.error(`File too large (max 5MB): ${file.name}`)
        e.target.value = ''
        setPhotoFiles([])
        return
      }
    }

    setPhotoFiles(trimmedFiles)
  }

  const handleRemovePhoto = (fileName: string) => {
    setPhotoFiles(prevFiles => prevFiles.filter(file => file.name !== fileName))
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-red-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Sell to <span className="text-green-600">Us</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Ready to sell your gaming items? Contact us with what you have and get a quote today!
            </p>
          </div>
        </div>
      </div>

      {/* Sell List Section */}
      {itemCount > 0 && (
        <div className="max-w-6xl mx-auto px-4 pt-8 pb-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-6 w-6 text-white" />
                <h2 className="text-white font-semibold text-lg">Your Sell List ({itemCount} items)</h2>
              </div>
              <button
                onClick={clearList}
                className="flex items-center gap-1 text-white/80 hover:text-white text-sm transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </button>
            </div>

            {/* Items Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sellListItems.map((item) => (
                  <div
                    key={item.sellListKey || item.id}
                    className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {item.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                        {item.consoleName && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {item.consoleName}
                          </span>
                        )}
                        {item.conditionLabel && (
                          <span className="text-xs text-orange-700 bg-orange-50 px-2 py-0.5 rounded">
                            {item.conditionLabel}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </span>
                        <span className="text-green-600 font-semibold">
                          ${((Number(item.price) || 0) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.sellListKey || item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      aria-label={`Remove ${item.name} from sell list`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-gray-600 font-medium">Estimated Total Value:</span>
                <span className="text-2xl font-bold text-green-600">
                  ${totalValue.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * Final quote may vary based on item condition. These items will be included in your quote request.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Email</h3>
                    <a href="mailto:jnrretro@outlook.com" className="text-gray-600 hover:text-blue-600 transition-colors">jnrretro@outlook.com</a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Phone</h3>
                    <p className="text-gray-600">(416) 677-2382</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Service Area</h3>
                    <p className="text-gray-600">
                      Serving the GTA
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Hours</h3>
                    <p className="text-gray-600">
                      Monday: 10 a.m.–7 p.m.<br />
                      Tuesday: 10 a.m.–7 p.m.<br />
                      Wednesday: 10 a.m.–7 p.m.<br />
                      Thursday: 10 a.m.–7 p.m.<br />
                      Friday: 10 a.m.–7 p.m.<br />
                      Saturday: 11 a.m.–6 p.m.<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Tell us what you want to sell</h2>
              <p className="text-sm text-gray-600 -mt-2 mb-6">
                Sending pictures get you a quote faster.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="(416) 677-2382"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 bg-white"
                    >
                      <option value="">What do you want to sell?</option>
                      <option value="consoles">Gaming Consoles</option>
                      <option value="games">Video Games</option>
                      <option value="accessories">Gaming Accessories</option>
                      <option value="bulk">Bulk Items</option>
                      <option value="other">Other Gaming Items</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 bg-white"
                    placeholder="Any games not on our Top Sell List will be quoted over email or phone"
                  />
                </div>

                <div>
                  <label htmlFor="photos" className="block text-sm font-medium text-gray-700 mb-2">
                    Photos (Optional)
                  </label>
                  <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-slate-50 p-3 sm:p-4">
                    <label
                      htmlFor="photos"
                      className="group flex cursor-pointer flex-col items-start gap-4 rounded-2xl border border-dashed border-blue-200 bg-white px-4 py-4 shadow-sm transition-all duration-300 hover:border-blue-400 hover:shadow-md focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                    >
                      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                        <Upload className="h-5 w-5" />
                      </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900">
                            {photoFiles.length > 0 ? 'Add more pictures' : 'Add pictures'}
                          </div>
                          <p className="pr-2 text-xs leading-5 text-gray-600">
                            Upload clear photos for a faster quote.
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-5 py-1.5 text-xs font-medium text-blue-700 shadow-sm sm:px-6">
                        Choose files
                      </span>
                    </label>
                  </div>
                  <input
                    id="photos"
                    name="photos"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handlePhotoChange}
                    className="sr-only"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Upload up to 10 images (JPG, PNG, WEBP), max 5MB each and 9MB total for emailed attachments.
                  </p>
                  {photoFiles.length > 0 && (
                    <div className="mt-4 rounded-2xl bg-slate-50 p-3 sm:p-4">
                      <p className="mb-3 px-1 text-xs font-medium text-gray-600">
                        {photoFiles.length} file(s) selected
                      </p>
                      <div className="space-y-2">
                        {photoFiles.map((file) => (
                          <div
                            key={`${file.name}-${file.size}`}
                            className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5"
                          >
                            <span className="min-w-0 flex-1 truncate text-xs text-gray-700">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(file.name)}
                              className="inline-flex shrink-0 items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs text-red-600 transition-colors hover:bg-red-100"
                              aria-label={`Remove ${file.name}`}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Get Quote
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-gradient-to-r from-red-50 to-green-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">What gaming items do we buy?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center group">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                <span className="text-2xl">🎮</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Gaming Consoles</h4>
            </div>
            <div className="text-center group">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                <span className="text-2xl">🎯</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Video Games</h4>
            </div>
            <div className="text-center group">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                <span className="text-2xl">🎧</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Accessories</h4>
            </div>
          </div>
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              <span className="text-red-600">*</span> All items must be in good condition and verified by one of our staff members before purchase.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
