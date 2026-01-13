import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const CHAR_LIMIT = 180;

export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const postId = Number(params.id);
  if (!Number.isInteger(postId)) {
    return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
  }

  const parent = await prisma.post.findUnique({ where: { id: postId } });
  if (!parent) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (parent.parentId) {
    return NextResponse.json({ error: "Replies only one level deep" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const content = body?.content?.trim();
  if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });
  if (content.length > CHAR_LIMIT) {
    return NextResponse.json({ error: `Content must be <= ${CHAR_LIMIT} characters` }, { status: 400 });
  }

  const reply = await prisma.post.create({
    data: {
      content,
      authorId: user.id,
      parentId: parent.id
    }
  });

  return NextResponse.json({ reply });
}
