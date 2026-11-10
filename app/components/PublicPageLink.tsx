"use client";

import Link, { useLinkStatus } from "next/link";
import type { ComponentProps } from "react";
import { createPortal } from "react-dom";
import BrandedPageLoading from "./BrandedPageLoading";

function PendingScreen() {
  const { pending } = useLinkStatus();
  return pending ? createPortal(<BrandedPageLoading />, document.body) : null;
}

export default function PublicPageLink({ children, ...props }: ComponentProps<typeof Link>) {
  return <Link {...props}>{children}<PendingScreen /></Link>;
}
