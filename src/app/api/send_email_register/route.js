import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
const normalizedEmail = (email) => email.toLowerCase();
//สมัคร user
export async function POST(req) {
    try {
        //  ดึงข้อมูล JSON จากคำขอ
        const { firstname, lastname, email, password, telephone, status, role = 'user', provider = 'credentials' } = await req.json();
        console.log("สมัคร",firstname, lastname, email, password, telephone, status, role,provider)
        // const existingUser = await prisma.user.findUnique({
        //     where: { email }
        // });

        const existingUser  = await prisma.user.findFirst({
            where: {
                email: {
                    equals: normalizedEmail(email), // แปลงเป็นตัวพิมพ์เล็ก
                    mode: 'insensitive', // เปรียบเทียบโดยไม่สนใจตัวพิมพ์เล็ก-ใหญ่
                },
            },
        });
        if (existingUser) {
            return NextResponse.json({ message: "อีเมลนี้มีผู้ใช้งานแล้ว", data: existingUser }, { status: 409 });
        }

        // สร้าง Token โดยฝังอีเมลและ Timestamp
        const expiryTime = Date.now() + 60 * 60 * 1000; // หมดอายุใน 1 ชั่วโมง
        const token = Buffer.from(`${firstname}:${lastname}:${email}:${password}:${telephone}:${status}:${role}:${provider}:${expiryTime}`).toString("base64");
        const confirm_email = `${process.env.NEXTAUTH_URL}/api/auth/signup?token=${encodeURIComponent(token)}`;
        // ส่งอีเมลพร้อมลิงก์ยืนยันอีเมล
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
            subject: "Condfirm Your Email",
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
                                กรุณาคลิกปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ
                            </p>
                            
                            <a 
                                href="${confirm_email}" 
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
                                ยืนยันอีเมลของคุณ
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

        return NextResponse.json({ message: "กรุณาตรวจสอบอีเมลของคุณเพื่อดำเนินการต่อ.", });
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน", error);

        return NextResponse.json(
            { message: "เกิดข้อผิดพลาดขณะรีเซ็ตรหัสผ่าน" },
            { status: 500 }
        );
    }
}