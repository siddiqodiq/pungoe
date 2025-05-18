// app/api/chat/history/[id]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const chat = await prisma.chat.findUnique({
      where: { 
        id: params.id,
        userId: session.user.id 
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            content: true,
            role: true,
            createdAt: true
          }
        }
      }
    })

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    return NextResponse.json(chat)
  } catch (error) {
    console.error('Error fetching chat:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}