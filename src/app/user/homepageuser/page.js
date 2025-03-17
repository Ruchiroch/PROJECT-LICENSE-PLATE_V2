"use client";
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from "react";
import axios from "axios";
import Loading from "../../loading";
export default function HomePageUser() {
  const { data: session, status } = useSession();
  const [data, setData] = useState();
  const [error, setError] = useState(""); // เพิ่ม useState สำหรับข้อผิดพลาด
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.user_id) {
      const fetchUser = async () => {
        try {
          const response = await axios.get(`/api/user/${session.user.user_id}`);
          setData(response.data);
          // console.log("firstname",userFirstname)
        } catch (error) {
          setError('Error fetching user data');
        } finally {
          setLoading(false);
        }
      }
      fetchUser();
    }
  }, [status, session]);

  if (loading) {
    return <Loading />; // แสดงหน้า loading ระหว่างโหลดข้อมูล
  }

  return (
    <main className="bg-white min-h-screen relative overflow-hidden">
      {/* วงรีครึ่งหนึ่ง */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[123%] h-screen bg-customBackGround"
        style={{ clipPath: "ellipse(60% 90% at 50% 0)" }}>
      </div>

      {/* สี่เหลี่ยมส้มอยู่นอกสีเขียว */}
      {/* <div className="absolute top-[55%] right-[-16%] w-[1523px] md:h-[404px] bg-customBgOrange "
        style={{ transform: 'rotate(147deg)' }}>

      </div> */}

      {/* เนื้อหาของหน้า */}
      <div className="flex justify-around items-center mt-20 sm:mt-40 px-4 sm:px-10">
        <div className="relative flex flex-col sm:flex-row justify-around  p-6 rounded-lg w-full gap-0 md:gap-10">
          {/* ข้อความ */}
          <div className="flex flex-col justify-center items-center text-center sm:text-left sm:mr-10">
          <h1 className="font-finger-paint font-normal text-4xl sm:text-6xl md:text-[100px] lg:text-[140px] text-black">
              Welcome
            </h1>
            <label className="text-2xl text-gray-800 mt-4">{data?.firstname || "Loading..."}</label>
          </div>

          {/* รูปภาพ */}
          <div className="relative mt-6 sm:mt-0 ml-11 md:ml-0  z-10">
            <Image
              src="/images/caruser.svg"
              alt="Description of image"
              width={600}
              height={456}
              className="max-w-full h-auto transform translate-x-0 sm:translate-x-16 sm:translate-y-5"
            />

          </div>
          {/* สี่เหลี่ยมส้มอยู่นอกสีเขียว */}
          <div className="absolute top-[50%] left-[-20%] w-[150vw] md:h-[30vw] lg:w-[170vw] bg-customBgOrange"
            style={{ transform: 'rotate(147deg)' }}>
          </div>


        </div>
      </div>


    </main>
  );
}
