"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { showToast } from '../../../components/Toast';


export default function UserDetails() {
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const searchParams = useSearchParams();
    const user_id = searchParams.get("user_id");
    const router = useRouter();
    const [showAddButton, setShowAddButton] = useState(false); // แสดงปุ่ม "เพิ่มรถ" หรือไม่
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
   
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        car_brand: "",
        car_model: "",
        car_color: "",
        license_plate: "",
        province_plate: "",
    });

    // ดึงข้อมูลผู้ใช้เมื่อ id พร้อม
    useEffect(() => {
        setErrorMessage("");
        const fetchUser = async () => {
            try {
                const response = await axios.get(`/api/ad_edit?user_id=${user_id}`);
                console.log(response.data);
                if (response.status === 200) {
                    const userData = response.data.data; // ใช้ข้อมูลจาก object ตรง ๆ
                    setFormData({
                        firstname: userData.firstname || "",
                        lastname: userData.lastname || "",
                        car_id: userData.car_id || "",
                        car_brand: userData.car_brand || "",
                        car_model: userData.car_model || "",
                        car_color: userData.car_color || "",
                        license_plate: userData.license_plate || "",
                        province_plate: userData.province_plate || "",
                    });
                } else {
                    setErrorMessage("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setErrorMessage("เกิดข้อผิดพลาดในการดึงข้อมูล");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [user_id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {

        e.preventDefault();
        try {
            setSubmitting(true);
            const response = await axios.post(`/api/ad_edit?user_id=${user_id}`, formData);
            if (response.status === 200 || response.status === 201) {
                showToast(`${response.data.message}`, 'success');
                router.replace("/admin/datauser");
            } else {
                setErrorMessage(response.data.message);
                showToast(`${response.data.message}`, 'error');
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message);
            showToast(`${error.response?.data?.message || error.message}`, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push("/admin/datauser"); // เปลี่ยนเส้นทางไปยังหน้าข้อมูลรถ
    };
    return (
        <main className="flex min-h-screen bg-customBackGround">
            <section className={`flex-1 transition-all p-6 ${isSidebarOpen ? "ml-[250px]" : "ml-16"} md:ml-[250px]`}>
                <div className="flex-1 flex-col p-6">
                    <div>
                        <div className="relative w-full sm:w-[500px] md:w-full md:h-[150px] bg-white rounded-[20px] flex justify-center items-center p-8 space-y-4">
                            <h1 className="text-3xl md:text-6xl  font-semibold text-center text-customTextHead" style={{ textShadow: "4px 4px 6px rgba(0, 0, 0, 0.2)" }}>
                                เพิ่มข้อมูลรถยนต์ของสมาชิก
                            </h1>
                        </div>
                    </div>
                    {/* <div className="w-full h-[105px]  bg-white shadow-md mt-6 rounded-[20px]">
                     
                    </div> */}
                    <div className="mt-11">
                        <form onSubmit={handleSubmit}>
                            <div className="bg-white px-20 py-10 rounded-[20px]  shadow-lg w-full mx-auto">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* ฟอร์มการแก้ไขข้อมูล */}
                                    {['firstname', 'lastname', 'car_brand', 'car_model', 'car_color', 'license_plate', 'province_plate'].map((field, index) => (
                                        <div key={index} className="grid">
                                            <label htmlFor={field} className="text_subreg w-60">
                                                {field === "firstname" ? "ชื่อ" :
                                                    field === "lastname" ? "นามสกุล" :
                                                        field === "car_brand" ? "ยี่ห้อรถยนต์" :
                                                            field === "car_model" ? "รุ่นรถยนต์" :
                                                                field === "car_color" ? "สีของรถยนต์" :
                                                                    field === "license_plate" ? "หมายเลขป้ายทะเบียนรถยนต์" : "ป้ายจังหวัด"}
                                            </label>
                                            <input
                                                type="text"
                                                name={field}
                                                placeholder={`กรอก${field === "firstName" ? "ชื่อ" :
                                                    field === "lastName" ? "นามสกุล" :
                                                        field === "car_brand" ? "ยี่ห้อรถยนต์" :
                                                            field === "car_model" ? "รุ่นรถยนต์" :
                                                                field === "car_color" ? "สีของรถยนต์" :
                                                                    field === "license_plate" ? "หมายเลขป้ายทะเบียน" : "ป้ายจังหวัด"}`}
                                                value={formData[field] || ""}
                                                onChange={handleChange}
                                                className="border p-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                                            />
                                        </div>
                                    ))}
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
                                    onClick={handleCancel}
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
