
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faBell, faBellSlash, faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { signOut, useSession } from 'next-auth/react';
import axios from "axios";
import { useNavbar } from '../../context/NavbarContext'; // ใช้ custom hook
import { showToast } from './Toast';
export default function NavbarUser() {
  const { data: session, status } = useSession();
  const [data, setData] = useState();
  const [error, setError] = useState(""); // เพิ่ม useState สำหรับข้อผิดพลาด // ดึง session ข้อมูลจาก NextAuth
  const [notifications, setNotifications] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { userFirstname, telephone, updateTelephoneStatus } = useNavbar(); // ดึงค่า hasPhoneNumber
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);


  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };
  useEffect(() => {
    if (status === "authenticated" && session?.user?.user_id) {
      const fetchUser = async () => {
        try {
          const response = await axios.get(`/api/user/${session.user.user_id}`);
          setData(response.data);
          setNotifications(response.data.notifications);
          updateTelephoneStatus(response.data.telephone !== null);
          console.log("ss",response.data.telephone);
        } catch (error) {
          setError('Error fetching user data');
        }
      }
      fetchUser();
      setIsClient(true);
    }
  }, [status, session]);


  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleEmailNotification = async () => {
    const userId = session.user.user_id;
    const newNotificationStatus = !notifications;
    try {
      const response = await axios.put(`/api/notifications/${userId}`, {
        notifications: newNotificationStatus,
      });
      setNotifications(newNotificationStatus);
      // alert(response.data.message);
      if (response.data.message.includes('enabled')) {
        showToast("เปิดการแจ้งเตือน", 'success');
      } else if (response.data.message.includes('disabled')) {
        showToast("ปิดการแจ้งเตือน", 'success');
      }
    } catch (error) {
      console.error('Error updating notifications:', error);
    }
  };

  const handleLogout = () => {
    console.log("Logging out...");
    signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full  px-4 sm:px-10 lg:px-4 z-50 transition-colors duration-300 
           ${scrolled || (isClient && !window.matchMedia('(min-width: 1024px)').matches) ? "bg-white shadow-md" : "bg-transparent"}`}
    >
      {/* // <nav className="bg-gray-300 fixed top-0 left-0 w-full z-50 "> */}
      {/* <nav className="fixed top-0 left-0 w-full flex justify-between items-center h-[80px] px-4 sm:px-10 z-50 bg-transparent  "> */}
      <div className="mx-auto  ">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center lg:hidden">
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-black hover:bg-gray-300  focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`h-6 w-6 ${isMobileMenuOpen ? 'hidden' : 'block'}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              <svg
                className={`h-6 w-6 ${isMobileMenuOpen ? 'block' : 'hidden'}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* กลุ่มเมนูฝั่งซ้าย */}
          <div className="flex  items-center justify-center sm:items-stretch ">
            <div className="hidden lg:block sm:ml-6">
              <div className="flex space-x-4">
                <Link href="/user/homepageuser" className="rounded-md  px-3 py-2 text-sm font-medium  text_navbaruser " >หน้าแรก</Link>
                <Link href="/user/datacar" className="rounded-md px-3 py-2 text-sm font-medium   text_navbaruser ">ข้อมูลรถยนต์</Link>
                <Link href="/user/reportcar" className="rounded-md px-3 py-2 text-sm font-medium   text_navbaruser ">รายงานการใช้งาน</Link>
              </div>
            </div>
          </div>

          {/* กลุ่มเมนูฝั่งขวา */}
          <div className="flex items-center space-x-6 text-center justify-center">
            <div className="hidden lg:block">
              <FontAwesomeIcon
                icon={faUser}
                size="2x"
                className="text-black hover:text-gray-500 transition duration-200"
              />
              <Link href="/user/userprofile"   className={`ml-5 ${telephone ? "text_navbaruser" : "text-red-500"} hover:text-gray-300`}>
                {userFirstname || data?.firstname || "Loading..."}
              </Link>
            </div>
            <div onClick={toggleEmailNotification} className="cursor-pointer ">
              <FontAwesomeIcon
                icon={notifications ? faBell : faBellSlash}
                className={`transition duration-300 ease-in-out ${notifications ? "text-black" : "text-red-600"}`}
                size="2x"
              />
            </div>
            <div>
              <FontAwesomeIcon
                icon={faArrowRightFromBracket}
                size="2x"
                className="cursor-pointer hover:text-gray-400 text-black"
                onClick={handleLogout}
              />
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="mb:hidden" id="mobile-menu">
          <div className="space-y-1 px-2 pb-3 pt-2">
            <Link href="/user/homepageuser" className="block rounded-md  px-3 py-2 text-base font-medium text-black hover:bg-gray-300 " onClick={() => setIsMobileMenuOpen(false)}>หน้าแรก</Link>
            <Link href="/user/datacar" className="block rounded-md  px-3 py-2 text-base font-medium text-black hover:bg-gray-300 " onClick={() => setIsMobileMenuOpen(false)}>ข้อมูลรถยนต์</Link>
            <Link href="/user/reportcar" className="block rounded-md  px-3 py-2 text-base font-medium text-black hover:bg-gray-300 " onClick={() => setIsMobileMenuOpen(false)}>รายงานการใช้งาน</Link>
            <Link href="/user/userprofile" className="block rounded-md  px-3 py-2 text-base font-medium text-black hover:bg-gray-300 " onClick={() => setIsMobileMenuOpen(false)}>
              {userFirstname || data?.firstname || "Loading..."}
              <FontAwesomeIcon
                icon={faUser}
                size="x"
                className="text-black ml-5 hover:text-gray-500 transition duration-200"
              />
            </Link>
          </div>
        </div>
      )}

    </nav>
  );
}
