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
 * Shared Location definition for reusable locations
 */
export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  isReuseLocation: boolean;
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
  locationId?: string; // Reference to a shared Location
  categoryIds: string[];
  isPrivacyProtected: boolean;
  isReuseLocation: boolean;
}
