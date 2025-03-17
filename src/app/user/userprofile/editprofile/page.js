"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import SmallLoading from "@/app/smalloading";
import { useNavbar } from '../../../../context/NavbarContext'; // ใช้ custom hook
import { signOut } from "next-auth/react";
import { showToast } from '../../../components/Toast';
import io from 'socket.io-client';

export default function EditProfile() {
  const { updateUserFirstname } = useNavbar(); // ฟังก์ชันจาก context
  const { updateTelephoneStatus } = useNavbar(); // ฟังก์ชันจาก context
  const { updatete } = useNavbar(); // ฟังก์ชันจาก context

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [oldEmail, setOldEmail] = useState(""); // อีเมลปัจจุบัน
  const [data, setData] = useState({
    firstname: "",
    lastname: "",
    telephone: "",
    email: "",
    status: "",
  });

  
  // เชื่อมต่อกับ WebSocket ที่เซิร์ฟเวอร์
  const socket = io("https://rec.licenseplate.pro", {
    path: "/socket.io/",
    transports: ["websocket"],
  }); // เปลี่ยน URL ตามเซิร์ฟเวอร์ของคุณ

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // ฟังการเชื่อมต่อ
        socket.on('connect', () => {
          console.log('Connected to server');
        });
        if (status === "authenticated" && session?.user?.user_id) {
          const response = await axios.get(`/api/profile/${session.user.user_id}`); // เรียก API
          // console.log("Response Data:", response.data); // Debug API Response
          if (response.status === 200) { // ตรวจสอบ status code
            setData(response.data);
            setOldEmail(response.data.email);
            setLoading(false); 
          } else {
            setErrorMessage("ไม่สามารถดึงข้อมูลผู้ใช้ได้:", response.status);
          }
        } else {
          setErrorMessage("Session หรือ User ID ไม่ถูกต้อง");
        }

        // เมื่อ component ถูก unmount ให้ลบ event listener
        return () => {
          socket.off("update_data");
        };

      } catch (error) {
        setErrorMessage("เกิดข้อผิดพลาดในการดึงข้อมูล:");
      }
    };
    fetchUserData();
  }, [status, session]);

  // ฟังก์ชันในการส่งข้อมูลที่ถูกแก้ไข
  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMessage("");


    if (!data.firstname || !data.lastname) {
      setErrorMessage("กรุณากรอกชื่อและนามสกุลให้ครบถ้วน");
      return;
    }
    if (!data.status) {
      setErrorMessage("กรุณาเลือกสถานะ");
      return;
    }
    if (data.telephone.length < 10) {
      setErrorMessage("หมายเลขโทรศัพท์ไม่ครบ 10 หลัก");
      return;
    }

    try {
      const isEmailChanged = data.email !== oldEmail;
      const response = await axios.put(`/api/send_email_editprofile/${session.user.user_id}`, data, {
      });

      // ตรวจสอบสถานะการตอบกลับ
      if (response.status === 200) {
        if (isEmailChanged) {
          alert("ระบบได้ออกจากระบบ กรุณายืนยันอีเมลใหม่");
          signOut({ callbackUrl: "/page/login" });
        } else {
          updateUserFirstname(response.data.firstname);
          updateTelephoneStatus(true);
          showToast(`${response.data.message}`, 'success');
          router.replace('/user/userprofile');
          socket.emit('update_data');
        }
      } else {
        setErrorMessage("ไม่สามารถบันทึกข้อมูลได้");
        showToast(`${response.data.message}`, 'error');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };


  const handleCancel = () => {
    router.push("/user/userprofile");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };


  return (
    <main className="relative bg-white min-h-screen  overflow-hidden">

      <div className="fixed top-0 right-0 w-[50%] h-[100vh]  bg-customBackGround" style={{ clipPath: "ellipse(60% 90% at 63% 55%)", }} ></div>
      <div className="mt-24 md:mt-32">
        <div className="relative flex h-full items-center justify-center">
          <h1 className="text-3xl md:text-6xl  font-semibold text-center text-customTextHead z-10" style={{ textShadow: "4px 4px 6px rgba(0, 0, 0, 0.2)" }}>
            แก้ไขโปรไฟล์
          </h1>
        </div>
      </div>
      <div className="flex justify-center mt-12">
        <form onSubmit={handleSave}>

          <div
            className="relative sm:w-[500px] md:w-[700px]  bg-white  rounded-[20px]  md:rounded-[90px] flex justify-center p-8 "
            style={{ boxShadow: "0 4px 60px 10px rgba(0, 0, 0, 0.25)" }}>

            {loading ? (
              <div className="flex justify-center items-end py-6">
                <SmallLoading />
              </div>
            ) : (

              <div className="space-y-8 ">
                <div className="flex flex-wrap gap-4">
                  {/* ชื่อ */}
                  <div className="flex items-center flex-grow  gap-4" >
                    <label htmlFor="firstname" className="text_subreg ">
                      ชื่อ
                    </label>
                    <input
                      type="text"
                      id="firstname"
                      name="firstname"
                      value={data.firstname || ""}
                      onChange={handleInputChange}
                      className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="กรอกชื่อ"
                    />
                  </div>
                  {/* นามสกุล */}
                  <div className="flex items-center flex-grow gap-4">
                    <label htmlFor="lastname" className="text_subreg ">
                      นามสกุล
                    </label>
                    <input
                      type="text"
                      id="lastname"
                      name="lastname"
                      value={data.lastname || ""}
                      onChange={handleInputChange}
                      className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="กรอกนามสกุล"
                    />
                  </div>
                </div>
                {/* เบอร์โทรศัพท์ */}
                <div className="flex items-center gap-4">
                  <label htmlFor="telephone" className="text_subreg w-60">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="text"
                    id="telephone"
                    name="telephone"
                    value={data.telephone || ""}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^0-9]/g, ''); // กรองเฉพาะตัวเลข
                      if (value.length > 10) {
                        value = value.slice(0, 10); // จำกัดให้มีแค่ 10 ตัว
                      }
                      setData({ ...data, telephone: value }); // อัพเดตค่า telephone
                    }}
                    className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 w-full"
                    placeholder="กรอกเบอร์โทรศัพท์"
                  />
                </div>

                {/* Email */}
                <div className="flex items-center gap-4">
                  <label htmlFor="email" className="text_subreg w-60">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={data.email || ""}
                    onChange={handleInputChange}
                    className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 w-full"
                    placeholder="กรอกอีเมล"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label htmlFor="status" className="text_subreg w-60">
                    สถานะ
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={data.status || ""}
                    onChange={(e) => setData({ ...data, status: e.target.value })}
                    className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 w-full"
                    required
                  >
                    <option value="" disabled>
                      ทำการเลือก
                    </option>
                    <option value="อาจารย์">อาจารย์</option>
                    <option value="นักศึกษา">นักศึกษา</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                </div>
                {/* Error Message */}
                <div className="flex justify-center items-center ">
                  {errorMessage && (<p className="text-red-500   mb-4">{errorMessage}</p>)}
                  {successMessage && (<p className="text-green-500 mb-4">{successMessage}</p>)}
                </div>
              </div>
            )}
          </div>

          {/* ปุ่ม */}
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
