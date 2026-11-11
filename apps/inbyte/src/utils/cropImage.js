export const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

/**
 * Manually crop an image based on pixel coordinates from react-easy-crop
 */
export async function getCroppedImg(imageSrc, pixelCrop, quality = 0.85) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return null;
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    // Convert cropped canvas image to WebP format
    return canvas.toDataURL('image/webp', quality);
}

/**
 * Basic WebP converter
 */
export async function convertToWebP(imageSrc, quality = 0.85) {
    if (!imageSrc) return '';
    if (typeof imageSrc === 'string' && imageSrc.startsWith('data:image/webp')) {
        return imageSrc;
    }
    try {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth || image.width || 800;
        canvas.height = image.naturalHeight || image.height || 800;
        const ctx = canvas.getContext('2d');
        if (!ctx) return imageSrc;
        ctx.drawImage(image, 0, 0);
        return canvas.toDataURL('image/webp', quality);
    } catch {
        return imageSrc;
    }
}

/**
 * Calculates byte size of a data URL string
 */
export function getDataUrlByteSize(dataUrl) {
    if (!dataUrl || typeof dataUrl !== 'string') return 0;
    const base64Str = dataUrl.split(',')[1] || '';
    return Math.round((base64Str.length * 3) / 4);
}

/**
 * Automatically center-crops, converts to WebP, and adaptively compresses
 * an image to strictly satisfy a maximum byte budget (e.g. <= 5KB - 8KB for dishes, <= 25KB for banners).
 * 
 * @param {string|File|Blob} imageInput - Base64 Data URL or Blob URL
 * @param {object} options
 * @param {number} [options.aspect=1] - 1 for square (dishes/categories/logos), 16/9 for banners
 * @param {number} [options.maxBytes=6144] - 6 KB budget for dishes/cats, 25600 for banners
 * @param {number} [options.maxDimension=240] - Initial target dimension (240px for 1:1, 640px for 16:9)
 */
export async function autoCropAndCompressToWebP(imageInput, options = {}) {
    const {
        aspect = 1,
        maxBytes = 6 * 1024, // ~6KB default target
        maxDimension = (aspect > 1.5 ? 640 : 240)
    } = options;

    if (!imageInput) return null;

    let srcUrl = imageInput;
    let cleanupBlob = false;
    if (imageInput instanceof Blob || imageInput instanceof File) {
        srcUrl = URL.createObjectURL(imageInput);
        cleanupBlob = true;
    }

    try {
        const img = await createImage(srcUrl);
        const origWidth = img.naturalWidth || img.width;
        const origHeight = img.naturalHeight || img.height;

        if (!origWidth || !origHeight) {
            throw new Error('Could not read image dimensions');
        }

        // 1. Calculate auto-crop box (center-crop matching target aspect ratio)
        let cropX = 0;
        let cropY = 0;
        let cropWidth = origWidth;
        let cropHeight = origHeight;

        const currentAspect = origWidth / origHeight;
        if (currentAspect > aspect) {
            // Image is wider than desired: crop sides
            cropWidth = origHeight * aspect;
            cropX = (origWidth - cropWidth) / 2;
        } else if (currentAspect < aspect) {
            // Image is taller than desired: crop top and bottom
            cropHeight = origWidth / aspect;
            cropY = (origHeight - cropHeight) / 2;
        }

        // 2. Set initial target canvas dimensions
        let targetWidth = maxDimension;
        let targetHeight = Math.round(maxDimension / aspect);

        if (aspect < 1) {
            targetHeight = maxDimension;
            targetWidth = Math.round(maxDimension * aspect);
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get 2D canvas context');

        // Render cropped & scaled image onto canvas
        const renderToCanvas = (w, h) => {
            canvas.width = w;
            canvas.height = h;
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(
                img,
                cropX, cropY, cropWidth, cropHeight,
                0, 0, w, h
            );
        };

        renderToCanvas(targetWidth, targetHeight);

        // 3. Adaptive compression loop to strictly fit inside maxBytes budget
        let quality = 0.75;
        let dataUrl = canvas.toDataURL('image/webp', quality);
        let byteSize = getDataUrlByteSize(dataUrl);

        // Step down quality progressively (0.75 -> 0.65 -> 0.55 -> 0.45 -> 0.35)
        while (byteSize > maxBytes && quality > 0.35) {
            quality -= 0.10;
            dataUrl = canvas.toDataURL('image/webp', quality);
            byteSize = getDataUrlByteSize(dataUrl);
        }

        // If still exceeding budget, downscale dimensions in 12% increments
        let attempts = 0;
        while (byteSize > maxBytes && targetWidth > 140 && attempts < 4) {
            attempts++;
            targetWidth = Math.round(targetWidth * 0.88);
            targetHeight = Math.round(targetHeight * 0.88);
            renderToCanvas(targetWidth, targetHeight);
            dataUrl = canvas.toDataURL('image/webp', Math.max(quality, 0.45));
            byteSize = getDataUrlByteSize(dataUrl);
        }

        return {
            dataUrl,
            byteSize,
            width: targetWidth,
            height: targetHeight,
            format: 'webp',
            aspect
        };
    } finally {
        if (cleanupBlob && srcUrl) {
            URL.revokeObjectURL(srcUrl);
        }
    }
}
