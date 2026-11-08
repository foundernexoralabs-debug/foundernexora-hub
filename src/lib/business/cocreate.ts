// @polsia:user-owned — Co-Create London: the facts behind /cocreate and its QR code.
// The QR code (public/assets/cocreate/renor-cocreate-qr.svg) encodes COCREATE_URL. It was generated with
// the QR encoder npm itself ships (qrcode-terminal) and checked by decoding it back.
// Demo video: none yet. DEMO_VIDEO stays null until a real recording exists; the page shows no
// video slot while it is null. Never point it at a mock-up or a recording of an older build.
import { siteUrl } from '@/lib/site';

export const COCREATE_PATH = '/cocreate';
/** What the printed QR code opens. Always the production address, whatever the deploy. */
export const COCREATE_URL = 'https://renor.app/cocreate';

export const EVENT = {
  name: 'Co-Create London',
  date: '19 November 2026',
  iso: '2026-11-19',
  city: 'London',
} as const;

export const QR_CODE = {
  src: '/assets/cocreate/renor-cocreate-qr.svg',
  /** 25 modules plus a 4-module quiet zone each side. */
  size: 33,
  alt: `QR code that opens ${COCREATE_URL}`,
} as const;

/** A real, published recording of Renor, or null. See the note above. */
export const DEMO_VIDEO: { title: string; youtubeId: string; recorded: string } | null = null;

/** This page on whatever host serves it, for metadata. */
export const COCREATE_CANONICAL = `${siteUrl}${COCREATE_PATH}`;
