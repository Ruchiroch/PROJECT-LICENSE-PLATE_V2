"use client"
import React, { createContext, useState, useContext } from 'react';

// สร้าง Context สำหรับ Navbar
const NavbarContext = createContext();

// สร้าง Provider สำหรับ Context
export const NavbarProvider = ({ children }) => {
  const [userFirstname, setUserFirstname] = useState('');
  const [telephone, setTelephone] = useState(true);  // สถานะเบอร์โทรศัพท์

  // ฟังก์ชันสำหรับการอัปเดตชื่อผู้ใช้ใน Navbar
  const updateUserFirstname = (newFirstname) => {
    setUserFirstname(newFirstname);
  };

  // ฟังก์ชันอัปเดตเบอร์โทรศัพท์
  const updateTelephoneStatus = (status) => {
    setTelephone(status);
  };

  return (
    <NavbarContext.Provider value={{ userFirstname, updateUserFirstname,telephone, updateTelephoneStatus }}>
      {children}
    </NavbarContext.Provider>
  );
};

// Custom hook สำหรับใช้งาน NavbarContext
export const useNavbar = () => useContext(NavbarContext);
