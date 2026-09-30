import "./globals.css";
import Link from "next/link";
export const metadata = { title: "Relay Commerce" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body className="min-h-screen bg-white text-gray-900">
      <nav className="border-b"><div className="mx-auto flex max-w-6xl items-center justify-between p-4"><Link href="/" className="font-bold">Relay</Link><Link href="/cart">Cart</Link></div></nav>
      {children}
    </body></html>
  );
}
