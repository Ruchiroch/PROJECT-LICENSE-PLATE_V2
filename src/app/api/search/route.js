import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req) {
    const search = req.nextUrl.searchParams.get('search'); // รับค่าคำค้นหา
    const category = req.nextUrl.searchParams.get('category') || 'license_plate'; // รับค่าหมวดหมู่การค้นหา (ค่าเริ่มต้นเป็น 'license_plate')

    try {
        let cars;

        // ตรวจสอบว่ามีคำค้นหาหรือไม่
        if (search) {
            switch (category) {
                case 'license_plate':
                    // ค้นหาตามหมายเลขทะเบียน
                    cars = await prisma.car.findMany({
                        where: {
                            license_plate: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        },
                        include: {
                            user: {
                                select: {
                                    firstname: true,
                                    lastname: true,
                                },
                            },
                        },
                    });
                    break;
                case 'fullname':
                    // ค้นหาตามชื่อ-นามสกุล
                    cars = await prisma.car.findMany({
                        where: {
                            user: {
                                OR: [
                                    { firstname: { contains: search, mode: 'insensitive' } },
                                    { lastname: { contains: search, mode: 'insensitive' } },
                                ],
                            },
                        },
                        include: {
                            user: {
                                select: {
                                    firstname: true,
                                    lastname: true,
                                },
                            },
                        },
                    });
                    break;
                case 'car_brand':
                    // ค้นหาตามยี่ห้อรถยนต์
                    cars = await prisma.car.findMany({
                        where: {
                            car_brand: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        },
                        include: {
                            user: {
                                select: {
                                    firstname: true,
                                    lastname: true,
                                },
                            },
                        },
                    });
                    break;
                default:
                    // ถ้าหมวดหมู่ไม่ถูกต้อง ให้ส่งข้อมูลทั้งหมด
                    cars = await prisma.car.findMany({
                        include: {
                            user: {
                                select: {
                                    firstname: true,
                                    lastname: true,
                                },
                            },
                        },
                    });
                    break;
            }
        } else {
            // ถ้าไม่มีคำค้นหา ให้ดึงข้อมูลทั้งหมด
            cars = await prisma.car.findMany({
                include: {
                    user: {
                        select: {
                            firstname: true,
                            lastname: true,
                        },
                    },
                },
            });
        }

        // ปรับผลลัพธ์ให้อยู่ในรูปแบบที่ต้องการ
        const result = cars.map(car => ({
            firstname: car.user?.firstname,
            lastname: car.user?.lastname,
            car_brand: car.car_brand,
            car_model: car.car_model,
            car_color: car.car_color,
            license_plate: car.license_plate,
        }));

        return NextResponse.json(result); // ส่งผลลัพธ์เป็น JSON
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการค้นหาข้อมูล' }, { status: 500 });
    }
}
