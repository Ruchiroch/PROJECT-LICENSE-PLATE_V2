"use client";
import { faCirclePlus, faEdit, faTrash, } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from "next/navigation";
import SmallLoading from "../../smalloading";
import { showToast } from '../../components/Toast';
import io from 'socket.io-client';

export default function DataCar() {
  const [carData, setCarData] = useState([]);
  const { data: session, status } = useSession();  // ดึง session ข้อมูลจาก NextAuth
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);  // สำหรับการแสดง/ซ่อนป๊อบอัพ
  const [carIdToDelete, setCarIdToDelete] = useState(null);  // เก็บ car_id ที่ต้องการลบ
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // เชื่อมต่อกับ WebSocket ที่เซิร์ฟเวอร์
  const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

  // ดึงข้อมูลจาก API เมื่อ Component ถูกเรนเดอร์
  useEffect(() => {

    // ฟังการเชื่อมต่อ
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    if (status === "authenticated" && session?.user?.user_id) {
      const fetchCars = async () => {
        try {
          const response = await axios.get(`/api/car/user/${session.user.user_id}`);

          if (response.status === 200) {
            if (response.data.length === 0) {
              // ไม่มีข้อมูลรถ
              setMessage('ยังไม่มีข้อมูลรถยนต์ในระบบ กรุณาเพิ่มข้อมูลรถยนต์ใหม่');
            } else {
              setCarData(response.data); // อัปเดต state ของ carData
              setMessage(''); // เคลียร์ข้อความเมื่อมีข้อมูล
            }
          } else {
            throw new Error('Failed to fetch cars');
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            setMessage('ไม่พบข้อมูลรถยนต์ในระบบ กรุณาเพิ่มข้อมูลรถยนต์ใหม่');
          } else {
            setMessage('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
          }
        } finally {
          setLoading(false); // ปิดสถานะกำลังโหลดเมื่อข้อมูลโหลดเสร็จ
        }
      };

      fetchCars();
    }
    // เมื่อ component ถูก unmount ให้ลบ event listener
    return () => {
      socket.off("update_data");
    };
  }, [status, session]);

  const handleDeleteClick = (id) => {
    setCarIdToDelete(id);  // เก็บ id ของรถที่จะลบ
    setShowModal(true);  // แสดงป๊อบอัพ
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`/api/car/${carIdToDelete}`);
      if (response.status === 200) {
        setCarData(carData.filter(car => car.car_id !== carIdToDelete));
        showToast(`${response.data.message}`, 'success');
        setShowModal(false);
        socket.emit('update_data');
      } else {
        showToast('เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
      }
    } catch (error) {
      console.error("Error deleting car data:", error);
      showToast('ไม่สามารถลบข้อมูลได้ กรุณาลองใหม่อีกครั้ง', 'error');
    }
  };

  const handleCancel = () => {
    setShowModal(false);  // ซ่อนป๊อบอัพ
  };

  const handleEditClick = (car_id) => {
    const query = new URLSearchParams({ car_id: car_id }).toString(); // สร้าง query string
    router.push(`/user/datacar/editcar?${query}`); // ส่ง URL เป็นสตริง
  };

  return (
    <main className="bg-white min-h-screen relative overflow-hidden">
      {/* วงรีครึ่งหนึ่ง */}
      <div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[123%] h-screen bg-customBackGround"
        style={{ clipPath: "ellipse(35% 75% at 20% 0)" }}
      ></div>

      <div className="mt-24 md:mt-32">
        <div className="relative flex justify-center  items-center px-12 gap-5">
          <h1 className="text-3xl md:text-6xl  font-semibold text-center text-customTextHead" style={{ textShadow: "4px 4px 6px rgba(0, 0, 0, 0.2)" }}>
            รายการข้อมูลรถยนต์
          </h1>
          <Link href="/user/datacar/addcar" className="flex justify-center">
            <FontAwesomeIcon
              icon={faCirclePlus}
              size="3x"
              style={{
                color: "#04b919",
              }}
              className="w-12 h-12 sm:w-16 sm:h-16  "
            />
          </Link>
        </div>
      </div>

      <div className="flex justify-center mt-12">
        <div
          className=" relative w-full sm:w-[500px] md:w-[1168px]  bg-white rounded-[90px] flex justify-center p-8 space-y-4"
          style={{ boxShadow: "0  4px 60px 10px rgba(0, 0, 0, 0.25)" }}
        >
          <div className="container mx-auto p-4">
            <table className="min-w-full  rounded-lg overflow-hidden">
              <thead className="text-lg font-normal text-black">
                <tr>
                  <th className="border-b border-gray-300 py-2 px-5 text-center">ลำดับ</th>
                  <th className="border-b border-gray-300 py-2 px-5 text-center">ยี่ห้อของรถยนต์</th>
                  <th className="border-b border-gray-300 py-2 px-5 text-center">รุ่นของรถยนต์</th>
                  <th className="border-b border-gray-300 py-2 px-5 text-center">สีของรถยนต์</th>
                  <th className="border-b border-gray-300 py-2 px-5 text-center">หมายเลขป้ายทะเบียน</th>
                  <th className="border-b border-gray-300 py-2 px-5 text-center">ป้ายจังหวัด</th>
                  <th className="border-b border-gray-300 py-2 px-5 text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">

                {loading ? (
                  <tr className="w-full">
                    <td colSpan="7" className="py-7 px-6 text-center">
                      <SmallLoading />
                    </td>
                  </tr>
                ) : message ? (
                  <tr className="w-full">
                    <td colSpan="7" className="py-7 px-6 text-center text-gray-500">
                      {message}
                    </td>
                  </tr>
                ) : (
                  carData
                    .sort((a, b) => a.car_id - b.car_id)
                    .map((car, index) => (
                      <tr key={car.car_id} className="hover:bg-gray-50 py-10 ">
                        <td className="border-b border-gray-300 px-4 py-8 text-center ">{index + 1}</td>
                        <td className="border-b border-gray-300 px-4 py-8 text-center">{car.car_brand}</td>
                        <td className="border-b border-gray-300 px-4 py-8 text-center">{car.car_model}</td>
                        <td className="border-b border-gray-300 px-4 py-8 text-center">{car.car_color}</td>
                        <td className="border-b border-gray-300 px-4 py-8 text-center">{car.license_plate}</td>
                        <td className="border-b border-gray-300 px-4 py-8 text-center">{car.province_plate}</td>
                        <td className="border-b border-gray-300 px-4 py-8 text-center">
                          <button onClick={() => handleEditClick(car.car_id)} className="text-blue-500 mr-2">
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button onClick={() => handleDeleteClick(car.car_id)} className="text-red-500">
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* ป๊อบอัพยืนยันการลบ */}
      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-[50px] md:w-[550px] md:h-[250px] flex flex-col justify-center items-center ">
            <h2 className="text-lg text-center">คุณต้องการลบข้อมูลรถยนต์จริงหรือไม่?</h2>
            <div className="mt-4 ">
              <button
                onClick={handleDelete}
                className="bg-customBtGreen text-black py-2 px-4  mr-2 rounded-lg  hover:bg-green-500 focus:outline-none focus:ring-2 "
              >
                ยืนยัน
              </button>
              <button
                onClick={handleCancel}
                className="bg-customBtRed text-white py-2 px-4 rounded-lg  hover:bg-gray-400 focus:outline-none focus:ring-2"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
