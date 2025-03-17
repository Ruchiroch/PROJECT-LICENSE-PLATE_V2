"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import SmallLoading from "../../smalloading";
import { showToast } from '../../components/Toast';

export default function SetCamera() {
    const [cameras, setCameras] = useState([]);
    const [updatedModes, setUpdatedModes] = useState({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    // const [successDelete, setSuccessDelete] = useState('');
    const [loading, setLoading] = useState(true);
    const [newCamera, setNewCamera] = useState({ camera_name: '', camera_mode: 'IN' });
    const [showModal, setShowModal] = useState(false);
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [cameraToDelete, setCameraToDelete] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);



    useEffect(() => {
        setError("");
        const fetchCamerasData = async () => {
            try {
                const response = await axios.get('/api/cameras');
                setCameras(response.data); // ตั้งค่าข้อมูลกล้อง
                setLoading(false);
            } catch (error) {
                setError(error.response.data.message);
                setLoading(false);
            }
        };

        fetchCamerasData();
    }, []);


    const handleModeChange = (cameraName, cameraId, newValue) => {
        // หาค่า previousValue จาก state หรือข้อมูลที่มีอยู่
        const previousValue = updatedModes[cameraId] !== undefined
            ? updatedModes[cameraId]
            : cameras.find(cam => cam.camera_id === cameraId)?.camera_mode; // ใช้ camera_mode เดิมจากข้อมูลที่มีหากไม่ได้อยู่ใน updatedModes

        console.log("new", newValue);  // ค่าใหม่ที่ถูกเลือก
        console.log("old", previousValue);  // ค่าเก่า

        // ถ้าค่าใหม่ไม่เหมือนกับค่าเก่า
        if (newValue !== previousValue) {
            setError(`ชื่อกล้อง: ${cameraName} กรุณากดปุ่มอัปเดต!`);
        } else if (newValue === previousValue) {
            setError("");
        }
        setUpdatedModes(prev => ({
            ...prev,
            [cameraId]: newValue,  // อัปเดตค่าของ camera ที่เลือก
        }));
    }


    const handleUpdate = async (camera_id, cameraMode) => {
        setError('');

        try {
            // ส่งคำขอ PUT ไปยัง API
            const response = await axios.put('/api/cameras', {
                camera_id: camera_id,
                camera_mode: cameraMode,
            });

            if (response.status === 200) {
                // ถ้าอัปเดตสำเร็จ
                showToast(`${response.data.message}`, 'success');
                setCameras((prevCameras) =>
                    prevCameras.map((camera) =>
                        camera.camera_id === camera_id
                            ? { ...camera, camera_mode: cameraMode } // อัปเดตเฉพาะ camera ที่มี camera_id ตรงกัน
                            : camera
                    )
                );
            } else {
                showToast(`${response.data.message}`, 'error');
                setError(response.data.message || 'มีบางอย่างผิดพลาดเกิดขึ้น');
            }
        } catch (error) {
            // จัดการข้อผิดพลาดจากการเชื่อมต่อหรือการอัปเดต
            const errorMessage = error?.response?.data?.message || 'ไม่สามารถอัปเดตกล้องได้ โปรดลองอีกครั้ง';
            showToast(errorMessage, 'error');
            setError(errorMessage);
        }
    };

    const handleAddCamera = async () => {
        if (!newCamera.camera_name) {
            setError('กรุณากรอกชื่อกล้อง');
            return;
        }
        setError('');
        try {
            const response = await axios.post('/api/cameras', newCamera);
            if (response.status === 200) {
                showToast(`${response.data.message}`, 'success');
                setCameras((prevCameras) => [...prevCameras, response.data.camera]);
                setNewCamera({ camera_name: '', camera_mode: 'IN' });
                setShowModal(false);
            } else {
                showToast(`${response.data.message}`, 'error');
                setError(response.data.message || 'มีบางอย่างผิดพลาดเกิดขึ้น');
            }
        } catch (error) {
            showToast(`${error.response.data.message}`, 'error');
            setError(`${error.response.data.message}`);
        }
    };

    const handleDelete = async (camera_id) => {
        setError('');
        try {
            const response = await axios.delete(`/api/cameras/${camera_id}`);
            if (response.status === 200) {
                showToast(`${response.data.message}`, 'success');
                setCameras((prevCameras) => prevCameras.filter(camera => camera.camera_id !== camera_id));
                setCameraToDelete(null);
                setShowModalDelete(false);
            } else {
                showToast(`${response.data.message}`, 'error');
                setError(response.data.message || 'มีบางอย่างผิดพลาดเกิดขึ้น');
            }
        } catch (error) {
            showToast(`${error.response.data.message}`, 'error');
            setError('ไม่สามารถลบกล้องได้ กรุณาลองอีกครั้ง');
        }
    };

    return (
        <main className="flex min-h-screen bg-customBackGround">
            <section className={`flex-1 transition-all p-6 ${isSidebarOpen ? "ml-[250px]" : "ml-16"} md:ml-[250px]`}>
                <div className="flex-1 flex-col p-6">
                    <div className="flex justify-center items-center">
                        <div className="relative  w-full sm:w-[500px] md:w-full md:h-[150px] bg-white rounded-[20px] flex  justify-center items-center  p-8 space-y-4">
                            <h1 className="text-3xl md:text-6xl  font-semibold text-center text-customTextHead" style={{ textShadow: "4px 4px 6px rgba(0, 0, 0, 0.2)" }}>
                                ตั้งค่ากล้อง
                            </h1>
                        </div>
                    </div>
                    {/* <div className="w-full h-[105px]  bg-white shadow-md mt-6 rounded-[20px]"></div> */}

                    {/* ปุ่มเพิ่มกล้อง */}
                    <div className=" text-right px-6 my-6 ">
                        <button
                            className="bg-green-500 text-white px-6 py-2 rounded-lg"
                            onClick={() => setShowModal(true)}
                        >
                            เพิ่มกล้องใหม่
                        </button>
                    </div>

                    <div className="bg-white px-2 py-10 rounded-[20px] shadow-lg w-full mx-auto mt-1 h-auto">
                        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
                        {success && <div className="text-green-500 mb-4 text-center">{success}</div>}

                        {loading ? (
                            <SmallLoading />
                        ) : (
                            cameras.length === 0 ? (
                                <div className="text-center text-black">
                                    ไม่มีข้อมูลกล้อง ทำการเพิ่มกล้อง
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cameras.map((camera) => (
                                        <div key={camera.camera_id} className="p-6  border-b border-gray-300 flex justify-between items-center hover:bg-gray-50">
                                            <div className="flex flex-col">
                                                <h3 className="text-lg font-semibold">{`ชื่อกล้อง : ${camera.camera_name}`}</h3>
                                                <p className="text-base">{`โหมดกล้อง: ${camera.camera_mode}`}</p>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <select
                                                    className="mt-1 block p-2 border border-gray-300 rounded-lg"
                                                    value={updatedModes[camera.camera_id] || camera.camera_mode}
                                                    onChange={(e) => handleModeChange(camera.camera_name, camera.camera_id, e.target.value)}
                                                >
                                                    <option value="IN">ขาเข้า</option>
                                                    <option value="OUT">ขาออก</option>
                                                </select>
                                                <button
                                                    disabled={updatedModes[camera.camera_id] === undefined || updatedModes[camera.camera_id] === camera.camera_mode} // ปุ่มอัปเดตจะถูกปิดถ้าโหมดไม่เปลี่ยนหรือไม่มีการเลือกโหมดใหม่
                                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                                                    onClick={() => handleUpdate(camera.camera_id, updatedModes[camera.camera_id] || camera.camera_mode)}
                                                >
                                                    อัปเดต
                                                </button>
                                                <button
                                                    className="bg-red-500 text-white px-4 py-2 rounded-lg"
                                                    onClick={() => {
                                                        setShowModalDelete(true);
                                                        setCameraToDelete(camera.camera_id);
                                                    }}
                                                >
                                                    ลบ
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}

                        {/* ฟอร์มเพิ่มกล้อง */}
                        {showModal && (
                            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
                                <div className="mt-6 p-6 bg-white rounded-lg shadow-md w-96">
                                    {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
                                    <h2 className="text-lg font-semibold mb-4 text-center">เพิ่มกล้องใหม่</h2>
                                    <input
                                        type="text"
                                        className="border p-2 w-full mb-4 rounded-lg"
                                        placeholder="ชื่อกล้อง"
                                        value={newCamera.camera_name}
                                        onChange={(e) => setNewCamera({ ...newCamera, camera_name: e.target.value })}
                                    />
                                    <div className="flex items-center space-x-4 mb-4">
                                        <select
                                            className="mt-1 block p-2 border border-gray-300 rounded-lg"
                                            value={newCamera.camera_mode}
                                            onChange={(e) => setNewCamera({ ...newCamera, camera_mode: e.target.value })}
                                        >
                                            <option value="IN">ขาเข้า</option>
                                            <option value="OUT">ขาออก</option>
                                        </select>
                                    </div>
                                    <div className="flex justify-center">
                                        <button
                                            className="bg-customBtGreen text-black px-4 py-2 rounded-lg  hover:bg-green-500 focus:outline-none focus:ring-2"
                                            onClick={handleAddCamera}
                                        >
                                            เพิ่มกล้อง
                                        </button>
                                        <button
                                            className="ml-4 bg-red-600 text-white px-4 py-2 rounded-lg  hover:bg-gray-400 focus:outline-none focus:ring-2"
                                            onClick={() => setShowModal(false)}
                                        >
                                            ยกเลิก
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ฟอร์มลบกล้อง */}
                        {showModalDelete && (
                            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
                                <div className="bg-white p-6 rounded-[50px] md:w-[550px] md:h-[250px] flex flex-col justify-center items-center ">

                                    {/* {successDelete && <div className="text-green-500 mb-4 text-center">{successDelete}</div>} */}

                                    <h2 className="text-lg text-center">คุณต้องการลบกล้องจริงหรือไม่</h2>
                                    <div className="flex justify-center mt-4">
                                        <button
                                            className="bg-customBtGreen text-black px-4 py-2 rounded-lg  hover:bg-green-500 focus:outline-none focus:ring-2"
                                            onClick={() => handleDelete(cameraToDelete)}
                                        >
                                            ตกลง
                                        </button>
                                        <button
                                            className="ml-4 bg-customBtRed text-white px-4 py-2 rounded-lg  hover:bg-gray-400 focus:outline-none focus:ring-2"
                                            onClick={() => setShowModalDelete(false)}
                                        >
                                            ยกเลิก
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}


                    </div>
                </div>
            </section>
        </main>
    );
}
