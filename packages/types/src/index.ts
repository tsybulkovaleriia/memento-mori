export type Category =
  | "CEMETERY"
  | "HAUNTED_HOUSE"
  | "BATTLEFIELD"
  | "ASYLUM"
  | "CURSED_PLACE"
  | "URBAN_LEGEND";

export interface PlaceImage {
  url: string;
  caption?: string;
  credit?: string;
}

export interface Place {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  category: Category;
  country: string;
  city?: string;
  description: string;
  legend: string;
  spookyScore: number; // 1-5
  images: PlaceImage[];
  sourceUrl?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  themeColor: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  places: CollectionPlace[];
}

export interface CollectionPlace {
  id: string;
  place: Place;
  personalNote?: string;
  order: number;
  addedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
