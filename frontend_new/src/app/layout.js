import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "NiyamR Flow - Document Intelligence Platform",
  description:
    "AI-powered document processing that extracts, understands, and structures information from any document automatically.",
  keywords: [
    "document processing",
    "AI document analysis",
    "OCR",
    "document intelligence",
    "PDF processing",
    "data extraction",
  ],
  authors: [{ name: "NiyamR Flow" }],
  openGraph: {
    title: "NiyamR Flow - Document Intelligence Platform",
    description:
      "AI-powered document processing that extracts, understands, and structures information from any document automatically.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="corporate">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'corporate';
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="w-full min-h-screen text-text-primary bg-background">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}