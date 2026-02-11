/**
 * URL Hash Utility
 * 
 * URL'lerin SHA-256 hash'ini hesaplar.
 * Calculates SHA-256 hash of URLs.
 * 
 * Video indirmek yerine URL'nin kendisini hash'ler.
 * Hashes the URL itself instead of downloading the video.
 */

/**
 * URL'nin SHA-256 hash'ini hesapla
 * Calculate SHA-256 hash of a URL
 * 
 * @param url - Video URL'si / Video URL
 * @returns Promise<string> - Hex formatında hash / Hash in hex format
 */
export async function calculateUrlHash(url: string): Promise<string> {
    // URL'yi normalize et (lowercase, trim)
    const normalizedUrl = url.trim().toLowerCase();

    // String'i byte array'e çevir
    const encoder = new TextEncoder();
    const data = encoder.encode(normalizedUrl);

    // SHA-256 hash hesapla
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Buffer'ı hex string'e çevir
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
}

/**
 * URL'nin geçerli olup olmadığını kontrol et
 * Validate if URL is valid
 * 
 * @param url - Kontrol edilecek URL / URL to validate
 * @returns boolean - Geçerli mi? / Is valid?
 */
export function isValidUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        // HTTP veya HTTPS olmalı
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * URL'den platform bilgisi çıkar (YouTube, Vimeo, vs.)
 * Extract platform info from URL
 * 
 * @param url - Video URL'si / Video URL
 * @returns string - Platform adı / Platform name
 */
export function detectPlatform(url: string): string {
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
        return 'YouTube';
    }
    if (lowerUrl.includes('vimeo.com')) {
        return 'Vimeo';
    }
    if (lowerUrl.includes('tiktok.com')) {
        return 'TikTok';
    }
    if (lowerUrl.match(/\.(mp4|mov|avi|webm|mkv)$/i)) {
        return 'Direct Video';
    }

    return 'Unknown';
}
