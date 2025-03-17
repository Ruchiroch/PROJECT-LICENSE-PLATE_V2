"use client";
import { useState } from "react";
import Link from "next/link";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes, faArrowRightFromBracket, faHouse, faUser, faMagnifyingGlass, faFlag, faGear } from "@fortawesome/free-solid-svg-icons";
import { signOut } from 'next-auth/react';

export default function NavbarAdmin() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        signOut({ redirect: true, callbackUrl: '/' });
    };

    return (
        <>
            {/* ปุ่มเมนู (แสดงเฉพาะบนมือถือ) */}
            <button
                className={`fixed top-4 ${isSidebarOpen ? "left-48" : "left-4"} z-50 text-gray-700 md:hidden`}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} size="2x" />
            </button>

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full bg-white z-40 transition-all overflow-hidden 
                ${isSidebarOpen ? "w-[250px]" : "w-16"} md:w-[250px]`}>

                {/* Header */}
                <div className="flex justify-between items-center p-4">
                    <h1 className={`text-2xl font-bold ${isSidebarOpen ? "block" : "hidden"} md:block`}>
                        Admin
                    </h1>
                    <FontAwesomeIcon
                        icon={faArrowRightFromBracket}
                        size="lg"
                        className="cursor-pointer hover:text-gray-400 md:block hidden"
                        onClick={handleLogout}
                    />
                </div>

                {/* Navigation */}
                <nav className="mt-5 flex-1">
                <ul className={`space-y-4 flex flex-col ${isSidebarOpen ? "items-start" : "items-center"}`}>
                        <li className="w-full flex justify-center md:justify-start">
                            <Link href="/admin/homepageadmin" className="flex items-center p-3 hover:bg-gray-200 rounded w-full justify-center md:justify-start ">
                                <FontAwesomeIcon icon={faHouse} style={{ color: "#03d100" }} size="lg" />
                                <span className={`ml-4 ${isSidebarOpen ? "block" : "hidden"} md:block`}>หน้าหลัก</span>
                            </Link>
                        </li>
                        <li className="w-full flex justify-center md:justify-start">
                            <Link href="/admin/datauser" className="flex items-center p-3 hover:bg-gray-200 rounded w-full justify-center md:justify-start">
                                <FontAwesomeIcon icon={faUser} style={{ color: "#03d100" }} size="lg" />
                                <span className={`ml-4 ${isSidebarOpen ? "block" : "hidden"} md:block`}>ดูข้อมูลสมาชิก</span>
                            </Link>
                        </li>
                        <li className="w-full flex justify-center md:justify-start">
                            <Link href="/admin/usage_information" className="flex items-center p-3 hover:bg-gray-200 rounded w-full justify-center md:justify-start">
                                <FontAwesomeIcon icon={faFlag} style={{ color: "#03d100" }} size="lg" />
                                <span className={`ml-4 ${isSidebarOpen ? "block" : "hidden"} md:block`}>รายงานการใช้งาน</span>
                            </Link>
                        </li>
                        <li className="w-full flex justify-center md:justify-start">
                            <Link href="/admin/search" className="flex items-center p-3 hover:bg-gray-200 rounded w-full justify-center md:justify-start">
                                <FontAwesomeIcon icon={faMagnifyingGlass} style={{ color: "#03d100" }} size="lg" />
                                <span className={`ml-4 ${isSidebarOpen ? "block" : "hidden"} md:block`}>ค้นหาข้อมูลรถยนต์</span>
                            </Link>
                        </li>
                        <li className="w-full flex justify-center md:justify-start">
                            <Link href="/admin/setcamera" className="flex items-center p-3 hover:bg-gray-200 rounded w-full justify-center md:justify-start">
                                <FontAwesomeIcon icon={faGear} style={{ color: "#03d100" }} size="lg" />
                                <span className={`ml-4 ${isSidebarOpen ? "block" : "hidden"} md:block`}>ตั้งค่ากล้อง</span>
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* ปุ่ม Logout (สำหรับมือถือ) */}
                <div className="absolute text-center mt-10 left-0 w-full md:hidden">
                    <FontAwesomeIcon
                        icon={faArrowRightFromBracket}
                        size="lg"
                        className="cursor-pointer hover:text-gray-400 "
                        onClick={handleLogout}
                    />
                </div>
            </aside>
        </>
    );
}
