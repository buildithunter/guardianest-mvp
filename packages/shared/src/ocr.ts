/**
 * OCR Service - Handles text extraction from images
 * Uses client-side ML Kit when available, falls back to server-side Google Cloud Vision
 */

import type { OCRRequest, OCRResponse, ApiResponse } from './index';

// Server-side OCR using Google Cloud Vision API
export const extractTextFromServer = async (
  imageBase64: string,
  serverUrl: string = 'http://localhost:8787'
): Promise<OCRResponse> => {
  try {
    const request: OCRRequest = {
      image: imageBase64,
    };

    const response = await fetch(`${serverUrl}/ocr/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse<OCRResponse> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'OCR extraction failed');
    }

    return result.data!;
  } catch (error) {
    console.error('Server OCR failed:', error);
    throw error;
  }
};

// Utility function to convert URI to base64
export const uriToBase64 = async (uri: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to convert URI to base64:', error);
    throw error;
  }
};

// Image validation
export const validateImageSize = (width: number, height: number): boolean => {
  const maxDimension = 4096;
  return width <= maxDimension && height <= maxDimension;
};

export const validateImageFileSize = (base64: string): boolean => {
  // Remove data URL prefix if present
  const base64Data = base64.replace(/^data:image\/[a-z]+;base64,/, '');
  const sizeInBytes = (base64Data.length * 3) / 4;
  const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
  return sizeInBytes <= maxSizeInBytes;
};
