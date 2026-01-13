import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") || undefined;

  const posts = await prisma.post.findMany({
    where: {
      parentId: null,
      ...(username ? { author: { username } } : {})
    },
    include: {
      author: true,
      likes: true,
      replies: {
        include: { author: true, likes: true },
        orderBy: { createdAt: "asc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ posts });
}
