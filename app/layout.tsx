import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { Header } from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MOVEVERSE",
  description: "AI Movement Coach: Jump, run, throw, balance. Physical Literacy for Gen Z.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ConvexClientProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1 pb-12">
                {children}
              </main>
              <footer className="text-center text-xs text-muted-foreground py-4">
                Built with 💙 in the MOVEVERSE &copy; {new Date().getFullYear()}
              </footer>
            </div>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
