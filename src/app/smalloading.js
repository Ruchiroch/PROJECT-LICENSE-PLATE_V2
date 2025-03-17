'use client';

export default function SmallLoading() {
  return (
    <div className="flex justify-center items-center  w-full h-full">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-500"></div>
        <p className="mt-2 text-gray-600 text-center">กำลังโหลด...</p>
      </div>
    </div>
  );
}