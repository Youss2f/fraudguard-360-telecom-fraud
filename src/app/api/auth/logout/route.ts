import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { logoutUser } from "@/lib/auth"

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    // Logout user (clears database session if using real data)
    if (token) {
      await logoutUser(token)
    }

    // Clear the authentication cookie
    cookieStore.delete("auth-token")

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
