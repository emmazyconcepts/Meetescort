// src/app/layout.js
import { AuthProvider } from '@/context/AuthContext';
import { WalletProvider } from '@/context/WalletContext';
import './globals.css';
import { NowPaymentsWalletProvider } from '@/context/NowPaymentsWalletContext';


export const metadata = {
  title: 'MeetAnEscort - Premium Dating Platform',
  description: 'Connect with verified professionals in your area',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900">
        <AuthProvider>
          <WalletProvider>
          <NowPaymentsWalletProvider>

            {children}

            </NowPaymentsWalletProvider>

          </WalletProvider>
        </AuthProvider>
      </body>
    </html>
  );
}