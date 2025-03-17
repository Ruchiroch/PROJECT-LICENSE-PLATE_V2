
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
const prisma = new PrismaClient();

export async function GET(req) {
    // ดึง Query Parameters
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");
    const car_id = searchParams.get("car_id");

    // console.log("User ID:", user_id);
    // console.log("Car ID:", car_id);
    // ตรวจสอบว่ามี Query Parameter ที่จำเป็นหรือไม่
    if (!user_id && !car_id) {
        return NextResponse.json(
            { message: "Either user_id or car_id is required" },
            { status: 400 }
        );
    }

    try {
        let data;

        if (car_id) {
            console.log("Fetching data for Car ID:", car_id);
            // ดึงข้อมูลรถจากฐานข้อมูล
            data = await prisma.car.findUnique({
                where: { car_id: Number(car_id) },
                select: {
                    car_id: true,
                    car_brand: true,
                    car_model: true,
                    car_color: true,
                    license_plate: true,
                    province_plate: true,
                    user: {
                        select: {
                            user_id: true,
                            firstname: true,
                            lastname: true,
                            email: true,
                        },
                    },
                },
            });

            if (!data) {
                return NextResponse.json(
                    { message: "No car found for the given Car ID" },
                    { status: 404 }
                );
            }
            // จัดการข้อมูลสำหรับ Car ID
            const result = {
                car_id: data.car_id,
                car_brand: data.car_brand,
                car_model: data.car_model,
                car_color: data.car_color,
                license_plate: data.license_plate,
                province_plate: data.province_plate,
                user_id: data.user.user_id,
                firstname: data.user?.firstname || "",
                lastname: data.user?.lastname || "",
                email: data.user?.email || "",
            };

            return NextResponse.json({ message: "successfully", data: result }, { status: 200 });
        } else if (user_id) {
            console.log("Fetching data for User ID:", user_id);
            // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
            data = await prisma.user.findUnique({
                where: { user_id: Number(user_id) },
                select: {
                    user_id: true,
                    firstname: true,
                    lastname: true,
                    email: true,
                    cars: {
                        select: {
                            car_id: true,
                            car_brand: true,
                            car_model: true,
                            car_color: true,
                            license_plate: true,
                            province_plate: true,
                        },
                    },
                },
            });

            if (!data) {
                return NextResponse.json(
                    { message: "No user found for the given User ID" },
                    { status: 404 }
                );
            }
        }

        if (!data) {
            return NextResponse.json(
                { message: "No user found for the given User ID" },
                { status: 404 }
            );
        }

        // จัดการข้อมูลสำหรับ User ID
        const result = {
            user_id: data.user_id,
            firstname: data.firstname,
            lastname: data.lastname,
            email: data.email,
            cars: data.cars.map((car) => ({
                car_id: car.car_id,
                car_brand: car.car_brand,
                car_model: car.car_model,
                car_color: car.car_color,
                license_plate: car.license_plate,
                province_plate: car.province_plate,
            })),
        };

        return NextResponse.json({ message: "successfully", data: result }, { status: 200 });

    } catch (error) {
        console.error("Error fetching data:", error);
        return NextResponse.json(
            { message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}


export async function PUT(req) {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");
    const car_id = searchParams.get("car_id");

    if (!user_id && !car_id) {
        return NextResponse.json({ message: "Either user_id or car_id is required" }, { status: 400 });
    }

    try {
        const body = await req.json();

        let updatedData;

        if (car_id) {
            // ดึงข้อมูลผู้ใช้ที่เกี่ยวข้องกับ car_id
            const car = await prisma.car.findUnique({
                where: { car_id: Number(car_id) },
                select: {
                    user_id: true,
                },
            });

            if (!car) {
                return NextResponse.json({ message: "ไม่พบรถยนต์ตามรหัสรถที่ระบุ" }, { status: 404 });

            }

            const user_id = car.user_id;
            // แปลงและจัดรูปแบบป้ายทะเบียน
            const formattedLicensePlate = body.license_plate.replace(/\s+/g, '');
            // อัปเดตข้อมูลรถ

            const checkLicensePlate = await prisma.car.findUnique({
                where: {
                    license_plate: formattedLicensePlate,
                    NOT: { car_id: Number(car_id) },
                },
            });

            if (checkLicensePlate) {
                return NextResponse.json({ message: "ป้ายทะเบียนมีอยู่แล้ว" }, { status: 400 });
            }

            updatedData = await prisma.car.update({
                where: { car_id: Number(car_id) },
                data: {
                    car_brand: body.car_brand,
                    car_model: body.car_model,
                    car_color: body.car_color,
                    license_plate: formattedLicensePlate,
                    province_plate: body.province_plate,
                },
            });

            // อัปเดตชื่อผู้ใช้ (ถ้ามีการส่ง `firstname` และ `lastname`)
            if (body.firstname || body.lastname) {
                await prisma.user.update({
                    where: { user_id: Number(user_id) },
                    data: {
                        firstname: body.firstname || undefined, // อัปเดตเฉพาะถ้ามีค่า
                        lastname: body.lastname || undefined,   // อัปเดตเฉพาะถ้ามีค่า
                    },
                });
            }

        } else if (user_id) {
            // อัปเดตข้อมูลผู้ใช้
            updatedData = await prisma.user.update({
                where: { user_id: Number(user_id) },
                data: {
                    firstname: body.firstname,
                    lastname: body.lastname,
                },
            });
        }

        return NextResponse.json({ message: "อัปเดตข้อมูลสำเร็จ!!", data: updatedData }, { status: 200 }


        );
    } catch (error) {
        console.error("Error updating data:", error);
        return NextResponse.json({ message: "ข้อผิดพลาดของเซิร์ฟเวอร์", error: error.message }, { status: 500 }
        );
    }
}



export async function POST(req) {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
        return NextResponse.json({ message: "จำเป็นต้องมี ID ผู้ใช้ในการเพิ่มรถใหม่" }, { status: 400 });
    }

    try {
        const body = await req.json();

        // ตรวจสอบข้อมูลรถที่ส่งมา
        if (!body.car_brand || !body.car_model || !body.license_plate) {
            return NextResponse.json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
        }
        
        const formattedLicensePlate = body.license_plate.replace(/\s+/g, '');

        // เพิ่มรถใหม่ให้กับผู้ใช้
        const checkLicensePlate = await prisma.car.findUnique({
            where: {
                license_plate: formattedLicensePlate,
            },
        });

        if (checkLicensePlate) {
            return NextResponse.json({ message: "ป้ายทะเบียนมีอยู่แล้ว" }, { status: 400 });
        }

        const newCar = await prisma.car.create({
            data: {
                car_brand: body.car_brand,
                car_model: body.car_model,
                car_color: body.car_color || null,
                license_plate: formattedLicensePlate,
                province_plate: body.province_plate || null,
                user_id: Number(user_id), // เชื่อมโยงกับผู้ใช้
            },
        });

        return NextResponse.json({ message: "เพิ่มรถยนต์สำเร็จ!!", data: newCar }, { status: 201 });

    } catch (error) {
        console.error("Error adding new car:", error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, props) {
    const params = await props.params;
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");
    try {
       
        await prisma.user.delete({
            where: { user_id: Number(user_id) },
        });

        console.log("ลบ", Number(user_id))
        return NextResponse.json({ message: 'ลบผู้ใช้งานสำเร็จ!!' });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}