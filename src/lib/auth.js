import crypto from "crypto";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

const SESSION_COOKIE = "session_token";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export async function createSession(userId) {
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  console.log("Creating session in DB for userId:", userId);
  
  try {
    await prisma.session.create({
      data: { token, userId, expiresAt }
    });
    console.log("Session created successfully");
  } catch (dbError) {
    console.error("Failed to create session in DB:", dbError.message);
    throw dbError;
  }

  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      expires: expiresAt
    });
    console.log("Cookie set successfully");
  } catch (cookieError) {
    console.error("Failed to set cookie:", cookieError.message);
    throw cookieError;
  }

  return { token, expiresAt };
}

export async function clearSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (token) {
      await prisma.session.deleteMany({ where: { token } });
      cookieStore.delete(SESSION_COOKIE);
    }
  } catch (error) {
    console.error("Error clearing session:", error.message);
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    });
    if (!session) return null;
    if (session.expiresAt.getTime() < Date.now()) {
      await prisma.session.delete({ where: { token } });
      cookieStore.delete(SESSION_COOKIE);
      return null;
    }
    return session.user;
  } catch (error) {
    console.error("Error getting current user:", error.message);
    return null;
  }
}
