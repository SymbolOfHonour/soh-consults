import Image from "next/image";

export default function UpdatesLoading() {
  return (
    <div
      role="status"
      className="fixed inset-0 z-[100] grid place-items-center bg-[radial-gradient(ellipse_at_center,#17543c,#09271d_70%)] text-white motion-safe:animate-[soh-loading-in_180ms_ease-out_100ms_both]"
    >
      <style>{`@keyframes soh-loading-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }`}</style>
      <div className="grid justify-items-center gap-4 px-4 text-center">
        <Image
          src="/icons/icon-192.png"
          alt=""
          width={88}
          height={88}
          loading="eager"
          unoptimized
          className="rounded-2xl bg-white"
        />
        <p className="text-sm font-semibold tracking-[0.2em]">S.O.H CONSULTS</p>
        <p className="text-xs text-emerald-100">Loading page…</p>
      </div>
    </div>
  );
}
