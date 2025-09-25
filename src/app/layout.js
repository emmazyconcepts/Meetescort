// src/app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'MeetAnEscort - Premium Dating Platform',
  description: 'Connect with verified professionals in your area',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
          {children}
        </main>
      </body>
    </html>
  );
}