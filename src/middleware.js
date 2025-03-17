import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  console.log('Middleware called for:', request.nextUrl.pathname);

  // ข้าม Static Assets
  if (request.nextUrl.pathname.startsWith('/_next') || request.nextUrl.pathname.includes('.')) {
    return NextResponse.next();
  }

  const user = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ตรวจสอบ session ว่ามีการล็อกอินแล้วหรือยัง
  if (user) {
    // ถ้าเป็นหน้าล็อกอินแล้วมี session อยู่ ก็ให้ไปที่หน้า dashboard หรือหน้า home
    if (request.nextUrl.pathname === '/page/login' || request.nextUrl.pathname === '/') {
      console.log('User already logged in, redirecting to homepage...');
      if (user.role === 'user') {
        return NextResponse.redirect(new URL('/user/homepageuser', request.url));
      } else {
        return NextResponse.redirect(new URL('/admin/homepageadmin', request.url));
      }
    }
  }

  if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/user')) {
    if (!user) {
      console.log('User not logged in, redirecting to login...');
      return NextResponse.redirect(new URL('/page/login', request.url));
    }
    if (request.nextUrl.pathname.startsWith('/admin') && user.role !== 'admin') {
      console.log('User is not admin, redirecting to home...');
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.set('next-auth.session-token', '', { maxAge: -1 }); // ลบ cookie ของ session
      return response;
    }
    console.log('User is allowed to access this page');
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*', '/page/login', '/'], // Middleware จะทำงานเฉพาะเส้นทางที่กำหนด
};
