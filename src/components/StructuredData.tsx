interface StructuredDataProps {
  type: 'Organization' | 'WebSite' | 'ItemList' | 'Product'
  data: any
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    switch (type) {
      case 'Organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'J&R Games',
          description: 'We buy gaming consoles, games, and accessories at fair prices',
          url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
          logo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/jnr_2024_logo.png`,
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+1-416-677-2382',
            contactType: 'customer service',
            email: 'jnrretro@outlook.com',
            availableLanguage: 'English'
          },
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Greater Toronto Area',
            addressRegion: 'ON',
            addressCountry: 'CA'
          },
          openingHours: [
            'Mo-Fr 10:00-19:00',
            'Sa 11:00-18:00',
            'Su closed'
          ],
          sameAs: [
            // Add your social media URLs here
          ]
        }

      case 'WebSite':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'J&R Games',
          url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
          description: 'Sell your gaming items to J&R Games. We buy consoles, games, and accessories.',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/items?search={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          }
        }

      case 'ItemList':
        return {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Gaming Items We Buy',
          description: 'List of gaming items we purchase at J&R Games',
          url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/items`,
          numberOfItems: data.length,
          itemListElement: data.map((item: any, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'Product',
              name: item.name,
              description: item.description,
              image: item.imageUrl,
              offers: {
                '@type': 'Offer',
                price: item.price,
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
                seller: {
                  '@type': 'Organization',
                  name: 'J&R Games'
                }
              },
              category: item.category?.name,
              brand: item.console?.consoleType?.name,
              model: item.console?.name
            }
          }))
        }

      case 'Product':
        return {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: data.name,
          description: data.description,
          image: data.imageUrl,
          category: data.category?.name,
          brand: {
            '@type': 'Brand',
            name: data.console?.consoleType?.name
          },
          model: data.console?.name,
          offers: {
            '@type': 'Offer',
            price: data.price,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            seller: {
              '@type': 'Organization',
              name: 'J&R Games',
              url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
            },
            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
          }
        }

      default:
        return {}
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData(), null, 2)
      }}
    />
  )
}


