import { NextRequest, NextResponse } from 'next/server'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

// This file exports API route handlers for Next.js app directory
// POST: Handles Claude API requests
// GET: Health check endpoint

export async function POST(request: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'Claude API key not configured' },
      { status: 500 }
    )
  }

  try {
    const { prompt, command, context } = await request.json()

    // Build the system prompt based on the command
    let systemPrompt = 'You are a helpful writing assistant.'
    
    switch (command) {
      case 'improve':
        systemPrompt = 'Improve the following text while maintaining its original meaning and tone.'
        break
      case 'continue':
        systemPrompt = 'Continue writing from where the text left off, maintaining the same style and tone.'
        break
      case 'summarize':
        systemPrompt = 'Summarize the following text concisely while keeping the key points.'
        break
      case 'expand':
        systemPrompt = 'Expand on the following text with more details and examples.'
        break
      case 'simplify':
        systemPrompt = 'Simplify the following text to make it easier to understand.'
        break
      case 'formal':
        systemPrompt = 'Rewrite the following text in a more formal, professional tone.'
        break
      case 'casual':
        systemPrompt = 'Rewrite the following text in a more casual, conversational tone.'
        break
      case 'bullets':
        systemPrompt = 'Convert the following text into a well-organized bullet point list.'
        break
      default:
        systemPrompt = prompt
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: context || prompt
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      result: data.content[0].text
    })
  } catch (error) {
    console.error('Claude API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: "Claude API is up" });
}