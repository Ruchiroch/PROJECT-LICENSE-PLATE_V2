import { NextResponse } from "next/server";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// ดึงข้อมูลกล้องทั้งหมด
export async function GET() {
  try {
    // ดึงข้อมูลกล้องทั้งหมดจากฐานข้อมูล
    const cameras = await prisma.camera.findMany();

    // ส่งข้อมูลกลับในรูป JSON
    return NextResponse.json(cameras, { status: 200 });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลกล้อง:", error);

    // ส่ง error response
    return NextResponse.json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลกล้อง" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { camera_name, camera_mode } = await req.json(); // รับข้อมูลจาก body (JSON)

    // ตรวจสอบว่า camera_name ได้รับค่ามาหรือไม่
    if (!camera_name) {
      return NextResponse.json({ message: "กรุณาระบุชื่อกล้อง" },{ status: 400 });
    }

    const existingCamera = await prisma.camera.findFirst({
      where: {
        camera_name: camera_name, // ค้นหากล้องที่มีชื่อตรงกัน
      },
    });

    if (existingCamera) {
      return NextResponse.json(
        { message: "มีข้อมูลกล้องชื่อนี้อยู่แล้ว" },
        { status: 400 }
      );
    }

    // เพิ่มข้อมูลกล้องใหม่ลงในฐานข้อมูล
    const newCamera = await prisma.camera.create({
      data: {
        camera_name,
        camera_mode, // ค่า camera_mode สามารถเป็น null ได้
      },
    });

    // ส่งผลลัพธ์กลับไปให้ผู้ใช้
    return NextResponse.json({ message: "เพิ่มข้อมูลกล้องสำเร็จ!", camera: newCamera },{ status: 200 });
    
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการเพิ่มข้อมูลกล้อง:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดในการเพิ่มข้อมูลกล้อง", error: error.message }, { status: 500 });
  
  }
}

export async function PUT(req) {
  try {
    const { camera_id, camera_mode } = await req.json(); // รับข้อมูลจาก body (JSON)

    // ตรวจสอบว่า id และ camera_mode ได้รับค่ามาหรือไม่
    if (!camera_id || !camera_mode) {
      return NextResponse.json({ message: "กรุณาระบุรหัสกล้องและโหมดกล้อง" },{ status: 400 });
    }

    // ค้นหากล้องที่มี id ตรงกันในฐานข้อมูล
    const camera = await prisma.camera.findUnique({
      where: {
        camera_id: Number(camera_id), // ใช้ id เป็นตัวระบุกล้อง
      },
    });

    if (!camera) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูลกล้องที่ระบุ" },
        { status: 404 }
      );
    }

    // อัปเดตข้อมูลกล้อง
    const updatedCamera = await prisma.camera.update({
      where: {
        camera_id: Number(camera_id), // ใช้ id เป็นตัวระบุ
      },
      data: {
        camera_mode, // อัปเดต camera_mode
      },
    });

    // ส่งผลลัพธ์กลับไปให้ผู้ใช้
    return NextResponse.json( { message: "อัปเดตข้อมูลกล้องสำเร็จ!", camera: updatedCamera },  { status: 200 });

  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูลกล้อง:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลกล้อง", error: error.message }, { status: 500 } );
   
  }
}
