import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import { config } from "@/lib/config";
import { themeScript } from "@/lib/theme";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: config.appName, template: `%s | ${config.appName}` },
  description: "Sign in to track and manage your orders.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The theme script edits <html> before React loads, hence suppressHydrationWarning.
    <html
      lang="en"
      data-theme="light"
      className={`${jakarta.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
