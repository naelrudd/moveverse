import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";

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
              <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 border-b-4 border-primary/20">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 md:gap-6">
                  <div className="flex items-center gap-2">
                    <img
                      src="/logo.png"
                      alt="MOVEVERSE"
                      className="w-10 h-10 rounded-full shadow-sm object-cover ring-2 ring-primary/30"
                    />
                    <div className="text-xs font-bold">
                      <span className="text-primary">MOVE</span>
                      <span className="text-foreground">VERSE</span>
                    </div>
                  </div>
                  <nav className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
                    <button className="px-3 py-2 rounded-full text-sm font-bold bg-primary text-primary-foreground shadow-soft scale-105">Dashboard</button>
                    <button className="px-3 py-2 rounded-full text-sm font-bold text-foreground/70 hover:bg-primary/10 hover:text-primary">Worlds</button>
                    <button className="px-3 py-2 rounded-full text-sm font-bold text-foreground/70 hover:bg-primary/10 hover:text-primary">AI Coach</button>
                    <button className="px-3 py-2 rounded-full text-sm font-bold text-foreground/70 hover:bg-primary/10 hover:text-primary">Parents</button>
                    <button className="px-3 py-2 rounded-full text-sm font-bold text-foreground/70 hover:bg-primary/10 hover:text-primary">Teachers</button>
                    <button className="px-3 py-2 rounded-full text-sm font-bold text-foreground/70 hover:bg-primary/10 hover:text-primary">Schools</button>
                  </nav>
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-sunny/30 flex items-center justify-center text-xs font-bold">
                      1,240
                    </div>
                  </div>
                </div>
              </header>
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
