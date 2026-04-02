export type MediaType = "IMAGE" | "UNKNOWN";

export interface MediaValidationResult {
  isValid: boolean;
  type: MediaType;
  error?: string;
}

export const validateMediaUrl = (url: string): MediaValidationResult => {
  if (!url || !url.trim()) {
    return {
      isValid: false,
      type: "UNKNOWN",
      error: "URL is required",
    };
  }

  const trimmedUrl = url.trim().toLowerCase();

  // Check if it's a valid URL format
  try {
    new URL(trimmedUrl);
  } catch {
    return {
      isValid: false,
      type: "UNKNOWN",
      error: "Invalid URL format",
    };
  }

  // Check for image file extensions in the URL
  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".bmp",
    ".svg",
    ".ico",
    ".tiff",
    ".tif",
  ];

  // Check if URL contains image extensions anywhere
  if (imageExtensions.some((ext) => trimmedUrl.includes(ext))) {
    return { isValid: true, type: "IMAGE" };
  }

  // Check for common image hosting domains
  const imageHosts = [
    "imgur.com",
    "flickr.com",
    "photobucket.com",
    "imageshack.com",
    "postimg.cc",
    "imgbb.com",
    "imgbox.com",
    "tinypic.com",
    "imageban.ru",
    "prnt.sc",
    "gyazo.com",
    "lightshot.com",
    "puu.sh",
    "unsplash.com",
    "pexels.com",
    "pixabay.com",
    "gettyimages.com",
    "shutterstock.com",
    "cloudinary.com",
    "imagekit.io",
    "imgix.net",
    "akamaized.net",
    "cloudfront.net",
  ];

  // Check if it's from a known image CDN/host
  if (imageHosts.some((host) => trimmedUrl.includes(host))) {
    return { isValid: true, type: "IMAGE" };
  }

  // Check for common CDN patterns that serve images
  const cdnPatterns = [
    /cdn.*\.(jpg|jpeg|png|gif|webp)/i,
    /images?\./i, // images.example.com
    /static\./i, // static.example.com
    /media\./i, // media.example.com
    /img\./i, // img.example.com
    /photos?\./i, // photos.example.com
    /pics?\./i, // pics.example.com
  ];

  if (cdnPatterns.some((pattern) => pattern.test(trimmedUrl))) {
    return { isValid: true, type: "IMAGE" };
  }

  return {
    isValid: false,
    type: "UNKNOWN",
    error: "Please provide a valid image URL",
  };
};

export const getMediaType = (url: string): MediaType => {
  const result = validateMediaUrl(url);
  return result.type;
};

export const isValidMediaUrl = (url: string): boolean => {
  const result = validateMediaUrl(url);
  return result.isValid;
};
