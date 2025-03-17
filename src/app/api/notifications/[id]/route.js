import { NextResponse } from 'next/server';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

export async function PUT(req, { params }) {
  try {
    // รับข้อมูล user_id จาก params และ notifications จาก body
    const userId = params?.id; 
    const { notifications } = await req.json();  // รับค่าจาก body ใน request

    // ตรวจสอบว่ามี userId หรือไม่
    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่ามีข้อมูล notifications หรือไม่
    if (typeof notifications !== 'boolean') {
      return NextResponse.json(
        { error: 'notifications should be a boolean value' },
        { status: 400 }
      );
    }

    // อัปเดตข้อมูลในฐานข้อมูล
    const updatedUser = await prisma.user.update({
      where: { user_id: Number(userId) }, 
      data: { notifications }, 
    });

    // ส่งผลลัพธ์กลับไปที่ผู้ใช้
    return NextResponse.json({ message: `${notifications ? 'enabled' : 'disabled'}`,updatedUser}, { status: 200 });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
