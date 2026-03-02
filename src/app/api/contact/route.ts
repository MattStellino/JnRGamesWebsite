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
const MAX_SELL_LIST_PREVIEW_ITEMS = 12

interface SellListEmailItem {
  name: string
  category: string
  consoleName: string | null
  price: number
  quantity: number
  total: number
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = rateLimit(request, '/api/contact')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
    const debugEnabled = process.env.CONTACT_FORM_DEBUG === 'true'
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

    // Normalize and format sell list items for email
    const normalizedSellListItems: SellListEmailItem[] = sellListItems
      .slice(0, MAX_SELL_LIST_ITEMS_IN_EMAIL)
      .map((item: any) => {
        const itemName = sanitizeInput(item.name || 'Unknown Item')
        const itemCategory = sanitizeInput(item.category || 'N/A')
        const itemConsole = item.consoleName ? sanitizeInput(item.consoleName) : null
        const itemPrice = Number(item.price) || 0
        const itemQty = Number(item.quantity) || 1

        return {
          name: itemName,
          category: itemCategory,
          consoleName: itemConsole,
          price: itemPrice,
          quantity: itemQty,
          total: itemPrice * itemQty,
        }
      })

    let sellListMessageText = ''
    if (normalizedSellListItems.length > 0) {
      const previewItems = normalizedSellListItems.slice(0, MAX_SELL_LIST_PREVIEW_ITEMS)

      sellListMessageText = 'SELL LIST SUMMARY'
      sellListMessageText += `\nItems: ${sellListItems.length}`
      sellListMessageText += `\nEstimated Total: $${sellListTotal.toFixed(2)}`
      sellListMessageText += '\n\nItems included in this email:'
      previewItems.forEach((item, index) => {
        const consolePart = item.consoleName ? ` | Console: ${item.consoleName}` : ''
        sellListMessageText += `\n${index + 1}. ${item.name}${consolePart} | Category: ${item.category} | Qty: ${item.quantity} | Est: $${item.total.toFixed(2)}`
      })
      if (normalizedSellListItems.length > previewItems.length) {
        sellListMessageText += `\n...and ${normalizedSellListItems.length - previewItems.length} more item(s).`
      }
      if (sellListItems.length > normalizedSellListItems.length) {
        sellListMessageText += `\n...plus ${sellListItems.length - normalizedSellListItems.length} additional item(s) not shown.`
      }
    }

    const combinedMessage = [
      sellListMessageText || null,
      message ? `CUSTOMER MESSAGE\n${message}` : null,
    ]
      .filter(Boolean)
      .join('\n\n')

    const safeMessage = combinedMessage.length > MAX_FORMSPREE_MESSAGE_LENGTH
      ? `${combinedMessage.slice(0, MAX_FORMSPREE_MESSAGE_LENGTH)}\n\n[Message truncated due to length]`
      : combinedMessage

    if (debugEnabled) {
      console.log('[ContactAPI] Submission received', {
        request_id: requestId,
        subject,
        message_length: message.length,
        sell_list_count: sellListItems.length,
        normalized_sell_list_count: normalizedSellListItems.length,
        sell_list_message_length: sellListMessageText.length,
        final_message_length: safeMessage.length,
      })
    }

    // Forward to Formspree
    const formspreeEndpoint = process.env.FORMSPREE_ENDPOINT || 'https://formspree.io/f/mqagvyde'

    try {
      const formspreePayload = {
        name,
        email,
        phone: phone || 'Not provided',
        subject,
        message: safeMessage,
        _subject: `Sell Request - ${subject}`,
        _replyto: email, // Formspree will use this for the reply-to address
      }

      const payloadText = JSON.stringify(formspreePayload)

      if (debugEnabled) {
        console.log('[ContactAPI] Forwarding to Formspree', {
          request_id: requestId,
          endpoint: formspreeEndpoint,
          payload_length: payloadText.length,
        })
      }

      const formspreeResponse = await fetch(formspreeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: payloadText,
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

      if (debugEnabled) {
        console.log('[ContactAPI] Formspree response', {
          request_id: requestId,
          status: formspreeResponse.status,
          ok: formspreeResponse.ok,
          response_type: typeof formspreeData,
        })
      }

      if (!formspreeResponse.ok) {
        console.error('Formspree error:', {
          request_id: requestId,
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
      console.error('Error forwarding to Formspree:', {
        request_id: requestId,
        error: fetchError
      })
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
