"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import SmallLoading from '@/app/smalloading';

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchCategory, setSearchCategory] = useState('license_plate');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchData = async (isReset = false) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await axios.get('/api/search', {
        params: isReset ? {} : { search: searchTerm, category: searchCategory },
      });
      setSearchResults(response.data);
    } catch (err) {
      setErrorMessage(isReset ? 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่' : 'ไม่สามารถค้นหาข้อมูลได้ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, []);

  const clearFilters = async () => {
    setSearchCategory('license_plate');
    setSearchTerm('');
    fetchData(true);
  };

  useEffect(() => {
    if (searchTerm.trim() !== '') {
      fetchData();
    }
  }, [searchTerm, searchCategory]);

  return (
    <main className="flex min-h-screen bg-customBackGround">


      <section className={`flex-1 transition-all p-6 ${isSidebarOpen ? "ml-[250px]" : "ml-16"} md:ml-[250px]`}>
        <div className="flex-1 flex-col p-6">
          {/* Header */}
          <div className="bg-white p-6 rounded-[20px] md:w-full md:h-[150px] shadow-md flex justify-center items-center">
            <h1 className="text-3xl md:text-6xl  font-semibold text-center text-customTextHead" style={{ textShadow: "4px 4px 6px rgba(0, 0, 0, 0.2)" }}>
              ค้นหาข้อมูลรถยนต์
            </h1>
          </div>

          {/* Search Filters */}
          <div className="mt-6 flex justify-end items-center gap-1">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg"
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
            >
              <option value="license_plate">หมายเลขป้ายทะเบียน</option>
              <option value="fullname">ชื่อ นามสกุล</option>
              <option value="car_brand">ยี่ห้อรถยนต์</option>
            </select>
            <input
              type="text"
              placeholder={
                searchCategory === 'license_plate'
                  ? 'กรอกหมายเลขป้ายทะเบียน...'
                  : searchCategory === 'fullname'
                    ? 'กรอกชื่อ หรือนามสกุล...'
                    : 'กรอกยี่ห้อรถยนต์...'
              }
              className="px-4 py-2 border border-gray-300 rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700 transition"
            >
              ยกเลิก
            </button>
          </div>


          <div className="flex items-center w-full h-[105px] bg-white shadow-md mt-6 rounded-[20px] px-2">
            {/* Header */}
            <div className="grid grid-cols-6 w-full bg-white text-center">
              <div className="text_ad_data px-4 py-2 ">ลำดับ</div>
              <div className="text_ad_data px-4 py-2 text-left">ชื่อ-นามสกุล</div>
              <div className="text_ad_data px-4 py-2">ยี่ห้อรถยนต์</div>
              <div className="text_ad_data px-4 py-2">รุ่นรถยนต์</div>
              <div className="text_ad_data px-4 py-2">สีของรถยนต์</div>
              <div className="text_ad_data px-4 py-2">หมายเลขป้ายทะเบียน</div>
            </div>

          </div>

          {errorMessage && (
            <div className="text-red-500 text-center mt-4">
              {errorMessage}
            </div>
          )}

          {/* Search Results */}
          <div className="mt-2 bg-white rounded-[20px] shadow-lg px-2 py-5 ">
            <table className="w-full text-left border-collapse">
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center p-4">
                      <SmallLoading />
                    </td>
                  </tr>
                ) : searchResults.length > 0 ? (
                  searchResults.map((result, index) => (
                    <tr key={result.id} className="grid grid-cols-6 w-full border-b border-gray-300 py-2">
                      <td className="text-center px-4 py-5">{index + 1}</td>
                      <td className="text-left   px-4 py-5">{result.firstname} {result.lastname}</td>
                      <td className="text-center px-4 py-5">{result.car_brand}</td>
                      <td className="text-center px-4 py-5">{result.car_model}</td>
                      <td className="text-center px-4 py-5">{result.car_color}</td>
                      <td className="text-center px-4 py-5">{result.license_plate}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center p-4">
                      ไม่มีข้อมูลที่ค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}