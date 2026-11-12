import jsQR from 'jsqr';
import QRCode from 'qrcode';

/**
 * Decodes a QR code from an uploaded image File using client-side Canvas and jsQR.
 */
export const decodeQRFromImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context is unavailable.'));
          return;
        }
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Try standard decode
        let code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        // Retry with inverted contrast if first attempt fails
        if (!code || !code.data) {
          code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });
        }

        if (code && code.data && code.data.trim()) {
          resolve(code.data.trim());
        } else {
          reject(new Error('No readable QR code found in this image. Please ensure the QR code is in focus, well-lit, and not clipped.'));
        }
      };
      img.onerror = () => reject(new Error('Failed to process image file.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file from disk.'));
    reader.readAsDataURL(file);
  });
};

/**
 * Generates an SVG or PNG data URL for displaying a pairing QR code on screen.
 */
export const generateQRCodeDataURL = async (text: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(text, {
      width: 280,
      margin: 2,
      color: {
        dark: '#141416',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('Failed to generate QR code data URL:', err);
    throw err;
  }
};
