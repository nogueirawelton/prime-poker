import { Footer } from "@/components/globals/footer";
import { Loading } from "@/components/globals/loading";
import { AppProvider } from "@/hooks/use-app";
import { Montserrat } from "next/font/google";
import { headers } from "next/headers";
import { ToastContainer } from "react-toastify";
import { Header } from "../components/globals/header";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${montserrat.variable} scroll-pt-24 scroll-smooth`}
    >
      <body className="antialiased">
        <AppProvider headers={headers()}>
          <Header />
          <div id="smooth-wrapper">
            <div id="smooth-content">
              {children}
              <Footer />
            </div>
          </div>
        </AppProvider>
        <Loading />
        <ToastContainer />
      </body>
    </html>
  );
}
