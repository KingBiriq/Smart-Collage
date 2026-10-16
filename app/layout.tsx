import type {Metadata,Viewport} from 'next';
import './globals.css';
export const metadata:Metadata={icons:{icon:'/brand/app-icon.svg'},title:'Smart Collage · Aqoonta maanta, fursadaha berri',description:'Waxbarasho tayo leh oo Af-Soomaali ah. Baro meel kasta, maalin kasta.'};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#114b9c'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="so"><body><a className="skip-link" href="#main">Skip to content</a>{children}</body></html>;}
