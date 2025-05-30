// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode: number;
    isOperational: boolean;
    details?: any[];
  };
  message?: string;
}

// Item Types
export interface Item {
  _id: string;
  id: string;
  title: string;
  description?: string;
  tags: string[];
  clothingType: ClothingType;
  price: number;
  currency: Currency;
  level: number;
  color?: string;
  layer: Layer;
  status: ItemStatus;
  imageRaisedUrl?: string;
  imageShopUrl?: string;
  imageThumbnailUrl?: string;
  imageMediumUrl?: string;
  releaseDate: string;
  retireDate?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  isAvailable: boolean;
  images: {
    raised?: string;
    shop?: string;
    thumbnail?: string;
    medium?: string;
  };
  originalId?: string;
}

// Enums
export type Currency = "diamonds" | "peanuts";

export type ItemStatus = "draft" | "published" | "archived";

export type ClothingType =
  | "weapons"
  | "Official Planet Peanut Work Wear"
  | "space gear"
  | "utility gear"
  | "Planetary Governance Wear"
  | "battle armor"
  | "tribal wear"
  | "experimental tech"
  | "casual wear";

export type Layer =
  | "body_layer1"
  | "body_layer2"
  | "body_layer3"
  | "body_layer_full"
  | "head_layer1"
  | "head_layer2"
  | "head_layer3"
  | "head_layer_full"
  | "pants_layer1"
  | "pants_layer2"
  | "pants_layer3"
  | "pants_layer_full"
  | "accessory"
  | "accessoryBack"
  | "fullbody1"
  | "fullbody2";

export type ItemTag =
  | "weapons"
  | "official"
  | "space"
  | "utility"
  | "governance"
  | "armor"
  | "primal"
  | "experimental"
  | "casual";

// Form Types
export interface CreateItemRequest {
  title: string;
  description?: string;
  price: number;
  currency: Currency;
  level: number;
  clothingType: ClothingType;
  layer: Layer;
  tags: string[];
  color?: string;
  status?: ItemStatus;
  releaseDate?: string;
  retireDate?: string;
  imageRaisedUrl?: string;
  imageShopUrl?: string;
  imageThumbnailUrl?: string;
  imageMediumUrl?: string;
}

export interface UpdateItemRequest extends Partial<CreateItemRequest> {}

// Filter Types
export interface ItemFilters {
  page?: number;
  limit?: number;
  status?: ItemStatus;
  currency?: Currency;
  clothingType?: ClothingType;
  layer?: Layer;
  level?: number;
  minLevel?: number;
  maxLevel?: number;
  minPrice?: number;
  maxPrice?: number;
  tags?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Pagination Types
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ItemsResponse {
  items: Item[];
  pagination: PaginationInfo;
  filters: {
    clothingType?: string;
    currency?: string;
    level?: { min?: string; max?: string };
    price?: { min?: number; max?: number };
    tags?: string[];
    layer?: string;
    search?: string;
  };
}

// Statistics Types
export interface ItemStats {
  summary: {
    totalItems: number;
    publishedItems: number;
    draftItems: number;
    archivedItems: number;
    diamondItems: number;
    peanutItems: number;
    averagePrice: number;
    averageLevel: number;
  };
  clothingTypeDistribution: Array<{
    _id: string;
    count: number;
  }>;
  layerDistribution: Array<{
    _id: string;
    count: number;
  }>;
}

// Upload Types
export interface UploadResponse {
  imageUrls: {
    raised?: string;
    raisedThumbnail?: string;
    raisedMedium?: string;
    shop?: string;
    shopThumbnail?: string;
    shopMedium?: string;
  };
  processedSizes: string[];
}

export interface UploadHealthResponse {
  supabase: {
    connected: boolean;
    error?: string;
  };
  imageService: {
    configured: boolean;
    maxFileSize: string;
    allowedTypes: string[];
    imageSizes: string[];
  };
}

// Authentication Types
export interface User {
  id: string;
  email: string;
  name?: string;
  role: "admin" | "editor" | "viewer";
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: string;
}

// UI Component Types
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

// Form Validation Types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface FormErrors {
  [key: string]: string | string[];
}

// Navigation Types
export interface NavItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
}

// Theme Types
export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  darkMode: boolean;
  sidebarCollapsed: boolean;
}

// Utility Types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error?: string;
  lastUpdated?: string;
}

// API Client Types
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

export interface RequestConfig {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

// Image Upload Types
export interface ImageUploadState {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  progress: number;
  error?: string;
  url?: string;
}

export interface ImageUpdateRequest {
  imageRaisedUrl?: string;
  imageShopUrl?: string;
  imageThumbnailUrl?: string;
  imageMediumUrl?: string;
}
