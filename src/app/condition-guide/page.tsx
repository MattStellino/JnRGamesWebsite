import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function ConditionGuide() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/items"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to What We Buy
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            What is <span className="text-green-600">Good Condition</span>?
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Not sure if your gaming items are in good condition? Here's what we look for when evaluating items.
          </p>
        </div>

        {/* General Guidelines */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">General Condition Guidelines</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-green-600 mb-4 flex items-center">
                <CheckCircle className="h-6 w-6 mr-2" />
                Good Condition
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Item works perfectly and functions as intended</li>
                <li>• Minor cosmetic wear is acceptable (light scratches, scuffs)</li>
                <li>• All buttons, ports, and features work properly</li>
                <li>• Original packaging in good condition (if available)</li>
                <li>• No major damage or missing essential parts</li>
                <li>• Clean and well-maintained appearance</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-red-600 mb-4 flex items-center">
                <XCircle className="h-6 w-6 mr-2" />
                Poor Condition
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Item doesn't work or has major functionality issues</li>
                <li>• Significant cosmetic damage (deep scratches, cracks)</li>
                <li>• Missing essential parts or accessories</li>
                <li>• Water damage or liquid exposure</li>
                <li>• Broken buttons, ports, or features</li>
                <li>• Excessive dirt, grime, or damage</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Console Examples */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Gaming Consoles</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Good Condition Console</h3>
              <div className="bg-gray-100 rounded-lg mb-4 relative h-64 md:h-80 overflow-hidden">
                <Image
                  src="/conditions/goodconsole.jpg"
                  alt="Good condition gaming console example"
                  fill
                  className="object-contain rounded-lg"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>✓ Powers on and functions normally</li>
                <li>✓ All ports and connections work</li>
                <li>✓ Controllers respond properly</li>
                <li>✓ Disc drive reads games (if applicable)</li>
                <li>✓ Minor wear on exterior is acceptable</li>
                <li>✓ Clean and well-maintained</li>
              </ul>
              
              {/* Good HDMI Port */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-green-600 mb-3">Good HDMI Port</h4>
                <div className="bg-gray-100 rounded-lg mb-3 p-4 relative h-64 md:h-80 overflow-hidden">
                  <Image
                    src="/conditions/HDMIGOOD.jpg"
                    alt="Good condition HDMI port on console"
                    fill
                    className="object-contain rounded-lg"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>✓ Port is clean and intact</li>
                  <li>✓ No damage to connector</li>
                  <li>✓ Properly connects to cables</li>
                </ul>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Poor Condition Console</h3>
              <div className="bg-gray-100 rounded-lg mb-4 relative h-64 md:h-80 overflow-hidden">
                <Image
                  src="/conditions/badnes.jpg"
                  alt="Poor condition gaming console example showing damage"
                  fill
                  className="object-contain rounded-lg"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>✗ Won't power on or has startup issues</li>
                <li>✗ Broken or loose ports</li>
                <li>✗ Controllers don't work properly</li>
                <li>✗ Disc drive doesn't read games</li>
                <li>✗ Significant cosmetic damage</li>
                <li>✗ Missing essential parts</li>
              </ul>
              
              {/* Damaged HDMI Port */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-red-600 mb-3">Damaged HDMI Port</h4>
                <div className="bg-gray-100 rounded-lg mb-3 p-4 relative h-64 md:h-80 overflow-hidden">
                  <Image
                    src="/conditions/HDMIBROKEN.jpg"
                    alt="Damaged HDMI port on console"
                    fill
                    className="object-contain rounded-lg"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>✗ Port is damaged or bent</li>
                  <li>✗ Connector broken or loose</li>
                  <li>✗ May not connect properly</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Game Examples */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Video Games</h2>
          
          {/* Good Condition Games */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-green-600 mb-6 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Good Condition Examples
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Complete Game</h4>
                <div className="bg-gray-100 rounded-lg p-4 text-center mb-4 relative aspect-square overflow-hidden">
                  <Image
                    src="/conditions/goodgamecase.jpg"
                    alt="Good condition complete game with case, disc, and manual"
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>✓ Original case in good condition</li>
                  <li>✓ Game disc/cartridge works</li>
                  <li>✓ Manual included and readable</li>
                  <li>✓ Artwork intact</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Good Game Disc</h4>
                <div className="bg-gray-100 rounded-lg p-4 text-center mb-4 relative aspect-square overflow-hidden">
                  <Image
                    src="/conditions/goodgamedisc.jpg"
                    alt="Good condition game disc"
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>✓ Disc reads properly</li>
                  <li>✓ No deep scratches</li>
                  <li>✓ Clean surface</li>
                  <li>✓ Minor wear acceptable</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Good Game Case</h4>
                <div className="bg-gray-100 rounded-lg p-4 text-center mb-4 relative aspect-square overflow-hidden">
                  <Image
                    src="/conditions/goodgamecase1.jpg"
                    alt="Good condition game case"
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>✓ Case closes properly</li>
                  <li>✓ Artwork intact</li>
                  <li>✓ No cracks or major damage</li>
                  <li>✓ Minor wear acceptable</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Poor Condition Games */}
          <div>
            <h3 className="text-xl font-semibold text-red-600 mb-6 flex items-center">
              <XCircle className="h-5 w-5 mr-2" />
              Poor Condition Examples
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Damaged Disc</h4>
                <div className="bg-gray-100 rounded-lg p-4 text-center mb-4 relative aspect-square overflow-hidden">
                  <Image
                    src="/conditions/baddisc.jpg"
                    alt="Damaged game disc example"
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>✗ Deep scratches or cracks</li>
                  <li>✗ May not read properly</li>
                  <li>✗ Significant damage</li>
                  <li>✗ Unplayable condition</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Damaged Case</h4>
                <div className="bg-gray-100 rounded-lg p-4 text-center mb-4 relative aspect-square overflow-hidden">
                  <Image
                    src="/conditions/badcase.jpg"
                    alt="Damaged game case example"
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>✗ Cracked or broken case</li>
                  <li>✗ Artwork damaged or missing</li>
                  <li>✗ Case doesn't close properly</li>
                  <li>✗ Significant wear</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Damaged Manual</h4>
                <div className="bg-gray-100 rounded-lg p-4 text-center mb-4 relative aspect-square overflow-hidden">
                  <Image
                    src="/conditions/badmanual.jpg"
                    alt="Damaged game manual example"
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>✗ Torn or heavily damaged</li>
                  <li>✗ Missing pages</li>
                  <li>✗ Stained or unreadable</li>
                  <li>✗ Water damage</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Accessories */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Gaming Accessories</h2>
          <div className="max-w-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Controllers & Accessories</h3>
            <div className="bg-gray-100 rounded-lg p-6 text-center mb-4">
              <div className="text-6xl mb-4">🎮</div>
              <p className="text-gray-600 text-sm">Controller Example</p>
            </div>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>✓ All buttons and triggers work properly</li>
              <li>✓ Analog sticks function correctly</li>
              <li>✓ Connects to console without issues</li>
              <li>✓ Battery holds charge (wireless)</li>
              <li>✓ Clean and well-maintained</li>
              <li>✓ No significant cosmetic damage</li>
            </ul>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <AlertCircle className="h-6 w-6 text-blue-600 mr-3" />
            Important Notes
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Testing Required:</strong> All items are tested by our staff before purchase to ensure they work properly. 
              We may adjust pricing based on actual condition during evaluation.
            </p>
            <p>
              <strong>Pricing Factors:</strong> Final pricing depends on current market value, item condition, completeness, 
              and demand. Our staff will provide the final price during evaluation.
            </p>
            <p>
              <strong>Questions?</strong> If you're unsure about your item's condition, bring it in and we'll evaluate it for free. 
              We're happy to explain our pricing and help you understand what makes an item valuable.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-lg font-semibold"
          >
            Ready to Sell? Get a Quote
          </Link>
        </div>
      </div>
    </div>
  )
}
