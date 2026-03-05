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
const MAX_UPLOAD_IMAGES = 10
const MAX_UPLOAD_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

const ALLOWED_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp'])

interface SellListEmailItem {
  name: string
  conditionLabel: string | null
  category: string
  consoleName: string | null
  price: number
  quantity: number
  total: number
}

function parseSellListItems(rawValue: unknown): any[] {
  if (Array.isArray(rawValue)) return rawValue
  if (typeof rawValue !== 'string') return []

  try {
    const parsed = JSON.parse(rawValue)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function toSafeString(rawValue: unknown): string {
  return typeof rawValue === 'string' ? rawValue : ''
}

function getFileExtension(filename: string): string {
  const trimmed = filename.trim()
  const lastDot = trimmed.lastIndexOf('.')
  if (lastDot <= 0 || lastDot === trimmed.length - 1) return ''
  return trimmed.slice(lastDot + 1).toLowerCase()
}

function sanitizeFileName(filename: string): string {
  const baseName = filename.replace(/[^\w.\-]/g, '_').replace(/_{2,}/g, '_')
  return (baseName || 'upload.jpg').slice(0, 100)
}

function hasValidImageSignature(fileBytes: Uint8Array): boolean {
  if (fileBytes.length < 12) return false

  // JPEG: FF D8 FF
  const isJpeg = fileBytes[0] === 0xff && fileBytes[1] === 0xd8 && fileBytes[2] === 0xff
  if (isJpeg) return true

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const isPng = (
    fileBytes[0] === 0x89 &&
    fileBytes[1] === 0x50 &&
    fileBytes[2] === 0x4e &&
    fileBytes[3] === 0x47 &&
    fileBytes[4] === 0x0d &&
    fileBytes[5] === 0x0a &&
    fileBytes[6] === 0x1a &&
    fileBytes[7] === 0x0a
  )
  if (isPng) return true

  // WEBP: "RIFF"...."WEBP"
  const isWebp = (
    fileBytes[0] === 0x52 &&
    fileBytes[1] === 0x49 &&
    fileBytes[2] === 0x46 &&
    fileBytes[3] === 0x46 &&
    fileBytes[8] === 0x57 &&
    fileBytes[9] === 0x45 &&
    fileBytes[10] === 0x42 &&
    fileBytes[11] === 0x50
  )
  return isWebp
}

async function validateImageFile(file: File): Promise<string | null> {
  if (!file || typeof file.name !== 'string') {
    return 'Invalid file upload'
  }

  if (file.size <= 0) {
    return `File "${file.name}" is empty`
  }

  if (file.size > MAX_UPLOAD_IMAGE_SIZE_BYTES) {
    return `File "${file.name}" exceeds 5MB`
  }

  const extension = getFileExtension(file.name)
  if (!ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
    return `File "${file.name}" has an unsupported extension`
  }

  const mimeType = file.type?.toLowerCase() || ''
  if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
    return `File "${file.name}" has an unsupported file type`
  }

  const fileBytes = new Uint8Array(await file.arrayBuffer())
  if (!hasValidImageSignature(fileBytes)) {
    return `File "${file.name}" is not a valid image`
  }

  return null
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = rateLimit(request, '/api/contact')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
    const debugEnabled = process.env.CONTACT_FORM_DEBUG === 'true'
    const contentType = request.headers.get('content-type') || ''
    let body: Record<string, unknown> = {}
    let uploadedFiles: File[] = []

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      body = {
        name: formData.get('name')?.toString() || '',
        email: formData.get('email')?.toString() || '',
        phone: formData.get('phone')?.toString() || '',
        subject: formData.get('subject')?.toString() || '',
        message: formData.get('message')?.toString() || '',
        sellListItems: parseSellListItems(formData.get('sellListItems')?.toString() || '[]'),
        sellListTotal: Number(formData.get('sellListTotal')?.toString() || 0),
      }
      uploadedFiles = formData
        .getAll('photos')
        .filter((entry): entry is File => entry instanceof File)
    } else {
      body = await request.json()
    }

    // Sanitize and validate inputs
    const name = sanitizeInput(toSafeString(body.name))
    const email = sanitizeInput(toSafeString(body.email))
    const phone = sanitizeInput(toSafeString(body.phone))
    const subject = sanitizeInput(toSafeString(body.subject))
    const message = sanitizeInput(toSafeString(body.message))
    const sellListItems = parseSellListItems(body.sellListItems)
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

    if (uploadedFiles.length > MAX_UPLOAD_IMAGES) {
      return NextResponse.json(
        { error: `Too many images. Maximum is ${MAX_UPLOAD_IMAGES}.` },
        { status: 400 }
      )
    }

    for (const file of uploadedFiles) {
      const uploadError = await validateImageFile(file)
      if (uploadError) {
        return NextResponse.json(
          { error: uploadError },
          { status: 400 }
        )
      }
    }

    // Normalize and format sell list items for email
    const normalizedSellListItems: SellListEmailItem[] = sellListItems
      .slice(0, MAX_SELL_LIST_ITEMS_IN_EMAIL)
      .map((item: any) => {
        const itemName = sanitizeInput(item.name || 'Unknown Item')
        const itemConditionLabel = item.conditionLabel ? sanitizeInput(item.conditionLabel) : null
        const itemCategory = sanitizeInput(item.category || 'N/A')
        const itemConsole = item.consoleName ? sanitizeInput(item.consoleName) : null
        const itemPrice = Number(item.price) || 0
        const itemQty = Number(item.quantity) || 1

        return {
          name: itemName,
          conditionLabel: itemConditionLabel,
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
        const conditionPart = item.conditionLabel ? ` | Condition: ${item.conditionLabel}` : ''
        sellListMessageText += `\n${index + 1}. ${item.name}${consolePart}${conditionPart} | Category: ${item.category} | Qty: ${item.quantity} | Est: $${item.total.toFixed(2)}`
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
      uploadedFiles.length > 0 ? `PHOTO UPLOADS\n${uploadedFiles.length} image(s) attached.` : null,
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
        uploaded_file_count: uploadedFiles.length,
        uploaded_file_bytes: uploadedFiles.reduce((sum, file) => sum + file.size, 0),
      })
    }

    // Forward to Formspree
    const formspreeEndpoint = process.env.FORMSPREE_ENDPOINT || 'https://formspree.io/f/mqagvyde'

    try {
      const formspreePayload = new FormData()
      formspreePayload.append('name', name)
      formspreePayload.append('email', email)
      formspreePayload.append('phone', phone || 'Not provided')
      formspreePayload.append('subject', subject)
      formspreePayload.append('message', safeMessage)
      formspreePayload.append('_subject', `Sell Request - ${subject}`)
      formspreePayload.append('_replyto', email)

      for (const file of uploadedFiles) {
        formspreePayload.append('photos', file, sanitizeFileName(file.name))
      }

      if (debugEnabled) {
        console.log('[ContactAPI] Forwarding to Formspree', {
          request_id: requestId,
          endpoint: formspreeEndpoint,
          payload_mode: 'multipart/form-data',
          file_count: uploadedFiles.length,
        })
      }

      const formspreeResponse = await fetch(formspreeEndpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formspreePayload,
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
