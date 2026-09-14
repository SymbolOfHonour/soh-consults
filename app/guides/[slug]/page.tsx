import type { Metadata } from "next";
import { guides } from "../../../data/guides";
import { getSiteUrl } from "../../site-url";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides.find((item) => item.slug === slug);

  if (!guide) {
    return {
      title: "Guide Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/guides/${guide.slug}`;

  return {
    title: guide.title,
    description: guide.summary,

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.summary,
      url: canonicalUrl,
      siteName: "S.O.H CONSULTS",
    },

    twitter: {
      card: "summary",
      title: guide.title,
      description: guide.summary,
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function GuideLayout({ children }: Props) {
  return children;
}