import * as cors from 'cors'
import * as crypto from 'crypto'
import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'

admin.initializeApp()

const corsHandler = cors()

const TOKEN = functions.config().telegram.bot_token || ''

interface TelegramLoginPayload {
  id: number
  hash: string
  auth_date: string
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
}

const verifyTelegramPayload = ({ hash, ...payload }: TelegramLoginPayload) => {
  const secret = crypto.createHash('sha256').update(TOKEN).digest()
  const check = crypto
    .createHmac('sha256', secret)
    .update(
      Object.keys(payload)
        .map((key) => `${key}=${payload[key as keyof typeof payload]}`)
        .sort()
        .join('\n')
    )
    .digest('hex')

  return hash === check
}

export const telegramLogin = functions.https.onRequest((req: functions.Request, res: functions.Response) => {
  const handleError = (error: any) => {
    functions.logger.error(error)
    res.sendStatus(500)
    return
  }

  const handleResponse = (status: number, body?: any) => {
    if (body) {
      return res.status(200).json(body)
    }
    return res.sendStatus(status)
  }

  try {
    return corsHandler(req, res, async () => {
      // Authentication requests are POSTed, other requests are forbidden
      if (req.method !== 'POST') {
        return handleResponse(403)
      }
      // Hash or user_id was not provided
      if (!req.body.hash || !req.body.id) {
        return handleResponse(400)
      }
      // Verify authentication and integrity of the data
      const valid = verifyTelegramPayload(req.body)
      if (!valid) {
        return handleResponse(401)
      }
      // Success: return Firebase Custom Auth Token and Telegram Login Payload
      const firebaseToken = await admin.auth().createCustomToken(req.body.id.toString())
      return handleResponse(200, { ...req.body, token: firebaseToken })
    })
  } catch (error) {
    return handleError(error)
  }
})
