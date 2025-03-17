"use client"
import { useState } from "react";
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        try {
            const response = await axios.post(`/api/send_email_forgot_password`, {
                email,
            });
            const data = response.data;

            if (response.status === 200) {
                setMessage(data.message || "กรุณาตรวจสอบอีเมลของคุณเพื่อดำเนินการต่อ");
                setTimeout(() => {
                    router.push('/page/login');
                }, 5000);
            } else {
                setError(data.message || "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
            }
        } catch (err) {
            // setError("มีบางอย่างผิดพลาด โปรดลองอีกครั้งในภายหลัง.");    
            setError(err.response?.data?.message || "มีบางอย่างผิดพลาด โปรดลองอีกครั้งในภายหลัง.");
        }
    };

    return (
        <main
            style={{
                backgroundImage: "linear-gradient(to bottom, #C9FFBF 0%, #FFFFFF 64%)",
            }}
            className="h-screen flex justify-center items-center"
        >
            <form onSubmit={handleSubmit} className="p-8 bg-white shadow-lg rounded-3xl">
                <h1 className="text-2xl font-bold mb-4 text-center">ลืมรหัสผ่าน</h1>
                <p className="text-gray-600 mb-4">
                    โปรดกรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน กรณีที่คุณลืมรหัสผ่าน</p>
                <label htmlFor="email" className="block mb-2 text-base font-normal text-grey500">Email</label>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required

                    className="w-full mb-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                {message && <p className="text-green-500 mb-4">{message}</p>}
                <button
                    type="submit"
                    className="w-full p-2 rounded-[20px] bg-customBtGreen text-black  hover:bg-green-400"
                >
                    Send Reset Email
                </button>
            </form>
        </main>
    );
}
