import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

import Providers from "./providers";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "UX Indexer",
  description: "Application Web3 avec Wagmi",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <Providers>
          {/* Header affiché sur toutes les pages */}
          <Header />

          {/* Contenu de la page actuelle */}
          {children}
        </Providers>
      </body>
    </html>
  );
}