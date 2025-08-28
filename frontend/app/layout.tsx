import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SignalVerse",
  description: "Realtime Crypto Signal Dashboard powered by Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
