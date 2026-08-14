import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
const geist=Geist({variable:"--font-geist",subsets:["latin"]});
const mono=Geist_Mono({variable:"--font-mono",subsets:["latin"]});
export const metadata:Metadata={title:"CotizaClaro · Comparador eléctrico",description:"Compara cotizaciones eléctricas desde fotos, PDF, Excel o CSV."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body className={`${geist.variable} ${mono.variable}`}>{children}</body></html>}
