import { permanentRedirect } from "next/navigation";

export default function PrivacyShortUrl() {
  permanentRedirect("/privacy-policy");
}
