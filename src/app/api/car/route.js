const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        // 1. ดึงข้อมูล JSON ออกจากคำขอ
        const { car_brand, car_model, car_color, license_plate, province_plate, user_id } = await req.json();


        // 2. บันทึกข้อมูลลงในฐานข้อมูลโดยใช้ Prisma
        const newCar = await prisma.car.create({
            data: {
                car_brand,
                car_model,
                car_color,
                license_plate,
                province_plate,
                user_id
            },
        });

        // 3. ส่งคืนข้อมูลของโพสต์ใหม่ในรูปแบบ JSON
        return NextResponse.json(
            {message: 'create car'}, 
            {   data: {
                    newCar
                }
            }
        )
    } catch (error) {
        // 4. หากเกิดข้อผิดพลาด ส่งคืนข้อความแสดงข้อผิดพลาด
        return NextResponse.json(error, { status: 500 });
    }
}
