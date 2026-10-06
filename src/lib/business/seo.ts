// @polsia:user-owned — per-page metadata in one shape.
//
// A page that sets its own `openGraph` replaces the layout's whole object, which
// silently drops og:image, og:type, og:site_name and og:url, and leaves Twitter on
// the site defaults. pageMetadata() always sets the complete set for the page.
import type { Metadata } from 'next';
import { siteName } from '@/lib/brand';

/** The framework's file-based social image (src/app/opengraph-image.tsx). */
const SOCIAL_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: `${siteName}, the company behind Renor`,
  type: 'image/png',
} as const;

export interface PageMetadataInput {
  /** Page title; the layout appends " · FounderLab" unless `absolute` is set. */
  title: string;
  description: string;
  /** App-absolute path, used for the canonical URL and og:url. */
  path: string;
  /** Optional shorter or punchier title for link previews. */
  socialTitle?: string;
  /** Use the title exactly as given (the home page). */
  absolute?: boolean;
}

export function pageMetadata({
  title,
  description,
  path,
  socialTitle,
  absolute = false,
}: PageMetadataInput): Metadata {
  const social = socialTitle ?? (absolute ? title : `${title} · ${siteName}`);
  return {
    title: absolute ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName,
      locale: 'en_GB',
      url: path,
      title: social,
      description,
      images: [SOCIAL_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: social,
      description,
      images: [{ url: SOCIAL_IMAGE.url, alt: SOCIAL_IMAGE.alt }],
    },
  };
}
