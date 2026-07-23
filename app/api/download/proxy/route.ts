import { NextRequest } from 'next/server';

const ALLOWED_DOMAINS = [
  'tiktok.com', 'tiktokcdn.com',
  'instagram.com', 'cdninstagram.com',
  'youtube.com', 'youtu.be', 'ytimg.com',
  'yt-dl.click', 'googlevideo.com',
  'open.spotify.com', 'scdn.co', 'spotifycdn.com',
  'facebook.com', 'fbcdn.net',
  'reddit.com', 'redd.it',
  'pinterest.com', 'pinimg.com',
  'twitter.com', 'x.com', 'twimg.com',
];

function isAllowedUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    // Block private IPs
    const hostname = parsed.hostname;
    if (hostname === 'localhost' || hostname.startsWith('127.') || hostname.startsWith('10.') ||
        hostname.startsWith('192.168.') || hostname.startsWith('169.254.') ||
        hostname === '0.0.0.0' || hostname === '[::1]') return false;
    return ALLOWED_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d));
  } catch {
    return false;
  }
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-.]/g, '_').slice(0, 128) || 'download';
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  const rawFilename = request.nextUrl.searchParams.get('filename') || 'download';
  const filename = sanitizeFilename(rawFilename);

  if (!url) {
    return Response.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  if (!isAllowedUrl(url)) {
    return Response.json({ error: 'URL not allowed' }, { status: 403 });
  }

  try {
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };

    if (url.includes('tiktok.com')) headers['Referer'] = 'https://www.tiktok.com/';
    else if (url.includes('instagram.com') || url.includes('cdninstagram.com')) headers['Referer'] = 'https://www.instagram.com/';
    else if (url.includes('youtube.com') || url.includes('youtu.be')) headers['Referer'] = 'https://www.youtube.com/';
    else if (url.includes('spotify.com') || url.includes('scdn.co')) headers['Referer'] = 'https://open.spotify.com/';

    const response = await fetch(url, { headers });

    if (!response.ok) {
      return Response.json({ error: `Failed to fetch: ${response.status}` }, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');

    const responseHeaders = new Headers({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-cache',
    });

    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }

    return new Response(response.body, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Proxy error';
    return Response.json({ error: msg }, { status: 500 });
  }
}
