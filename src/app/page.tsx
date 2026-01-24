import React from 'react'
import Link from 'next/link'
import JRGamesLogo from '@/components/JRGamesLogo'
import StructuredData from '@/components/StructuredData'
import { Gamepad2, DollarSign, Clock, Shield, Star, Users } from 'lucide-react'

export default function Home() {
  return (
    <>
      <StructuredData type="Organization" data={{}} />
      <StructuredData type="WebSite" data={{}} />
      
      {/* Hero Section - Centered Logo Design */}
      <section className="bg-gradient-to-br from-red-50 via-white to-green-50 min-h-[80vh] flex items-center" aria-labelledby="hero-heading">
        <div className="max-w-7xl mx-auto px-4 py-16 w-full">
          <div className="text-center">
            {/* Centered Logo as Focal Point */}
            <div className="mb-12">
              <div className="inline-block p-8 bg-white rounded-3xl shadow-2xl border-4 border-green-100 transform hover:scale-105 transition-all duration-500 animate-pulse-slow">
                <JRGamesLogo size="lg" className="justify-center" />
              </div>
            </div>
            
            {/* Main Heading */}
            <h1 id="hero-heading" className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight animate-fade-in-up">
              Turn Your Gaming
              <span className="text-green-600 block animate-bounce-slow">Into Cash</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
              We buy your gaming consoles, games, and accessories at fair prices. 
              <span className="text-green-600 font-semibold animate-pulse"> Quick, easy, and trusted.</span>
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-fade-in-up animation-delay-400">
              <Link
                href="/items"
                className="bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-all duration-300 transform hover:scale-105 text-lg font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-300 animate-bounce-in animation-delay-600"
                aria-label="View our current buy prices for gaming items"
              >
                <DollarSign className="inline h-5 w-5 mr-2 animate-spin-slow" aria-hidden="true" />
                See what we pay
              </Link>
              <Link
                href="/contact"
                className="bg-red-600 text-white px-8 py-4 rounded-xl hover:bg-red-700 transition-all duration-300 transform hover:scale-105 text-lg font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-red-300 animate-bounce-in animation-delay-800"
                aria-label="Contact us to sell your gaming items"
              >
                <Gamepad2 className="inline h-5 w-5 mr-2 animate-wiggle" aria-hidden="true" />
                Contact us to sell
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 animate-fade-in-up animation-delay-1000" role="list" aria-label="Why choose J&R Games">
              <div className="flex items-center gap-2 animate-float" role="listitem">
                <Shield className="h-5 w-5 text-green-600 animate-pulse" aria-hidden="true" />
                <span>Trusted Service</span>
              </div>
              <div className="flex items-center gap-2 animate-float animation-delay-200" role="listitem">
                <Clock className="h-5 w-5 text-blue-600 animate-spin-slow" aria-hidden="true" />
                <span>Quick Process</span>
              </div>
              <div className="flex items-center gap-2 animate-float animation-delay-400" role="listitem">
                <DollarSign className="h-5 w-5 text-green-600 animate-bounce" aria-hidden="true" />
                <span>Fair Prices</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 id="features-heading" className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose J&R Games?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We make selling your gaming items simple, fast, and profitable
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" role="list" aria-label="Key features and benefits">
            <article className="text-center group bg-gray-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2 animate-slide-in-left" role="listitem">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                <DollarSign className="h-10 w-10 text-green-600" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Fair Prices</h3>
              <p className="text-gray-600 leading-relaxed">
                We offer competitive market rates for all your gaming items
              </p>
            </article>

            <article className="text-center group bg-gray-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 animate-slide-in-left animation-delay-200" role="listitem">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <Clock className="h-10 w-10 text-blue-600" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Quick Process</h3>
              <p className="text-gray-600 leading-relaxed">
                Fast, stress-free quotes with service that comes to you.
              </p>
            </article>

            <article className="text-center group bg-gray-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 focus-within:ring-2 focus-within:ring-red-500 focus-within:ring-offset-2 animate-slide-in-right animation-delay-400" role="listitem">
              <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-red-200 transition-colors">
                <Shield className="h-10 w-10 text-red-600" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Trusted Service</h3>
              <p className="text-gray-600 leading-relaxed">
                Safe, secure transactions with a reputation you can trust
              </p>
            </article>

            <article className="text-center group bg-gray-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2" role="listitem">
              <div className="bg-orange-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-200 transition-colors">
                <Users className="h-10 w-10 text-orange-600" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Local Business</h3>
              <p className="text-gray-600 leading-relaxed">
                Supporting the gaming community with personalized service
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* What We Buy Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20" aria-labelledby="what-we-buy-heading">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 id="what-we-buy-heading" className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What We Buy
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <article className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-xl p-3 mr-4">
                    <Gamepad2 className="h-8 w-8 text-green-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Gaming Consoles</h3>
                </div>
                <Link
                  href="/items?category=consoles"
                  className="inline-flex items-center text-green-600 hover:text-green-800 font-semibold group focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-lg px-4 py-2 hover:bg-green-50 transition-all duration-200"
                  aria-label="View console prices and what we buy"
                >
                  View Prices 
                  <span className="ml-1 group-hover:translate-x-1 transition-transform" aria-hidden="true">→</span>
                </Link>
              </div>
            </article>

            <article className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-xl p-3 mr-4">
                    <Star className="h-8 w-8 text-blue-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Games & More</h3>
                </div>
                <Link
                  href="/items?category=games"
                  className="inline-flex items-center text-green-600 hover:text-green-800 font-semibold group focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-lg px-4 py-2 hover:bg-green-50 transition-all duration-200"
                  aria-label="Browse all gaming items we buy"
                >
                  Browse All 
                  <span className="ml-1 group-hover:translate-x-1 transition-transform" aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600 mb-4">
              <span className="text-red-600">*</span> All items must be in good condition and verified by one of our staff members before purchase.
            </p>
            <Link
              href="/condition-guide"
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium group focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              aria-label="Learn about condition guidelines for selling gaming items"
            >
              Condition Guidelines
              <span className="ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
