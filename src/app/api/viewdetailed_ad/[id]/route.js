import { NextResponse } from "next/server";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


export async function GET(req, { params }) {
  try {
    const indexParam = params?.id;
    // ดึงข้อมูลจากฐานข้อมูล
    const logs = await prisma.detectionLog.findMany({
      select: {
        detection_license_plate: true,
        detection_province_plate: true,
        image_base64: true,
        action: true,
        detection_time: true,
        detection_status: true,
      },
    });

    if (!logs || logs.length === 0) {
      return NextResponse.json({ message: 'No detection logs found' }, { status: 404 });
    }

    // จัดกลุ่มข้อมูลตามป้ายทะเบียน
    const groupedLogs = logs.reduce((acc, log) => {
      const { detection_license_plate } = log;

      if (!acc[detection_license_plate]) {
        acc[detection_license_plate] = [];
      }

      acc[detection_license_plate].push(log);
      return acc;
    }, {});

    // สร้างรายการเฉพาะ IN และ OUT
    const detectionRounds = [];

    for (const licensePlate of Object.keys(groupedLogs)) {
      const logsForPlate = groupedLogs[licensePlate];

      // ดึงข้อมูล user_id จากฐานข้อมูลตาม license_plate
      const user = await prisma.user.findFirst({
        where: {
          cars: {
            some: {
              license_plate: licensePlate,
            },
          },
        },
        select: {
          firstname: true,
          lastname: true,
          cars: {
            where: {
              license_plate: licensePlate,
            },
            select: {
              car_brand: true,
              car_model: true,
              car_color: true,
              province_plate: true,
            }
          }
        },
      });



      // ตรวจสอบว่า user มีข้อมูลหรือไม่
      const userName = user ? `${user.firstname} ${user.lastname}` : "ไม่ระบุ";

      // const detection_province_plate = inLog.detection_province_plate || outLog.detection_province_plate;
      // แยก IN และ OUT
      const inLogs = logsForPlate.filter((log) => log.action === 'IN').sort((a, b) => new Date(a.detection_time) - new Date(b.detection_time));
      const outLogs = logsForPlate.filter((log) => log.action === 'OUT').sort((a, b) => new Date(a.detection_time) - new Date(b.detection_time));

      const unmatchedInLogs = []; // IN ที่ยังไม่ได้จับคู่

      // จับคู่ OUT กับ IN ล่าสุดที่ยังไม่มีการจับคู่
      outLogs.forEach((outLog) => {
        const matchingInLogIndex = inLogs
          .slice()
          .reverse() // เรียง IN จากล่าสุดไปเก่าสุด
          .findIndex(
            (inLog) =>
              new Date(inLog.detection_time) < new Date(outLog.detection_time) &&
              !unmatchedInLogs.includes(inLog)
          );

        if (matchingInLogIndex !== -1) {
          const matchingInLog = inLogs.splice(inLogs.length - 1 - matchingInLogIndex, 1)[0];
          detectionRounds.push({
            name: userName,
            // cars: userCars,
            cars: user?.cars?.map(car => ({
              car_brand: car?.car_brand, // ใช้ Optional Chaining เพื่อหลีกเลี่ยงการเข้าถึงข้อมูล null หรือ undefined
              car_model: car?.car_model,
              car_color: car?.car_color
            })) || [],
            license_plate: licensePlate,
            detection_province_plate: outLog.detection_province_plate,
            in_image: matchingInLog.image_base64, // รูปภาพของ IN
            in_detection_time: matchingInLog.detection_time,
            out_detection_time: outLog.detection_time, // เวลา OUT
            out_image: outLog.image,
            in_detection_status: matchingInLog.detection_status, // สถานะ IN
          });

          unmatchedInLogs.push(matchingInLog); // เพิ่ม IN ที่จับคู่แล้ว
        } else {
          // ถ้าไม่มี IN ที่เหมาะสม
          detectionRounds.push({
            name: userName,
            // cars: userCars, 
            cars: user?.cars?.map(car => ({
              car_brand: car?.car_brand, // ใช้ Optional Chaining เพื่อหลีกเลี่ยงการเข้าถึงข้อมูล null หรือ undefined
              car_model: car?.car_model,
              car_color: car?.car_color
            })) || [],
            license_plate: licensePlate,
            detection_province_plate: outLog.detection_province_plate,
            in_image: null,
            in_detection_time: null,
            out_detection_time: outLog.detection_time,
            out_image: outLog.image_base64,
            in_detection_status: null,
          });
        }
        
      });
     

      // เพิ่ม IN ล่าสุดที่ยังไม่มี OUT
      inLogs.forEach((inLog, index) => {
        // ถ้ามี IN ใหม่ และยังไม่มี OUT
        let status = inLog.detection_status; // Set initial status based on detection status

        if (status === "ไม่ผ่าน") {
          status = "ไม่ผ่าน"; // If status is "ไม่ผ่าน", keep it as "ไม่ผ่าน"
        } else if (status === "ผ่าน") {
          status = "ผิดปกติ"; // If status is "ผ่าน", change to "ผิดปกติ"
        } else {
          status = "ผิดปกติ"; // Default to "ผิดปกติ" if it's neither "ผ่าน" nor "ไม่ผ่าน"
        }
        if (index !== inLogs.length - 1) { // ตรวจสอบว่าไม่ใช่ IN ล่าสุด
          detectionRounds.push({
            name: userName,
            // cars: userCars, 
            cars: user?.cars?.map(car => ({
              car_brand: car?.car_brand,
              car_model: car?.car_model,
              car_color: car?.car_color
            })) || [],
            license_plate: licensePlate,
            detection_province_plate: inLog.detection_province_plate,
            license_plate: licensePlate,
            in_image: inLog.image_base64,
            in_detection_time: inLog.detection_time,
            out_detection_time: "ยังไม่ออก",
            out_image: null,
            in_detection_status: status, // เปลี่ยนสถานะเป็น "ผิดปกติ"
          });
        } else {
          // เพิ่ม IN ล่าสุดที่ยังไม่มี OUT
          detectionRounds.push({
            name: userName,
            // cars: userCars, 
            cars: user?.cars?.map(car => ({
              car_brand: car?.car_brand,
              car_model: car?.car_model,
              car_color: car?.car_color
            })) || [],
            license_plate: licensePlate,
            detection_province_plate: inLog.detection_province_plate,
            license_plate: licensePlate,
            in_image: inLog.image_base64,
            in_detection_time: inLog.detection_time,
            out_detection_time: "ยังไม่ออก",
            out_image: null,
            in_detection_status: inLog.detection_status || "ไม่พบข้อมูล",
          });
        }
      });
    }

     
    // จัดเรียงตามเวลาเก่าสุด -> ล่าสุด
    detectionRounds.sort((a, b) => {
      const timeA = new Date(a.in_detection_time || a.out_detection_time);
      const timeB = new Date(b.in_detection_time || b.out_detection_time);

      return timeA - timeB; // เก่าสุด -> ล่าสุด
    });

    // เพิ่ม index ให้กับแต่ละ detectionRound
    detectionRounds.forEach((round, index) => {
      round.index = index + 1; // เพิ่ม index (เริ่มต้นจาก 1)
    });

    // ตรวจสอบว่ามี indexParam ที่ต้องการหรือไม่
    if (indexParam) {
      const specificRound = detectionRounds.find((round) => round.index === parseInt(indexParam));
      if (!specificRound) {
        return NextResponse.json({ message: `No detection round found for index ${indexParam}` }, { status: 404 });
      }
      return NextResponse.json({ detectionRound: specificRound }); // ส่งเฉพาะ index ที่กำหนด
    }

    // ส่งข้อมูลทั้งหมดกลับไป
    return NextResponse.json({ detectionRounds });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}