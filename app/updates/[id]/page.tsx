import type { Metadata } from "next";
import { getUpdateImage, updates } from "../../../data/updates";
import { getSiteUrl } from "../../site-url";

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const update = updates.find((item) => item.id === Number(id));

  if (!update) {
    return {
      title: "Update Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/updates/${update.id}`;
  const image = getUpdateImage(update);

  return {
    title: update.title,
    description: update.summary,

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      type: "article",
      title: update.title,
      description: update.summary,
      url: canonicalUrl,
      siteName: "S.O.H CONSULTS",
      images: image
        ? [
            {
              url: image,
              alt: update.title,
            },
          ]
        : undefined,
    },

    twitter: {
      card: "summary_large_image",
      title: update.title,
      description: update.summary,
      images: image ? [image] : undefined,
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function UpdateDetailsLayout({ children }: Props) {
  return children;
}