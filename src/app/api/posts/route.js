import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const CHAR_LIMIT = 180;

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const content = body?.content?.trim();

  if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });
  if (content.length > CHAR_LIMIT) {
    return NextResponse.json({ error: `Content must be <= ${CHAR_LIMIT} characters` }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      content,
      authorId: user.id
    }
  });

  return NextResponse.json({ post });
}
