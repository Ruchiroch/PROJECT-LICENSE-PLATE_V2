import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ message: "กรุณากรอกอีเมล" }, { status: 400 });
        }

        // ตรวจสอบว่าอีเมลมีในระบบ
        const user = await prisma.user.findUnique({
            where: { email: email },
        });

        if (!user) {
            // ส่งข้อความสำเร็จเสมอเพื่อความปลอดภัย
            return NextResponse.json({ message: "ไม่พบอีเมล์ในระบบ กรุณาทำการกรอกใหม่", }, { status: 400 });
        }

        // สร้าง Token โดยฝังอีเมลและ Timestamp
        const expiryTime = Date.now() + 60 * 60 * 1000; // หมดอายุใน 1 ชั่วโมง
        const token = Buffer.from(`${email}:${expiryTime}`).toString("base64");
        const resetLink = `${process.env.NEXTAUTH_URL}/page/reset_password?token=${encodeURIComponent(
            token
        )}`;

        // ส่งอีเมลพร้อมลิงก์รีเซ็ตรหัสผ่าน
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 465,
            secure: true,
            auth: {
                user: process.env.GOOGLE_GMAIL_USER,
                pass: process.env.GOOGLE_GMAIL_SECRET,
            },
        });

        const mailOptions = {
            to: email,
            subject: "Reset Your Password",
            html: `
            <html>
                <head>
                    <!-- เพิ่ม meta tag สำหรับการแสดงผลบนมือถือ -->
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                </head>
                <body>
                    <div style="font-family: Arial, sans-serif; text-align: center; color: #333; padding: 20px;">
                        <h1 style="color: #000; font-size: 24px; margin-bottom: 20px;">LICENSE PLATE RECOGNITION</h1>
                        <div style="
                            margin: 0 auto; 
                            text-align: center; 
                            background-color: white; 
                            padding: 30px; 
                            border-radius: 10px; 
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                            border: 2px solid black; 
                            max-width: 600px; ">
                            
                            <p style="font-size: 16px; color: #444; margin-bottom: 20px;">
                                กรุณาคลิกปุ่มด้านล่างเพื่อรีเซ็ตรหัสผ่านของคุณ
                            </p>
                            
                            <a 
                                href="${resetLink}" 
                                style="
                                    display: inline-block; 
                                    padding: 12px 24px; 
                                    font-size: 16px; 
                                    color: white; 
                                    background-color: #28a745; 
                                    text-decoration: none; 
                                    border-radius: 5px; 
                                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
                                    transition: background-color 0.3s ease;">
                                รีเซ็ตรหัสผ่านของคุณ
                            </a>
                            
                            <p style="font-size: 14px; color: #666; margin-top: 20px;">
                                ลิงก์นี้จะหมดอายุภายใน 1 ชั่วโมง
                            </p>
                            
                            <p style="font-size: 16px; color: #444; margin-top: 30px; font-weight: bold;">
                                ขอบคุณที่ใช้บริการของเรา
                            </p>
                        </div>
                    </div>
                </body>
            </html>
            `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: "กรุณาตรวจสอบข้อความอีเมลของคุณเพื่อดำเนินการต่อ.", });
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน", error);

        return NextResponse.json(
            { message: "เกิดข้อผิดพลาดขณะรีเซ็ตรหัสผ่าน" },
            { status: 500 }
        );
    }
}
