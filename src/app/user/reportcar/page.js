"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSession } from 'next-auth/react';
import SmallLoading from "../../smalloading";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';


export default function MyComponent() {
    const { data: session, status } = useSession(); // ดึง session ข้อมูลของผู้ใช้งาน
    const [data, setData] = useState([]);
    const [userId, setUserId] = useState('');  // ใช้ userId เพื่อค้นหาข้อมูล
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage] = useState(10);
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const [maxPagesToShow, setMaxPagesToShow] = useState(5);

    const [dateFilter, setDateFilter] = useState("");
    const [startTimeFilter, setStartTimeFilter] = useState("");
    const [endTimeFilter, setEndTimeFilter] = useState("");


    useEffect(() => {
        // ตรวจสอบว่า session พร้อมแล้ว (authenticated)
        if (status === 'authenticated' && session.user?.user_id) {
            setUserId(session.user.user_id); // ตั้งค่า userId จาก session เมื่อ login สำเร็จ
        }
    }, [status, session]); // คอยตรวจสอบสถานะ session

    useEffect(() => {
        const socket = io("https://rec.licenseplate.pro", {
            path: "/socket.io/",
            transports: ["websocket"],
        });

        if (userId) {
            // ฟังการเชื่อมต่อ
            socket.on('connect', () => {
                console.log('Connected to server');
                console.log('Client connected: ', socket.id);
            });

            socket.emit("joinRoom", "user", userId);
            // ส่ง user_id ไปยังเซิร์ฟเวอร์เพื่อดึงข้อมูล
            socket.emit('get_license_plate', { userId });

            // รับข้อมูลจากเซิร์ฟเวอร์เมื่อมีการอัปเดต
            socket.on('license_plate_updates', (data) => {
                if (data) {
                    setData(data);
                    // console.log(data);
                    setLoading(false);
                }
            });

            // ลบ event listener เมื่อ component ถูกทำลาย
            return () => {
                socket.off('license_plate_updates'); // ลบ listener
            };
        }
    }, [userId]);

    const convertToThaiDate = (date) => {
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0'); // วัน
        const month = (d.getMonth() + 1).toString().padStart(2, '0'); // เดือน
        const year = d.getFullYear(); // ปี

        const hours = d.getHours().toString().padStart(2, '0'); // ชั่วโมง
        const minutes = d.getMinutes().toString().padStart(2, '0'); // นาที
        const seconds = d.getSeconds().toString().padStart(2, '0'); // วินาที

        return `${day}/${month}/${year}  ${hours}:${minutes}:${seconds}`;
    };

    // การกรองข้อมูล
    const filteredData = data.filter((round) => {
        // กรองตามวันที่
        const logDate = new Date(round.in_detection_time);
        const selectedDate = new Date(dateFilter);
        const isDateMatch = dateFilter ? logDate.toDateString() === selectedDate.toDateString() : true;

        // กรองตามเวลา
        const logTime = round.in_detection_time ? new Date(round.in_detection_time).toLocaleTimeString().slice(0, 5) : null;
        const timeMatch = startTimeFilter && endTimeFilter
            ? logTime && logTime >= startTimeFilter && logTime <= endTimeFilter
            : true;

        return isDateMatch && timeMatch;
    });

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

    const viewClick = (index, licensePlate) => {
        const query = new URLSearchParams({ index, license_plate: licensePlate }).toString();
        router.push(`/user/reportcar/viewdetailed_u?${query}`);
    };

    const generatePageNumbers = () => {
        const pageNumbers = [];

        // คำนวณหน้าที่จะเริ่มต้นแสดง โดยพยายามให้ currentPage อยู่ตรงกลาง
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));

        // คำนวณหน้าที่จะเป็นหน้าสุดท้ายที่แสดง
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        // ตรวจสอบว่า startPage กับ endPage ครอบคลุมจำนวนหน้าที่ต้องการหรือไม่
        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        // ถ้า startPage ไม่ใช่ 1 แสดงว่ามีหน้าก่อนหน้านี้ที่ไม่แสดง ให้เพิ่ม "..." 
        if (startPage > 1) pageNumbers.push("...");

        // เพิ่มเลขหน้าทั้งหมดที่อยู่ในช่วง startPage ถึง endPage ลงไปในอาร์เรย์
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        // ถ้า endPage ยังไม่ถึง totalPages แสดงว่ามีหน้าหลังจากนี้ที่ไม่แสดง ให้เพิ่ม "..." 
        if (endPage < totalPages) pageNumbers.push("...");

        // คืนค่ารายการหมายเลขหน้าที่จะใช้แสดงผล
        return pageNumbers;
    };

    return (
        <main className="relative bg-white min-h-screen overflow-x-hidden">
           
            <div className="mt-24 md:mt-32">
                <div className="relative flex h-full items-center justify-center">
                    <h1 className="text-3xl md:text-6xl font-semibold text-center text-customTextHead" style={{ textShadow: "4px 4px 6px rgba(0, 0, 0, 0.2)" }}>
                        รายงานการใช้งาน
                    </h1>
                </div>
            </div>

            <div className=" relative min-h-screen flex flex-col items-center  mt-12  ">
                <div className=" w-full sm:w-[500px] md:w-[800px] lg:w-[1000px] max-w-full bg-white rounded-[90px] flex justify-center p-8 space-y-4 z-10 mb-10" style={{ boxShadow: "0  4px 60px 10px rgba(0, 0, 0, 0.25)" }}>

                    <div className='flex flex-col'>
                        {/* ฟอร์มกรองวันที่และเวลา */}
                        <div className=" flex justify-end items-center gap-1 mb-4">
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="px-4 py-2 border rounded-lg"
                            />
                            <input
                                type="time"
                                value={startTimeFilter}
                                onChange={(e) => setStartTimeFilter(e.target.value)}
                                className="px-4 py-2 border rounded-lg"
                            />
                            <input
                                type="time"
                                value={endTimeFilter}
                                onChange={(e) => setEndTimeFilter(e.target.value)}
                                className="px-4 py-2 border rounded-lg"
                            />
                            <button
                                onClick={() => {
                                    setDateFilter('');
                                    setStartTimeFilter('');
                                    setEndTimeFilter('');
                                }}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700 transition"
                            >
                                ยกเลิก
                            </button>
                        </div>

                        {/* ตารางข้อมูล */}
                        <table>
                            <thead className="text-lg font-normal text-black">
                                <tr>
                                    <th className="px-6 py-3 text-center">ครั้งที่</th>
                                    <th className="px-6 py-3 text-center">รูปป้ายทะเบียน</th>
                                    <th className="px-6 py-3 text-center">ป้ายทะเบียน</th>
                                    <th className="px-6 py-3 text-center">เข้า</th>
                                    <th className="px-6 py-3 text-center">ออก</th>
                                    <th className="px-6 py-3 text-center">แสดงผล</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr className="w-full">
                                        <td colSpan="7" className="py-3 px-6 text-center">
                                            <SmallLoading />
                                        </td>
                                    </tr>
                                ) : (
                                    currentRows.length > 0 ? (
                                        currentRows.map((log, index) => (
                                            <tr key={index} className="border-t border-gray-200 hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm text-center text-gray-700">{filteredData.length - indexOfFirstRow - index}</td>
                                                <td className="px-6 py-4 text-sm text-center text-gray-700">

                                                    <img
                                                        src={log.in_image || log.out_image}
                                                        alt="Plate"
                                                        className="w-40 h-28 object-cover rounded "
                                                    />

                                                </td>
                                                <td className="px-6 py-4 text-sm text-center text-gray-700">{log.license_plate}</td>
                                                <td className="px-6 py-4 text-sm text-center text-gray-700">
                                                    {log.in_detection_time ? convertToThaiDate(log.in_detection_time) : 'ไม่พบข้อมูล'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-center text-gray-700">
                                                    {log.out_detection_time && log.out_detection_time !== "ยังไม่ออก"
                                                        ? convertToThaiDate(log.out_detection_time)
                                                        : "ยังไม่ออก"}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <button onClick={() => viewClick(log.index, log.license_plate)} className="text-blue-500 hover:text-blue-700">
                                                        <FontAwesomeIcon icon={faEye} style={{ color: "#f59338", fontSize: "20px" }} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                                ไม่มีข้อมูล
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="flex items-center justify-center my-4 gap-2">
                            {currentPage > 1 && (
                                <button button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                            )}

                            {generatePageNumbers().map((pageNum, index) =>
                                pageNum === "..." ? (
                                    <span key={`ellipsis-${index}`} className="px-3 text-gray-700">...</span>
                                ) : (
                                    <button
                                        key={`page-${pageNum}`}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-4 py-2 text-sm rounded ${currentPage === pageNum ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                                    >
                                        {pageNum}
                                    </button>
                                )
                            )}

                            {currentPage < totalPages && (
                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            )}
                        </div>

                    </div>
                </div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[123%] h-screen bg-customBackGround z-0" style={{ clipPath: "ellipse(50% 40% at 50% 100%)" }}></div>
            </div>
        </main >
    );
}
