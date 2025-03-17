"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import axios from "axios";
import { showToast } from '../../../components/Toast';

export default function addUser() {
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);


    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const [userData, setUserData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        telephone: "",
        status: "",
        role: "",
    });

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();
        // ฟิลด์ที่ต้องการตรวจสอบ
        const requiredFields = ["firstname", "lastname", "email", "password", "telephone"];

        // ตรวจสอบว่าฟิลด์ที่จำเป็นมีค่าว่างหรือไม่
        if (requiredFields.some(field => !userData?.[field] || String(userData[field]).trim() === "")) {
            setErrorMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }
        if (userData.password.length < 8) {
            setErrorMessage("รหัสผ่านต้องมีอย่างน้อย 8 ตัว");
            return;
        }
        // ตรวจสอบรหัสผ่านให้ตรงกัน
        if (userData.password !== confirmPassword) {
            setErrorMessage("รหัสผ่านไม่ตรงกัน กรุณาลองใหม่");
            return;
        }
        if (userData.telephone.length < 10) {
            setErrorMessage("หมายเลขโทรศัพท์ไม่ครบ 10 หลัก");
            return;
        }
        setErrorMessage("");
        try {
            // ส่งข้อมูลผู้ใช้ไปที่ API
            console.log("ข้อมูล", userData)
            const userResponse = await axios.post("/api/send_email_register", userData);

            if (userResponse.status === 200) {
                // รีเซ็ตข้อมูลฟอร์ม ยกเว้นข้อมูลรถ
                setUserData((prevUserData) => ({
                    ...prevUserData,
                    firstname: "",
                    lastname: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    telephone: "",
                    status: "",
                    role: "",
                }));
                setErrorMessage("")
                showToast("กรุณายืนยันอีเมลของคุณเพื่อเปิดใช้งานบัญชี!", 'success');
                router.replace("/admin/datauser");  // เปลี่ยนเส้นทางหลังบันทึกสำเร็จ
            } else {
                showToast("เกิดข้อผิดพลาดในการบันทึกข้อมูลสมาชิก", 'error');
            }

        } catch (error) {
            console.error("Error:", error);
            if (error.response) {
                // ข้อผิดพลาดจากการตอบกลับของ API\
                setErrorMessage(error.response.data.message);
                showToast(`${error.response.data.message || 'ไม่ทราบข้อผิดพลาด'}`, 'error');
            }
        }
    };

    const resetForm = () => {
        setUserData({
            firstname: "",
            lastname: "",
            email: "",
            password: "",
            telephone: "",
            status: "",
            role: "",
        });
        setConfirmPassword("");
        router.push("/admin/datauser");
    };

    return (
        <main className="flex min-h-screen bg-customBackGround">
            <section className={`flex-1 transition-all p-6 ${isSidebarOpen ? "ml-[250px]" : "ml-16"} md:ml-[250px]`}>
                <div className="flex-1 flex-col p-6">
                    <div className="flex justify-center items-center ">
                        <div className="relative  w-full sm:w-[500px] md:w-full md:h-[150px] bg-white rounded-[20px] flex  justify-center items-center  p-8 space-y-4">
                            <h1 className="text-3xl md:text-6xl  font-semibold text-center text-customTextHead" style={{ textShadow: "4px 4px 6px rgba(0, 0, 0, 0.2)" }}>
                                เพิ่มข้อมูลสมาชิก
                            </h1>
                        </div>

                    </div>

                    {/*   <div className="w-full h-[105px]  bg-white shadow-md mt-6 rounded-[20px]">
                    เนื้อหาภายในไม่จำเป็น 
                    </div>*/}

                    <div className="mt-11">
                        <form onSubmit={handleSubmit} >
                            <div className="bg-white px-20 py-10 rounded-[20px]  shadow-lg w-full mx-auto">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid">
                                        <label htmlFor="firstname" className="text_subreg  w-60">
                                            ชื่อ
                                        </label>
                                        <input
                                            type="text"
                                            name="firstname"
                                            placeholder="ชื่อจริง"
                                            value={userData.firstname}
                                            onChange={handleChange}
                                            className="border p-2 rounded-lg"
                                        />
                                    </div>

                                    <div className="grid">
                                        <label htmlFor="lastname" className="text_subreg  w-60">
                                            นามสกุล
                                        </label>
                                        <input
                                            type="text"
                                            name="lastname"
                                            placeholder="นามสกุล"
                                            value={userData.lastname}
                                            onChange={handleChange}
                                            className="border p-2 rounded-lg"
                                        />
                                    </div>

                                    <div className="grid col-span-2">
                                        <label htmlFor="email" className="text_subreg  w-60">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Email"
                                            value={userData.email}
                                            onChange={handleChange}
                                            className="border p-2 rounded-lg "
                                        />
                                    </div>

                                    <div className="grid relative">
                                        <label htmlFor="password" className="text_subreg w-60">
                                            Password
                                        </label>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="Password"
                                            value={userData.password}
                                            onChange={handleChange}
                                            className="border p-2 rounded-lg w-full pr-12"  // เพิ่ม padding ซ้ายและขวา
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute top-[30px] bottom-0 right-3 flex items-center text-gray-500 "
                                        >
                                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                        </button>
                                    </div>
                                    <div className="grid relative">
                                        <label htmlFor="cf_password" className="text_subreg w-60">
                                            Confirm Password
                                        </label>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            placeholder="ConfirmPassword"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="border p-2 rounded-lg w-full  pr-12"  // เพิ่ม padding ด้านขวาให้พอสำหรับปุ่มตา
                                        />
                                        <button
                                            type="button"
                                            onClick={toggleConfirmPasswordVisibility}
                                            className="absolute top-[30px] bottom-0 right-3 flex items-center text-gray-500 "
                                        >
                                            <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                        </button>
                                    </div>

                                    <div className="grid col-span-2">
                                        <label htmlFor="telephone" className="text_subreg w-60">
                                            เบอร์โทรศัพท์
                                        </label>
                                        <input
                                            type="text"
                                            name="telephone"
                                            placeholder="เบอร์โทรศัพท์"
                                            value={userData.telephone}
                                            className="border p-2 rounded-lg "
                                            onChange={(e) => {
                                                let value = e.target.value.replace(/[^0-9]/g, ''); // กรองเฉพาะตัวเลข
                                                if (value.length > 10) {
                                                    value = value.slice(0, 10); // จำกัดให้มีแค่ 10 ตัว
                                                }
                                                setUserData({ ...userData, telephone: value }); // อัพเดตค่า telephone
                                            }}
                                        />
                                    </div>


                                    <div className="grid ">
                                        <label htmlFor="status" className="text_subreg w-60">
                                            สถานะ
                                        </label>
                                        <select
                                            id="status"
                                            name="status"
                                            className="flex-grow p-2 border border-gray-300 pl-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                            required
                                            value={userData.status}
                                            onChange={(e) =>
                                                setUserData({
                                                    ...userData,
                                                    status: e.target.value,
                                                })}

                                        >
                                            <option value="" disabled>
                                                ทำการเลือก
                                            </option>
                                            <option value="อาจารย์">อาจารย์</option>
                                            <option value="นักศึกษา">นักศึกษา</option>
                                            <option value="อื่นๆ">อื่นๆ</option>
                                        </select>
                                    </div>
                                    <div className="grid">
                                        <label htmlFor="role" className="text_subreg w-60">
                                            สิทธิ์
                                        </label>
                                        <select
                                            id="role"
                                            name="role"
                                            value={userData.role}
                                            onChange={handleChange}
                                            className="flex-grow p-2 border border-gray-300 pl-1  rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                            required
                                        >
                                            <option value="" disabled>
                                                ทำการเลือก
                                            </option>
                                            <option value="user">ผู้ใช้งาน</option>
                                            <option value="admin">ผู้ดูแลระบบ</option>
                                        </select>
                                    </div>

                                </div>
                                <div className="mt-5">
                                    {errorMessage && <p className="text-red-500  text-center text-base font-normal">{errorMessage}</p>}
                                </div>
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
                                    onClick={resetForm}
                                    className="text-base font-normal w-[140px] h-[50px] py-3 bg-customBtRed  text-center text-white rounded-[20px] hover:bg-gray-400 focus:outline-none focus:ring-2"
                                >
                                    ยกเลิก
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </main>
    );
}
