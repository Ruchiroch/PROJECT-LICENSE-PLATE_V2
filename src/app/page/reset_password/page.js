"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        
        if(newPassword.length < 8){
            setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัว");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            return;
        }

        try {
            const res = await axios.put('/api/reset_password', {
                newPassword,
                token, 
            });

            setMessage(res.data.message || 'Password reset successfully.');
            setTimeout(() => {
                router.push('/page/login');
            }, 5000);

        } catch (err) {
            console.error('Error resetting password:', err);
            setError(err.response?.data?.message || 'An unexpected error occurred.');
        }
    };

    return (
        <main
            style={{ backgroundImage: "linear-gradient(to bottom, #C9FFBF 0%, #FFFFFF 64%)" }}
            className="h-screen flex justify-center flex-col items-center"
        >
        
            <form onSubmit={handleSubmit} className="p-8 bg-white shadow-lg rounded-3xl">
                <h1 className="text-3xl font-bold mb-4 text-center">LICENSE PLATE RECOGNITION</h1>
                <h2 className="text-2xl font-semibold mb-4 text-center">เปลี่ยนรหัสผ่าน</h2>
                <div className="mb-4">
                    <label htmlFor="password" className="block mb-2 text-base font-normal text-grey500">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                        className="w-full mb-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block mb-2 text-base font-normal text-grey500">Confirm Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                        className="w-full mb-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                </div>
                <div>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                {message && <p className="text-green-500 mb-4 text-center">{message}</p>}
                </div>
                <button
                    type="submit"
                    className="w-full p-2 rounded-[20px] bg-customBtGreen text-black  hover:bg-green-400">
                    Change  Password
                </button>

            </form>


        </main>
    );
}
