import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ฟังก์ชัน GET ใช้ดึงข้อมูลจากฐานข้อมูลตาม car_id
export async function GET(req, { params }) {
  try {
    // ดึง car_id จาก params ที่มาจาก path parameter
    const { id } = params;
    console.log("Car ID:", id);

    if (!id) {
      return NextResponse.json({ error: 'car_id is required' }, { status: 400 });
    }

    // ค้นหารถที่เกี่ยวข้องกับ car_id
    const cars = await prisma.car.findMany({
      where: { car_id: Number(id) }, // ค้นหาตาม car_id
    });

    if (!cars || cars.length === 0) {
      return NextResponse.json({ message: 'No cars found for this user' }, { status: 404 });
    }

    return NextResponse.json(cars, { status: 200 });
  } catch (error) {
    console.error("Error fetching cars:", error); // Log error
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ฟังก์ชัน PUT ใช้สำหรับอัปเดตข้อมูลรถ
export async function PUT(req, { params }) {
  try {
    // ดึงข้อมูล JSON ที่ต้องการอัปเดต
    const { car_brand, car_model, car_color, license_plate, province_plate } = await req.json();

    const formattedLicensePlate = license_plate.replace(/\s+/g, '');
    // อัปเดตรถในฐานข้อมูล

    const checkLicensePlate = await prisma.car.findUnique({
      where: {
        license_plate: formattedLicensePlate,
        NOT: { car_id: Number(params.id) },
      },
    });

    if (checkLicensePlate) {
      return NextResponse.json({ message: "ป้ายทะเบียนมีอยู่แล้ว" }, { status: 400 });
    }

    const updatedCar = await prisma.car.update({
      where: { car_id: Number(params.id) },
      data: {
        car_brand,
        car_model,
        car_color,
        license_plate: formattedLicensePlate,
        province_plate
      },
    });
    

    return NextResponse.json({ data: updatedCar, message: 'อัปเดตข้อมูลรถยนต์สำเร็จ!!' }, { status: 200 });
  } catch (error) {
    console.error("Error updating car:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ฟังก์ชัน DELETE ใช้สำหรับลบข้อมูลรถ
export async function DELETE(req, { params }) {
  try {
    // ลบข้อมูลรถตาม id
    await prisma.car.delete({
      where: { car_id: Number(params.id) }, // ตรวจสอบว่าใช้ car_id ตามชื่อคอลัมน์ที่ถูกต้อง
    });

    return NextResponse.json({ message: 'ลบข้อมูลรถยนต์สำเร็จ!!' }, { status: 200 });
  } catch (error) {
    console.error("Error deleting car:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
