const express = require('express');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const http = require('http');
const cors = require("cors");
const next = require('next');
const nodemailer = require('nodemailer');
const prisma = new PrismaClient();

// ตั้งค่าการทำงานของ Next.js
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();



app.prepare().then(() => {
  const expressApp = express();
  expressApp.use(cors({ origin: "*" })); // ✅ เพิ่ม cors middleware ให้ Express
  const server = http.createServer(expressApp);

  const io = new Server(server, {
    path: "/socket.io/", // Custom path for socket.io connection
    cors: {
      origin: ["http://localhost:3000", "https://rec.licenseplate.pro"],
      methods: ["GET", "POST"], // Allowing GET and POST methods for CORS
    },
  });

  // ฟังก์ชันจัดกลุ่มข้อมูลตามป้ายทะเบียน
  const groupByLicensePlate = (logs) => {
    return logs.reduce((acc, log) => {
      const { detection_license_plate } = log;

      if (!acc[detection_license_plate]) {
        acc[detection_license_plate] = [];
      }

      acc[detection_license_plate].push(log);
      return acc;
    }, {});
  };

  // ฟังก์ชันสร้างรายการ IN และ OUT
  const generateDetectionRounds = (groupedLogs) => {
    const detectionRounds = [];

    for (const licensePlate of Object.keys(groupedLogs)) {
      const logsForPlate = groupedLogs[licensePlate];

      // แยก IN และ OUT
      const inLogs = logsForPlate
        .filter((log) => log.action === 'IN')
        .sort((a, b) => new Date(a.detection_time) - new Date(b.detection_time));
      const outLogs = logsForPlate
        .filter((log) => log.action === 'OUT')
        .sort((a, b) => new Date(a.detection_time) - new Date(b.detection_time));

      matchInOutLogs(inLogs, outLogs, detectionRounds, licensePlate);
    }

    return detectionRounds;
  };

  // ฟังก์ชันจับคู่ IN และ OUT
  const matchInOutLogs = (inLogs, outLogs, detectionRounds, licensePlate) => {
    // const unmatchedInLogs = [];

    // outLogs.forEach((outLog) => {
    //   const matchingInLogIndex = inLogs
    //     .slice()
    //     .reverse() // เรียง IN จากล่าสุด
    //     .findIndex(
    //       (inLog) =>
    //         new Date(inLog.detection_time) < new Date(outLog.detection_time) &&
    //         !unmatchedInLogs.includes(inLog)
    //     );

    //   if (matchingInLogIndex !== -1) {
    //     const matchingInLog = inLogs.splice(inLogs.length - 1 - matchingInLogIndex, 1)[0];
    //     detectionRounds.push({
    //       license_plate: licensePlate,
    //       in_image: matchingInLog.image_base64,
    //       in_detection_time: matchingInLog.detection_time,
    //       out_detection_time: outLog.detection_time,
    //       out_image: outLog.image_base64,
    //       in_detection_status: matchingInLog.detection_status,
    //     });

    //     unmatchedInLogs.push(matchingInLog);
    //   } else {
    //     // detectionRounds.push({
    //     //   license_plate: licensePlate,
    //     //   in_image: null,
    //     //   in_detection_time: null,
    //     //   out_detection_time: outLog.detection_time,
    //     //   out_image: outLog.image,
    //     //   in_detection_status: null,
    //     // });
    //     detectionRounds.push({
    //       license_plate: licensePlate,
    //       in_image: null,
    //       in_detection_time: "ไม่พบข้อมูล", // แก้จาก null เป็นค่า default
    //       out_detection_time: outLog.detection_time,
    //       out_image: outLog.image_base64,
    //       in_detection_status: null,
    //     });
    //   }
    // });
    const matchedInLogs = new Set(); // เก็บ detection_time ของ IN ที่ถูกใช้ไปแล้ว
    const unmatchedInLogs = new Set(); // เก็บ IN ที่ยังไม่มี OUT
    
    outLogs.forEach((outLog) => {
      // หา IN ที่ยังไม่ถูกใช้ และเกิดก่อน OUT นี้
      const matchingInLog = inLogs
        .slice()
        .reverse()
        .find(
          (inLog) =>
            new Date(inLog.detection_time) < new Date(outLog.detection_time) && // IN ต้องมาก่อน OUT
            !matchedInLogs.has(inLog.detection_time) // เช็คว่า IN นี้ยังไม่ถูกใช้
        );
    
      if (matchingInLog) {
        // จับคู่ IN และ OUT
        detectionRounds.push({
          license_plate: licensePlate,
          in_image: matchingInLog.image_base64,
          in_detection_time: matchingInLog.detection_time,
          out_detection_time: outLog.detection_time,
          out_image: outLog.image_base64,
          in_detection_status: matchingInLog.detection_status,
        });
    
        matchedInLogs.add(matchingInLog.detection_time); // บันทึกว่า IN นี้ถูกใช้แล้ว
      } else {
        // ไม่มี IN → แสดงว่า OUT ไม่มีคู่ IN
        detectionRounds.push({
          license_plate: licensePlate,
          in_image: null,
          in_detection_time: "ไม่พบข้อมูล",
          out_detection_time: outLog.detection_time,
          out_image: outLog.image_base64,
          in_detection_status: null,
        });
      }
    });
    
    // ✅ เพิ่ม IN ที่ยังไม่มี OUT
    inLogs.forEach((inLog) => {
      if (!matchedInLogs.has(inLog.detection_time)) {
        unmatchedInLogs.add(inLog.detection_time); // บันทึก IN ที่ยังไม่มี OUT
    
        detectionRounds.push({
          license_plate: licensePlate,
          in_image: inLog.image_base64,
          in_detection_time: inLog.detection_time,
          out_detection_time: "ยังไม่ออก",
          out_image: null,
          in_detection_status: inLog.detection_status || "ผิดปกติ",
        });
      }
    });

    // เพิ่ม IN ล่าสุดที่ยังไม่มี OUT
    // inLogs.forEach((inLog, index) => {
    //   let status = inLog.detection_status;

    //   if (status === "ไม่ผ่าน") {
    //     status = "ไม่ผ่าน";
    //   } else if (status === "ผ่าน") {
    //     status = "ผิดปกติ";
    //   } else {
    //     status = "ผิดปกติ";
    //   }
    //   // ถ้ามี IN ใหม่ และยังไม่มี OUT
    //   if (index !== inLogs.length - 1) { // ตรวจสอบว่าไม่ใช่ IN ล่าสุด
    //     detectionRounds.push({
    //       license_plate: licensePlate,
    //       in_image: inLog.image_base64,
    //       in_detection_time: inLog.detection_time,
    //       out_detection_time: "ยังไม่ออก",
    //       out_image: null,
    //       in_detection_status: status, // เปลี่ยนสถานะเป็น "ผิดปกติ"
    //     });
    //   } else {
    //     // เพิ่ม IN ล่าสุดที่ยังไม่มี OUT
    //     detectionRounds.push({
    //       license_plate: licensePlate,
    //       in_image: inLog.image_base64,
    //       in_detection_time: inLog.detection_time,
    //       out_detection_time: "ยังไม่ออก",
    //       out_image: null,
    //       in_detection_status: inLog.detection_status || "ไม่พบข้อมูล",
    //     });
    //   }
    // });
  };

  const getUserData = async () => {
    const users = await prisma.user.findMany({
      where: { role: 'user' }, // ดึงเฉพาะผู้ใช้ที่มี role เป็น "user"
      orderBy: { user_id: 'desc' }, // เรียงจากใหม่ไปเก่า
      select: {
        user_id: true,
        firstname: true,
        lastname: true,
        status: true,
        cars: {
          select: {
            car_id: true,
            car_brand: true,
            car_model: true,
            car_color: true,
            license_plate: true,
            province_plate: true,
          }
        }
      }
    });

    // จัดรูปแบบข้อมูล
    return users.map(user => ({
      user_id: user.user_id,
      firstname: user.firstname,
      lastname: user.lastname,
      status: user.status,
      cars: user.cars.length > 0
        ? user.cars.map(car => ({
          car_id: car.car_id,
          car_brand: car.car_brand,
          car_model: car.car_model,
          car_color: car.car_color,
          license_plate: car.license_plate,
          province_plate: car.province_plate,
        }))
        : [{
          car_id: 'ไม่มีข้อมูลรถยนต์ในระบบ',
          car_brand: 'ไม่มีข้อมูลรถยนต์ในระบบ',
          car_model: 'ไม่มีข้อมูลรถยนต์ในระบบ',
          car_color: 'ไม่มีข้อมูลรถยนต์ในระบบ',
          license_plate: 'ไม่มีข้อมูลรถยนต์ในระบบ',
          province_plate: 'ไม่มีข้อมูลรถยนต์ในระบบ',
        }]
    }));
  };

  io.on('connection', (socket) => {

    console.log('A client connected: ' + socket.id);

    // ส่งข้อความไปยัง client ทันทีเมื่อเชื่อมต่อ
    socket.emit('welcome_message', { message: 'Welcome to the server!' });

    /////////////////////////////////////////////////

    socket.on("joinRoom", (role, userId) => {
      if (userId) {
        socket.data.userId = userId;  // เก็บ user_id ใน socket.data
      }

      if (role === "admin") {
        socket.join("admin"); // 🔴 Admin อยู่ในห้อง 'admin'
        console.log(`🛠️ Admin joined room: admin`);
      } else {
        socket.join(`user_${userId}`);// 🔵 User อยู่ในห้องตัวเอง
        console.log(`👤 User ${userId} joined room: user_${userId}`);
      }

    });

    /////////////////////////////////////////////////

    // รับข้อมูลจาก ฮาร์ดแวร์ ที่ส่งมา เทส
    socket.on('sendData', async (data) => {
      // console.log('A client connected camera: ' + socket.id);
      console.log('Received license_plate from client: ', data.license_plate);
      console.log('Received provice_plate from client: ', data.provice_plate);
      console.log('Received camera_id from client: ', data.camera_id);
      try {
        let currentDateTime = new Date();
        let formattedDate = currentDateTime.toLocaleString();


        if (data) {
          const detection_license_plate = data.license_plate;
          const detection_province_plate = data.provice_plate;
          const file = data.image;
          const numericCameraId = Number(data.camera_id);

          // ดึงข้อมูลจากฐานข้อมูล
          const [camera, user, admin, existingVehicle] = await Promise.all([
            prisma.camera.findUnique({ where: { camera_id: numericCameraId } }),
            prisma.user.findMany({ where: { cars: { some: { license_plate: detection_license_plate } } }, select: { email: true, notifications: true, user_id: true } }),
            prisma.user.findMany({ where: { role: "admin" }, select: { email: true } }),
            prisma.car.findFirst({ where: { license_plate: detection_license_plate } })
          ]);

          // ตั้งค่า action ตามข้อมูลที่ดึงมา
          const action = camera.camera_mode;
          let move = action === 'IN' ? "เข้า" : "ออก";

          // ถ้าไม่พบป้ายทะเบียนในฐานข้อมูล ให้ตั้ง detection_status เป็น "ไม่ผ่าน"
          let detection_status = existingVehicle ? "ผ่าน" : "ไม่ผ่าน";
          const imageBase64 = `data:image/jpeg;base64,${file}`;

          // เก็บข้อมูลในฐานข้อมูล
          await prisma.detectionLog.create({
            data: {
              detection_license_plate: detection_license_plate,
              detection_province_plate: detection_province_plate,
              image_base64: imageBase64, // เก็บ path หรือ URL ของไฟล์
              action: action,
              detection_status: detection_status,
              camera_id: numericCameraId
            },
          });

          // ถ้าไม่พบป้ายทะเบียนในฐานข้อมูล 
          if (!existingVehicle) {
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              port: 465,
              secure: true,
              auth: {
                user: process.env.GOOGLE_GMAIL_USER,
                pass: process.env.GOOGLE_GMAIL_SECRET,
              },
            });
            // ไว้ลองปรับ
            //   await Promise.all(admin.map(admin_email => {
            //     return transporter.sendMail({
            //         to: admin_email.email,
            //         subject: 'การแจ้งเตือน: มีรถไม่ได้ลงทะเบียน',
            //         html: emailContent
            //     });
            // }));
            for (const admin_email of admin) {
              const mailOptions = {
                to: admin_email.email,  // ใช้ email ของ admin แต่ละคน
                subject: 'การแจ้งเตือน: มีรถยนต์ไม่ได้ลงทะเบียน',
                html: `
                    <html>
                        <head>
                            <!-- เพิ่ม meta tag สำหรับการแสดงผลบนมือถือ -->
                            <meta name="viewport" content="width=device-width, initial-scale=1">
                        </head>
                        <body>
                            <div style="font-family: Arial, sans-serif; text-align: center; color: #333; padding: 20px;">
                                <h1 style="color: #000; font-size: 24px; margin-bottom: 20px;">LICENSE PLATE RECOGNITION</h1>
                                <div style="
                                    margin: 0 auto; 
                                    text-align: center; 
                                    background-color: white; 
                                    padding: 30px; 
                                    border-radius: 10px; 
                                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                                    border: 2px solid black; 
                                    max-width: 600px; 
                                ">
                                    <h2 style="font-size: 20px; color: #333; margin-top: 20px; font-weight: bold; line-height: 1.4;">
                                        แจ้งเตือนว่า มีรถไม่ได้ลงทะเบียน ${move} กรุณาตรวจสอบข้อมูลอีกครั้ง
                                    </h2>
                                    <p style="font-size: 16px; color: #333; font-weight: bold;">หมายเลขทะเบียน: ${detection_license_plate}</p>
                                    <p style="font-size: 16px; color: #333; font-weight: bold;">ณ เวลา: ${formattedDate}</p>
                                    <p style="font-size: 16px; color: #7f8c8d; font-weight: normal;">ขอบคุณที่ใช้บริการของเรา</p>
                                </div>
                            </div>
                        </body>
                    </html>
                    `
              };
              await transporter.sendMail(mailOptions);
            }
          } else {
            const email = user[0].email;
            if (user[0].notifications) {
              const transporter = nodemailer.createTransport({
                service: 'gmail',
                port: 465,
                secure: true,
                auth: {
                  user: process.env.GOOGLE_GMAIL_USER,
                  pass: process.env.GOOGLE_GMAIL_SECRET,
                },
              });

              const mailOptions = {
                to: email,  // อีเมลผู้รับ (รับค่าจาก body)
                subject: 'การแจ้งเตือน',
                html: `
                    <html>
                        <head>
                            <!-- เพิ่ม meta tag สำหรับการแสดงผลบนมือถือ -->
                            <meta name="viewport" content="width=device-width, initial-scale=1">
                        </head>
                        <body>
                            <div style="font-family: Arial, sans-serif; text-align: center; color: #333; padding: 20px;">
                                <h1 style="color: #000; font-size: 24px; margin-bottom: 20px;">LICENSE PLATE RECOGNITION</h1>
                                <div style="
                                    margin: 0 auto; 
                                    text-align: center; 
                                    background-color: white; 
                                    padding: 30px; 
                                    border-radius: 10px; 
                                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                                    border: 2px solid black; 
                                    max-width: 600px; 
                                ">
                                    <h2 style="font-size: 20px; color: #333; margin-top: 20px; font-weight: bold; line-height: 1.4;">
                                        แจ้งเตือนว่า คุณได้ทำการ${move}ที่จอดรถยนต์
                                    </h2>
                                    <p style="font-size: 16px; color: #333; font-weight: bold;">หมายเลขทะเบียน: ${detection_license_plate}</p>
                                    <p style="font-size: 16px; color: #333; font-weight: bold;">ณ เวลา: ${formattedDate}</p>
                                    <p style="font-size: 16px; color: #7f8c8d; font-weight: normal;">ขอบคุณที่ใช้บริการของเรา</p>
                                </div>
                            </div>
                        </body>
                    </html>
                    `
              };

              await transporter.sendMail(mailOptions);
            }
          }

          if (user && user[0]?.user_id) {  // ตรวจสอบว่า user มีค่าและ user[0] มี user_id
            const userId = user[0].user_id;
            const userWithCars = await prisma.user.findUnique({
              where: { user_id: userId },
              include: {
                cars: {
                  select: { license_plate: true },
                },
              },
            });

            if (userWithCars) {
              const logs = await prisma.detectionLog.findMany({
                where: {
                  detection_license_plate: {
                    in: userWithCars.cars.map((car) => car.license_plate),
                  },
                },
                select: {
                  detection_license_plate: true,
                  image_base64: true,
                  action: true,
                  detection_time: true,
                  detection_status: true,
                },
              });

              // จัดกลุ่มข้อมูลตามป้ายทะเบียน
              const groupedLogs = groupByLicensePlate(logs);
              const detectionRounds = generateDetectionRounds(groupedLogs);

              // จัดเรียงตามเวลาจากใหม่ -> เก่า
              detectionRounds.sort((a, b) => {
                const timeA = new Date(a.in_detection_time || a.out_detection_time);
                const timeB = new Date(b.in_detection_time || b.out_detection_time);
                return timeB - timeA; // ใหม่ -> เก่า
              });

              // เพิ่ม index ให้กับแต่ละ detectionRound
              detectionRounds.forEach((round, index) => {
                round.index = detectionRounds.length - index; // คำนวณ index เริ่มจากสูงสุด
              });

              // 📤 ส่งข้อมูลให้ User เจ้าของป้ายทะเบียน
              io.to(`user_${userId}`).emit("license_plate_updates", detectionRounds);
              console.log("📤 Sent update to user");

            } else {
              console.log('❌ User with cars not found');
            }
          } else {
            console.log('❌ User or user_id not found || The car is not registered.');
          }

          const limit = 20; // จำนวนข้อมูลต่อหน้า
          const page = 1;

          const logs_admin = await prisma.detectionLog.findMany({
            select: {
              detection_license_plate: true,
              image_base64: true,
              action: true,
              detection_time: true,
              detection_status: true,
            },
          });

          // จัดกลุ่มข้อมูลตามป้ายทะเบียน
          const groupedLogs = groupByLicensePlate(logs_admin);
          const detectionRounds = generateDetectionRounds(groupedLogs);

          // จัดเรียงตามเวลาจากใหม่ -> เก่า
          // detectionRounds.sort((a, b) => {
          //   const timeA = new Date(a.in_detection_time || a.out_detection_time);
          //   const timeB = new Date(b.in_detection_time || b.out_detection_time);
          //   return timeB - timeA; // ใหม่ -> เก่า
          // });
          // จัดเรียงตามเวลาจากใหม่ -> เก่า
          detectionRounds.sort((a, b) => {
            // ตรวจสอบว่าในทั้งสองค่านี้เป็นเวลาที่ถูกต้องหรือไม่
            const timeA = a.in_detection_time !== "ไม่พบข้อมูล" ? new Date(a.in_detection_time) : new Date(a.out_detection_time);
            const timeB = b.in_detection_time !== "ไม่พบข้อมูล" ? new Date(b.in_detection_time) : new Date(b.out_detection_time);

            // ตรวจสอบว่า timeA และ timeB เป็นเวลา valid หรือไม่
            if (isNaN(timeA)) timeA = new Date(0); // ถ้าไม่ใช่เวลา ให้ใช้ค่า default เป็นเวลา Unix 0
            if (isNaN(timeB)) timeB = new Date(0); // ถ้าไม่ใช่เวลา ให้ใช้ค่า default เป็นเวลา Unix 0

            return timeB - timeA; // ใหม่ -> เก่า
          });

          // ตั้งค่า filteredRounds ให้มีค่าเท่ากับ detectionRounds
          const filteredRounds = detectionRounds;

          // แบ่งหน้า
          const startIndex = (page - 1) * limit;
          const paginatedData = filteredRounds.slice(startIndex, startIndex + limit);

          // เพิ่ม index ให้กับแต่ละ detectionRound
          detectionRounds.forEach((round, index) => {
            round.index = detectionRounds.length - index; // คำนวณ index เริ่มจากสูงสุด
          });

          // เพิ่ม index ให้ข้อมูล
          paginatedData.forEach((round, index) => {
            round.index = filteredRounds.length - (page - 1) * limit - index;
          });

          // คำนวณจำนวนหน้าทั้งหมด
          const totalPages = Math.ceil(filteredRounds.length / limit);

          // ส่งข้อมูลกลับไปยัง Client ผ่าน WebSocket
          io.to("admin").emit("license_plate_updates_v2", {
            detectionRounds: paginatedData,
            totalPages,
            currentPage: page,
          });
          // console.log("pag:", paginatedData);
          // console.log("total", totalPages);
          console.log(`📤 Sent update to admin_v2`);

          // 📤 ส่งให้ Admin ทุกคน
          io.to("admin").emit("license_plate_updates", detectionRounds);

          console.log("📤 Sent update to admin_no1");

        } else {
          // ถ้าไม่มี user หรือ user_id ให้ส่งข้อมูลไปยังแอดมิน
          console.log('❌ User or user_id not found || The car is not registered.');

          const limit = 20; // จำนวนข้อมูลต่อหน้า
          const page = 1;

          // ดึงข้อมูล logs สำหรับแอดมิน
          const logs_admin = await prisma.detectionLog.findMany({
            select: {
              detection_license_plate: true,
              image_base64: true,
              action: true,
              detection_time: true,
              detection_status: true,
            },
          });

          // จัดกลุ่มข้อมูลสำหรับ Admin
          const groupedLogsAdmin = groupByLicensePlate(logs_admin);
          const detectionRoundsAdmin = generateDetectionRounds(groupedLogsAdmin);

          // จัดเรียงตามเวลาจากใหม่ -> เก่า
          detectionRoundsAdmin.sort((a, b) => {
            const timeA = new Date(a.in_detection_time || a.out_detection_time);
            const timeB = new Date(b.in_detection_time || b.out_detection_time);
            return timeB - timeA; // ใหม่ -> เก่า
          });

          // ตั้งค่า filteredRounds ให้มีค่าเท่ากับ detectionRoundsAdmin
          const filteredRounds = detectionRoundsAdmin;

          // แบ่งหน้า
          const startIndex = (page - 1) * limit;
          const paginatedData = filteredRounds.slice(startIndex, startIndex + limit);

          // เพิ่ม index ให้กับแต่ละ detectionRound
          detectionRoundsAdmin.forEach((round, index) => {
            round.index = detectionRoundsAdmin.length - index; // คำนวณ index เริ่มจากสูงสุด
          });

          // เพิ่ม index ให้ข้อมูล
          paginatedData.forEach((round, index) => {
            round.index = filteredRounds.length - (page - 1) * limit - index;
          });

          // คำนวณจำนวนหน้าทั้งหมด
          const totalPages = Math.ceil(filteredRounds.length / limit);

          // ส่งข้อมูลกลับไปยัง Client ผ่าน WebSocket
          io.to("admin").emit("license_plate_updates_v2", {
            detectionRounds: paginatedData,
            totalPages,
            currentPage: page,
          });
          // console.log("pag:", paginatedData);
          // console.log("total", totalPages);
          console.log(`📤 Sent update to admin_v2`);

          // 📤 ส่งข้อมูลให้ Admin ทุกคน
          io.to("admin").emit("license_plate_updates", detectionRoundsAdmin);
          console.log(`📤 Sent update to admin_no2`);

        }

      } catch (error) {
        console.error('Error fetching license plate logs:', error);
      }
    });

    ///////////////////////////////////////////////////////////////////

    // ฟัง WebSocket จากฝั่ง Client
    socket.on('get_license_plate', async () => {
      let logs;
      const userId = socket.data.userId;  // ดึง user_id จาก socket.data

      try {

        if (!userId) {
          return socket.emit('license_plate_updates', { error: 'user_id is required' });
        }

        const user = await prisma.user.findUnique({
          where: { user_id: Number(userId) },
          select: { role: true, user_id: true }  // ค้นหา role ของ user
        });

        if (user.role === 'user') {

          // ดึงข้อมูลผู้ใช้พร้อมกับทะเบียนรถ
          const userWithCars = await prisma.user.findUnique({
            where: { user_id: Number(userId) },
            include: {
              cars: {
                select: { license_plate: true },
              },
            },
          });

          if (!userWithCars) {
            return socket.emit('license_plate_updates', { error: 'No user found with this ID' });
          }

          // ดึงข้อมูล logs ที่เกี่ยวข้องกับทะเบียนรถของ user
          logs = await prisma.detectionLog.findMany({
            where: {
              detection_license_plate: {
                in: userWithCars.cars.map((car) => car.license_plate),
              },
            },
            select: {
              detection_license_plate: true,
              image_base64: true,
              action: true,
              detection_time: true,
            },
          });
        }
        else if (user.role === 'admin') {
          // ดึงข้อมูลจากฐานข้อมูล
          logs = await prisma.detectionLog.findMany({
            select: {
              detection_license_plate: true,
              image_base64: true,
              action: true,
              detection_time: true,
              detection_status: true
            },
          });

        } else {
          return socket.emit('license_plate_updates', { error: 'Invalid role' });
        }

        // จัดกลุ่มข้อมูลตามป้ายทะเบียน
        const groupedLogs = groupByLicensePlate(logs);
        const detectionRounds = generateDetectionRounds(groupedLogs);

        detectionRounds.sort((a, b) => {
          // ตรวจสอบว่าในทั้งสองค่านี้เป็นเวลาที่ถูกต้องหรือไม่
          const timeA = a.in_detection_time !== "ไม่พบข้อมูล" ? new Date(a.in_detection_time) : new Date(a.out_detection_time);
          const timeB = b.in_detection_time !== "ไม่พบข้อมูล" ? new Date(b.in_detection_time) : new Date(b.out_detection_time);

          // ตรวจสอบว่า timeA และ timeB เป็นเวลา valid หรือไม่
          if (isNaN(timeA)) timeA = new Date(0); // ถ้าไม่ใช่เวลา ให้ใช้ค่า default เป็นเวลา Unix 0
          if (isNaN(timeB)) timeB = new Date(0); // ถ้าไม่ใช่เวลา ให้ใช้ค่า default เป็นเวลา Unix 0

          return timeB - timeA; // ใหม่ -> เก่า
        });

        // เพิ่ม index ให้กับแต่ละ detectionRound
        detectionRounds.forEach((round, index) => {
          round.index = detectionRounds.length - index; // คำนวณ index เริ่มจากสูงสุด
        });

        // ส่งข้อมูลที่กรองแล้วไปยังฝั่ง Client
        socket.emit('license_plate_updates', detectionRounds);

      } catch (error) {
        console.error('Error fetching license plate logs:', error);
      }
    });


    //////////////////////////////////////////////////////////////////

    socket.on('get_data_user', async () => {
      const result = await getUserData();
      // ส่งข้อมูลที่กรองแล้วไปยังฝั่ง Client
      socket.emit('data_user_updates', result);
    });

    //////////////////////////////////////////////////////////////////

    socket.on('update_data', async () => {
      const result = await getUserData();
      // ส่งข้อมูลที่กรองแล้วไปยังฝั่ง Client
      io.emit('data_user_updates', result);
    });

    ///////////////////////////////////////////////////////////////
    //แบบมีการกรอง และแบ่งหน้า
    socket.on("get_license_plate_v2", async ({ page = 1, licensePlateFilter, dateFilter, startTimeFilter, endTimeFilter, statusFilter }) => {

      // แปลงค่าที่ได้รับเป็นค่าที่จะใช้กรอง
      const license_plate = licensePlateFilter;
      const date = dateFilter;
      const start_time = startTimeFilter;
      const end_time = endTimeFilter;
      const status = statusFilter;

      // console.log("Received filters:", { page, license_plate, date, start_time, end_time, status });

      try {
        const limit = 20; // จำนวนข้อมูลต่อหน้า

        // ดึงข้อมูลจากฐานข้อมูล
        const logs = await prisma.detectionLog.findMany({
          select: {
            detection_license_plate: true,
            image_base64: true,
            action: true,
            detection_time: true,
            detection_status: true,
          },
        });

        if (!logs || logs.length === 0) {
          return socket.emit("license_plate_updates", { message: "No detection logs found", totalPages: 0 });
        }

        // จัดกลุ่มข้อมูลตามป้ายทะเบียน
        const groupedLogs = groupByLicensePlate(logs);
        const detectionRounds = generateDetectionRounds(groupedLogs);

        // กรองข้อมูลตาม filter
        const filteredRounds = detectionRounds.filter((round) => {

          const licensePlateMatch = license_plate
            ? round.license_plate.toLowerCase().includes(license_plate.toLowerCase())
            : true;

          const logDate = round.in_detection_time ? new Date(round.in_detection_time) : new Date(round.out_detection_time);
          const selectedDate = new Date(date);
          const isDateMatch = date ? logDate.toDateString() === selectedDate.toDateString() : true;

          const logTime = round.in_detection_time
            ? new Date(round.in_detection_time).toLocaleTimeString().slice(0, 5)
            : null;

          const timeMatch =
            start_time && end_time
              ? logTime && logTime >= start_time && logTime <= end_time
              : true;

          const statusMatch =
            status ? round.in_detection_status === status || (status === "ผิดปกติ" && !round.in_detection_status) : true;

          return licensePlateMatch && isDateMatch && timeMatch && statusMatch;
        });

        // จัดเรียงข้อมูลจากใหม่ไปเก่า
        filteredRounds.sort((a, b) => {
             // ตรวจสอบว่าในทั้งสองค่านี้เป็นเวลาที่ถูกต้องหรือไม่
             const timeA = a.in_detection_time !== "ไม่พบข้อมูล" ? new Date(a.in_detection_time) : new Date(a.out_detection_time);
             const timeB = b.in_detection_time !== "ไม่พบข้อมูล" ? new Date(b.in_detection_time) : new Date(b.out_detection_time);
   
             // ตรวจสอบว่า timeA และ timeB เป็นเวลา valid หรือไม่
             if (isNaN(timeA)) timeA = new Date(0); // ถ้าไม่ใช่เวลา ให้ใช้ค่า default เป็นเวลา Unix 0
             if (isNaN(timeB)) timeB = new Date(0); // ถ้าไม่ใช่เวลา ให้ใช้ค่า default เป็นเวลา Unix 0
   
             return timeB - timeA; // ใหม่ -> เก่า
        });
      
        // แบ่งหน้า
        const startIndex = (page - 1) * limit;
        const paginatedData = filteredRounds.slice(startIndex, startIndex + limit);

        // เพิ่ม index ให้ข้อมูล
        paginatedData.forEach((round, index) => {
          round.index = filteredRounds.length - (page - 1) * limit - index;
        });

        // คำนวณจำนวนหน้าทั้งหมด
        const totalPages = Math.ceil(filteredRounds.length / limit);

        // ส่งข้อมูลกลับไปยัง Client ผ่าน WebSocket
        socket.emit("license_plate_updates_v2", {
          detectionRounds: paginatedData,
          totalPages,
          currentPage: page,
        });

      } catch (error) {
        console.error("Error fetching data:", error);
        socket.emit("license_plate_updates", { error: error.message });
      }
    });

    ///////////////////////////////////////////////////////////////

    // เมื่อ client ปิดการเชื่อมต่อ
    socket.on('disconnect', () => {
      console.log('Client disconnected: ' + socket.id);
    });

  });

  expressApp.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });

  module.exports = io;
});