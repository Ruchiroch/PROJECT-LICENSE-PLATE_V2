"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function ResetPassword() {
    const [message, setMessage] = useState('');
    const router = useRouter();

    useEffect(() => {
        // ดึงค่าจาก query string
        const queryParams = new URLSearchParams(window.location.search);
        const messageFromURL = queryParams.get("message"); // ดึงค่าของ message
        if (messageFromURL) {
            setMessage(decodeURIComponent(messageFromURL)); // ถอดรหัสข้อความ
        }
    }, []);

    const handleBackToLogin = () => {
        router.push('/page/login');
    };

    return (
        <main
            style={{
                backgroundImage: "linear-gradient(to bottom, #C9FFBF 0%, #FFFFFF 64%)",
            }}
            className="h-screen flex justify-center flex-col items-center px-4"
        >
            <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md text-center">
                <h1 className="text-2xl font-semibold mb-4">ทำการยืนยัน Email </h1>
                <p   className={`mb-6 ${message ? "text-red-500" : "text-gray-500"}`}>
                     {message || "คุณได้ทำการยืนยันอีเมลของคุณแล้ว กรุณาคลิกที่ปุ่มด้านล่างเพื่อกลับไปยังหน้าล็อกอิน"}
                </p>
                {/* Back to Login Button */}
                <div className="mt-6">
                    <button
                        onClick={handleBackToLogin}
                        className="py-3 px-6 bg-customBtGreen text-black font-normal  rounded-[20px] hover:bg-green-400 transition duration-200"
                    >
                        กลับไปยังหน้าล็อกอิน
                    </button>
                </div>
            </div>
        </main>
    );
}