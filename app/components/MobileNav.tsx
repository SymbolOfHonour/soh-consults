"use client";
import {usePathname} from "next/navigation";
const items=[
 {href:"/",label:"Home",icon:"⌂"},
 {href:"/updates",label:"Updates",icon:"▤"},
 {href:"/search",label:"Search",icon:"⌕"},
 {href:"/tools",label:"Tools",icon:"▦"},
 {href:"/#contact",label:"Contact",icon:"☏"},
];
export default function MobileNav(){const pathname=usePathname();if(pathname.startsWith("/admin"))return null;return <nav className="soh-mobile-nav" aria-label="Mobile navigation">{items.map(item=>{const active=item.href==="/"?pathname==="/":item.href==="/tools"?(pathname==="/tools"||pathname.includes("calculator")||pathname.startsWith("/admission-matcher")):pathname.startsWith(item.href.split("#")[0]);return <a key={item.label} href={item.href} aria-current={active?"page":undefined} className={active?"active":""}><span aria-hidden="true">{item.icon}</span><small>{item.label}</small></a>})}</nav>}
