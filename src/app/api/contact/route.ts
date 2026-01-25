import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { 
  sanitizeInput, 
  validateEmail, 
  validatePhone, 
  validateName,
  validateDescription 
} from '@/lib/security'

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = rateLimit(request, '/api/contact')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()

    // Sanitize and validate inputs
    const name = sanitizeInput(body.name || '')
    const email = sanitizeInput(body.email || '')
    const phone = sanitizeInput(body.phone || '')
    const subject = sanitizeInput(body.subject || '')
    const message = sanitizeInput(body.message || '')
    const sellListItems = Array.isArray(body.sellListItems) ? body.sellListItems : []
    const sellListTotal = Number(body.sellListTotal) || 0

    // Validation
    if (!validateName(name)) {
      return NextResponse.json(
        { error: 'Invalid name format' },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (phone && !validatePhone(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone format' },
        { status: 400 }
      )
    }

    if (!subject || subject.length < 3) {
      return NextResponse.json(
        { error: 'Subject is required and must be at least 3 characters' },
        { status: 400 }
      )
    }

    if (!validateDescription(message)) {
      return NextResponse.json(
        { error: 'Message is too long (max 1000 characters)' },
        { status: 400 }
      )
    }

    // Format sell list items for email
    let sellListText = ''
    if (sellListItems.length > 0) {
      sellListText = '\n\n--- SELL LIST ITEMS ---\n'
      sellListItems.forEach((item: any, index: number) => {
        const itemName = sanitizeInput(item.name || 'Unknown Item')
        const itemCategory = sanitizeInput(item.category || 'N/A')
        const itemConsole = item.consoleName ? sanitizeInput(item.consoleName) : null
        const itemPrice = Number(item.price) || 0
        const itemQty = Number(item.quantity) || 1
        const itemTotal = itemPrice * itemQty

        sellListText += `\n${index + 1}. ${itemName}`
        sellListText += `\n   Category: ${itemCategory}`
        if (itemConsole) {
          sellListText += `\n   Console: ${itemConsole}`
        }
        sellListText += `\n   Quantity: ${itemQty}`
        sellListText += `\n   Price: $${itemTotal.toFixed(2)}`
        sellListText += '\n'
      })
      sellListText += `\n--- ESTIMATED TOTAL: $${sellListTotal.toFixed(2)} ---\n`
    }

    // Forward to Formspree
    const formspreeEndpoint = process.env.FORMSPREE_ENDPOINT || 'https://formspree.io/f/mqagvyde'

    try {
      const formspreeResponse = await fetch(formspreeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone: phone || 'Not provided',
          subject,
          message: message + sellListText,
          sellListItemCount: sellListItems.length,
          sellListTotal: sellListTotal > 0 ? `$${sellListTotal.toFixed(2)}` : 'N/A',
          _replyto: email, // Formspree will use this for the reply-to address
        }),
      })

      const formspreeData = await formspreeResponse.json()

      if (!formspreeResponse.ok) {
        console.error('Formspree error:', formspreeData)
        return NextResponse.json(
          { error: 'Failed to send message. Please try again later.' },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { message: 'Message sent successfully! We\'ll get back to you soon.' },
        { status: 200 }
      )
    } catch (fetchError) {
      console.error('Error forwarding to Formspree:', fetchError)
      return NextResponse.json(
        { error: 'Failed to send message. Please try again later.' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to process your message. Please try again.' },
      { status: 500 }
    )
  }
}


