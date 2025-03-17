"use client"
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
export default function Register() {
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("")
    const router = useRouter();
    const [userData, setUserData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        telephone: "",
        status: "",
    });
    const { data: session, status } = useSession();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    useEffect(() => {
        if (status === "authenticated") {
            if (session.user?.role === "admin") {
                router.push("/admin/homepageadmin");
            } else if (session.user?.role === "user") {
                router.push("/user/homepageuser");
            }
        }
    }, [status, session, router]);

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const requiredFields = ["firstname", "lastname", "email", "password", "telephone"];

        if (requiredFields.some(field => !userData?.[field] || String(userData[field]).trim() === "")) {
            setErrorMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        if (userData.password.length < 8) {
            setErrorMessage("รหัสผ่านต้องมีอย่างน้อย 8 ตัว");
            return;
        }
        if (userData.password !== confirmPassword) {
            setErrorMessage("รหัสผ่านไม่ตรงกัน กรุณาลองอีกครั้ง");
            return;
        }
        if (userData.telephone.length < 10) {
            setErrorMessage("หมายเลขโทรศัพท์ไม่ครบ 10 หลัก");
            return;
        }

        // console.log(userData.password)

        try {
            const response = await axios.post("/api/send_email_register",
                userData,
            );
            if (response.status === 200) {
                setErrorMessage("")
                setSuccessMessage("ลงทะเบียนสำเร็จ")
                alert("ทำการส่งข้อความไป email แล้ว");
                router.replace("/page/login");
            } else {
                console.error("ไม่สามารถบันทึกข้อมูลได้:", response.data.error || "Unknown error");
                setErrorMessage("เกิดข้อผิดพลาดในการสมัครสมาชิก");
            }
            console.log(userData)
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล:", error);
            // setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์" ,error);
            const errorMessage = error.response?.data?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์";
            setErrorMessage(errorMessage);
        }

    };

    const handleGoogleSignOut = async () => {
        try {
            const result = await signIn('google', { redirect: false });
            if (result?.error) {
                console.error('Google Sign-In Error:', result.error);
                alert(`Error: ${result.error}`);  // แสดงข้อผิดพลาดให้ผู้ใช้เห็น
            } else {
                console.log('Google Sign-In Success:', result);
            }
        } catch (error) {
            console.error('Error during Google sign-in:', error);
            alert(`An error occurred: ${error.message}`);  // แสดงข้อผิดพลาดทั่วไป
        }
    };


    return (
        <main style={{ backgroundImage: 'linear-gradient(to bottom, #C9FFBF 0%, #FFFFFF 64%)', }} className="h-screen flex flex-col items-center">
            <div className="mt-20">
                <h1 className="text-3xl md:text-6xl  font-semibold text-center text-customTextHead mb-10" style={{ textShadow: "4px 4px 6px rgba(0, 0, 0, 0.2)" }}>
                    สมัครสมาชิกใหม่
                </h1>
            </div>
            <div className="flex justify-center items-center ">
                <button
                    onClick={handleGoogleSignOut}
                    className="flex items-center justify-center w-[291px] h-[64px] bg-white border border-gray-300 rounded-lg shadow-sm px-4 py-2 space-x-2 text-gray-600 hover:bg-gray-100"
                >
                    <img src="/images/google.png" alt="Google icon" className="w-6 h-6" />
                    <span>Sign Up with Google</span>
                </button>
            </div>
            <div className="flex items-center justify-center my-4">
      <div className="w-1/3 border-t border-gray-300"></div>
      <span className="px-2 text-gray-500 text-sm">หรือdfsd</span>
      <div className="w-1/3 border-t border-gray-300"></div>
    </div>
            
            <form onSubmit={handleSubmit}>
                <div className="w-full    sm:w-[500px] md:w-[750px] md:h-[700px] bg-white rounded-[20px]  md:rounded-[90px] flex flex-col justify-center items-center p-8 space-y-4   " style={{ boxShadow: "0  4px 60px 10px rgba(0, 0, 0, 0.25)" }}>
                    <div className="flex flex-col justify-center items-center w-full ">
                        <div className="space-y-8">
                            {/* First Name */}
                            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 ">
                                <label htmlFor="firstname" className="text_subreg w-60 ">
                                    ชื่อ
                                </label>
                                <input
                                    type="text"
                                    id="firstname"
                                    name="firstname"
                                    className="w-full md:w-72 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    placeholder="ชื่อ"
                                    value={userData.firstname}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Last Name */}
                            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 ">
                                <label htmlFor="lastname" className="text_subreg w-60">
                                    นามสกุล
                                </label>
                                <input
                                    type="text"
                                    id="lastname"
                                    name="lastname"
                                    className="w-full md:w-72 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    placeholder="นามสกุล"
                                    value={userData.lastname}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Email */}
                            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0">
                                <label htmlFor="email" className="text_subreg w-60">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="w-full md:w-72 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    placeholder="Email"
                                    value={userData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Password */}
                            <div className="relative flex flex-col md:flex-row items-center space-y-2 md:space-y-0 ">
                                <label htmlFor="password" className="text_subreg w-60">
                                    Password
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    className="w-full md:w-72 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    placeholder="Password"
                                    value={userData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                </button>
                            </div>

                            {/* Confirm Password */}
                            <div className="relative flex flex-col md:flex-row items-center space-y-2 md:space-y-0">
                                <label htmlFor="cf_password" className="text_subreg w-60">
                                    Confirm Password
                                </label>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="cf_password"
                                    name="cf_password"
                                    className="w-full md:w-72 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    placeholder="Confirm Password"

                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={toggleConfirmPasswordVisibility}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                                >
                                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                </button>
                            </div>

                            {/* Telephone */}
                            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 ">
                                <label htmlFor="telephone" className="text_subreg w-60">
                                    เบอร์โทรศัพท์
                                </label>
                                <input
                                    type="text"
                                    id="telephone"
                                    name="telephone"
                                    className="w-full md:w-72 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    placeholder="เบอร์โทรศัพท์"

                                    value={userData.telephone}
                                    onChange={(e) => {
                                        let value = e.target.value.replace(/[^0-9]/g, ''); // Filter only numbers
                                        if (value.length > 10) {
                                            value = value.slice(0, 10); // Limit to 10 digits
                                        }
                                        setUserData({ ...userData, telephone: value });
                                    }}
                                />
                            </div>

                            {/* Status */}
                            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 ">
                                <label htmlFor="status" className="text_subreg w-60">
                                    สถานะ
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    className="w-full md:w-72 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    value={userData.status || ""}
                                    onChange={handleChange}
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
                                {errorMessage && (
                                    <p className="text-red-500 mb-4">{errorMessage}</p>
                                )}
                                {successMessage && (
                                    <p className="text-green-500 mb-4">{successMessage}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center items-center my-10">
                    <button type="submit" className=" text-base font-normal  w-[250px] h-[67px] py-3 bg-customBtGreen text-center text-black rounded-[20px] hover:bg-green-500 focus:outline-none focus:ring-2">ลงทะเบียน</button>
                </div>
            </form>

        </main>
    )

}