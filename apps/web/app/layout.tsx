import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SmartSave AI Wallet",
    template: "%s | SmartSave",
  },
  description:
    "Save Smart. Spend Only When It Matters. AI-powered wallet that protects your savings with intelligent document verification.",
  keywords: ["wallet", "savings", "AI", "fintech", "smart savings"],
  authors: [{ name: "SmartSave" }],
  creator: "SmartSave",
  openGraph: {
    title: "SmartSave AI Wallet",
    description: "Save Smart. Spend Only When It Matters.",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09090B" },
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey="pk_test_c29saWQtZWFyd2lnLTI5LmNsZXJrLmFjY291bnRzLmRldiQ"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <html
        lang="en"
        data-theme="dark"
        suppressHydrationWarning
      >
        <head>
          {/* Prevent FOUC — apply dark theme before render */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  var t = localStorage.getItem('smartsave-theme') || 'dark';
                  var r = t === 'system'
                    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                    : t;
                  document.documentElement.setAttribute('data-theme', r);
                } catch(e) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              `,
            }}
          />
        </head>
        <body className="bg-bg-base text-text-primary antialiased">
          <AppProviders>
            <div className="app-container">
              {children}
            </div>
          </AppProviders>
        </body>
      </html>
    </ClerkProvider>
  );
}
