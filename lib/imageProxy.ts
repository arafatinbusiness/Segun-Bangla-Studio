/**
 * Image proxy utility to handle CORS issues with external images.
 * 
 * When images are loaded from external domains (like media.agamirsomoy.com),
 * they may not include CORS headers, causing canvas operations to fail.
 * 
 * This utility provides:
 * 1. A proxy URL that routes through our own server (same origin)
 * 2. A fallback mechanism for when images fail to load
 */

/**
 * Converts an external image URL to a proxied URL that goes through our own server.
 * This avoids CORS issues since the request will be same-origin.
 */
export function getProxiedImageUrl(url: string): string {
  if (!url) return url;
  
  // Don't proxy data URLs or already proxied URLs
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/api/proxy/')) {
    return url;
  }
  
  // Don't proxy same-origin URLs (relative paths)
  if (url.startsWith('/')) {
    return url;
  }
  
  // Check if it's already a same-origin URL
  try {
    const parsed = new URL(url);
    // If it's the same host as the current page, no need to proxy
    if (parsed.hostname === window.location.hostname) {
      return url;
    }
  } catch {
    // Invalid URL, return as-is
    return url;
  }
  
  // Proxy the URL through our API
  return `/api/proxy/image?url=${encodeURIComponent(url)}`;
}

/**
 * Preloads an image and returns a promise that resolves with the image element.
 * Uses the proxy to avoid CORS issues.
 * Returns null if the image fails to load after all attempts.
 */
export function preloadImage(url: string, timeoutMs = 10000): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    let resolved = false;
    
    const cleanup = () => {
      resolved = true;
    };
    
    img.onload = () => {
      if (!resolved) {
        resolved = true;
        resolve(img);
      }
    };
    
    img.onerror = () => {
      if (!resolved) {
        resolved = true;
        console.warn(`[imageProxy] Failed to load image: ${url}`);
        resolve(null);
      }
    };
    
    // Set crossOrigin for canvas compatibility
    img.crossOrigin = 'anonymous';
    
    // Try loading through proxy first
    img.src = getProxiedImageUrl(url);
    
    // Timeout fallback
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.warn(`[imageProxy] Timeout loading image: ${url}`);
        resolve(null);
      }
    }, timeoutMs);
  });
}

/**
 * Checks if an image element is in a valid (non-broken) state for canvas operations.
 */
export function isImageValid(img: HTMLImageElement | null): boolean {
  if (!img) return false;
  // Check if the image is complete and has natural dimensions (not broken)
  return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
}
