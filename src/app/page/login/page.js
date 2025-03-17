"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash} from "@fortawesome/free-solid-svg-icons";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { data: session, status } = useSession(); // ตรวจสอบ session
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter()
  
  // หากผู้ใช้ล็อกอินแล้ว ให้เปลี่ยนหน้าไปตาม role
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      console.log("User is authenticated:", session.user);
  
      if (session.user.role === "admin") {
        router.push("/admin/homepageadmin");
      } else if (session.user.role === "user") {
        router.push("/user/homepageuser");
      }
    }
  }, [status, session, router]);


const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage(""); // ล้างข้อความ error เก่าก่อน
  
  try {
    console.log("Logging in with:", email, password);
    
    const result = await signIn("credentials", {
      redirect: false, // ไม่ให้ NextAuth redirect อัตโนมัติ
      email,
      password,
    });

    if (result?.error) {
      setMessage("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } else {
      console.log("Login successful, refreshing session...");
      router.refresh(); // รีโหลด session ใหม่เพื่อให้สถานะเปลี่ยนเร็วขึ้น
    }
  } catch (error) {
    console.error("Login error:", error);
    setMessage("เกิดข้อผิดพลาดในการล็อกอิน");
  }
};

const handleGoogleSignIn = async () => {
  try {
    const result = await signIn('google' ,{redirect: false,});

    if (result?.error) {
      console.error('Google Sign-In Error:', result.error);
      alert(`Error: ${result.error}`);  // แสดงข้อผิดพลาดให้ผู้ใช้เห็น
    } else {
      console.log('Google Sign-In Success:', result);
    }
  } catch (error) {
    console.error('Error during Google sign-in:', error);
    alert("อีเมลนี้มีผู้ใช้งานแล้ว กรุณาเข้าสู่ระบบ");  // แสดงข้อผิดพลาดทั่วไป
  }
};

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
};


  return (
    <main
      style={{ backgroundImage: "linear-gradient(to bottom, #C9FFBF 0%, #FFFFFF 64%)" }}
      className="h-screen flex justify-center items-center"
    >
      <div
        className=" sm:w-[500px] md:w-[700px] md:h-[600px] bg-white rounded-[20px] md:rounded-[90px] flex flex-col items-center p-8 space-y-4"
        style={{ boxShadow: "0 4px 60px 10px rgba(0, 0, 0, 0.25)" }}
      >
        <div className="flex flex-col sm:w-[400px]  md:w-[500px] h-[500px]  ">
          <form onSubmit={handleSubmit}>
            <h1 className="text-3xl md:text-4xl  font-semibold  mb-4 text-center">
              เข้าสู่ระบบ
            </h1>
            <div>
              <label htmlFor="email" className="text_sublogin text-grey500">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="mt-3 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </div>
            <div className="mt-4 relative">
              <label htmlFor="password" className="text_sublogin text-grey500">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="mt-3 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute  top-9 bottom-0 right-3 flex items-center text-gray-500"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            {message && (
              <div className="text-red-500 text-center p-1">
                {message}
              </div>
            )}
            <div className="my-6">
              <Link href="/page/reset_password_inputemail" className="text_sublogin text-grey500">
                Forget password?
              </Link>
            </div>
            <button
              type="submit"
              className="text-xl  font-normal w-full h-[55px] py-3 bg-customBtGreen text-center text-black rounded-[20px] hover:bg-green-400 focus:outline-none focus:ring-2"
            >
              Log In
            </button>
          </form>
          <div className="flex justify-center items-center">
            <button
              onClick={handleGoogleSignIn}
              className="my-8 flex items-center justify-center w-[291px] h-[64px] bg-white border border-gray-300 rounded-lg shadow-sm px-4 py-2 space-x-2 text-gray-600 hover:bg-gray-100"
            >
              <img src="/images/google.png" alt="Google icon" className="w-6 h-6" />
              <span>Sign In with Google</span>
            </button>
          </div>
          <p className="text-center">
            {" "}
            Don't have an account?{" "}
            <Link href="/page/register" className=" text-red-500">
              {" "}
              Register
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
