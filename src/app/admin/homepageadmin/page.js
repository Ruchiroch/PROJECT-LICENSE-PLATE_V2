import React from "react";
import Image from "next/image";
export default function homePageAdmin() {
    return (
        <main className="bg-customBackGround relative  min-h-screen  overflow-hidden z-0 ">
            <aside className="w-64 ">

            </aside>
            {/* สี่เหลี่ยมส้มอยู่นอกสีเขียว */}
            {/* <div
                className="absolute top-2/4 right-[-16%] w-[1523px] h-[404px] bg-customBgOrange "
                style={{ transform: "rotate(147deg)" }}>
            </div> */}

            {/* เนื้อหาของหน้า */}
            <div className="flex flex-col mt-20">
                <div className="relative left-96 flex items-start justify-start">
                    <div className="text-center">
                        <h1 className="font-finger-paint font-normal sm:text-6xl md:text-[140px] text-black">
                            Welcome
                        </h1>
                        {/* //แก้ไข */}
                        <label className="text-2xl text-gray-800 mt-4">Admin</label>
                    </div>
                </div>
                <div className="relative w-full z-10">
                    <Image
                        src="/images/caradmin.svg"
                        alt="Description of image"
                        width={600}
                        height={450}
                        className="absolute max-w-full h-auto  right-0"
                    />
                </div>
                <div className="absolute top-[50%] left-[-20%] w-[140vw] md:h-[30vw] lg:w-[180vw] bg-customBgOrange "
                    style={{ transform: "rotate(147deg)" }}>
                </div>
            </div>
        </main>
    );
}
