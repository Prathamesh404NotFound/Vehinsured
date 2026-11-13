/**
 * Client-side image compression helper to ensure Firebase RTDB previews
 * stay within conservative free-tier limits (<200 KB per encoded image).
 */

export interface CompressionResult {
  previewBase64: string; // Data URL for RTDB storage (<200KB)
  sizeKb: number;
  width: number;
  height: number;
}

export async function compressImageForPreview(
  fileOrDataUrl: File | Blob | string,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.7
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      // Scale down dimensions while maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get 2D context from canvas'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      let currentQuality = quality;
      let dataUrl = canvas.toDataURL('image/jpeg', currentQuality);

      // Reduce quality iteratively if base64 size exceeds 200 KB
      while (dataUrl.length > 200 * 1024 * 1.33 && currentQuality > 0.2) {
        currentQuality -= 0.1;
        dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
      }

      const approxSizeKb = Math.round((dataUrl.length * 0.75) / 1024);

      resolve({
        previewBase64: dataUrl,
        sizeKb: approxSizeKb,
        width,
        height,
      });
    };

    img.onerror = (err) => reject(new Error('Failed to load image for compression: ' + err));

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}
