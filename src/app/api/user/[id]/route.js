import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(req,{params}) {
  try {

    const userId = params?.id;  // ดึงค่า user_id จาก params
    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' },{ status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { 
        user_id: Number(userId)  
      },
      select: {
        firstname: true,
        telephone:true,
        notifications: true,
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'No user found for this user_id' },{ status: 404 });
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: error.message },{ status: 500 });
  }
}
