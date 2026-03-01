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
const MAX_FORMSPREE_SELL_LIST_FIELD_LENGTH = 12000
const MAX_SELL_LIST_PREVIEW_ITEMS = 10

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

    let sellListText = ''
    let sellListPreviewText = ''
    if (normalizedSellListItems.length > 0) {
      const previewItems = normalizedSellListItems.slice(0, MAX_SELL_LIST_PREVIEW_ITEMS)

      sellListPreviewText = '--- SELL LIST SUMMARY ---'
      sellListPreviewText += `\nItems: ${sellListItems.length}`
      sellListPreviewText += `\nEstimated Total: $${sellListTotal.toFixed(2)}`
      previewItems.forEach((item, index) => {
        sellListPreviewText += `\n${index + 1}. ${item.name} (x${item.quantity}) - $${item.total.toFixed(2)}`
      })
      if (normalizedSellListItems.length > previewItems.length) {
        sellListPreviewText += `\n...and ${normalizedSellListItems.length - previewItems.length} more item(s) in this summary.`
      }
      if (sellListItems.length > normalizedSellListItems.length) {
        sellListPreviewText += `\n...plus ${sellListItems.length - normalizedSellListItems.length} additional item(s) not shown.`
      }

      sellListText = '--- SELL LIST ITEMS ---'
      normalizedSellListItems.forEach((item, index) => {
        sellListText += `\n\n${index + 1}. ${item.name}`
        sellListText += `\n   Category: ${item.category}`
        if (item.consoleName) {
          sellListText += `\n   Console: ${item.consoleName}`
        }
        sellListText += `\n   Quantity: ${item.quantity}`
        sellListText += `\n   Price: $${item.total.toFixed(2)}`
      })
      if (sellListItems.length > normalizedSellListItems.length) {
        sellListText += `\n\n...and ${sellListItems.length - normalizedSellListItems.length} more item(s).`
      }
      sellListText += `\n\n--- ESTIMATED TOTAL: $${sellListTotal.toFixed(2)} ---`
    }

    const combinedMessage = [
      sellListPreviewText || null,
      message ? `--- CUSTOMER MESSAGE ---\n${message}` : null,
    ]
      .filter(Boolean)
      .join('\n\n')

    const safeMessage = combinedMessage.length > MAX_FORMSPREE_MESSAGE_LENGTH
      ? `${combinedMessage.slice(0, MAX_FORMSPREE_MESSAGE_LENGTH)}\n\n[Message truncated due to length]`
      : combinedMessage
    const safeSellListText = sellListText.length > MAX_FORMSPREE_SELL_LIST_FIELD_LENGTH
      ? `${sellListText.slice(0, MAX_FORMSPREE_SELL_LIST_FIELD_LENGTH)}\n\n[Sell list details truncated due to length]`
      : sellListText
    const safeSellListJson = JSON.stringify(normalizedSellListItems)

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
          sell_list_count: sellListItems.length,
          sell_list_total: Number(sellListTotal.toFixed(2)),
          sell_list_items: safeSellListText || 'No sell list items were included.',
          sell_list_json: safeSellListJson,
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
