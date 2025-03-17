export default function navbarHomePage() {
  return (
    <nav className="text_nbhp flex justify-between items-center h-[80px] bg-customBackGround px-4 md:px-20">
      {/* Left Section */}
      <div className="flex justify-center items-center">
        <p className="text-sm sm:text-base md:text-lg">RMUTT</p>
      </div>

      {/* Right Section */}
      <div className="flex justify-center items-center">
        <p className="text-sm sm:text-base md:text-lg">ติดต่อ</p>
      </div>
    </nav>
  );
}
