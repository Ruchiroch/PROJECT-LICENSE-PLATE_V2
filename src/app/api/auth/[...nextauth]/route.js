import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import GoogleProvider from "next-auth/providers/google";
import { io } from 'socket.io-client';
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient()
// เชื่อมต่อกับ WebSocket ที่เซิร์ฟเวอร์
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL); // เปลี่ยน URL ตามเซิร์ฟเวอร์ของคุณ

export const authOptions = {

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'john@doe.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (
          user &&
          (await bcrypt.compare(credentials.password, user.password))
        ) {
          return {
            user_id: user.user_id,
            role: user.role
          }
        } else {
          throw new Error('Invalid email or password')
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      httpOptions: {
        timeout: 5000, // เพิ่มเวลา timeout เป็น 5000ms
      },
      profile: async (profile) => {
        let user = await prisma.user.findUnique({
          where: { email: profile.email },
        });
        // console.log('Email:', profile.email);

        // ถ้าผู้ใช้ไม่มีในระบบ, สร้างผู้ใช้ใหม่
        if (!user) {
          // แยกชื่อและนามสกุลจาก profile.name
          user = await prisma.user.create({
            data: {
              email: profile.email,
              firstname: profile.given_name || 'ไม่ระบุ',  // ใช้ข้อมูลจาก Google
              lastname: profile.family_name || 'ไม่ระบุ',
              provider: 'google',
            },
          });
          socket.emit('update_data');
        }

        // console.log("User GOOGLE :", profile)
        // console.log("User database :", user)

        // ส่งข้อมูลผู้ใช้กลับไปยังเซสชัน
        return {
          id: profile.sub,
          user_id: user.user_id,
          name: `${profile.given_name} ${profile.family_name}`,
          email: user.email,
          role: user.role
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 3 * 60 * 60, //วัน*ชม.*นาที*วินาที
  },

  pages: {
    signIn: "/page/login",
  },

  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.user_id = user.user_id || user.id;
        token.role = user.role;
        //  console.log("🔑 JWT Token Created:", token); // ตรวจสอบค่าที่ถูกสร้าง
      }
      return token;
    },


    session: async ({ session, token }) => {
      // console.log("📌 Session Token Before Assignment:", token); // ตรวจสอบ token ก่อน assign
      if (session.user) {
        session.user.user_id = token.user_id;
        session.user.role = token.role;
      }
      // console.log("📌 Session Data with Role:", session);  // ตรวจสอบค่าของ sessionrn
      return session;
    },


   
  },
  // debug: true, // ✅ เปิด debug mode เพื่อตรวจสอบ error

}
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }
