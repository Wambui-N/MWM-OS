import { auth } from "./auth"
export default auth

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/pipeline/:path*",
    "/projects/:path*",
    "/content/:path*",
    "/settings/:path*",
  ],
}
