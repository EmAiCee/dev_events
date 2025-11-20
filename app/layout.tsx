import type { Metadata } from "next";
import { Schibsted_Grotesk, Martian_Mono } from "next/font/google";
import "./globals.css";
import LightRays from "./components/lightRays";
import NavBar from "./components/NavBar";

const SchibstedGrotesk = Schibsted_Grotesk({
  variable: '--font-schibsted-grotesk',
  subsets: ["latin"],
});

const MartianMono = Martian_Mono({
  variable: '--font-martian-mono',
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dev_Events",
  description: "The Hub for Developer Events Worldwide",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${SchibstedGrotesk.variable} ${MartianMono.variable} min-h-screen antialiased`}
      >
        <NavBar/>
      
<div className="absolute inset-0 top-0 z-[-1] min-h-screen overflow-hidden">
<LightRays
    raysOrigin="top-center-offset"
    raysColor="#5dfeca"
    raysSpeed={0.5}
    lightSpread={0.9}
    rayLength={1.2}
    followMouse={true}
    mouseInfluence={0.02}
    noiseAmount={0.1}
    distortion={0.05}
    className="custom-rays"
  />
</div>

  <main>
 {children}
  </main>

       
      </body>
    </html>
  );
}
