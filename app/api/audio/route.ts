import { Buffer } from 'buffer'
import { NextRequest, NextResponse } from 'next/server'
import { azureCognitiveEndpoint } from '@/app/lib/constants'

async function fetchAudio(token: string, input: string, voiceName: string, selectedLang: string) {
  const response = await fetch(azureCognitiveEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/ssml+xml',
      'X-MICROSOFT-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
    },
    body: `<speak version='1.0'  xml:lang='${selectedLang}' xml:gender='Female'><voice name='${voiceName}'>${input}</voice></speak>`,
  })

  const arrayBuffer = await response.arrayBuffer()
  const base64String = Buffer.from(arrayBuffer).toString('base64')
  return base64String
}

export async function POST(req: NextRequest) {
  try {
    // fetch token
    const tokenResponse = await fetch(`${req.nextUrl.origin}/api/token`, { method: 'POST' })

    if (!tokenResponse.ok) {
      throw new Error(`Failed to fetch token: ${tokenResponse.statusText}`)
    }
    const { token } = await tokenResponse.json()
    const data = await req.json()
    const { input, voiceName, selectedLang } = data

    // use token to request
    const base64Audio = await fetchAudio(token, input, voiceName, selectedLang)
    return NextResponse.json({ base64Audio })
  } catch (error) {
    console.error('Error fetching audio:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
