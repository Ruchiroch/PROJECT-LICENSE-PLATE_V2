import { NextResponse } from "next/server";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

export async function GET(req, { params }) {
  try {
    const { id, index } = params;
    const userId = parseInt(id);
    const indexParam = parseInt(index);

    const { searchParams } = new URL(req.url);
    const licensePlate = searchParams.get("license_plate"); // รับเลขป้ายทะเบียนจาก query
    // console.log("Received Params:");
    // console.log("User ID:", userId);
    // console.log("Index:", indexParam);
    // console.log("License Plate:", licensePlate);

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    // ดึงข้อมูลผู้ใช้พร้อมกับทะเบียนรถ
    const userWithCars = await prisma.user.findUnique({
      where: { user_id: userId },
      include: {
        cars: {
          select: {
            license_plate: true,
            car_brand: true,
            car_model: true,
            car_color: true,
          },
        },
      },
    });

    if (!userWithCars) {
      return NextResponse.json({ message: 'No user found with this ID' }, { status: 404 });
    }

    const userName = `${userWithCars.firstname} ${userWithCars.lastname}`;

    // ดึงข้อมูล logs ที่เกี่ยวข้อง
    const logs = await prisma.detectionLog.findMany({
      where: {
        detection_license_plate: {
          in: userWithCars.cars.map((car) => car.license_plate), // ใช้ทะเบียนทั้งหมดของรถในผู้ใช้
        },
      },
      select: {
        detection_license_plate: true,
        detection_province_plate: true,
        detection_status: true,
        image_base64: true,
        action: true,
        detection_time: true,
      },
    });

    // (คงโค้ดสำหรับการจัดกลุ่มและจับคู่ IN/OUT)
    const groupedLogs = logs.reduce((acc, log) => {
      const { detection_license_plate, action } = log;

      if (!acc[detection_license_plate]) {
        acc[detection_license_plate] = { in: [], out: [] };
      }

      if (action === 'IN') {
        acc[detection_license_plate].in.push(log);
      } else if (action === 'OUT') {
        acc[detection_license_plate].out.push(log);
      }

      return acc;
    }, {});

    // จัดการข้อมูลการจับคู่ IN และ OUT
    const detectionRounds = [];

    Object.keys(groupedLogs).forEach((licensePlate) => {
      const carLogs = groupedLogs[licensePlate];
      const inLogs = carLogs.in.sort((a, b) => new Date(a.detection_time) - new Date(b.detection_time));
      const outLogs = carLogs.out.sort((a, b) => new Date(a.detection_time) - new Date(b.detection_time));

      outLogs.forEach((outLog) => {
        const matchingInLogIndex = inLogs.findLastIndex(
          (inLog) => new Date(inLog.detection_time) < new Date(outLog.detection_time)
        );

        const matchingInLog =
          matchingInLogIndex !== -1
            ? inLogs.splice(matchingInLogIndex, 1)[0]
            : null;

        detectionRounds.push({
          name: userName,
          cars: userWithCars.cars.filter((car) => car.license_plate === licensePlate), // กรองเฉพาะคันที่ตรงกับ license_plate
          license_plate: licensePlate,
          detection_province_plate: outLog.detection_province_plate,
          in_image: matchingInLog ? matchingInLog.image_base64 : null,
          in_detection_time: matchingInLog ? matchingInLog.detection_time : null,
          out_detection_time: outLog.detection_time,
          in_detection_status: matchingInLog?.detection_status || null,
        });
      });

      inLogs.forEach((inLog) => {
        detectionRounds.push({
          name: userName,
          cars: userWithCars.cars.filter((car) => car.license_plate === licensePlate), // กรองเฉพาะคันที่ตรงกับ license_plate
          license_plate: licensePlate,
          detection_province_plate: inLog.detection_province_plate,
          in_image: inLog.image_base64,
          in_detection_time: inLog.detection_time,
          out_detection_time: "ยังไม่ออก",
          in_detection_status: inLog.detection_status,
        });
      });
    });

    // เรียงลำดับตามเวลา IN/OUT
    detectionRounds.sort((a, b) => {
      const timeA = new Date(a.in_detection_time || a.out_detection_time);
      const timeB = new Date(b.in_detection_time || b.out_detection_time);

      return timeA - timeB;
    });

    detectionRounds.forEach((round, index) => {
      round.index = index + 1;
      // console.log("Round", index + 1, ":", round);
    });

    // กรองตาม index ที่ต้องการ
    if (indexParam) {
      const specificRound = detectionRounds.find(
        (round) => round.index === indexParam && round.license_plate === licensePlate
      );

      if (!specificRound) {
        return NextResponse.json(
          { message: `No detection round found for index ${indexParam}` },
          { status: 404 }
        );
      }

      return NextResponse.json({ detectionRound: specificRound });
    }

    return NextResponse.json(detectionRounds);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}




// export async function GET(req, { params }) {

//   try {
//     const { id, index } = params;
//     const userId = parseInt(id);
//     const indexParam = parseInt(index);
//     if (!userId) {
//       return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
//     }

//     // ดึงข้อมูลผู้ใช้พร้อมกับทะเบียนรถ
//     const userWithCars = await prisma.user.findUnique({
//       where: { user_id: userId },
//       include: {
//         cars: {
//           select: {
//             license_plate: true,
//             car_brand: true,
//             car_model: true,
//             car_color: true,
//           },
//         },
//       },
//     });
//     const userName = `${userWithCars.firstname} ${userWithCars.lastname}`;


//     if (!userWithCars) {
//       return NextResponse.json({ message: 'No user found with this ID' }, { status: 404 });
//     }

//     // ดึงข้อมูล logs ที่เกี่ยวข้อง
//     const logs = await prisma.detectionLog.findMany({
//       where: {
//         detection_license_plate: {
//           in: userWithCars.cars.map((car) => car.license_plate),
//         },
//       },
//       select: {
//         detection_license_plate: true,
//         detection_province_plate: true,
//         detection_status: true,
//         image: true,
//         action: true,
//         detection_time: true,
//       },
//     });

//     // จัดกลุ่ม logs เป็น IN และ OUT ตามป้ายทะเบียน
//     const groupedLogs = logs.reduce((acc, log) => {
//       const { detection_license_plate, action } = log;

//       if (!acc[detection_license_plate]) {
//         acc[detection_license_plate] = { in: [], out: [] };
//       }

//       if (action === 'IN') {
//         acc[detection_license_plate].in.push(log);
//       } else if (action === 'OUT') {
//         acc[detection_license_plate].out.push(log);
//       }

//       return acc;
//     }, {});

//     // จัดการข้อมูลการจับคู่ IN และ OUT
//     const detectionRounds = [];

//     Object.keys(groupedLogs).forEach((licensePlate) => {
//       const carLogs = groupedLogs[licensePlate];
//       const inLogs = carLogs.in.sort((a, b) => new Date(a.detection_time) - new Date(b.detection_time));
//       const outLogs = carLogs.out.sort((a, b) => new Date(a.detection_time) - new Date(b.detection_time));

//       const unmatchedOutLogs = [...outLogs]; // สำเนา OUT ที่ยังไม่ได้จับคู่

//       outLogs.forEach((outLog) => {
//         // ค้นหา IN ที่ตรงกับ OUT โดยเลือก IN ที่ "ล่าสุดก่อน OUT"
//         const matchingInLogIndex = inLogs.findLastIndex(
//           (inLog) => new Date(inLog.detection_time) < new Date(outLog.detection_time)
//         );

//         const matchingInLog =
//           matchingInLogIndex !== -1
//             ? inLogs.splice(matchingInLogIndex, 1)[0] // ลบ IN ที่จับคู่แล้ว
//             : null;

//         detectionRounds.push({
//           name: userName,
//           cars: userWithCars?.cars?.map(car => ({
//             car_brand: car?.car_brand, 
//             car_model: car?.car_model,
//             car_color: car?.car_color
//           })) || [],
//           license_plate: licensePlate,
//           detection_province_plate: outLog.detection_province_plate,
//           in_image: matchingInLog ? matchingInLog.image : null,
//           in_detection_time: matchingInLog ? matchingInLog.detection_time : null,
//           out_detection_time: outLog.detection_time,
//           in_detection_status: matchingInLog.detection_status,
//         });
//       });

//       // กรณี IN ที่ไม่มี OUT
//       inLogs.forEach((inLog) => {
//         detectionRounds.push({
//           name: userName,
//           cars: userWithCars?.cars?.map(car => ({
//             car_brand: car?.car_brand, 
//             car_model: car?.car_model,
//             car_color: car?.car_color
//           })) || [],
//           license_plate: licensePlate,
//           detection_province_plate: inLog.detection_province_plate,
//           in_image: inLog.image,
//           in_detection_time: inLog.detection_time,
//           out_detection_time: "ยังไม่ออก",
//           in_detection_status: inLog.detection_status,
//         });
//       });
//     });

//     // เรียงลำดับตามเวลาที่ IN หรือ OUT
//     detectionRounds.sort((a, b) => {
//       const timeA = new Date(a.in_detection_time || a.out_detection_time);
//       const timeB = new Date(b.in_detection_time || b.out_detection_time);

//       return timeA - timeB;
//     });

//     // เพิ่ม index ให้กับแต่ละ detectionRound
//     detectionRounds.forEach((round, index) => {
//       round.index = index + 1; 
//     });

//     if (indexParam) {
//       const specificRound = detectionRounds.find((round) => round.index === parseInt(indexParam));
//       if (!specificRound) {
//         return NextResponse.json({ message: `No detection round found for index ${indexParam}` }, { status: 404 });
//       }
//       return NextResponse.json({ detectionRound: specificRound }); // ส่งเฉพาะ index ที่กำหนด
//     }

//     // ส่งข้อมูลกลับไปยังฝั่งหน้าบ้าน
//     return NextResponse.json(detectionRounds);

//   } catch (error) {
//     console.error("Error fetching data:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }