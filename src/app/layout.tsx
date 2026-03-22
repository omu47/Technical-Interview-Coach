import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Technical Interview Coach",
  description: "AI-powered interview coach for technical roles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
