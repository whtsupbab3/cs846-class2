import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import prisma from "@/lib/prisma";
import { createSession } from "@/lib/auth";

const SALT_ROUNDS = 10;

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  const username = body?.username?.trim()?.toLowerCase()?.replace(/[^a-z0-9_]/g, "");
  const password = body?.password?.trim();
  const isRegister = body?.isRegister === true;

  if (!name || !username || !password) {
    return NextResponse.json(
      { error: "Name, username, and password are required." },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 }
    );
  }

  try {
    console.log("Auth attempt:", { name, username, password: "***", isRegister });
    if (isRegister) {
      // Register: create new user with hashed password
      const existingUser = await prisma.user.findUnique({ where: { username } });
      if (existingUser) {
        return NextResponse.json(
          { error: "Username already taken." },
          { status: 400 }
        );
      }

      console.log("Hashing password...");
      const hashedPassword = await bcryptjs.hash(password, SALT_ROUNDS);
      console.log("Password hashed, creating user...");
      const user = await prisma.user.create({
        data: { name, username, password: hashedPassword }
      });

      await createSession(user.id);
      return NextResponse.json({ user: { id: user.id, name: user.name, username: user.username } });
    } else {
      // Login: verify password
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) {
        return NextResponse.json(
          { error: "Invalid username or password." },
          { status: 401 }
        );
      }

      const passwordMatch = await bcryptjs.compare(password, user.password);
      if (!passwordMatch) {
        return NextResponse.json(
          { error: "Invalid username or password." },
          { status: 401 }
        );
      }

      await createSession(user.id);
      return NextResponse.json({ user: { id: user.id, name: user.name, username: user.username } });
    }
  } catch (error) {
    console.error("Auth error:", error.message || error);
    console.error("Stack:", error.stack);
    return NextResponse.json(
      { error: "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}

