import React from "react";
import "@goober/styles/globals.css";

import { GeistSans } from "geist/font/sans";

import { TRPCReactProvider } from "@goober/trpc/react";
import { fonts } from "./lib/fonts";
import NavBar from "./components/NavBar";

export const metadata = {
  title: "Goober",
  description: "Goober web app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.warn('layout')

  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <NavBar />
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
