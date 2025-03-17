"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleLeft } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { Fragment } from 'react';

export default function ViewDetailed() {
    const [data, setData] = useState();
    const searchParams = useSearchParams();
    const index = searchParams.get("index");

    useEffect(() => {
        const fetchData = async () => {
            if (!index) return;
            try {
                const response = await axios.get(`/api/viewdetailed_ad/${index}`);
                if (response.status === 200 && response.data?.detectionRound) {
                    setData(response.data.detectionRound);
                } else {
                    throw new Error('Failed to fetch cars');
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
        fetchData();
    }, [index]);

    const convertToThaiDate = (date) => {
        if (!date) return "ไม่มีข้อมูล";
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, "0");
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        const year = d.getFullYear();

        const hours = d.getHours().toString().padStart(2, "0");
        const minutes = d.getMinutes().toString().padStart(2, "0");
        const seconds = d.getSeconds().toString().padStart(2, '0'); // วินาที

        return `${day}/${month}/${year}  ${hours}:${minutes}:${seconds}`;
    };

    return (
        <>
            <main className="bg-customBackGround min-h-screen">
                <div className="flex flex-col md:flex-row h-full">
                    <aside className="md:w-16 lg:w-[250px] bg-slate-400 p-4 flex-shrink-0">
                        {/* {navbar} */}
                    </aside>

                    <div className="flex-grow p-9">
                        <div className="flex justify-center">
                            <h1 className="text-3xl md:text-6xl  font-semibold text-center text-customTextHead mb-5" style={{ textShadow: "4px 4px 6px rgba(0, 0, 0, 0.2)" }}>
                                แสดงผลการตรวจจับป้ายทะเบียน</h1>
                        </div>

                        <div className="flex justify-center">
                            <div className={`text-2xl bg-white rounded-[20px] flex justify-center p-8 w-60 
                            ${data?.in_detection_status === "ผ่าน" ? "text-green-500" : data?.in_detection_status === 'ไม่ผ่าน'
                                ? 'text-red-500'
                                : 'text-yellow-400'} `}>
                                <p className="text_ad_data">{data?.in_detection_status || "ผิดปกติ"}</p>
                            </div>

                        </div>

                        <div className="flex justify-around h-[480px] mt-10">
                            <div className="bg-white rounded-[20px] flex justify-center p-8 w-[570px]" style={{ boxShadow: "0px 0px 20px 3px rgba(0, 0, 0, 0.25)" }}>
                                {/* Content here */}
                                <img
                                    src={data?.in_image || data?.out_image}
                                    alt="License Plate"
                                    className="w-auto h-auto object-contain"
                                />
                            </div>
                            <div className="bg-white rounded-[20px] flex  p-8 w-[570px]" style={{ boxShadow: "0px 0px 20px 3px rgba(0, 0, 0, 0.25)" }}>
                                {/* Content here */}
                                <div className="flex justify-around w-full">
                                    {data?.in_detection_status === "ผ่าน" || data?.in_detection_status === "ผิดปกติ" ? (
                                        <div className="p-4">
                                            <p className="text_ad_data  mt-4 ">หมายเลขทะเบียน:</p>
                                            <p className="text_ad_data  mt-4 ">จังหวัดของป้ายทะเบียน:</p>
                                            <p className="text_ad_data  mt-4 ">ชื่อ นามสกุล:</p>
                                            <p className="text_ad_data  mt-4 ">ยี่ห้อรถยนต์:</p>
                                            <p className="text_ad_data  mt-4 ">รุ่นรถยนต์:</p>
                                            <p className="text_ad_data  mt-4 ">สีรถยนต์:</p>
                                            <p className="text_ad_data  mt-4 ">เข้า:</p>
                                            <p className="text_ad_data  mt-4 ">ออก:</p>
                                        </div>
                                    ) : (
                                        <div className="flex justify-center items-center w-full ">
                                            <div className="p-4">
                                                <p className="text_ad_data mt-4">หมายเลขทะเบียน:</p>
                                                <p className="text_ad_data mt-4">จังหวัดของป้ายทะเบียน:</p>
                                                <p className="text_ad_data mt-4">เข้า:</p>
                                                <p className="text_ad_data mt-4">ออก:</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* แสดงข้อมูลตามสถานะ "ผ่าน"และถ้าไม่ผ่านน */}
                                    {data?.in_detection_status === "ผ่าน" || data?.in_detection_status === "ผิดปกติ"  ? (
                                        <div className="p-4">
                                            <p className="mt-4">{data?.license_plate}</p>
                                            <p className="mt-4">{data?.detection_province_plate || "ไม่พบข้อมูล"}</p>
                                            <p className="mt-4">{data?.name}</p>
                                            {data?.cars.map((car, index) => (
                                                <Fragment key={index}>
                                                    <p className="mt-4">{car.car_brand}</p>
                                                    <p className="mt-4">{car.car_model}</p>
                                                    <p className="mt-4">{car.car_color}</p>
                                                </Fragment>
                                            ))}
                                            <p className="mt-4">{convertToThaiDate(data?.in_detection_time)}</p>
                                            <p className="mt-4">
                                                {data?.out_detection_time && data.out_detection_time !== "ยังไม่ออก"
                                                    ? convertToThaiDate(data.out_detection_time)
                                                    : "ยังไม่ออก"}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex justify-center items-center w-full ">
                                            <div className="p-4">
                                                <p className="mt-4">{data?.license_plate}</p>
                                                <p className="mt-4">{data?.detection_province_plate || "ไม่พบข้อมูล"}</p>
                                                <p className="mt-4">{convertToThaiDate(data?.in_detection_time)}</p>
                                                <p className="mt-4">
                                                    {data?.out_detection_time && data.out_detection_time !== "ยังไม่ออก"
                                                        ? convertToThaiDate(data.out_detection_time)
                                                        : "ยังไม่ออก"}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* <div className="flex justify-between py-10">
                            <div></div>
                            <div>
                                <Link href="/admin/usage_information">
                                    <FontAwesomeIcon icon={faCircleLeft} style={{ color: "#077bd5" }} size="2xl" />
                                </Link>
                            </div>
                        </div> */}
                    </div>
                </div>
            </main>
        </>
    );
}
