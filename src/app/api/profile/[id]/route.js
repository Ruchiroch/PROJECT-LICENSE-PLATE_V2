import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req, props) {
    const params = await props.params;
    try {
        const userId = params?.id;
        console.log("Type User ID :",typeof(userId))

        if (!userId) {
            return NextResponse.json({ error: 'ไม่พบผู้ใช้งาน' }, {status: 400})
            ;
        }

        const post = await prisma.user.findUnique({
            where: { user_id: Number(userId) },  // ค้นหาตาม user_id
            select: {  // เลือกฟิลด์ที่ต้องการแสดง
                firstname: true,   // แสดง title
                lastname: true,  // แสดง content
                telephone: true,
                email: true,
                status: true
            }

        });

        if (!post) {
            return NextResponse.json({ message: 'ไม่พบผู้ใช้งาน' }, { status: 404, }) ;
        }

        return NextResponse.json(post, { status: 200 });

    } catch (error) {
        console.error("Error fetching post:", error);
        return NextResponse.json({ error: error.message } , { status: 500 });
    }
}

export async function PUT(req, props) {
    const params = await props.params;
    const userId = params?.id;
    try {
        // ดึงข้อมูล JSON ที่ต้องการอัปเดต
        const { firstname, lastname, telephone, email, status } = await req.json();

        // อัปเดตรถในฐานข้อมูล
        const updatedCar = await prisma.user.update({
            where:  {user_id: Number(userId ) },
            data: {
                firstname, 
                lastname, 
                telephone, 
                email, 
                status
            },
        });
        
        return NextResponse.json(updatedCar,{ status: 200});

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

}


