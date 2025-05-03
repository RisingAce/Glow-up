/**
 * Image optimization utilities for CheckYourMeter.com
 * Helps with lazy loading, responsive images, and performance
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Generate responsive srcset for images
 * @param imagePath Base path of the image
 * @param widths Array of widths for responsive images
 * @returns Properly formatted srcset string
 */
export function generateSrcSet(imagePath: string, widths: number[]): string {
  return widths
    .map((width) => `${imagePath}?w=${width} ${width}w`)
    .join(', ');
}

/**
 * Create lazy loading attributes for images
 * @param element HTML image element
 */
export function setupLazyLoading(element: HTMLImageElement): void {
  if ('loading' in HTMLImageElement.prototype) {
    element.loading = 'lazy';
  } else {
    // Fallback for browsers that don't support native lazy loading
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const image = entry.target as HTMLImageElement;
          if (image.dataset.src) {
            image.src = image.dataset.src;
          }
          observer.unobserve(image);
        }
      });
    });
    observer.observe(element);
  }
}

/**
 * Format bytes to readable string
 * @param bytes Number of bytes 
 * @param decimals Decimal places to display
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Compress image before upload
 * @param file File object from input
 * @param maxSizeMB Maximum size in MB
 * @param quality Compression quality (0-1)
 * @returns Promise with compressed file
 */
export async function compressImage(
  file: File, 
  maxSizeMB: number = 1, 
  quality: number = 0.7
): Promise<File> {
  // Return original if already small enough
  if (file.size / 1024 / 1024 < maxSizeMB) {
    return file;
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Maintain aspect ratio but limit dimensions
        let width = img.width;
        let height = img.height;
        const maxDimension = 1200;
        
        if (width > height && width > maxDimension) {
          height = (height / width) * maxDimension;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width / height) * maxDimension;
          height = maxDimension;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas to Blob conversion failed'));
              return;
            }
            
            const newFile = new File(
              [blob],
              file.name,
              {
                type: 'image/jpeg',
                lastModified: Date.now(),
              }
            );
            
            resolve(newFile);
          },
          'image/jpeg',
          quality
        );
      };
    };
    reader.onerror = (error) => reject(error);
  });
}
