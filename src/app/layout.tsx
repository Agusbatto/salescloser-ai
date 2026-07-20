import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SalesCloser AI",
  description:
    "CRM con inteligencia artificial especializado en aumentar la tasa de conversión de ventas.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
