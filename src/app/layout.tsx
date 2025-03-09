import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const excalifont = localFont({
  src: [{ path: "../../public/Excalifont-Regular.woff2" }],
});

export const metadata: Metadata = {
  title: "brutle",
  description: "for when you run out of ideas on how to solve your word puzzle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${excalifont.className} flex flex-col text-center w-screen h-screen overflow-clip items-center justify-center antialiased select-none`}
      >
        {children}
      </body>
    </html>
  );
}
