import { Header } from "@/components/Header";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1 pb-12">
        {children}
      </main>
      <footer className="text-center text-xs text-muted-foreground py-4">
        Built with 💙 in the MOVEVERSE &copy; {new Date().getFullYear()}
      </footer>
    </>
  );
}
