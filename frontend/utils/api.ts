import {
  ApiResponse,
  Item,
  ItemsResponse,
  ItemStats,
  CreateItemRequest,
  UpdateItemRequest,
  ItemFilters,
  UploadResponse,
  UploadHealthResponse,
  ImageUpdateRequest,
} from "@/types";

// Configuration
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
};

// Token management
class TokenManager {
  private static readonly TOKEN_KEY = "planet_peanut_token";

  static getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
}

// Custom error class
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any[]
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// HTTP Client
class HttpClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(config: typeof API_CONFIG) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
    this.defaultHeaders = config.headers;
  }

  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      // Prepare headers
      const headers: Record<string, string> = {
        ...this.defaultHeaders,
        ...((options.headers as Record<string, string>) || {}),
      };

      // Add authentication token
      const token = TokenManager.getToken();
      if (token && !TokenManager.isTokenExpired(token)) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Make request
      const response = await fetch(`${this.baseURL}${url}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      const data: ApiResponse<T> = await response.json();

      // Handle API errors
      if (!response.ok || !data.success) {
        throw new ApiError(
          data.error?.message || "Request failed",
          response.status,
          data.error?.details
        );
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiError("Request timeout", 408);
      }

      const errorMessage =
        error instanceof Error ? error.message : "Network error";
      throw new ApiError(errorMessage, 0);
    }
  }

  async get<T>(
    url: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const searchParams = params ? new URLSearchParams(params).toString() : "";
    const fullUrl = searchParams ? `${url}?${searchParams}` : url;
    return this.request<T>(fullUrl, { method: "GET" });
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: "DELETE" });
  }

  async upload<T>(url: string, formData: FormData): Promise<ApiResponse<T>> {
    const token = TokenManager.getToken();
    const headers: Record<string, string> = {};

    if (token && !TokenManager.isTokenExpired(token)) {
      headers.Authorization = `Bearer ${token}`;
    }

    return this.request<T>(url, {
      method: "POST",
      body: formData,
      headers,
    });
  }
}

// Create HTTP client instance
const httpClient = new HttpClient(API_CONFIG);

// API methods
export const api = {
  // Health checks
  async checkHealth() {
    return httpClient.get("/health");
  },

  async checkUploadHealth(): Promise<ApiResponse<UploadHealthResponse>> {
    return httpClient.get<UploadHealthResponse>("/upload/health");
  },

  // Items
  async getItems(
    filters: ItemFilters = {}
  ): Promise<ApiResponse<ItemsResponse>> {
    return httpClient.get<ItemsResponse>("/items", filters);
  },

  async getItem(id: string): Promise<ApiResponse<{ item: Item }>> {
    return httpClient.get<{ item: Item }>(`/items/${id}`);
  },

  async createItem(
    data: CreateItemRequest
  ): Promise<ApiResponse<{ item: Item }>> {
    return httpClient.post<{ item: Item }>("/items", data);
  },

  async updateItem(
    id: string,
    data: UpdateItemRequest
  ): Promise<ApiResponse<{ item: Item }>> {
    return httpClient.put<{ item: Item }>(`/items/${id}`, data);
  },

  async deleteItem(
    id: string
  ): Promise<ApiResponse<{ deletedItem: { id: string; title: string } }>> {
    return httpClient.delete<{ deletedItem: { id: string; title: string } }>(
      `/items/${id}`
    );
  },

  async publishItem(id: string): Promise<ApiResponse<{ item: Item }>> {
    return httpClient.post<{ item: Item }>(`/items/${id}/publish`);
  },

  async unpublishItem(id: string): Promise<ApiResponse<{ item: Item }>> {
    return httpClient.post<{ item: Item }>(`/items/${id}/unpublish`);
  },

  async archiveItem(id: string): Promise<ApiResponse<{ item: Item }>> {
    return httpClient.post<{ item: Item }>(`/items/${id}/archive`);
  },

  async duplicateItem(id: string): Promise<ApiResponse<{ item: Item }>> {
    return httpClient.post<{ item: Item }>(`/items/${id}/duplicate`);
  },

  async getItemStats(): Promise<ApiResponse<ItemStats>> {
    return httpClient.get<ItemStats>("/items/stats/summary");
  },

  // Image management
  async uploadItemImages(
    formData: FormData
  ): Promise<ApiResponse<UploadResponse>> {
    return httpClient.upload<UploadResponse>("/upload/item-images", formData);
  },

  async uploadSingleImage(
    itemId: string,
    formData: FormData
  ): Promise<ApiResponse<UploadResponse>> {
    return httpClient.upload<UploadResponse>(
      `/upload/item/${itemId}`,
      formData
    );
  },

  async updateItemImages(
    id: string,
    data: ImageUpdateRequest
  ): Promise<ApiResponse<{ item: Item }>> {
    return httpClient.put<{ item: Item }>(`/items/${id}/images`, data);
  },

  async deleteItemImage(
    id: string,
    type: string
  ): Promise<ApiResponse<{ item: Item }>> {
    return httpClient.delete<{ item: Item }>(`/items/${id}/images/${type}`);
  },
};

// Utility functions
export const utils = {
  // Format currency for display
  formatCurrency(amount: number, currency: "diamonds" | "peanuts"): string {
    const symbol = currency === "diamonds" ? "💎" : "🥜";
    return `${symbol} ${amount.toLocaleString()}`;
  },

  // Format date for display
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  },

  // Format date and time for display
  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  // Get status badge variant
  getStatusVariant(status: string): "success" | "warning" | "error" | "info" {
    switch (status) {
      case "published":
        return "success";
      case "draft":
        return "warning";
      case "archived":
        return "error";
      default:
        return "info";
    }
  },

  // Capitalize first letter
  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  // Debounce function for search
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // File size formatter
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  // Truncate text
  truncate(text: string, length: number): string {
    return text.length > length ? text.substring(0, length) + "..." : text;
  },

  // Generate color from string (for avatars)
  getColorFromString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
  },
};

// Error handler utility
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
};

// Export token manager for auth
export { TokenManager };
