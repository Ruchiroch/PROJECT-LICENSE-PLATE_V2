import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

export async function PUT(req) {
    try {
        const body = await req.json(); // อ่าน JSON Body
        const {newPassword,token } = body;
        const decoded = Buffer.from(token, "base64").toString("utf-8");
        const [email, expiryTime] = decoded.split(":");
      
        if (Date.now() > parseInt(expiryTime, 10)) {
            return NextResponse.json({ message: "ลิงก์เปลี่ยนรหัสผ่านหมดอายุแล้ว กรุณาขอรับลิงก์ใหม่อีกครั้ง" }, { status: 400 });
        }

        if (!email || !newPassword) {
            return NextResponse.json({ message: 'กรุณากรอกรหัสผ่านใหม่หรือไม่ถูกต้อง' }, { status: 400 });
        }

        // ค้นหา user จากฐานข้อมูล
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ message: 'ไม่พบผู้ใช้งาน' }, { status: 404 });
        }

        
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });

        return NextResponse.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จแล้ว' }, { status: 200 });
        
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน', error.message);
        return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน:' }, { status: 500 });
    }
}
