import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { UserProvider } from "@/context/UserContext";
import VisitTracker from "@/components/VisitTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sanotaf - Biologiya O'qituvchilari Uchun",
  description: "Sanogen tafakkur va innovatsion ta'lim platformasi. Biologiya o'qituvchilari malakasini oshirish va yondashuvlarni takomillashtirish tizimi.",
  keywords: ["biologiya", "sanogen tafakkur", "ta'lim", "o'qituvchi", "lms", "innovatsion ta'lim", "malaka oshirish", "sanotaf"],
  authors: [{ name: "Sanotaf Edu" }],
  openGraph: {
    title: "Sanotaf - Biologiya O'qituvchilari Uchun",
    description: "Sanogen tafakkur va innovatsion ta'lim platformasi. Biologiya o'qituvchilari malakasini oshirish tizimi.",
    url: "https://sanotaf.edu",
    siteName: "Sanotaf",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uz"
      suppressHydrationWarning
    >
      <body className={`${geistSans.variable} ${geistMono.variable} ${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <UserProvider>
              {children}
              <VisitTracker />
            </UserProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
