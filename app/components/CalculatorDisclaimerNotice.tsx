"use client";

import { usePathname } from "next/navigation";

export default function CalculatorDisclaimerNotice() {
  const pathname = usePathname();
  if (pathname !== "/lasu-calculator" && pathname !== "/lasu-calculator/") return null;

  return (
    <aside aria-label="LASU calculator disclaimer" className="mx-auto w-full max-w-5xl px-4 pb-6 sm:px-6">
      <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-950">
        <strong>Important:</strong> This independent calculator provides estimates for guidance only. Results are not an official LASU eligibility decision or admission offer. Verify the latest requirements directly with LASU. <a href="/disclaimer" className="font-semibold underline underline-offset-2 hover:text-green-700">Read the full disclaimer</a>.
      </p>
    </aside>
  );
}
