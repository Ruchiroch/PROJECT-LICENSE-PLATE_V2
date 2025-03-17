export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen  text-gray-900"  style={{  backgroundImage:  "linear-gradient(to bottom, #C9FFBF 0%, #FFFFFF 64%)", }} >
      <h1 className="text-8xl font-extrabold text-black ">404</h1>
      <h2 className="text-2xl font-semibold mt-4">ไม่พบหน้านี้ !!</h2>
   
      <a 
        href="/" 
        className="mt-6 px-6 py-3 bg-customBtGreen text-black text-lg rounded-lg shadow-lg hover:bg-green-600 transition duration-300"
      >
        Go Back Home
      </a>
    </div>
  );
}