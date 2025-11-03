import React from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, DollarSign, Tag, Gamepad2, Mail, Phone, AlertCircle } from 'lucide-react'
import StructuredData from '@/components/StructuredData'

async function getItem(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/items/${id}`, {
      cache: 'no-store'
    })

    if (!response.ok) {
      return null
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching item:', error)
    return null
  }
}

export default async function ItemDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  try {
    const resolvedParams = await params
    const item = await getItem(resolvedParams.id)

    if (!item) {
      notFound()
    }

    return (
      <>
        <StructuredData type="Product" data={item} />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Back Button */}
            <div className="mb-6">
              <Link
                href="/items"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to What We Buy
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Item Image */}
              <div className="space-y-4">
                {item.imageUrl ? (
                  <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Gamepad2 className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No image available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.name}</h1>
                  
                  {/* Console Info */}
                  {item.console && (
                    <div className="flex items-center mb-4">
                      <Gamepad2 className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-lg text-gray-700">
                        {item.console.consoleType?.name} - {item.console.name}
                      </span>
                    </div>
                  )}

                  {/* Category */}
                  <div className="flex items-center mb-4">
                    <Tag className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-lg text-gray-700">{item.category.name}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <DollarSign className="h-6 w-6 text-green-600 mr-2" />
                    <h2 className="text-2xl font-bold text-green-600">We Pay</h2>
                  </div>
                  
                  {/* Dynamic Pricing Based on Item Category */}
                  {item.category.name === 'Consoles' ? (
                    // Console pricing tiers (Complete Console, Console with Controller, Console Only)
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-gray-900">Complete Console</h3>
                            <p className="text-sm text-gray-600">Console with all accessories, controllers, and original packaging</p>
                          </div>
                          <div className="text-2xl font-bold text-green-600">
                            ${(item.completeConsolePrice || item.price).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      {item.consoleWithController && (
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold text-gray-900">Console with Controller</h3>
                              <p className="text-sm text-gray-600">Console with controller and essential cables</p>
                            </div>
                            <div className="text-2xl font-bold text-green-600">
                              ${item.consoleWithController.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {item.consoleOnlyPrice && (
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold text-gray-900">Console Only</h3>
                              <p className="text-sm text-gray-600">Just the console unit</p>
                            </div>
                            <div className="text-2xl font-bold text-green-600">
                              ${item.consoleOnlyPrice.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Special Notes for Consoles */}
                      {item.description && item.description.includes('(') && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-yellow-800">Special Note</h3>
                              <p className="mt-1 text-sm text-yellow-700">
                                {item.description.split('(')[1]?.replace(')', '') || ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : item.category.name === 'Games' ? (
                    // Game pricing tiers - different logic for classic Nintendo systems
                    <div className="space-y-4">
                      {['NES', 'SNES', 'Nintendo 64'].includes(item.console?.name || '') ? (
                        // Classic Nintendo systems - Game Only only
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold text-gray-900">Game Only</h3>
                              <p className="text-sm text-gray-600">Just the game cartridge</p>
                            </div>
                            <div className="text-2xl font-bold text-green-600">
                              ${item.price.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ) : item.console?.name === 'Nintendo Switch' ? (
                        // Switch games - Case and Game, Game Only
                        <>
                          <div className="bg-white rounded-lg p-4 border border-green-200">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-semibold text-gray-900">Case and Game</h3>
                                <p className="text-sm text-gray-600">Game with original case but no manual or inserts</p>
                              </div>
                              <div className="text-2xl font-bold text-green-600">
                                ${item.price.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          
                          {item.goodPrice && (
                            <div className="bg-white rounded-lg p-4 border border-green-200">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h3 className="font-semibold text-gray-900">Game Only</h3>
                                  <p className="text-sm text-gray-600">Just the game cartridge</p>
                                </div>
                                <div className="text-2xl font-bold text-green-600">
                                  ${item.goodPrice.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        // Modern systems - Complete in Box, Box and Game, Disc Only
                        <>
                          <div className="bg-white rounded-lg p-4 border border-green-200">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-semibold text-gray-900">Complete in Box</h3>
                                <p className="text-sm text-gray-600">Game with original box, manual, and all inserts</p>
                              </div>
                              <div className="text-2xl font-bold text-green-600">
                                ${item.price.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          
                          {item.goodPrice && (
                            <div className="bg-white rounded-lg p-4 border border-green-200">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h3 className="font-semibold text-gray-900">Box and Game</h3>
                                  <p className="text-sm text-gray-600">Game with original box but no manual or inserts</p>
                                </div>
                                <div className="text-2xl font-bold text-green-600">
                                  ${item.goodPrice.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {item.acceptablePrice && (
                            <div className="bg-white rounded-lg p-4 border border-green-200">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h3 className="font-semibold text-gray-900">Disc Only</h3>
                                  <p className="text-sm text-gray-600">Just the game disc/cartridge</p>
                                </div>
                                <div className="text-2xl font-bold text-green-600">
                                  ${item.acceptablePrice.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : ['Handhelds', 'Controllers', 'Accessories'].includes(item.category.name) ? (
                    // Handheld/Controller/Accessory pricing tiers (Good Condition, Acceptable Condition)
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-gray-900">Good Condition</h3>
                            <p className="text-sm text-gray-600">Excellent working condition with minimal wear</p>
                          </div>
                          <div className="text-2xl font-bold text-green-600">
                            ${item.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      {item.acceptablePrice && (
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold text-gray-900">Acceptable Condition</h3>
                              <p className="text-sm text-gray-600">Working condition with some wear</p>
                            </div>
                            <div className="text-2xl font-bold text-green-600">
                              ${item.acceptablePrice.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Single price display for other categories
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        ${item.price.toFixed(2)}
                      </div>
                      <p className="text-green-700 text-sm">
                        This is our current buy price for this item
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-green-700 text-sm text-center mb-2">
                      <span className="text-red-600">*</span> All items must be in good working condition
                    </p>
                    <p className="text-center">
                      <Link 
                        href="/condition-guide" 
                        className="text-blue-600 hover:text-blue-800 text-sm underline transition-colors"
                      >
                        Not sure what good condition looks like? Check our guide →
                      </Link>
                    </p>
                  </div>
                </div>

                {/* Description */}
                {item.description && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{item.description}</p>
                  </div>
                )}

                {/* Sell to Us CTA */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Ready to Sell?</h3>
                  <p className="text-gray-700 mb-4">
                    Have this item? Contact us to get a quote and sell it to us today!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      <Mail className="h-5 w-5 mr-2" />
                      Get Quote
                    </Link>
                    <a
                      href="tel:5551234567"
                      className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-base font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 transition-colors"
                    >
                      <Phone className="h-5 w-5 mr-2" />
                      Call Us
                    </a>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Selling Information</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>Fair market prices for your gaming items</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>Quick and easy transactions</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>We buy items in good condition</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>Cash payment available</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      </>
    )
  } catch (error) {
    console.error('Error in ItemDetailsPage:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              We're having trouble loading this item. Please try again later.
            </p>
            <Link
              href="/items"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Items
            </Link>
          </div>
        </div>
      </div>
    )
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  try {
    const resolvedParams = await params
    const item = await getItem(resolvedParams.id)

    if (!item) {
      return {
        title: 'Item Not Found - J&R Games',
        description: 'The requested item could not be found.',
      }
    }

    return {
      title: `${item.name} - We Pay $${item.price.toFixed(2)} - J&R Games`,
      description: `Sell your ${item.name} to J&R Games. We pay $${item.price.toFixed(2)} for this ${item.category.name.toLowerCase()}. Contact us today!`,
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Item Error - J&R Games',
      description: 'There was an error loading this item.',
    }
  }
}