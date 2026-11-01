// @polsia:user-owned — per-page metadata in one shape.
//
// A page that sets its own `openGraph` replaces the layout's whole object, which
// silently drops og:image, og:type, og:site_name and og:url, and leaves Twitter on
// the site defaults. pageMetadata() always sets the complete set for the page, plus the
// search-engine ownership tags when the deploy provides them (siteVerification below).
import type { Metadata } from 'next';
import { companyName, siteName } from '@/lib/brand';

/** The framework's file-based social image (src/app/opengraph-image.tsx). */
const SOCIAL_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: `${siteName} by ${companyName}`,
  type: 'image/png',
} as const;

export interface PageMetadataInput {
  /**
   * Page title. The layout appends " · Renor" unless `absolute` is set or the title already
   * names Renor ("Renor plans — …"), so no tab ever reads "Renor … · Renor".
   */
  title: string;
  description: string;
  /** App-absolute path, used for the canonical URL and og:url. */
  path: string;
  /** Optional shorter or punchier title for link previews. */
  socialTitle?: string;
  /** Use the title exactly as given (the home page). */
  absolute?: boolean;
  /**
   * The route has its own opengraph-image/twitter-image files (e.g. each product page):
   * leave `images` unset so those files are used instead of the site-wide image.
   */
  ownImage?: boolean;
  /** A page-specific social image (a static file in public/), e.g. the Renor launch card. */
  image?: { url: string; width: number; height: number; alt: string; type?: string };
}

const SITE_WORD = new RegExp(`\\b${siteName}\\b`);

/** True when the title already carries the site name as a word, e.g. "Renor Plugin Store". */
function namesSite(title: string): boolean {
  return SITE_WORD.test(title);
}

/** Environment variables holding the search engines' ownership tokens (docs/seo/search-console.md). */
export const VERIFICATION_ENV = {
  google: 'GOOGLE_SITE_VERIFICATION',
  bing: 'BING_SITE_VERIFICATION',
} as const;

/** Tokens are base64url (Google) or hex (Bing): letters, digits and `-_.+/=`, never spaces. */
const TOKEN = /^[A-Za-z0-9_\-.+/=]{8,128}$/;

/**
 * The token from whatever the founder pasted: the token itself, the whole
 * `<meta name="…" content="…">` tag, or a DNS-style `google-site-verification=…` value.
 * Anything else gives `undefined`, so a mistyped value never renders a broken tag.
 */
export function verificationToken(raw: string | undefined): string | undefined {
  const value = raw?.trim();
  if (!value) return undefined;
  const fromTag = value.match(/content\s*=\s*["']([^"']*)["']/i)?.[1];
  const token = (fromTag ?? value)
    .trim()
    .replace(/^(?:google-site-verification|msvalidate\.01)[=:]\s*/i, '');
  return TOKEN.test(token) ? token : undefined;
}

/**
 * Google Search Console and Bing Webmaster Tools ownership meta tags, from the deploy's
 * GOOGLE_SITE_VERIFICATION and BING_SITE_VERIFICATION. Unset (or unrecognisable) means no tag.
 */
export function siteVerification(
  env: Record<string, string | undefined> = process.env,
): Metadata['verification'] {
  const google = verificationToken(env[VERIFICATION_ENV.google]);
  const bing = verificationToken(env[VERIFICATION_ENV.bing]);
  if (!google && !bing) return undefined;
  return {
    ...(google ? { google } : {}),
    ...(bing ? { other: { 'msvalidate.01': bing } } : {}),
  };
}

export function pageMetadata({
  title,
  description,
  path,
  socialTitle,
  absolute = false,
  ownImage = false,
  image,
}: PageMetadataInput): Metadata {
  const socialImage = image ?? SOCIAL_IMAGE;
  const exact = absolute || namesSite(title);
  const social = socialTitle ?? (exact ? title : `${title} · ${siteName}`);
  const verification = siteVerification();
  return {
    title: exact ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName,
      locale: 'en_GB',
      url: path,
      title: social,
      description,
      ...(ownImage ? {} : { images: [socialImage] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: social,
      description,
      ...(ownImage ? {} : { images: [{ url: socialImage.url, alt: socialImage.alt }] }),
    },
    ...(verification ? { verification } : {}),
  };
}
