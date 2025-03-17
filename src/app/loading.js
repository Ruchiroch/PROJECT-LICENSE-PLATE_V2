'use client';

export default function Loading() {
    return (
      <div className="fixed top-[80px] left-0 w-full h-[calc(100vh-80px)] flex justify-center items-center  z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      <p className="ml-4 text-gray-600">กำลังโหลดข้อมูล...</p>
    </div>
    );
  }