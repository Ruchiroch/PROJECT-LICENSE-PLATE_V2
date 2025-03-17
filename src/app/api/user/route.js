import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

//ดึงข้อมูล user
export async function GET() {
    try {
        const posts = await prisma.user.findMany();
        return NextResponse.json(posts);
    } catch (error) {
        return NextResponse.json('Error fetching posts',error, { status: 500 });
    }
}