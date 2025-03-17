import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();


export async function PUT(req, props) {
    const params = await props.params;
    try {
        const { firstname, lastname, telephone, email, status } = await req.json();
        const userId = params?.id;

        const newEmail = email;
        console.log("newemail", newEmail);
        // ตรวจสอบว่าข้อมูลครบถ้วนหรือไม่
        if (!firstname || !lastname || !telephone || !status) {
            return NextResponse.json({ message: "กรุณาระบุข้อมูลให้ครบถ้วน" }, { status: 400 });
        }

        // ค้นหาผู้ใช้ในระบบ
        const existingUser = await prisma.user.findUnique({
            where: { user_id: Number(userId) },
        });

        if (!existingUser) {
            return NextResponse.json({ message: "ไม่พบผู้ใช้ในระบบ" }, { status: 404 });
        }

        // ตรวจสอบว่ามีการเปลี่ยนอีเมลหรือไม่
        if (newEmail && newEmail !== existingUser.email) {
            // ตรวจสอบว่าอีเมลใหม่ไม่ได้ถูกใช้ในระบบ
            const emailInUse = await prisma.user.findUnique({
                where: { email: newEmail },
            });

            if (emailInUse) {
                return NextResponse.json({ message: "อีเมลนี้ถูกใช้ในระบบแล้ว กรุณาลองอีเมลอื่น" }, { status: 400 });
            }

            // สร้าง Token ยืนยันอีเมล
            const expiryTime = Date.now() + 60 * 60 * 1000; // หมดอายุใน 1 ชั่วโมง
            const token = Buffer.from(`${userId}:${newEmail}:${expiryTime}`).toString("base64");
            const confirmationLink = `${process.env.NEXTAUTH_URL}/api/confirm_email_profile?token=${encodeURIComponent(token)}`;

            // ส่งอีเมลยืนยัน
            const transporter = nodemailer.createTransport({
                service: "gmail",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.GOOGLE_GMAIL_USER,
                    pass: process.env.GOOGLE_GMAIL_SECRET,
                },
            });

            const mailOptions = {
                to: newEmail,
                subject: "Confirm Your Email Change",
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
                                max-width: 600px;">
                        
                                
                                <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                                    กรุณาคลิกปุ่มด้านล่างเพื่อยืนยันการเปลี่ยนอีเมลของคุณ
                                </p>
                                
                                <a 
                                    href="${confirmationLink}" 
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

                                <p style="font-size: 14px; color: #333; margin-top: 20px;">
                                    ลิงก์นี้จะหมดอายุภายใน 1 ชั่วโมง
                                </p>
                                
                                <p style="font-size: 16px; color: #7f8c8d; margin-top: 30px; font-weight: bold;">
                                    ขอบคุณที่ใช้บริการของเรา
                                </p>
                            </div>
                        </div>
                    </body>
                </html>
                `,
            };

            await transporter.sendMail(mailOptions);

            // อัปเดตข้อมูลโดยยังไม่เปลี่ยนอีเมล
            const updatedUser = await prisma.user.update({
                where: { user_id: Number(userId) },
                data: {
                    firstname,
                    lastname,
                    telephone,
                    status,
                },
            });

            return NextResponse.json({ message: "กรุณาตรวจสอบอีเมลใหม่เพื่อดำเนินการยืนยัน.", data: updatedUser });
        }

        // อัปเดตข้อมูลทั่วไป (ไม่มีการเปลี่ยนอีเมล)
        const updatedUser = await prisma.user.update({
            where: { user_id: Number(userId) },
            data: {
                firstname,
                lastname,
                telephone,
                status,
            },
        });

        return NextResponse.json({ message: "อัปเดตข้อมูลสำเร็จ!!", data: updatedUser });
    } catch (error) {
        console.error("เกิดข้อผิดพลาด:", error);
        return NextResponse.json({ message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลซ" }, { status: 500 });
    }
}
