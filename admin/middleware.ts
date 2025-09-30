// middleware.ts (đặt ở root của project, cùng cấp với app/)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Danh sách các route cần bảo vệ (yêu cầu authentication)
const protectedRoutes = [
  '/',
  '/Business',
  'Individual'
  // Thêm các route khác cần bảo vệ
];

// Danh sách các route public (không cần authentication)
const publicRoutes = [
  '/login'

];

// Danh sách các route chỉ dành cho user chưa đăng nhập
const authRoutes = [
  '/login'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Lấy token từ cookie hoặc header
  const token = request.cookies.get('accessToken')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  const isAuthenticated = !!token;
  
  // Kiểm tra nếu đang ở route được bảo vệ
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Kiểm tra nếu đang ở route dành cho user chưa đăng nhập
  const isAuthRoute = authRoutes.includes(pathname);
  
  // Nếu user chưa đăng nhập và cố truy cập route được bảo vệ
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    // Lưu URL người dùng muốn truy cập để redirect sau khi login
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Nếu user đã đăng nhập và cố truy cập trang login/register
  if (isAuthenticated && isAuthRoute) {
    // Kiểm tra nếu có callbackUrl thì redirect về đó, không thì về home
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
    const redirectUrl = callbackUrl || '/'; 
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }
  
  // Cho phép truy cập bình thường
  return NextResponse.next();
}

// Cấu hình matcher để chỉ chạy middleware trên các route cần thiết
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};