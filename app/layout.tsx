import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { DataStoreProvider } from "@/lib/data-store"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Medical Billing Dashboard",
  description: "Attendance and team management system",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <DataStoreProvider>{children}</DataStoreProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
