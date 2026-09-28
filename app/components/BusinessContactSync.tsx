"use client";

import { useEffect } from "react";

const SUPPORT_EMAIL = "support@sohconsults.com.ng";
const INSTAGRAM = "https://www.instagram.com/sohconsults/";
const FACEBOOK = "https://www.facebook.com/share/19Mzqo5Ggg/";
const WHATSAPP_CHANNEL = "https://whatsapp.com/channel/0029VbD6QQp3GJP68dl9TK29";

function syncBusinessContacts() {
  document.querySelectorAll<HTMLAnchorElement>('a[href="mailto:oluyepeadetayo@gmail.com"], a[href="mailto:Oluyepeadetayo@gmail.com"]').forEach((link) => {
    link.href = `mailto:${SUPPORT_EMAIL}`;
    if (link.textContent?.toLowerCase().includes("oluyepeadetayo")) link.textContent = SUPPORT_EMAIL;
  });

  document.querySelectorAll<HTMLAnchorElement>('a[href*="instagram.com/oluyepeadetayo"]').forEach((link) => {
    link.href = INSTAGRAM;
  });

  document.querySelectorAll("footer").forEach((footer) => {
    const contactHeading = Array.from(footer.querySelectorAll("h2")).find((heading) => heading.textContent?.trim() === "Contact Us");
    const contactBlock = contactHeading?.parentElement;
    if (!contactBlock || contactBlock.querySelector('[data-business-socials="true"]')) return;

    const socials = document.createElement("div");
    socials.dataset.businessSocials = "true";
    socials.className = "mt-2 flex flex-wrap gap-x-3 gap-y-2 text-xs";
    socials.innerHTML = [
      `<a href="${INSTAGRAM}" target="_blank" rel="noopener noreferrer" class="text-[#e6f0e9] hover:underline">Instagram</a>`,
      `<a href="${FACEBOOK}" target="_blank" rel="noopener noreferrer" class="text-[#e6f0e9] hover:underline">Facebook</a>`,
      `<a href="${WHATSAPP_CHANNEL}" target="_blank" rel="noopener noreferrer" class="text-[#e6f0e9] hover:underline">WhatsApp Channel</a>`,
    ].join("");
    contactBlock.appendChild(socials);
  });
}

export default function BusinessContactSync() {
  useEffect(() => {
    syncBusinessContacts();
    const observer = new MutationObserver(syncBusinessContacts);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
