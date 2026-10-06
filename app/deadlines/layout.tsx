import type {Viewport} from "next";
export const viewport:Viewport={width:"device-width",initialScale:1,userScalable:true};
export default function Layout({children}:{children:React.ReactNode}){return children;}
