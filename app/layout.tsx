import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LinCheng Store',
  description: 'Hệ thống quản lý đơn hàng LinCheng Store',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}

