import service, { apiClient, HttpMethod } from './http';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export interface GalleryImage {
  id: string;
  category: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  alt: string | null;
  uploadedById: string | null;
  createdAt: string;
}

export const GALLERY_CATEGORIES = [
  { value: 'celebrations', label: 'Celebrations' },
  { value: 'team_spirit', label: 'Team Spirit' },
  { value: 'achievements', label: 'Achievements' },
  { value: 'company_events', label: 'Company Events' },
  { value: 'culture', label: 'Culture' },
  { value: 'fun_at_work', label: 'Fun at Work' },
] as const;

export type GalleryCategoryValue = (typeof GALLERY_CATEGORIES)[number]['value'];

export function getGalleryImageUrl(filename: string): string {
  return `${API_BASE}/uploads/gallery/${filename}`;
}

/**
 * Public endpoint -- uses native fetch so it works on the unauthenticated
 * landing page without going through the session-aware Axios interceptor.
 */
export async function getGalleryImages(
  category?: string
): Promise<ApiResponse<GalleryImage[]>> {
  const url = new URL(`${API_BASE}/api/v1/gallery`);
  if (category) url.searchParams.set('category', category);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    return { success: false, message: 'Failed to load gallery', data: [] };
  }

  return (await res.json()) as ApiResponse<GalleryImage[]>;
}

export async function uploadGalleryImage(
  file: File,
  category: string,
  alt?: string
): Promise<ApiResponse<GalleryImage>> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);
  if (alt) formData.append('alt', alt);

  const res = await apiClient.post('/api/v1/gallery', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data as ApiResponse<GalleryImage>;
}

export async function deleteGalleryImage(
  id: string
): Promise<ApiResponse<null>> {
  const res = await service({
    method: HttpMethod.DELETE,
    url: `/api/v1/gallery/${encodeURIComponent(id)}`,
  });
  return res.data as ApiResponse<null>;
}
