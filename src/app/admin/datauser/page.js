"use client";
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from "next/navigation";
import Link from 'next/link';
import axios from 'axios';
import SmallLoading from "../../smalloading";
import React from "react";
import { showToast } from '../../components/Toast';
import io from 'socket.io-client';

export default function DataUser() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [errorTable, setErrorTable] = useState(null);
    const [succeedMessage, setSucceedMessage] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [userId, setUserId] = useState(null);
    const [carId, setCarId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);  // หน้าปัจจุบัน
    const [itemsPerPage] = useState(10);  // แก้ไขเลขตรงนี้ถ้าจะกำหนดข้อมูลที่แสดงต่อหน้า
    const [selectedOption, setSelectedOption] = useState("");
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // คำนวณตำแหน่งเริ่มต้นและสิ้นสุดของข้อมูลที่จะแสดงในหน้าปัจจุบัน
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

    // คำนวณจำนวนหน้า
    const totalPages = Math.ceil(data.length / itemsPerPage);

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

        // ส่ง user_id ไปยังเซิร์ฟเวอร์เพื่อดึงข้อมูล
        socket.emit('get_data_user');

        // ฟังข้อมูลที่ได้รับจาก server
        socket.on('data_user_updates', (data) => {
            setData(data);
            // showToast("มีการอัปเดตข้อมูล", 'success');
            setLoading(false);  // เมื่อข้อมูลถูกดึงมาจาก server แล้ว
            // console.log('Data:', data);
        });

        // เมื่อ component ถูก unmount ให้ลบ event listener
        return () => {
            socket.off("get_data_user");
            socket.off("update_data");
        };
    }, []);


    const handleDeleteClick = (id, carId) => {
        setUserId(id);
        setCarId(carId);
        setShowModal(true);
    };

    const handleConfirmDelete = async () => {
        try {
            if (selectedOption === "user") {
                // ลบผู้ใช้
                if (!userId) {
                    setError("ไม่พบ ID ของผู้ใช้ที่ต้องการลบ");
                    return;
                }
                const response = await axios.delete(`/api/ad_edit?user_id=${userId}`);
                if (response.status === 200) {
                    setData((prevData) => prevData.filter((item) => item.user_id !== userId));
                    showToast(`${response.data.message}`, 'success');
                    setTimeout(() => {
                        setShowModal(false);
                    }, 500);
                } else {
                    setError("ไม่สามารถลบผู้ใช้ได้");
                }
            } else if (selectedOption === "car") {
                // ลบรถ
                if (!carId || carId === "ไม่มีข้อมูล") {
                    setError("ไม่พบข้อมูลรถยนต์!!");
                    return;
                }
                const response = await axios.delete(`/api/car/${carId}`);
                if (response.status === 200) {
                    setData((prevData) => prevData.filter((item) => item.car_id !== carId));
                    showToast(`${response.data.message}`, 'success');
                    setTimeout(() => {
                        setShowModal(false);
                    }, 500);
                } else {
                    setError("ไม่สามารถลบรถได้");
                }
            }
            socket.emit('update_data');
        } catch (error) {
            console.error("Error deleting data:", error.message);
            alert("เกิดข้อผิดพลาดในการลบข้อมูล");
        }

    };

    const handleCancel = () => {
        setError("")
        setSucceedMessage("")
        setShowModal(false);
    };

    const handleEditClick = (car_id, user_id) => {
        if (car_id === "ไม่มีข้อมูล") {
            const query = new URLSearchParams({ user_id: user_id }).toString();
            router.push(`/admin/datauser/addcaruser?${query}`);
        }
        else {
            const query = new URLSearchParams({ car_id: car_id }).toString();
            router.push(`/admin/datauser/edituser?${query}`);
        }
    };
    const handleAddClick = () => {
        router.push("/admin/datauser/adduser");
    };


    // ฟังก์ชันเปลี่ยนหน้า
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };


    return (
        <main className="flex min-h-screen bg-customBackGround">
            <section className={`flex-1 transition-all p-6 ${isSidebarOpen ? "ml-[250px]" : "ml-16"} md:ml-[250px]`}>
                <div className="flex-1 flex-col p-6">
                    <div>
                        <div className="relative  w-full sm:w-[500px] md:w-full md:h-[150px] bg-white rounded-[20px] flex  justify-center items-center  p-8 space-y-4    ">
                            <h1 className="text-3xl md:text-6xl  font-semibold text-center text-customTextHead" style={{ textShadow: "4px 4px 6px rgba(0, 0, 0, 0.2)" }}>
                                รายการข้อมูลสมาชิก
                            </h1>
                        </div>
                    </div>

                    {/* <div className="flex justify-end items-center  mt-5">
                    <div className="flex items-center bg-white rounded-[20px] p-1">
                        <span className="m-2">เพิ่มสมาชิก</span>
                        <Link href="/admin/datauser/adduser">
                            <FontAwesomeIcon
                                icon={faCirclePlus}
                                size="2x"
                                style={{ color: "#04b919" }}
                            />
                        </Link>
                    </div>
                </div> */}
                    <div className=" text-right px-6  my-5">
                        <button
                            className="bg-green-500 text-white px-6 py-2 rounded-lg"
                            onClick={() => handleAddClick()}
                        >
                            เพิ่มสมาชิก
                        </button>
                    </div>

                    <div className="flex items-center w-full h-[105px] bg-white shadow-md mt-1 rounded-[20px] px-2">
                        {/* Header */}
                        <div className="grid grid-cols-8 w-full bg-white text-left">
                            <div className="text_ad_data px-4 py-2 text-center">ลำดับ</div>
                            <div className="text_ad_data px-4 py-2">ชื่อ-นามสกุล</div>
                            {/* <div className="text_ad_data px-4 py-2">สถานะ</div> */}
                            <div className="text_ad_data px-4 py-2">ยี่ห้อของรถยนต์</div>
                            <div className="text_ad_data px-4 py-2">รุ่นของรถยนต์</div>
                            <div className="text_ad_data px-4 py-2">สีของรถยนต์</div>
                            <div className="text_ad_data px-4 py-2">หมายเลขป้ายทะเบียน</div>
                            <div className="text_ad_data px-4 py-2">ป้ายจังหวัด</div>
                            <div className="text_ad_data px-4 py-2 text-center">การจัดการ</div>
                        </div>
                    </div>
                    <div className="bg-white px-2 py-10 rounded-[20px] shadow-lg w-full mx-auto mt-2">
                        {errorTable && <div className="text-red-500 mb-4 text-center">{errorTable}</div>}
                        {loading ? (
                            <SmallLoading />
                        ) : currentItems.length === 0 ? (
                            <p className="text-black mt-3   text-center">ไม่มีผู้ใช้งาน</p>
                        ) : (
                            currentItems.map((item, index) => (
                                <div key={item.user_id} className="grid grid-cols-8 gap-2 hover:bg-gray-50 border-b py-2">
                                    {/* ลำดับและชื่อเจ้าของ (rowSpan เทียบเท่า) */}
                                    <div
                                        className="text-center flex items-center justify-center"
                                        style={{ gridRow: `span ${item.cars.length}` }}
                                    >
                                        {data.length - indexOfFirstItem - index}
                                    </div>
                                    <div
                                        className=" flex items-center"
                                        style={{ gridRow: `span ${item.cars.length}` }}
                                    >
                                        {item.firstname} {item.lastname}
                                    </div>
                                    {/* <div
                                    className=" flex items-center px-4 "
                                    style={{ gridRow: `span ${item.cars.length}` }}
                                >
                                    {item.status}
                                </div> */}

                                    {/* ตรวจสอบว่ามีรถหรือไม่ */}
                                    {item.cars && item.cars.length > 0 && item.cars[0].car_id !== "ไม่มีข้อมูลรถยนต์ในระบบ" ? (
                                        <>
                                            {/* รถคันแรก */}
                                            <div className="px-4 py-5">{item.cars[0].car_brand}</div>
                                            <div className="px-4 py-5">{item.cars[0].car_model}</div>
                                            <div className="px-4 py-5">{item.cars[0].car_color}</div>
                                            <div className="px-4 py-5">{item.cars[0].license_plate}</div>
                                            <div className="px-4 py-5">{item.cars[0].province_plate}</div>
                                            <div className="px-4 py-2 flex justify-center space-x-2">
                                                <button
                                                    onClick={() => handleEditClick(item.cars[0].car_id)}
                                                    className="text-blue-500"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(item.user_id, item.cars[0].car_id)}
                                                    className="text-red-500"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>

                                            {/* รถคันที่เหลือ */}
                                            {item.cars.slice(1).map((car) => (
                                                <React.Fragment key={car.car_id}>
                                                    <div className="px-4 py-5">{car.car_brand}</div>
                                                    <div className="px-4 py-5">{car.car_model}</div>
                                                    <div className="px-4 py-5">{car.car_color}</div>
                                                    <div className="px-4 py-5">{car.license_plate}</div>
                                                    <div className="px-4 py-5">{car.province_plate}</div>
                                                    <div className="px-4 py-2 flex justify-center space-x-2">
                                                        <button
                                                            onClick={() => handleEditClick(car.car_id)}
                                                            className="text-blue-500"
                                                        >
                                                            <FontAwesomeIcon icon={faEdit} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(item.user_id, car.car_id)}
                                                            className="text-red-500"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    </div>
                                                </React.Fragment>
                                            ))}
                                        </>
                                    ) : (
                                        <>
                                            <div className="col-span-5 text-center text-red-600 px-4 py-5">
                                                ไม่มีข้อมูลรถยนต์ในระบบ
                                            </div>
                                            <div className="px-4 py-2 flex justify-center space-x-2">
                                                <button
                                                    onClick={() => handleEditClick("ไม่มีข้อมูล", item.user_id)}
                                                    className="text-blue-500"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(item.user_id)}
                                                    className="text-red-500"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        )}

                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-center my-4">
                        {currentPage > 1 && (
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                className="px-4 py-2 text-sm  bg-blue-500 text-white  rounded-md  disabled:cursor-not-allowed"
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                        )}
                        <div className="px-4 py-2 text-gray-700">
                            {Array.from({ length: totalPages }, (_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentPage(index + 1)}
                                    className={`px-4 py-2 mx-1 text-sm rounded ${currentPage === index + 1
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 text-gray-700"
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                        {currentPage < totalPages && (
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-sm  bg-blue-500 text-white  rounded-md  disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        )}
                    </div>

                    {/* ป๊อปอัปยืนยันการลบ */}
                    {showModal && (
                        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
                            <div className="bg-white p-6 rounded-[50px] md:w-[550px] md:h-[300px] flex flex-col justify-center items-center">
                                <h2 className="text-lg text-center mb-4">คุณต้องการลบข้อมูลอะไร?</h2>
                                <div className="w-full flex flex-col items-center">
                                    <select
                                        className="w-[80%] bg-gray-100 border border-gray-300 rounded-lg py-2 px-4 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedOption}
                                        onChange={(e) => setSelectedOption(e.target.value)}
                                    >
                                        <option value="" disabled>กรุณาเลือก</option>
                                        <option value="user">ลบผู้ใช้</option>
                                        <option value="car">ลบรถ</option>
                                    </select>
                                    {error && <p className="text-red-500  mt-3   text-center">{error}</p>}
                                    {succeedMessage && <p className="text-green-500 mt-3 text-center">{succeedMessage}</p>}
                                    <div className="mt-6 flex space-x-4">
                                        <button
                                            onClick={handleConfirmDelete}
                                            className="bg-customBtGreen text-black py-2 px-4 rounded-lg hover:bg-green-500 focus:outline-none focus:ring-2"
                                            disabled={!selectedOption}
                                        >
                                            ยืนยัน
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="bg-customBtRed text-white py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2"
                                        >
                                            ยกเลิก
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}