// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Logout successful' })
    response.cookies.set('token', '', { 
      httpOnly: true,
      expires: new Date(0)
    })
    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}