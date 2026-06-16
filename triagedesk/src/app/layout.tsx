import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TriageDesk",
  description: "AI support triage with human-in-the-loop review",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
