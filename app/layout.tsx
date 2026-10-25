import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { WelcomeHeading } from "@/components/welcome-heading";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GradeBox",
  description: "Teacher grading workload management",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <DashboardShell
          welcome={
            <Suspense
              fallback={
                <p className="text-base font-semibold text-slate-900">
                  Welcome back
                </p>
              }
            >
              <WelcomeHeading />
            </Suspense>
          }
        >
          {children}
        </DashboardShell>
      </body>
    </html>
  );
}