"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { showToast } from '../../../components/Toast';
import io from 'socket.io-client';

export default function AddCar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [carData, setCarData] = useState({
    car_brand: "",
    car_model: "",
    car_color: "",
    license_plate: "",
    province_plate: "",
  });

  // เชื่อมต่อกับ WebSocket ที่เซิร์ฟเวอร์
  const socket = io("https://rec.licenseplate.pro", {
    path: "/socket.io/",
    transports: ["websocket"],
  });

  useEffect(() => {

    // ฟังการเชื่อมต่อ
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    // เมื่อ component ถูก unmount ให้ลบ event listener
    return () => {
      socket.off("update_data");
    };
  }, []);

  const handleSubmit = async (e) => {

    setErrorMessage("");
    e.preventDefault();

    // ฟิลด์ที่ต้องการตรวจสอบ
    const requiredFields = ["car_brand", "car_model", "car_color", "license_plate", "province_plate"];

    // ตรวจสอบว่าฟิลด์ที่จำเป็นมีค่าว่างหรือไม่
    if (requiredFields.some(field => !carData?.[field] || String(carData[field]).trim() === "")) {
      setErrorMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (status === "authenticated" && session?.user?.user_id) {
      try {
        const response = await axios.post(`/api/car/user/${session.user.user_id}`,
          carData, // ส่งข้อมูลรถยนต์ที่กรอกในฟอร์ม
        );
        // console.log("Car data to be sent:", carData);
        if (response.status === 200 || response.status === 201) {
          showToast(`${response.data.message}`, 'success');
          router.replace("/user/datacar");

        } else {
          showToast(`${response.data.message}`, 'error');
          setErrorMessage(response.data.message);
        }
        socket.emit('update_data');
      } catch (error) {
        showToast(`${error.response?.data?.message}`, 'error');
        setErrorMessage(error.response?.data?.message);
      }

    }
  };
  const handleCancel = () => {
    router.push("/user/datacar");
  };


  return (
    <main className="bg-white min-h-screen relative overflow-x-hidden">
      {/* วงรีครึ่งหนึ่ง */}
      <div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[123%] h-screen bg-customBackGround"
        style={{ clipPath: "ellipse(25% 70% at 15% 10%)" }}
      ></div>
      <div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[123%] h-screen bg-customBackGround"
        style={{ clipPath: "ellipse(30% 66% at 50% 0%)" }}
      ></div>
      <div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[123%] h-screen bg-customBackGround"
        style={{ clipPath: "ellipse(21% 50% at 78% 0%)" }}
      ></div>

      <div className="mt-24 md:mt-32">
        <div className="relative flex  h-full items-center  justify-center ">
          <h1 className="text-3xl md:text-6xl  font-semibold text-center text-customTextHead" style={{ textShadow: "4px 4px 6px rgba(0, 0, 0, 0.2)" }}>
            เพิ่มข้อมูลรถยนต์
          </h1>
        </div>
      </div>

      <div className="flex justify-center mt-12">
        <form onSubmit={handleSubmit}>
          <div className="relative w-full sm:w-[500px] md:w-[800px] md:h-[515px] bg-white rounded-[90px]  flex-col justify-center p-8 space-y-4" style={{ boxShadow: "0 4px 60px 10px rgba(0, 0, 0, 0.25)" }}>
            <div className="flex flex-col w-auto">
              <div className="space-y-8 mt-6">
                {["car_brand", "car_model", "car_color", "license_plate", "province_plate"].map((field) => (
                  <div key={field} className="flex items-center justify-center mt-4">
                    <label htmlFor={field} className="text_subreg w-60">
                      {field === "car_brand" && "ยี่ห้อรถยนต์"}
                      {field === "car_model" && "รุ่นรถยนต์"}
                      {field === "car_color" && "สีของรถยนต์"}
                      {field === "license_plate" && "หมายเลขป้ายทะเบียนรถยนต์"}
                      {field === "province_plate" && "ป้ายจังหวัด"}
                    </label>
                    <input
                      type="text"
                      id={field}
                      name={field}
                      className="w-64 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder={
                        field === "car_brand" ? "กรอกยี่ห้อรถยนต์" :
                          field === "car_model"
                            ? "กรอกรุ่นรถยนต์"
                            : field === "car_color"
                              ? "กรอกสีของรถยนต์"
                              : field === "license_plate"
                                ? "กรอกหมายเลขป้ายทะเบียนรถยนต์"
                                : field === "province_plate"
                                  ? "กรอกป้ายจังหวัด"
                                  : ""
                      }
                      value={carData[field]}
                      onChange={(e) => setCarData({ ...carData, [field]: e.target.value })}
                      // required
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* Error Message */}
            {errorMessage && (
              <div className="flex justify-center items-center ">
                <p className="text-red-500">{errorMessage}</p>
              </div>
            )}
          </div>

          <div className="flex justify-center space-x-4  py-8 relative ">
            <button
              type="submit"
              className="text-base font-normal w-[140px] h-[50px] py-3 bg-customBtGreen text-center text-black rounded-[20px] hover:bg-green-500 focus:outline-none focus:ring-2"
            >
              ยืนยัน
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="text-base font-normal w-[140px] h-[50px] py-3 bg-customBtRed  text-center text-white rounded-[20px] hover:bg-gray-400 focus:outline-none focus:ring-2"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
