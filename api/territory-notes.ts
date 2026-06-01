import { list, put } from '@vercel/blob'

export const config = {
  runtime: 'edge',
}

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

function jsonResponse(body: unknown, init?: ResponseInit) {
  return Response.json(body, {
    ...init,
    headers: {
      'cache-control': 'no-store',
      ...init?.headers,
    },
  })
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

export default async function handler(request: Request) {
  if (request.method === 'GET') {
    const notes = await readNotes()
    return jsonResponse({ notes })
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, { status: 405 })
  }

  let payload: Record<string, unknown>
  try {
    payload = await request.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const gx = normalizeCoordinate(payload.gx, 0, 359)
  const gy = normalizeCoordinate(payload.gy, 0, 179)
  const message = normalizeString(payload.message, '', 90)

  if (gx === null || gy === null) {
    return jsonResponse({ error: 'Invalid territory coordinate' }, { status: 400 })
  }
  if (!message) {
    return jsonResponse({ error: 'Message is required' }, { status: 400 })
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

  return jsonResponse({ note, notes })
}
