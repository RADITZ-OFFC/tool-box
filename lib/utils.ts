export type Platform =
  | 'youtube' | 'tiktok' | 'instagram' | 'twitter' | 'facebook'
  | 'reddit' | 'pinterest' | 'snapchat' | 'tumblr' | 'soundcloud'
  | 'vimeo' | 'twitch' | 'dailymotion' | 'bilibili' | 'bluesky'
  | 'vk' | 'ok' | 'rutube' | 'streamable' | 'loom' | 'newgrounds'
  | 'terabox' | 'spotify'
  | 'other';

export function detectPlatform(url: string): Platform {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
  if (url.includes('facebook.com') || url.includes('fb.watch')) return 'facebook';
  if (url.includes('reddit.com') || url.includes('redd.it')) return 'reddit';
  if (url.includes('pinterest.com') || url.includes('pin.it')) return 'pinterest';
  if (url.includes('snapchat.com')) return 'snapchat';
  if (url.includes('tumblr.com')) return 'tumblr';
  if (url.includes('soundcloud.com')) return 'soundcloud';
  if (url.includes('vimeo.com')) return 'vimeo';
  if (url.includes('twitch.tv') || url.includes('clips.twitch.tv')) return 'twitch';
  if (url.includes('dailymotion.com') || url.includes('dai.ly')) return 'dailymotion';
  if (url.includes('bilibili.com') || url.includes('b23.tv')) return 'bilibili';
  if (url.includes('bsky.app') || url.includes('bluesky')) return 'bluesky';
  if (url.includes('vk.com') || url.includes('vkvideo.ru')) return 'vk';
  if (url.includes('ok.ru')) return 'ok';
  if (url.includes('rutube.ru')) return 'rutube';
  if (url.includes('streamable.com')) return 'streamable';
  if (url.includes('loom.com')) return 'loom';
  if (url.includes('newgrounds.com')) return 'newgrounds';
  if (url.includes('terabox') || url.includes('1024terabox.com')) return 'terabox';
  if (url.includes('spotify.com')) return 'spotify';
  return 'other';
}

export function getPlatformIcon(platform: Platform): string {
  const icons: Record<Platform, string> = {
    youtube: 'YT', tiktok: 'TT', instagram: 'IG', twitter: 'X', facebook: 'FB',
    reddit: 'RD', pinterest: 'PT', snapchat: 'SC', tumblr: 'TM', soundcloud: 'SC',
    vimeo: 'VM', twitch: 'TW', dailymotion: 'DM', bilibili: 'BL', bluesky: 'BS',
    vk: 'VK', ok: 'OK', rutube: 'RT', streamable: 'ST', loom: 'LM', newgrounds: 'NG',
    terabox: 'TB', spotify: 'SP',
    other: '?',
  };
  return icons[platform];
}

export function getPlatformColor(platform: Platform): string {
  const colors: Record<Platform, string> = {
    youtube: '#FF0000', tiktok: '#00F2EA', instagram: '#E4405F', twitter: '#1DA1F2', facebook: '#1877F2',
    reddit: '#FF4500', pinterest: '#BD081C', snapchat: '#FFFC00', tumblr: '#36465D', soundcloud: '#FF5500',
    vimeo: '#1AB7EA', twitch: '#9146FF', dailymotion: '#0D9BF0', bilibili: '#00A1D6', bluesky: '#0085FF',
    vk: '#4C75A3', ok: '#EE8208', rutube: '#0D9BF0', streamable: '#0B84FF', loom: '#625DF5', newgrounds: '#BCA948',
    terabox: '#2B5BE5', spotify: '#1DB954',
    other: '#666',
  };
  return colors[platform];
}
