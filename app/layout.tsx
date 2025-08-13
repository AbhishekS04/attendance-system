import type React from "react"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} antialiased dark`}>
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Smart Attendance Management System" />
        <title>AttendanceHub - Smart Attendance Management</title>
      </head>
      <body className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-gray-100 overflow-x-hidden">
        <div className="min-h-screen relative">
          {/* Background decoration */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          {children}
        </div>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.app'
    };
