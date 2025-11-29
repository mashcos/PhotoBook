/**
 * Location data for a photo
 */
export interface LocationData {
  name: string;
  lat: number;
  lng: number;
}

/**
 * Category definition for organizing photos
 */
export interface Category {
  id: string;
  label: string;
  icon: string;
  description: string;
  color: string;
}

/**
 * Photo model with metadata
 */
export interface Photo {
  id: string;
  src: string;
  title: string;
  description: string;
  date: string;
  location: LocationData;
  categoryIds: string[];
  isPrivacyProtected: boolean;
}
