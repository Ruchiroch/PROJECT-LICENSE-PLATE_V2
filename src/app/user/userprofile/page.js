"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faPen } from "@fortawesome/free-solid-svg-icons";
import { useSession } from "next-auth/react";
import Link from "next/link";
import SmallLoading from "@/app/smalloading";


export default function UserProfile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const { data: session, status } = useSession(); 

 
  useEffect(() => {
    if (status === "authenticated" && session?.user?.user_id) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(`/api/profile/${session.user.user_id}`);
          setData(response.data); 
          setLoading(false); 

          const incompleteFields = ["firstname", "lastname", "telephone", "email", "status"].filter(field => !response.data[field]);
          if (incompleteFields.length > 0) {
            setError("กรุณากรอกข้อมูลให้ครบถ้วน");
          }

        } catch (err) {
          setError("ไม่สามารถดึงข้อมูลผู้ใช้ได้"); 
          setLoading(false); 
        }
      };
      fetchUserData();
    }
  }, [status, session]); 


  return (
    <main className="relative bg-white min-h-screen  overflow-hidden">
      
      <div className="fixed top-0 right-0 w-[50%] h-[100vh]  bg-customBackGround" style={{clipPath: "ellipse(60% 90% at 63% 55%)",  }} ></div>
    
      <div className="mt-24 md:mt-32">
        <div className="relative flex justify-evenly h-full items-center px-12 gap-5">
          <h1 className="text-3xl md:text-6xl  font-semibold text-center text-customTextHead" style={{ textShadow: "4px 4px 6px rgba(0, 0, 0, 0.2)" }}>
            โปรไฟล์
          </h1>
          <FontAwesomeIcon icon={faUser} size="3x" />
        </div>
      </div>

      <div className="flex justify-center mt-12">
        <div
          className="relative w-full sm:w-[500px] md:w-[700px] md:h-[350px] bg-white rounded-[90px] flex justify-center p-8 space-y-4"
          style={{ boxShadow: "0 4px 60px 10px rgba(0, 0, 0, 0.25)" }}
        >
          <div className="flex flex-col  w-full">
            <div className="flex justify-end px-5">
              {/* <Link href="/user/editprofile">
                <FontAwesomeIcon icon={faPen} size="2x" />
              </Link> */}
              <Link href="/user/userprofile/editprofile">
                <FontAwesomeIcon icon={faPen} size="2x" />
              </Link>

            </div>

            <div className="mt-6 px-20 mx-auto ">
              {loading ? (
                <div className="flex justify-center items-end py-6">
                  <SmallLoading />
                </div>
              ) : (
                <div>
                  <div className="flex items-center">
                    <label htmlFor="name" className="text_subreg w-60">
                      ชื่อและนามสกุล
                    </label>
                    <span>{`${data?.firstname || ""} ${data?.lastname || ""}`}</span>{" "}
                    {/* แสดงชื่อและนามสกุล */}
                  </div>

                  <div className="flex items-center mt-4">
                    <label htmlFor="phone" className="text_subreg w-60">
                      เบอร์โทรศัพท์
                    </label>
                    <span>{data?.telephone || "-"}</span> {/* แสดงเบอร์โทรศัพท์ */}
                  </div>
                  <div className="flex items-center mt-4">
                    <label htmlFor="email" className="text_subreg w-60">
                      Email
                    </label>
                    <span>{data?.email || "-" }</span> {/* แสดงอีเมล์ */}
                  </div>

                  <div className="flex items-center mt-4">
                    <label htmlFor="status" className="text_subreg w-60">
                      สถานะ
                    </label>
                    <span>{data?.status || "-"}</span> {/* แสดงสถานะ */}
                  </div>
                  {error && (
                    <div className="text-red-500 mt-4 text-center">
                      {error} {/* แสดงข้อความเตือนถ้าข้อมูลไม่ครบ */}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
