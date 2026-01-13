import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { username } = params;
  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      createdAt: true,
      posts: {
        orderBy: { createdAt: "desc" },
        where: { parentId: null },
        select: {
          id: true,
          content: true,
          createdAt: true,
          likes: {
            select: {
              userId: true,
            },
          },
          replies: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              content: true,
              createdAt: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                },
              },
              likes: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
      },
    },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json(user);
}
