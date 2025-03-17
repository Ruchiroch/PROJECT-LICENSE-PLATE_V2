"use client"
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import SmallLoading from "../../smalloading";

export default function LicensePlateTracker() {
  const { data: session, status } = useSession(); // ดึง session ข้อมูลของผู้ใช้งาน
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [userId, setUserId] = useState('');  // ใช้ userId เพื่อค้นหาข้อมูล
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [itemsPerPage] = useState(10); // Items per page
  const [rowsPerPage] = useState(20);
  const [message, setMessage] = useState('');
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const [maxPagesToShow, setMaxPagesToShow] = useState(5);

  // State สำหรับตัวกรอง
  const [licensePlateFilter, setLicensePlateFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [startTimeFilter, setStartTimeFilter] = useState("");
  const [endTimeFilter, setEndTimeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredLogs, setFilteredLogs] = useState([]);

  useEffect(() => {
    // ตรวจสอบว่า session พร้อมแล้ว (authenticated)
    if (status === 'authenticated' && session.user?.user_id) {
      setUserId(session.user.user_id); // ตั้งค่า userId จาก session เมื่อ login สำเร็จ
    }
  }, [status, session]); // คอยตรวจสอบสถานะ session

  useEffect(() => {

    // เชื่อมต่อกับ WebSocket ที่เซิร์ฟเวอร์
    const socket = io("https://rec.licenseplate.pro", {
      path: "/socket.io/",
      transports: ["websocket"],
    });


    // ฟังการเชื่อมต่อ
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.emit("joinRoom", "admin", userId);

    // ส่ง user_id ไปยังเซิร์ฟเวอร์เพื่อดึงข้อมูล
    socket.emit('get_license_plate');

    // ฟังข้อมูลที่ได้รับจาก server
    socket.on('license_plate_updates', (data) => {
      setData(data);
      setLoading(false);  // เมื่อข้อมูลถูกดึงมาจาก server แล้ว
      setFilteredLogs(data);
      // console.log('Data:', data);
    });

    // เมื่อ component ถูก unmount ให้ลบ event listener
    return () => {
      socket.off("license_plate_updates");
    };

  }, [userId]);

  const convertToThaiDate = (date) => {
    if (!date) return "ไม่มีข้อมูล";
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();

    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const seconds = d.getSeconds().toString().padStart(2, '0'); // วินาที

    return `${day}/${month}/${year}  ${hours}:${minutes}:${seconds}`;
  };


  // การกรองข้อมูล
  const filteredData = data.filter((round) => {
    // กรองตามป้ายทะเบียน
    const licensePlateMatch = round.license_plate.toLowerCase().includes(licensePlateFilter.toLowerCase());

    // กรองตามวันที่
    const logDate = new Date(round.in_detection_time);
    const selectedDate = new Date(dateFilter);
    const isDateMatch = dateFilter ? logDate.toDateString() === selectedDate.toDateString() : true;

    // กรองตามเวลา
    const logInTime = round.in_detection_time   ? new Date(round.in_detection_time).toLocaleTimeString().slice(0, 5) : null;
    const logOutTime = round.out_detection_time ? new Date(round.out_detection_time).toLocaleTimeString().slice(0, 5) : null;
    const timeMatch = startTimeFilter && endTimeFilter
      ? (logInTime && logInTime >= startTimeFilter && logInTime <= endTimeFilter) ||
      (logOutTime && logOutTime >= startTimeFilter && logOutTime <= endTimeFilter)
      : true;
    // กรองตามสถานะ
    const statusMatch = statusFilter
      ? round.in_detection_status === statusFilter || (statusFilter === "ผิดปกติ" && !round.in_detection_status)
      : true;
    return licensePlateMatch && isDateMatch && timeMatch && statusMatch;
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);


  const clearFilters = () => {
    setLicensePlateFilter("");
    setDateFilter("");
    setStatusFilter("");
    setStartTimeFilter("");
    setEndTimeFilter("");

  };


  const viewClick = (index) => {
    console.log(index);
    const query = new URLSearchParams({ index }).toString(); // สร้าง query string
    router.push(`/admin/usage_information/viewdetailed_ad?${query}`); // ส่ง URL เป็นสตริง
  };

  const generatePageNumbers = () => {
    const pageNumbers = [];

    // คำนวณหน้าที่จะเริ่มต้นแสดง โดยพยายามให้ currentPage อยู่ตรงกลาง
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));

    // คำนวณหน้าที่จะเป็นหน้าสุดท้ายที่แสดง
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (startPage > 1) pageNumbers.push("...");

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages) pageNumbers.push("...");

    return pageNumbers;
  };


  return (
    <main className="flex min-h-screen bg-customBackGround">
      <section className={`flex-1 transition-all p-6 ${isSidebarOpen ? "ml-[250px]" : "ml-16"} md:ml-[250px]`}>
        <div className="flex-1 flex-col p-6">
          <div className="relative w-full md:h-[150px] bg-white rounded-[20px] flex justify-center items-center p-8">
            <h1 className="text-3xl md:text-6xl  font-semibold text-center text-customTextHead" style={{ textShadow: "4px 4px 6px rgba(0, 0, 0, 0.2)" }}>
              รายงานการใช้งาน
            </h1>
          </div>

          {/* Filters */}
          <div className="mt-6 flex justify-end items-center gap-1">
            <input
              type="text"
              placeholder="กรอกหมายเลขป้ายทะเบียน..."
              className="px-4 py-2 border rounded-lg"
              value={licensePlateFilter}
              onChange={(e) => setLicensePlateFilter(e.target.value)}
            />
            <input
              type="date"
              className="px-4 py-2 border rounded-lg"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <input
              type="time"
              className="px-4 py-2 border rounded-lg"
              value={startTimeFilter}
              onChange={(e) => setStartTimeFilter(e.target.value)}
            />
            <input
              type="time"
              className="px-4 py-2 border rounded-lg"
              value={endTimeFilter}
              onChange={(e) => setEndTimeFilter(e.target.value)}
            />
            <select
              className="px-4 py-2 border rounded-lg"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">ทั้งหมด</option>
              <option value="ผ่าน">ผ่าน</option>
              <option value="ไม่ผ่าน">ไม่ผ่าน</option>
              <option value="ผิดปกติ">ผิดปกติ</option>

            </select>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700 transition"
            >
              ยกเลิก
            </button>

          </div>

          <div className="flex items-center w-full h-[105px] bg-white shadow-md mt-6 rounded-[20px] ">
            {/* Header */}
            <div className="grid grid-cols-8 w-full bg-white text-center">
              <div className="text_ad_data px-4 py-2">ลำดับ</div>
              <div className="text_ad_data px-4 py-2 col-span-2">รูปป้ายทะเบียน</div>
              <div className="text_ad_data px-4 py-2">หมายเลขป้ายทะเบียน</div>
              <div className="text_ad_data px-4 py-2">เข้า</div>
              <div className="text_ad_data px-4 py-2">ออก</div>
              <div className="text_ad_data px-4 py-2">สถานะ</div>
              <div className="text_ad_data px-4 py-2">แสดงผล</div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-[20px] shadow-lg w-full mx-auto mt-2 px-2 py-5">
            {loading ? (
              <SmallLoading />
            ) : message ? (
              <div className="w-full">
                <div className="py-3 px-6 text-center text-red-600">
                  {message}
                </div>
              </div>
            ) : currentRows.length === 0 ? (
              <div className="w-full">
                <div className="py-3 px-6 text-center text-red-600">
                  ไม่มีข้อมูล
                </div>
              </div>
            ) : (
              currentRows.map((round, index) => (
                <div key={index} className="grid grid-cols-8 text-center hover:bg-gray-50 ">
                  <div className="border-b border-gray-300 px-4 py-2 flex items-center justify-center">
                    {filteredData.length - indexOfFirstRow - index} {/* แสดงลำดับ */}
                  </div>
                  <div className="border-b border-gray-300 px-4 py-2 col-span-2 flex items-center justify-center">
                    <div className="flex justify-center items-center">
                      <img
                        src={round.in_image || round.out_image}
                        alt="License Plate"
                        className="w-40 h-28 object-cover rounded "
                      />
                    </div>
                  </div>
                  <div className="border-b border-gray-300 px-4 py-2 flex items-center justify-center">
                    {round.license_plate}
                  </div>
                  <div className="border-b border-gray-300 px-4 py-2 flex items-center justify-center">
                    {round.in_detection_time && round.in_detection_time !== "ไม่พบข้อมูล"
                      ? convertToThaiDate(round.in_detection_time)
                      : "ไม่พบข้อมูล"}
                  </div>
                  <div className="border-b border-gray-300 px-4 py-2 flex items-center justify-center">
                    {round.out_detection_time && round.out_detection_time !== "ยังไม่ออก"
                      ? convertToThaiDate(round.out_detection_time)
                      : "ยังไม่ออก"}
                  </div>
                  <div
                    className={`border-b border-gray-300 px-4 py-2 flex items-center justify-center ${round?.in_detection_status === 'ผ่าน'
                      ? 'text-green-500'
                      : round?.in_detection_status === 'ไม่ผ่าน'
                        ? 'text-red-500'
                        : 'text-yellow-400'
                      }`}
                  >
                    {round?.in_detection_status || 'ผิดปกติ'}
                  </div>
                  <div className="border-b border-gray-300 px-4 py-2 flex items-center justify-center">
                    <button onClick={() => viewClick(round.index)} className="text-blue-500 hover:text-blue-700">
                      <FontAwesomeIcon icon={faEye} style={{ color: "#f59338", fontSize: "20px" }} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>



          {/* Pagination */}
          <div className="flex items-center justify-center my-4">
            {currentPage > 1 && (
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-4 py-2 text-sm  bg-blue-500 text-white rounded-md  disabled:cursor-not-allowed"
                disabled={currentPage === 1}
              >
                Previous
              </button>
            )}

            <div className="px-4 py-2 text-gray-700">
              {generatePageNumbers().map((pageNum, index) =>
                pageNum === "..." ? (
                  <span key={`ellipsis-${index}`} className="px-4 py-2 text-gray-700">...</span>
                ) : (
                  <button
                    key={`page-${pageNum}`}  // ใช้ `pageNum` เพื่อให้ key ไม่ซ้ำ
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 mx-1 text-sm rounded ${currentPage === pageNum ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                  >
                    {pageNum}
                  </button>
                )
              )}
            </div>

            {currentPage < totalPages && (
              <button
                onClick={() =>
                  setCurrentPage(currentPage + 1)
                }
                className="px-4 py-2 text-sm  bg-blue-500 text-white rounded disabled:cursor-not-allowed"
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            )}

          </div>
        </div>
      </section>
    </main>
  );
}


