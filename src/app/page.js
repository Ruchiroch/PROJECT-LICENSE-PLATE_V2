"use client";
import Link from "next/link";
import Image from "next/image";
import NavbarHomePage from "./components/navbarHomePage";
export default function Home() {
  return (
    <>
      <NavbarHomePage />
      <main style={{  backgroundImage:  "linear-gradient(to bottom, #C9FFBF 0%, #FFFFFF 64%)", }}  className="h-screen " >
        <div className="flex flex-col items-center justify-center h-screen ">
          <Image
            src="/images/smartcarv2.svg"
            alt="Description of image"
            width={600}
            height={450}
            className="max-w-full h-auto" 
          />
           <h1 className="text-3xl md:text-4xl  font-semibold mt-10 mb-4 text-center">
            LICENSE PLATE RECOGNITION
          </h1>
          <Link href="/page/login">
          <button className="text-black text-xl  font-normal bg-customBtGreen px-4 py-2 mt-4 mb-5 rounded-[20px] w-full sm:w-[200px] h-[55px] mx-auto">
              Login
            </button>
          </Link>

          <p className="text-don">
            {" "}
            Don't have an account?{" "}
            <Link href="/page/register" className=" text-red-500">
              {" "}
              Register
            </Link>
          </p>

        </div>
      </main>
    </>
  );
}
