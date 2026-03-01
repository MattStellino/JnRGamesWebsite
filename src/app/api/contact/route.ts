import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { 
  sanitizeInput, 
  validateEmail, 
  validatePhone, 
  validateName,
  validateDescription 
} from '@/lib/security'

const MAX_SELL_LIST_ITEMS_IN_EMAIL = 60
const MAX_FORMSPREE_MESSAGE_LENGTH = 7000

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
      const limitedItems = sellListItems.slice(0, MAX_SELL_LIST_ITEMS_IN_EMAIL)
      sellListText = '\n\n--- SELL LIST ITEMS ---\n'
      limitedItems.forEach((item: any, index: number) => {
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

      if (sellListItems.length > limitedItems.length) {
        sellListText += `\n...and ${sellListItems.length - limitedItems.length} more item(s).\n`
      }

      sellListText += `\n--- ESTIMATED TOTAL: $${sellListTotal.toFixed(2)} ---\n`
    }

    const combinedMessage = `${message}${sellListText}`
    const safeMessage = combinedMessage.length > MAX_FORMSPREE_MESSAGE_LENGTH
      ? `${combinedMessage.slice(0, MAX_FORMSPREE_MESSAGE_LENGTH)}\n\n[Message truncated due to length]`
      : combinedMessage

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
          message: safeMessage,
          _subject: `Sell Request - ${subject}`,
          _replyto: email, // Formspree will use this for the reply-to address
        }),
      })

      const formspreeRaw = await formspreeResponse.text()
      let formspreeData: any = null
      if (formspreeRaw) {
        try {
          formspreeData = JSON.parse(formspreeRaw)
        } catch {
          formspreeData = formspreeRaw
        }
      }

      if (!formspreeResponse.ok) {
        console.error('Formspree error:', {
          status: formspreeResponse.status,
          data: formspreeData
        })
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

