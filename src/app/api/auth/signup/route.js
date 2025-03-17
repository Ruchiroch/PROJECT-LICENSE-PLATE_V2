import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
import io from 'socket.io-client';
// เชื่อมต่อกับ WebSocket ที่เซิร์ฟเวอร์
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL); // เปลี่ยน URL ตามเซิร์ฟเวอร์ของคุณ

//สมัคร user
// export async function POST(req) {
//     try {
//         //  ดึงข้อมูล JSON จากคำขอ
//         const { firstname, lastname, email, password, telephone, status, role,provider } = await req.json();
//         // console.log("สมัคร ",firstname, lastname, email, password, telephone, status, role,provider)

//         // ตรวจสอบว่ามี email หรือไม่
//         const existingUser = await prisma.user.findUnique({
//             where: { email }
//         });



//         if (existingUser) {
//             return NextResponse.json({ message: "อีเมล์นี้มีผู้ใช้งานแล้ว", data: existingUser },{ status: 409 });  
//         }

//         let hashedPassword = null;
//         if (provider !== 'google') {
//             // สมัครแบบปกติ ต้องมีการแฮชรหัสผ่าน
//             if (!password) {
//                 throw new Error("Password is required for non-Google signup");
//             }
//             hashedPassword = bcrypt.hashSync(password, 10);
//         }



//         //  บันทึกข้อมูลลงในฐานข้อมูลโดยใช้ Prisma
//         const newUser = await prisma.user.create({
//             data: {
//                 firstname,
//                 lastname,
//                 email,
//                 password: hashedPassword,
//                 telephone,
//                 status,
//                 role,
//                 provider: provider || 'credentials',
//             },
//         });

//         //  ส่งคืนคำตอบในรูปแบบ JSON โดยใช้ NextResponse
//         return NextResponse.json({ message: "สร้างผู้ใช้สำเร็จแล้ว",data: newUser, },{ status: 200 });


//     } catch (error) {
//         console.error("เกิดข้อผิดพลาดในการสร้างผู้ใช้", error);
//         return NextResponse.json({message: "เกิดข้อผิดพลาดในการสร้างผู้ใช้",error: error.message || "เกิดข้อผิดพลาด", },{ status: 500 });
//     }
// }



// export async function POST(req) {
//     try {
//         //  ดึงข้อมูล JSON จากคำขอ
//         const body = await req.json(); // อ่าน JSON Body
//         const { token } = body;

//         if (!token) {
//             return NextResponse.json({ message: "Token ไม่พบในคำขอ" }, { status: 400 });
//         }

//         const decoded = Buffer.from(token, "base64").toString("utf-8");
//         const [firstname, lastname, email, password, telephone, status, role , provider, expiryTime] = decoded.split(":");
//         //  console.log("สมัคร ",firstname, lastname, email, password, telephone, status, role,provider)


//         if (!firstname || !lastname || !email || !status || !role || !provider || !expiryTime) {
//             return NextResponse.json({ message: "ข้อมูลใน token ไม่สมบูรณ์" }, { status: 400 });
//         }


//         if (Date.now() > parseInt(expiryTime, 10)) {
//             return NextResponse.json({ message: "ลิงก์ยืนยันหมดอายุแล้ว กรุณาขอรับลิงก์ใหม่อีกครั้ง" }, { status: 400 });
//         }


//         const existingUser = await prisma.user.findUnique({
//             where: { email }
//         });

//         if (existingUser) {
//             return NextResponse.json({ message: "อีเมล์นี้มีผู้ใช้งานแล้ว", data: existingUser }, { status: 409 });
//         }

//         let hashedPassword = null;
//         if (provider !== 'google') {
//             // สมัครแบบปกติ ต้องมีการแฮชรหัสผ่าน
//             if (!password) {
//                 return NextResponse.json({ message: "Password is required for non-Google signup" }, { status: 400 });
//             }
//             hashedPassword = bcrypt.hashSync(password, 10);
//         }

//         //  บันทึกข้อมูลลงในฐานข้อมูลโดยใช้ Prisma
//         const newUser = await prisma.user.create({
//             data: {
//                 firstname,
//                 lastname,
//                 email,
//                 password: hashedPassword || null,
//                 telephone,
//                 status,
//                 role,
//                 provider: provider || 'credentials',
//             },
//         });

//         //  ส่งคืนคำตอบในรูปแบบ JSON โดยใช้ NextResponse
//         return NextResponse.json({message: "สร้างผู้ใช้สำเร็จแล้ว",  data: newUser,}, { status: 200 });
//     } catch (error) {
//         console.error("เกิดข้อผิดพลาดในการสร้างผู้ใช้", error);
//         return NextResponse.json({ message: "เกิดข้อผิดพลาดในการสร้างผู้ใช้",error: error.message || "เกิดข้อผิดพลาด", }, { status: 500 });
//     }
// }




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
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const [firstname, lastname, email, password, telephone, status, role, provider, expiryTime] = decoded.split(':');

        // ตรวจสอบว่า token ถูกต้องหรือไม่
        if (!firstname || !lastname || !email || !status || !role || !provider || !expiryTime) {
            return NextResponse.redirect(
                new URL(`/page/confirm_email?status=error&message=ข้อมูลไม่สมบูรณ์`, process.env.NEXTAUTH_URL),
                302
            );
        }

        if (Date.now() > parseInt(expiryTime, 10)) {
            return NextResponse.redirect(
                new URL(`/page/confirm_email?status=error&message=ลิงก์ยืนยันหมดอายุ`, process.env.NEXTAUTH_URL),
                302
            );
        }

        // ตรวจสอบว่าผู้ใช้งานมีอยู่แล้วหรือไม่
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.redirect(
                new URL(`/page/confirm_email?status=error&message=อีเมล์นี้มีผู้ใช้งานแล้ว`, process.env.NEXTAUTH_URL),
                302
            );
        }

        // สร้างผู้ใช้ใหม่
        const newUser = await prisma.user.create({
            data: {
                firstname,
                lastname,
                email,
                password: provider === 'google' ? null : await bcrypt.hash(password, 10),
                telephone,
                status,
                role,
                provider: provider || 'credentials',
            },
        });

        socket.emit('update_data');
        
        return NextResponse.redirect(
            new URL(`/page/confirm_email`, process.env.NEXTAUTH_URL),
            302
        );
    } catch (error) {
        return NextResponse.redirect(
            new URL(`/page/confirm_email?status=error&message=เกิดข้อผิดพลาดในการตรวจสอบโทเค็น`, process.env.NEXTAUTH_URL),
            302
        );
    }
}