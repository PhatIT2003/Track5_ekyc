import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap'
});

export const metadata = {
  title: 'EG TEAM - Blockchain & Web3 Solutions',
  description: 'EG TEAM là đội ngũ chuyên gia nghiên cứu và phát triển công nghệ Blockchain, Web3 và DePIN hàng đầu Việt Nam',
  keywords: ['blockchain', 'web3', 'depin', 'vietnam', 'technology', 'ai', 'iot'],
  authors: [{ name: 'EG TEAM' }],
  creator: 'EG TEAM',
  publisher: 'EG TEAM',
  icons: {
    icon: '/favicon.ico', // ✅ đường dẫn tuyệt đối từ thư mục /public
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='vi' className='scroll-smooth'>
      <head>
        <meta name='theme-color' content='#0a0a0a' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      </head>
      <body className={`${inter.variable} antialiased min-h-screen`}>{children}</body>
    </html>
  );
}
