import React from 'react'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing and using J&R Games' services, you accept and agree to be bound by the terms and 
                provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Services Description</h2>
              <p className="text-gray-700 mb-4">
                J&R Games provides gaming item buying services, including but not limited to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Purchase of gaming consoles, games, and accessories</li>
                <li>Item evaluation and pricing</li>
                <li>Cash transactions for gaming items</li>
                <li>Customer service and support</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Item Evaluation and Pricing</h2>
              <p className="text-gray-700 mb-4">
                All items are subject to evaluation by J&R Games staff. Pricing is based on:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Current market value</li>
                <li>Item condition and functionality</li>
                <li>Completeness of items (original packaging, manuals, accessories)</li>
                <li>Demand and availability</li>
              </ul>
              <p className="text-gray-700">
                Final pricing is determined at the time of evaluation and may differ from initial estimates.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Transaction Terms</h2>
              <p className="text-gray-700 mb-4">
                By selling items to J&R Games, you agree that:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>You are the legal owner of the items being sold</li>
                <li>Items are not stolen, counterfeit, or obtained illegally</li>
                <li>You have the right to sell the items</li>
                <li>All sales are final once payment is made</li>
                <li>Payment will be made in cash or agreed-upon method</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Item Condition and Testing</h2>
              <p className="text-gray-700">
                J&R Games reserves the right to test all items for functionality. Items that do not work as described 
                or are in worse condition than represented may result in reduced pricing or refusal of purchase. 
                We test items to ensure they meet our quality standards.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Prohibited Items</h2>
              <p className="text-gray-700 mb-4">We do not accept:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Stolen or illegally obtained items</li>
                <li>Counterfeit or pirated software/games</li>
                <li>Items with water damage or severe physical damage</li>
                <li>Items that violate intellectual property rights</li>
                <li>Items that are banned or restricted by law</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-700">
                J&R Games shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
                including without limitation, loss of profits, data, use, goodwill, or other intangible losses, 
                resulting from your use of our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Privacy and Data Protection</h2>
              <p className="text-gray-700">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of 
                our services, to understand our practices.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Modifications to Terms</h2>
              <p className="text-gray-700">
                J&R Games reserves the right to modify these terms at any time. We will notify users of any 
                significant changes by posting the new terms on our website. Your continued use of our services 
                after such modifications constitutes acceptance of the updated terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
              <p className="text-gray-700">
                These terms shall be governed by and construed in accordance with the laws of the jurisdiction 
                in which J&R Games operates, without regard to conflict of law principles.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Dispute Resolution</h2>
              <p className="text-gray-700">
                Any disputes arising from these terms or our services shall be resolved through good faith 
                negotiation. If a resolution cannot be reached, disputes may be subject to binding arbitration 
                or the jurisdiction of local courts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <p className="text-gray-700">
                  <strong>J&R Games</strong><br />
                  Email: info@jrgames.com<br />
                  Phone: (555) 123-4567
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
