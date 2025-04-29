export function extractVideoId(url) {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname;
  
      if (hostname === 'youtu.be') {
        return parsedUrl.pathname.slice(1); // ✅ This returns "NPBBZXz4QIQ"
      } else if (
        hostname === 'www.youtube.com' ||
        hostname === 'youtube.com' ||
        hostname === 'm.youtube.com'
      ) {
        return parsedUrl.searchParams.get('v');
      } else {
        return null;
      }
    } catch (err) {
      return null;
    }
  }
  