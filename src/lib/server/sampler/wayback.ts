import type { Link } from '$lib/types';

const ARCHIVED_PAGE_PATTERN = /^\/web\/\d{14}\/http/;

// Non-HTML file extensions that will never be walkable pages
const MEDIA_EXTENSIONS = new Set([
    'ram', 'rm', 'ra',           // RealAudio/RealVideo
    'mp3', 'wav', 'wma', 'aiff', // audio
    'mp4', 'avi', 'mov', 'mpg', 'mpeg', 'wmv', 'flv', // video
    'swf',                        // Flash
    'pdf', 'doc', 'xls', 'ppt',  // documents
    'exe', 'zip', 'gz', 'tar',   // binaries/archives
    'jpg', 'jpeg', 'png', 'gif', 'bmp', // images (usually not pages)
]);

export function isWaybackMediaUrl(link: Link): boolean {
    try {
        const pathname = new URL(link.url).pathname.toLowerCase();
        const ext = pathname.split('.').pop();
        return ext !== undefined && MEDIA_EXTENSIONS.has(ext);
    } catch {
        return false;
    }
}

export function isWaybackUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname === 'web.archive.org' && ARCHIVED_PAGE_PATTERN.test(urlObj.pathname);
    } catch {
        return false;
    }
}

export function isWaybackCoreUrl(link: Link): boolean {
    try {
        const urlObj = new URL(link.url);
        if (urlObj.hostname !== 'web.archive.org') return false;
        return !ARCHIVED_PAGE_PATTERN.test(urlObj.pathname);
    } catch {
        return false;
    }
}
