"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import SmallLoading from "@/app/smalloading";
import { showToast } from '../../../components/Toast';
import io from 'socket.io-client';

export default function EditCar() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [carData, setCarData] = useState({
    car_brand: "",
    car_model: "",
    car_color: "",
    license_plate: "",
    province_plate: "",
  });

  const searchParams = useSearchParams();
  const carId = searchParams.get("car_id"); // ดึง car_id จาก URL query string
  const socket = io("https://rec.licenseplate.pro", {
    path: "/socket.io/",
    transports: ["websocket"],
  });

  useEffect(() => {

    // ฟังการเชื่อมต่อ
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    if (carId) {
      const fetchCarData = async () => {
        try {
          const response = await axios.get(`/api/car/${carId}`);
          setCarData(response.data[0]);
        } catch (error) {
          setErrorMessage(error.response?.data?.message);
        } finally {
          setLoading(false);
        }
      };
      fetchCarData();
    }
    // เมื่อ component ถูก unmount ให้ลบ event listener
    return () => {
      socket.off("update_data");
    };
  }, [carId]);

  // console.log(carData);
  // console.log(carId);

  if (!carData) return <div>Loading...</div>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCarData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    // console.log("ข้อมูลที่ส่ง:", carData);
    // ฟิลด์ที่ต้องการตรวจสอบ
    const requiredFields = ["car_brand", "car_model", "car_color", "license_plate", "province_plate"];

    // ตรวจสอบว่าฟิลด์ที่จำเป็นมีค่าว่างหรือไม่
    if (requiredFields.some(field => !carData?.[field] || String(carData[field]).trim() === "")) {
      setErrorMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    try {
      const response = await axios.put(`/api/car/${carId}`, carData);
      if (response.status === 200) {
        showToast(`${response.data.message}`, 'success');
        router.replace('/user/datacar');
        socket.emit('update_data');
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message);
    }
  };

  const handleCancel = () => {
    router.push("/user/datacar");
  };

  return (
    <main className="bg-white min-h-screen relative  overflow-x-hidden">
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
        <div className="relative flex h-full items-center justify-center">
          <h1 className="text-3xl md:text-6xl  font-semibold text-center text-customTextHead" style={{ textShadow: "4px 4px 6px rgba(0, 0, 0, 0.2)" }}>
            แก้ไขข้อมูลรถยนต์
          </h1>
        </div>
      </div>
      <div className="flex justify-center mt-12">
        <form onSubmit={handleSubmit}>
          <div
            className="relative w-full sm:w-[500px] md:w-[800px] md:h-[515px] bg-white rounded-[90px] flex flex-col justify-center p-8 space-y-4"
            style={{ boxShadow: "0 4px 60px 10px rgba(0, 0, 0, 0.25)" }}
          >
            {loading ? (
              <div className="flex justify-center items-center py-6">
                <SmallLoading />
              </div>
            ) : (
              <div className="flex flex-col w-auto ">
                <div className="space-y-8">
                  {["car_brand", "car_model", "car_color", "license_plate", "province_plate"].map((field, index) => (
                    <div className="flex items-center justify-center mt-4 " key={index}>
                      <label htmlFor={field} className="text_subreg w-60 ">
                        {field === "car_brand"
                          ? "ยี่ห้อรถยนต์"
                          : field === "car_model"
                            ? "รุ่นรถยนต์"
                            : field === "car_color"
                              ? "สีของรถยนต์"
                              : field === "license_plate"
                                ? "หมายเลขป้ายทะเบียนรถยนต์"
                                : "ป้ายจังหวัด"}
                      </label>
                      <input
                        type="text"
                        id={field}
                        name={field}
                        value={carData[field] || ""}
                        onChange={handleChange}
                        className="w-64 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                        placeholder={`กรอก${field}`}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
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
