import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "外字レビュー試作版",
  description: "字形適合性チェック用の内部ツール試作版",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-w-80 font-sans">{children}</body>
    </html>
  );
}
