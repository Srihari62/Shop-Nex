import Header from "../shared/widgets/header";
import "./global.css";
import { Poppins, Roboto } from "next/font/google";
import Providers from "./providers";

export const metadata = {
  title: "Welcome to Shop-Nex",
  description: "One stop solution for all your shopping needs",
};
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "900", "700"],
  variable: "--font-roboto",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "900", "700", "600", "800"],
  variable: "--font-poppins",
});
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${roboto.variable} ${poppins.variable}`}>
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
