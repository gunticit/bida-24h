import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Chat proxy endpoint is working',
    config: {
      useProxy: process.env.NEXT_PUBLIC_CHAT_WIDGET_USE_PROXY,
      webhookUrl: process.env.CHAT_WIDGET_WEBHOOK_URL,
      publicWebhookUrl: process.env.NEXT_PUBLIC_CHAT_WIDGET_WEBHOOK_URL,
    },
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    
    return NextResponse.json({
      message: 'Chat proxy received POST request',
      bodyReceived: body,
      headers: Object.fromEntries(request.headers.entries()),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}