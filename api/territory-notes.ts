import { list, put } from '@vercel/blob'

interface TerritoryNote {
  id: string
  gx: number
  gy: number
  color: string
  name: string
  message: string
  createdAt: string
}

const NOTES_PATH = 'portfolio/territory-notes.json'
const MAX_NOTES = 100
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i

interface ApiRequest {
  method?: string
  body?: unknown
  on?: (event: string, listener: (...args: unknown[]) => void) => ApiRequest
}

interface ApiResponse {
  status: (statusCode: number) => ApiResponse
  setHeader: (name: string, value: string) => void
  end: (body?: string) => void
}

function sendJson(response: ApiResponse, body: unknown, statusCode = 200) {
  response.status(statusCode)
  response.setHeader('cache-control', 'no-store')
  response.setHeader('content-type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(body))
}

function normalizeString(value: unknown, fallback: string, maxLength: number) {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return (trimmed || fallback).slice(0, maxLength)
}

function normalizeCoordinate(value: unknown, min: number, max: number) {
  const numberValue = Number(value)
  if (!Number.isInteger(numberValue) || numberValue < min || numberValue > max) {
    return null
  }
  return numberValue
}

function normalizeColor(value: unknown) {
  if (typeof value !== 'string' || !HEX_COLOR_PATTERN.test(value)) {
    return '#06b6d4'
  }
  return value
}

async function readNotes(): Promise<TerritoryNote[]> {
  const result = await list({
    prefix: NOTES_PATH,
    limit: 1,
  })
  const blob = result.blobs.find((item) => item.pathname === NOTES_PATH)

  if (!blob) {
    return []
  }

  const response = await fetch(blob.downloadUrl, { cache: 'no-store' })
  if (!response.ok) {
    return []
  }

  const data = await response.json()
  return Array.isArray(data) ? data.slice(0, MAX_NOTES) : []
}

async function writeNotes(notes: TerritoryNote[]) {
  await put(NOTES_PATH, JSON.stringify(notes, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
    contentType: 'application/json; charset=utf-8',
  })
}

async function readPayload(request: ApiRequest): Promise<Record<string, unknown> | null> {
  if (request.body && typeof request.body === 'object') {
    return request.body as Record<string, unknown>
  }

  if (typeof request.body === 'string') {
    return JSON.parse(request.body) as Record<string, unknown>
  }

  if (!request.on) {
    return null
  }

  const chunks: string[] = []

  await new Promise<void>((resolve, reject) => {
    request.on?.('data', (chunk) => {
      if (typeof chunk === 'string') {
        chunks.push(chunk)
      } else if (chunk instanceof Uint8Array) {
        chunks.push(new TextDecoder().decode(chunk))
      }
    })
    request.on?.('end', () => resolve())
    request.on?.('error', (error) => reject(error))
  })

  const rawBody = chunks.join('').trim()
  return rawBody ? (JSON.parse(rawBody) as Record<string, unknown>) : null
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method === 'GET') {
    const notes = await readNotes()
    sendJson(response, { notes })
    return
  }

  if (request.method !== 'POST') {
    response.setHeader('allow', 'GET, POST')
    sendJson(response, { error: 'Method not allowed' }, 405)
    return
  }

  let payload: Record<string, unknown> | null
  try {
    payload = await readPayload(request)
  } catch {
    sendJson(response, { error: 'Invalid JSON body' }, 400)
    return
  }

  if (!payload) {
    sendJson(response, { error: 'Invalid JSON body' }, 400)
    return
  }

  const gx = normalizeCoordinate(payload.gx, 0, 359)
  const gy = normalizeCoordinate(payload.gy, 0, 179)
  const message = normalizeString(payload.message, '', 90)

  if (gx === null || gy === null) {
    sendJson(response, { error: 'Invalid territory coordinate' }, 400)
    return
  }
  if (!message) {
    sendJson(response, { error: 'Message is required' }, 400)
    return
  }

  const note: TerritoryNote = {
    id: crypto.randomUUID(),
    gx,
    gy,
    color: normalizeColor(payload.color),
    name: normalizeString(payload.name, '방문자', 24),
    message,
    createdAt: new Date().toISOString(),
  }
  const notes = [note, ...(await readNotes())].slice(0, MAX_NOTES)

  await writeNotes(notes)

  sendJson(response, { note, notes })
}
