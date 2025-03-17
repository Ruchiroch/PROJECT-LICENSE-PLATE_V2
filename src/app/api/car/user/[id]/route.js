const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
import { NextResponse } from 'next/server';


// ฟังก์ชัน GET ใช้ดึงข้อมูลจากฐานข้อมูลตาม user_id
export async function GET(req, props) {
  const params = await props.params;

  try {
    // ดึง user_id จาก params ที่มาจาก path parameter
    const { id } = params;
    // console.log("User ID:", id);

    if (!id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    // ค้นหารถที่เกี่ยวข้องกับ user_id
    const cars = await prisma.car.findMany({
      where: { user_id: Number(id) }, // ค้นหาตาม user_id
    });

    if (!cars || cars.length === 0) {
      return NextResponse.json(
        { message: 'No cars found for this user' },
        { status: 404 }
      );
    }

    return NextResponse.json(cars);
  } catch (error) {
    console.error("Error fetching cars:", error); // Log error
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}




export async function POST(req, props) {
  const params = await props.params;
  try {
    const { id } = params; // ดึง `user_id` จาก path parameter

    if (!id) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

    // อ่านข้อมูล JSON จาก body
    const { car_brand, car_model, car_color, license_plate, province_plate } = await req.json();

    // ตรวจสอบความสมบูรณ์ของข้อมูลที่ส่งมา
    if (!car_brand || !car_model || !car_color || !license_plate || !province_plate) {
      return NextResponse.json({ message: "กรุณากรอกให้ครบ" }, { status: 400 });
    }
    // แปลงและจัดรูปแบบป้ายทะเบียน
    const formattedLicensePlate = license_plate.replace(/\s+/g, '');

    const checkLicensePlate = await prisma.car.findUnique({
      where: { license_plate: formattedLicensePlate }
    });

    if (checkLicensePlate) {
      return NextResponse.json({ message: "ป้ายทะเบียนมีอยู่แล้ว" }, { status: 400 });
    }
    // บันทึกข้อมูลลงฐานข้อมูล
    const newCar = await prisma.car.create({
      data: {
        car_brand,
        car_model,
        car_color,
        license_plate: formattedLicensePlate,
        province_plate,
        user_id: parseInt(id, 10), // แปลง `id` เป็น Integer
      },
    });

  
    // ส่งข้อมูลกลับในรูปแบบ JSON
    return NextResponse.json({ message: "เพิ่มรถยนต์สำเร็จ!!", car: newCar }, { status: 201 });

  } catch (error) {

    return NextResponse.json({ message: "ข้อผิดพลาดของเซิร์ฟเวอร์" }, { status: 500 });
  }
}