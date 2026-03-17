import type { Metadata } from "next";
import { Providers } from "./providers";
import { Sidebar } from "@/features/ui-facelift/components/layout/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Genie OS",
  description: "Discover, analyze, and replicate winning competitor ads",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning>
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 bg-black min-h-screen">
              <div className="p-6 max-w-[1600px] mx-auto">{children}</div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
