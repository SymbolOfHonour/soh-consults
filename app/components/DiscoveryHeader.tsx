"use client";
import PublicPageLink from "./PublicPageLink";
import {DisplaySettingsButton} from "./DisplayPreferences";
import PortalNavigation from "./PortalNavigation";
export default function DiscoveryHeader(){
  return <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 lg:px-8"><PublicPageLink href="/" aria-label="S.O.H CONSULTS homepage"><img src="/soh-logo.jpg" alt="S.O.H CONSULTS" className="h-10 w-auto max-w-24 sm:h-12"/></PublicPageLink><div className="flex items-center gap-2"><DisplaySettingsButton/><PublicPageLink href="/search" className="rounded-xl border border-green-800 px-3 py-3 text-sm font-bold text-green-800">Search</PublicPageLink><PortalNavigation/></div></div></header>;
}
