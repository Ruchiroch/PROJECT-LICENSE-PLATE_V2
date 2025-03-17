import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req) {
    const { searchParams } = new URL(req.url); // ดึง Query String จาก URL
    const token = searchParams.get('token'); // รับค่า token จาก Query String

    if (!token) {
        return NextResponse.redirect(
            new URL(`/page/confirm_email?status=error&message=Token%20ไม่พบในคำขอ`, process.env.NEXTAUTH_URL),
            302
        );
    }

    try {
        const decodedToken = Buffer.from(token, "base64").toString("utf-8");
        const [userId, newEmail, expiryTime] = decodedToken.split(":");
        console.log("userID",userId)
        // ตรวจสอบว่า Token หมดอายุหรือไม่
        if (Date.now() > parseInt(expiryTime)) {
            return NextResponse.redirect(
                new URL(`/page/confirm_email?status=error&message=ลิงก์ยืนยันหมดอายุ`, process.env.NEXTAUTH_URL),
                302
            );
        }

        // ค้นหาผู้ใช้ในระบบ
        const user = await prisma.user.findUnique({
            where: { user_id: Number(userId) },
        });

        if (!user) {
            return NextResponse.redirect(
                new URL(`/page/confirm_email?status=error&message=ไม่มีuser`, process.env.NEXTAUTH_URL),
                302
            );
        }

        // อัปเดตอีเมลใหม่
        const updatedUser = await prisma.user.update({
            where: { user_id: Number(userId) },
            data: {
                email: newEmail, // อัปเดตอีเมล
            },
        });

        return NextResponse.redirect(
            new URL(`/page/confirm_email?status=success&message=เปลี่ยนอีเมลสำเร็จ`, process.env.NEXTAUTH_URL),
            302
        );
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการตรวจสอบโทเค็น:", error);
        return NextResponse.redirect(
            new URL(`/page/confirm_email?status=error&message=เกิดข้อผิดพลาดในการตรวจสอบโทเค็น`, process.env.NEXTAUTH_URL),
            302
        );
    }
}