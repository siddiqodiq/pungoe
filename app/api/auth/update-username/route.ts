import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { email, username } = await request.json()

    if (!email || !username) {
      return NextResponse.json(
        { error: "Email and username are required" },
        { status: 400 }
      )
    }

    // Update user with username
    const user = await prisma.user.update({
      where: { email },
      data: { username }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    })

  } catch (error) {
    console.error("Update username error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}