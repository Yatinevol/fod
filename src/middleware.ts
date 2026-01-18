import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
// this protects only client side routing and not the api routes so its better to use auth to verify session and token in api routes.

export async function middleware(request:NextRequest) {
    const token = await getToken({req: request, secret: process.env.AUTH_SECRET})
    const url = request.nextUrl

    if(!token && (url.pathname.startsWith('/goal')
                || url.pathname.startsWith('/dashboard')
                || url.pathname.startsWith('/timer')
                || url.pathname.startsWith('/streak')
    )){
        return NextResponse.redirect(new URL('/sign-in', request.url))
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*', '/goal/:path*', '/timer/:path*', '/streak/:path*', '/goal', '/timer'
    ]
}