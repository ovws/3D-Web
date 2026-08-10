import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "🚗",
  description:
    "文山木公 / OVWS 的交互式 3D 个人空间：自托管、Rime、AI 工具链与日常折腾。",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/game/favicons/favicon.svg",
    shortcut: "/game/favicons/favicon.ico",
    apple: "/game/favicons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1d1721",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
