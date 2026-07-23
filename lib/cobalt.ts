import { detectPlatform, type Platform } from './utils';

const NANZZ_API = 'https://api-nanzz.my.id/docs/api/downloader';

const COBALT_FALLBACK = 'https://co.eepy.today';

const NANZZ_ENDPOINTS: Record<string, string> = {
  youtube: 'ytmp4.php',
  tiktok: 'tiktok.php',
  instagram: 'Instagram.php',
  twitter: 'twitter.php',
  facebook: 'all-in-one.php',
  reddit: 'all-in-one.php',
  pinterest: 'pinterest-download.php',
  soundcloud: 'soundcloud.php',
  spotify: 'spotify-dl.php',
  terabox: 'terabox.php',
  other: 'all-in-one.php',
};

export interface VideoFormat {
  quality: string;
  url: string;
  mimeType: string;
  type: 'video' | 'audio';
  size?: string;
}

export interface CobaltVideoInfo {
  originalUrl: string;
  title: string;
  thumbnail: string;
  duration: string;
  platform: Platform;
  formats: VideoFormat[];
}

export interface CobaltStreamUrl {
  url: string;
  filename: string;
  type: string;
}

function extractYouTubeId(url: string): string | null {
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  return null;
}

function getThumbnailUrl(url: string): string {
  const ytId = extractYouTubeId(url);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
  return '';
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getEndpoint(url: string): string {
  const platform = detectPlatform(url);
  return NANZZ_ENDPOINTS[platform] || NANZZ_ENDPOINTS.other;
}

function getParamName(url: string): string {
  const platform = detectPlatform(url);
  if (platform === 'twitter') return 'q';
  if (platform === 'pinterest') return 'q';
  return 'url';
}

async function fetchNanzz(endpoint: string, paramName: string, paramValue: string, timeoutMs = 10000): Promise<any> {
  const apiUrl = `${NANZZ_API}/${endpoint}?${paramName}=${encodeURIComponent(paramValue)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status === false) {
      const msg = data.message || data.result?.message || data.debug?.error || 'Download failed';
      throw new Error(msg);
    }

    // Handle different response formats
    if (data.debug?.result) return data.debug.result;
    return data.result || data;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchCobalt(url: string): Promise<any> {
  const response = await fetch(`${COBALT_FALLBACK}/`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      url,
      videoQuality: '1080',
      filenameStyle: 'basic',
    }),
  });

  if (!response.ok) {
    throw new Error(`Cobalt API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.status === 'error' || data.error) {
    const errCode = data.error?.code || data.error?.message || 'Unknown error';
    throw new Error(errCode);
  }

  return data;
}

function parseCobaltResult(url: string, data: any): CobaltVideoInfo {
  const platform = detectPlatform(url);
  const formats: VideoFormat[] = [];

  const title = data.filename?.replace(/\.[^.]+$/, '') || `${platform} Download`;

  // Handle picker response (multiple items) - only take first video
  if (data.status === 'picker' && data.picker) {
    const firstVideo = data.picker.find((item: any) => item.type === 'video' || item.type === 'gif') || data.picker[0];
    if (firstVideo) {
      formats.push({
        quality: 'HD (No Watermark)',
        url: firstVideo.url,
        mimeType: 'video/mp4',
        type: 'video',
      });
    }
  }
  // Handle single tunnel/redirect response
  else if (data.url) {
    formats.push({
      quality: 'HD (No Watermark)',
      url: data.url,
      mimeType: data.output?.type || 'video/mp4',
      type: 'video',
    });
  }

  return {
    originalUrl: url,
    title,
    thumbnail: getThumbnailUrl(url),
    duration: '',
    platform,
    formats,
  };
}

export async function getVideoInfo(url: string): Promise<CobaltVideoInfo> {
  const platform = detectPlatform(url);

  if (platform === 'youtube') {
    return getYouTubeInfo(url);
  }

  if (platform === 'spotify') {
    const data = await fetchNanzz('spotify-dl.php', 'url', url);
    return parseSpotifyInfo(url, data);
  }

  // For other platforms, try Nanzz first, then Cobalt fallback
  // Instagram: try Cobalt first (faster), then Nanzz (slow/unreliable)
  const tryNanzz = async (): Promise<CobaltVideoInfo | null> => {
    try {
      if (platform === 'tiktok') {
        const data = await fetchNanzz('tiktok.php', 'url', url);
        const info = parseTikTokInfo(url, data);
        if (info.formats.length > 0) return info;
      }
      if (platform === 'instagram') {
        const data = await fetchNanzz('Instagram.php', 'url', url);
        const info = parseInstagramInfo(url, data);
        if (info.formats.length > 0) return info;
      }
      if (platform === 'twitter') {
        const data = await fetchNanzz('twitter.php', 'q', url);
        const info = parseTwitterInfo(url, data);
        if (info.formats.length > 0) return info;
      }
      if (platform === 'terabox') {
        const data = await fetchNanzz('terabox.php', 'url', url);
        const info = parseTeraboxInfo(url, data);
        if (info.formats.length > 0) return info;
      }
      const endpoint = getEndpoint(url);
      const paramName = getParamName(url);
      const data = await fetchNanzz(endpoint, paramName, url);
      const info = parseGenericInfo(url, data, platform);
      if (info.formats.length > 0) return info;
    } catch {}
    return null;
  };

  const tryCobalt = async (): Promise<CobaltVideoInfo | null> => {
    try {
      const data = await fetchCobalt(url);
      return parseCobaltResult(url, data);
    } catch {}
    return null;
  };

  // Instagram: try Cobalt first (faster), then Nanzz (slow/unreliable)
  if (platform === 'instagram') {
    const cobaltResult = await tryCobalt();
    if (cobaltResult) return cobaltResult;

    const nanzzResult = await tryNanzz();
    if (nanzzResult) return nanzzResult;
  } else {
    const nanzzResult = await tryNanzz();
    if (nanzzResult) return nanzzResult;

    const cobaltResult = await tryCobalt();
    if (cobaltResult) return cobaltResult;
  }

  throw new Error(`Download not available for this URL. Platform "${platform}" may be temporarily unsupported.`);
}

async function getYouTubeInfo(url: string): Promise<CobaltVideoInfo> {
  const thumbnail = getThumbnailUrl(url);
  let title = 'YouTube Video';

  const fetchFormat = async (q: string, type: 'video' | 'audio'): Promise<VideoFormat | null> => {
    try {
      const result = await fetchNanzz('ytmp4.php', 'q', `${url},${q}`);
      if (result.download_url) {
        if (result.title) title = result.title;
        return {
          quality: q.toUpperCase(),
          url: result.download_url,
          mimeType: type === 'audio' ? 'audio/mpeg' : 'video/mp4',
          type,
        };
      }
    } catch {}
    return null;
  };

  const allResults = await Promise.all([
    fetchFormat('360p', 'video'),
    fetchFormat('480p', 'video'),
    fetchFormat('720p', 'video'),
    fetchFormat('1080p', 'video'),
    fetchFormat('128kbps', 'audio'),
    fetchFormat('256kbps', 'audio'),
    fetchFormat('320kbps', 'audio'),
  ]);

  const formats = allResults.filter((f): f is VideoFormat => f !== null);

  if (formats.length === 0) {
    throw new Error('No download formats available');
  }

  return {
    originalUrl: url,
    title,
    thumbnail,
    duration: '',
    platform: 'youtube',
    formats,
  };
}

function parseTikTokInfo(url: string, result: any): CobaltVideoInfo {
  const formats: VideoFormat[] = [];

  // Handle downloads array - only keep best video + audio
  if (result.downloads && result.downloads.length > 0) {
    let bestVideo = null;
    let bestAudio = null;

    for (const dl of result.downloads) {
      const itemUrl = dl.url || dl.download_url;
      if (!itemUrl) continue;

      const itemType = (dl.type || '').toLowerCase();
      const itemFormat = (dl.format || '').toLowerCase();
      const itemQuality = (dl.quality || '').toLowerCase();

      const isAudio = itemType === 'audio'
        || itemFormat === 'mp3'
        || itemFormat === 'audio'
        || itemQuality.includes('audio')
        || itemQuality.includes('mp3')
        || itemUrl.includes('.mp3')
        || itemUrl.includes('/audio/');

      if (isAudio && !bestAudio) {
        bestAudio = itemUrl;
      } else if (!isAudio && !bestVideo) {
        bestVideo = itemUrl;
      }
    }

    if (bestVideo) {
      formats.push({
        quality: 'HD (No Watermark)',
        url: bestVideo,
        mimeType: 'video/mp4',
        type: 'video',
      });
    }

    if (bestAudio) {
      formats.push({
        quality: 'MP3',
        url: bestAudio,
        mimeType: 'audio/mpeg',
        type: 'audio',
      });
    }
  }

  // Fallback: download_urls format
  if (formats.length === 0 && result.download_urls) {
    const urls = Array.isArray(result.download_urls) ? result.download_urls : [result.download_urls];
    if (urls.length > 0) {
      formats.push({
        quality: 'HD (No Watermark)',
        url: urls[0],
        mimeType: 'video/mp4',
        type: 'video',
      });
    }
  }

  // Fallback: single video
  if (formats.length === 0 && result.video_no_watermark) {
    formats.push({
      quality: 'HD (No Watermark)',
      url: result.video_no_watermark,
      mimeType: 'video/mp4',
      type: 'video',
    });
  }

  if (formats.length === 0 && result.video) {
    formats.push({
      quality: 'HD (No Watermark)',
      url: result.video,
      mimeType: 'video/mp4',
      type: 'video',
    });
  }

  // Music field
  if (result.music && !formats.find(f => f.type === 'audio')) {
    formats.push({
      quality: 'MP3',
      url: result.music,
      mimeType: 'audio/mpeg',
      type: 'audio',
    });
  }

  return {
    originalUrl: url,
    title: result.title || result.author?.name || 'TikTok Video',
    thumbnail: result.thumbnail || result.cover || '',
    duration: '',
    platform: 'tiktok',
    formats,
  };
}

function parseInstagramInfo(url: string, result: any): CobaltVideoInfo {
  const formats: VideoFormat[] = [];

  // Handle download_urls format (from debug.result)
  if (result.download_urls) {
    const urls = Array.isArray(result.download_urls) ? result.download_urls : [result.download_urls];
    for (let i = 0; i < urls.length; i++) {
      const itemUrl = urls[i];
      const isVideo = itemUrl.includes('.mp4') || itemUrl.includes('video');

      // Single item = no number suffix
      const label = urls.length === 1
        ? (isVideo ? 'HD (No Watermark)' : 'Download')
        : (isVideo ? `Video ${i + 1}` : `Photo ${i + 1}`);

      formats.push({
        quality: label,
        url: itemUrl,
        mimeType: isVideo ? 'video/mp4' : 'image/jpeg',
        type: 'video',
      });
    }
  }

  // Handle url format
  if (result.url && formats.length === 0) {
    const items = Array.isArray(result.url) ? result.url : [result.url];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const isVideo = item.includes('.mp4') || result.type === 'video';

      const label = items.length === 1
        ? (isVideo ? 'HD (No Watermark)' : 'Download')
        : (isVideo ? `Video ${i + 1}` : `Photo ${i + 1}`);

      formats.push({
        quality: label,
        url: item,
        mimeType: isVideo ? 'video/mp4' : 'image/jpeg',
        type: 'video',
      });
    }
  }

  return {
    originalUrl: url,
    title: result.title || result.username || 'Instagram Post',
    thumbnail: result.thumbnail || result.image || '',
    duration: '',
    platform: 'instagram',
    formats,
  };
}

function parseTwitterInfo(url: string, result: any): CobaltVideoInfo {
  const formats: VideoFormat[] = [];

  if (result.url) {
    const isVideo = result.type === 'video' || result.url.includes('.mp4');

    formats.push({
      quality: isVideo ? 'HD (No Watermark)' : 'Download',
      url: result.url,
      mimeType: isVideo ? 'video/mp4' : 'image/jpeg',
      type: 'video',
    });

    if (isVideo) {
      formats.push({
        quality: 'MP3',
        url: result.url,
        mimeType: 'audio/mpeg',
        type: 'audio',
      });
    }
  }

  return {
    originalUrl: url,
    title: result.title || 'Twitter Post',
    thumbnail: result.thumbnail || result.image || '',
    duration: '',
    platform: 'twitter',
    formats,
  };
}

function parseTeraboxInfo(url: string, result: any): CobaltVideoInfo {
  const formats: VideoFormat[] = [];

  if (result.url) {
    const items = Array.isArray(result.url) ? result.url : [result.url];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const isVideo = typeof item === 'string' ? item.includes('.mp4') : item.type === 'video';
      const itemUrl = typeof item === 'string' ? item : item.url;
      formats.push({
        quality: `File ${i + 1}`,
        url: itemUrl,
        mimeType: isVideo ? 'video/mp4' : 'application/octet-stream',
        type: 'video',
      });
    }
  }

  return {
    originalUrl: url,
    title: result.title || result.filename || 'Terabox File',
    thumbnail: result.thumbnail || result.thumb || '',
    duration: '',
    platform: 'terabox',
    formats,
  };
}

function parseSpotifyInfo(url: string, data: any): CobaltVideoInfo {
  const formats: VideoFormat[] = [];

  if (data.download_url) {
    formats.push({
      quality: 'MP3',
      url: data.download_url,
      mimeType: 'audio/mpeg',
      type: 'audio',
    });
  }

  const meta = data.metadata || {};
  const title = meta.name ? `${meta.artist ? meta.artist + ' - ' : ''}${meta.name}` : 'Spotify Track';
  const thumbnail = meta.image || '';

  return {
    originalUrl: url,
    title,
    thumbnail,
    duration: meta.duration || '',
    platform: 'spotify',
    formats,
  };
}

function parseGenericInfo(url: string, result: any, platform: Platform): CobaltVideoInfo {
  const formats: VideoFormat[] = [];

  if (result.url) {
    formats.push({
      quality: 'Default',
      url: result.url,
      mimeType: 'video/mp4',
      type: 'video',
    });
  }

  return {
    originalUrl: url,
    title: result.title || `${platform} Download`,
    thumbnail: result.thumbnail || '',
    duration: '',
    platform,
    formats,
  };
}

export async function getStreamingUrl(
  url: string,
  type: 'video' | 'audio' = 'video'
): Promise<CobaltStreamUrl> {
  const info = await getVideoInfo(url);

  const format = info.formats.find((f) => f.type === type)
    || info.formats[0];

  if (!format) {
    throw new Error('No download format available');
  }

  const ext = type === 'audio' ? 'mp3' : 'mp4';
  const filename = `${info.title.replace(/[^a-zA-Z0-9 ]/g, '')}.${ext}`;

  return {
    url: format.url,
    filename,
    type: format.mimeType,
  };
}
