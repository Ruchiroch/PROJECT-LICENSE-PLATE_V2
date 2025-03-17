'use client';
import { useSession } from "next-auth/react";
import NavbarUser from "./navbarUser";
import NavbarAdmin from "./navbarAdmin";

export default function Navbar() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  if (!role) return null; // ไม่แสดง Navbar หากไม่มี role

  return (
    <>
      {role === "admin" ? <NavbarAdmin /> : <NavbarUser />}
    </>
  );
}
