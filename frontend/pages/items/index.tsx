import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/Button";
import { ItemList } from "@/components/items/ItemList";
import { ItemGrid } from "@/components/items/ItemCard";
import { Alert } from "@/components/ui/Alert";
import { Item, ItemFilters, ItemsResponse } from "@/types";
import { api, handleApiError } from "@/utils/api";
import Link from "next/link";
import { cn } from "@/utils/cn";

const ItemsPage: React.FC = () => {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState<ItemFilters>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning" | "info";
    message: string;
  } | null>(null);
  const [hasBackendConnection, setHasBackendConnection] = useState(true);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);

  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Mock data for when backend is not available
  const mockItems: Item[] = [
    {
      _id: "mock-1",
      id: "mock-1",
      title: "Space Explorer Helmet",
      description:
        "Advanced helmet for planetary exploration with built-in oxygen recycler",
      price: 150,
      currency: "diamonds",
      level: 25,
      clothingType: "space gear",
      layer: "head_layer_full",
      color: "Silver",
      status: "published",
      images: {
        thumbnail:
          "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
      },
      tags: ["space", "exploration", "safety"],
      releaseDate: new Date().toISOString(),
      createdBy: "admin",
      isPublished: true,
      isAvailable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "mock-2",
      id: "mock-2",
      title: "Battle Armor Chest Plate",
      description: "Reinforced chest protection for combat missions",
      price: 250,
      currency: "diamonds",
      level: 40,
      clothingType: "battle armor",
      layer: "body_layer_full",
      color: "Dark Steel",
      status: "published",
      images: {
        thumbnail:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
      },
      tags: ["combat", "protection"],
      releaseDate: new Date(Date.now() - 86400000).toISOString(),
      createdBy: "admin",
      isPublished: true,
      isAvailable: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      _id: "mock-3",
      id: "mock-3",
      title: "Casual Peanut T-Shirt",
      description: "Comfortable everyday wear with Planet Peanut logo",
      price: 50,
      currency: "peanuts",
      level: 1,
      clothingType: "casual wear",
      layer: "body_layer1",
      color: "Orange",
      status: "draft",
      images: {
        thumbnail:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
      },
      tags: ["casual", "comfort"],
      releaseDate: new Date(Date.now() - 172800000).toISOString(),
      createdBy: "admin",
      isPublished: false,
      isAvailable: true,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  // Load items with improved error handling
  const loadItems = useCallback(
    async (newFilters: ItemFilters = filters, forceRetry = false) => {
      // Prevent multiple simultaneous requests, but allow initial load
      if (isRequestInProgress && !forceRetry && !isLoading) {
        return;
      }

      try {
        setIsRequestInProgress(true);
        setIsLoading(true);
        if (forceRetry) {
          setError(null);
        }

        const response = await api.getItems(newFilters);

        // Check if component is still mounted before updating state
        if (!isMountedRef.current) return;

        if (response.success && response.data) {
          setItems(response.data.items);
          setPagination(response.data.pagination);
          setHasBackendConnection(true);
          setError(null);
        } else {
          throw new Error(response.error?.message || "Failed to load items");
        }
      } catch (error) {
        if (!isMountedRef.current) return;

        const errorMessage = handleApiError(error);
        console.warn("Backend not available, using mock data:", errorMessage);

        // Use mock data when backend is not available
        setHasBackendConnection(false);
        setItems(mockItems);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalCount: mockItems.length,
          limit: 20,
          hasNextPage: false,
          hasPrevPage: false,
        });

        // Only set error on force retry, not on initial load
        if (forceRetry) {
          setError(errorMessage);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsRequestInProgress(false);
        }
      }
    },
    [filters]
  ); // Removed isRequestInProgress from dependencies

  // Initial load
  useEffect(() => {
    const initialLoad = async () => {
      console.log("Starting initial load...");
      try {
        setIsLoading(true);
        setError(null);

        // Try to load items with a simple timeout
        const response = await api.getItems(filters);

        if (response.success && response.data) {
          console.log(
            "API call successful, got items:",
            response.data.items.length
          );
          setItems(response.data.items);
          setPagination(response.data.pagination);
          setHasBackendConnection(true);
        } else {
          throw new Error(response.error?.message || "Failed to load items");
        }
      } catch (error) {
        console.warn("Initial load failed, using mock data:", error);

        // Use mock data when backend is not available
        setHasBackendConnection(false);
        setItems(mockItems);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalCount: mockItems.length,
          limit: 20,
          hasNextPage: false,
          hasPrevPage: false,
        });
      } finally {
        setIsLoading(false);
        setIsRequestInProgress(false);
      }
    };

    initialLoad();
  }, []); // Empty dependency array for initial load only

  // Handle filter changes
  const handleFiltersChange = useCallback(
    (newFilters: ItemFilters) => {
      setFilters(newFilters);

      if (hasBackendConnection) {
        loadItems(newFilters);
      } else {
        // Filter mock data locally
        let filteredItems = [...mockItems];

        if (newFilters.search) {
          filteredItems = filteredItems.filter(
            (item) =>
              item.title
                .toLowerCase()
                .includes(newFilters.search!.toLowerCase()) ||
              item.description
                ?.toLowerCase()
                .includes(newFilters.search!.toLowerCase())
          );
        }

        if (newFilters.status) {
          filteredItems = filteredItems.filter(
            (item) => item.status === newFilters.status
          );
        }

        if (newFilters.currency) {
          filteredItems = filteredItems.filter(
            (item) => item.currency === newFilters.currency
          );
        }

        setItems(filteredItems);
      }
    },
    [hasBackendConnection, loadItems]
  );

  // Mock item action handlers for when backend is not available
  const createMockActionHandler =
    (actionName: string) => async (item: Item) => {
      setAlert({
        type: "warning",
        message: `Backend not available. Would ${actionName} "${item.title}" if connected.`,
      });
    };

  // Item action handlers
  const handleItemDelete = useCallback(
    async (item: Item) => {
      if (!hasBackendConnection) {
        return createMockActionHandler("delete")(item);
      }

      try {
        const response = await api.deleteItem(item._id);

        if (response.success) {
          setAlert({
            type: "success",
            message: `Item "${item.title}" deleted successfully`,
          });
          loadItems(filters, true);
        } else {
          throw new Error(response.error?.message || "Failed to delete item");
        }
      } catch (error) {
        setAlert({
          type: "error",
          message: handleApiError(error),
        });
      }
    },
    [hasBackendConnection, filters, loadItems]
  );

  const handleItemPublish = useCallback(
    async (item: Item) => {
      if (!hasBackendConnection) {
        return createMockActionHandler("publish")(item);
      }

      try {
        const response = await api.publishItem(item._id);

        if (response.success) {
          setAlert({
            type: "success",
            message: `Item "${item.title}" published successfully`,
          });
          loadItems(filters, true);
        } else {
          throw new Error(response.error?.message || "Failed to publish item");
        }
      } catch (error) {
        setAlert({
          type: "error",
          message: handleApiError(error),
        });
      }
    },
    [hasBackendConnection, filters, loadItems]
  );

  const handleItemUnpublish = useCallback(
    async (item: Item) => {
      if (!hasBackendConnection) {
        return createMockActionHandler("unpublish")(item);
      }

      try {
        const response = await api.unpublishItem(item._id);

        if (response.success) {
          setAlert({
            type: "success",
            message: `Item "${item.title}" unpublished successfully`,
          });
          loadItems(filters, true);
        } else {
          throw new Error(
            response.error?.message || "Failed to unpublish item"
          );
        }
      } catch (error) {
        setAlert({
          type: "error",
          message: handleApiError(error),
        });
      }
    },
    [hasBackendConnection, filters, loadItems]
  );

  const handleItemArchive = useCallback(
    async (item: Item) => {
      if (!hasBackendConnection) {
        return createMockActionHandler("archive")(item);
      }

      try {
        const response = await api.archiveItem(item._id);

        if (response.success) {
          setAlert({
            type: "success",
            message: `Item "${item.title}" archived successfully`,
          });
          loadItems(filters, true);
        } else {
          throw new Error(response.error?.message || "Failed to archive item");
        }
      } catch (error) {
        setAlert({
          type: "error",
          message: handleApiError(error),
        });
      }
    },
    [hasBackendConnection, filters, loadItems]
  );

  const handleItemAction = useCallback(
    (action: string, item: Item) => {
      switch (action) {
        case "edit":
          router.push(`/items/${item._id}`);
          break;
        case "delete":
          handleItemDelete(item);
          break;
        case "publish":
          handleItemPublish(item);
          break;
        case "unpublish":
          handleItemUnpublish(item);
          break;
        case "archive":
          handleItemArchive(item);
          break;
      }
    },
    [
      router,
      handleItemDelete,
      handleItemPublish,
      handleItemUnpublish,
      handleItemArchive,
    ]
  );

  const retryLoad = useCallback(() => {
    setError(null);
    loadItems(filters, true);
  }, [loadItems, filters]);

  if (error && !items.length) {
    return (
      <Layout>
        <div className="p-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <svg
                className="mx-auto h-12 w-12 text-error-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Failed to Load Items
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="flex justify-center space-x-3">
                <Button onClick={retryLoad} variant="primary">
                  Try Again
                </Button>
                <Button
                  onClick={() => {
                    setError(null);
                    setHasBackendConnection(false);
                    setItems(mockItems);
                    setPagination({
                      currentPage: 1,
                      totalPages: 1,
                      totalCount: mockItems.length,
                      limit: 20,
                      hasNextPage: false,
                      hasPrevPage: false,
                    });
                  }}
                  variant="outline"
                >
                  Use Demo Mode
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Backend Status Indicator */}
        {!hasBackendConnection && (
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-warning-600 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-warning-800">
                  Demo Mode
                </p>
                <p className="text-sm text-warning-700">
                  Backend not available. Showing mock data. Start backend with:{" "}
                  <code>cd ../backend && npm start</code>
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={retryLoad}
                className="ml-auto"
              >
                Retry Connection
              </Button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Items</h1>
            <p className="text-gray-600">
              Manage your Planet Peanut items
              {pagination.totalCount > 0 && (
                <span className="ml-2">
                  • {pagination.totalCount} total items
                  {!hasBackendConnection && " (demo)"}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                className={cn(
                  "px-3 py-1 rounded text-sm font-medium transition-colors",
                  viewMode === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
                onClick={() => setViewMode("list")}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </button>
              <button
                className={cn(
                  "px-3 py-1 rounded text-sm font-medium transition-colors",
                  viewMode === "grid"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
                onClick={() => setViewMode("grid")}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
            </div>

            <Link href="/items/new">
              <Button variant="primary">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Item
              </Button>
            </Link>
          </div>
        </div>

        {/* Alert */}
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Content */}
        {viewMode === "list" ? (
          <ItemList
            items={items}
            pagination={pagination}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onItemDelete={handleItemDelete}
            onItemPublish={handleItemPublish}
            onItemUnpublish={handleItemUnpublish}
            onItemArchive={handleItemArchive}
            isLoading={isLoading && hasBackendConnection}
          />
        ) : (
          <div className="space-y-6">
            {/* Grid Filters (simplified) */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Search items..."
                  className="input"
                  value={filters.search || ""}
                  onChange={(e) =>
                    handleFiltersChange({
                      ...filters,
                      search: e.target.value,
                      page: 1,
                    })
                  }
                />

                <select
                  className="input"
                  value={filters.status || ""}
                  onChange={(e) =>
                    handleFiltersChange({
                      ...filters,
                      status: e.target.value as any,
                      page: 1,
                    })
                  }
                >
                  <option value="">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>

                <select
                  className="input"
                  value={`${filters.sortBy || "createdAt"}:${
                    filters.sortOrder || "desc"
                  }`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split(":");
                    handleFiltersChange({
                      ...filters,
                      sortBy,
                      sortOrder: sortOrder as "asc" | "desc",
                      page: 1,
                    });
                  }}
                >
                  <option value="createdAt:desc">Newest First</option>
                  <option value="createdAt:asc">Oldest First</option>
                  <option value="title:asc">Title A-Z</option>
                  <option value="title:desc">Title Z-A</option>
                  <option value="price:desc">Price High-Low</option>
                  <option value="price:asc">Price Low-High</option>
                </select>
              </div>
            </div>

            {/* Items Grid */}
            {isLoading && hasBackendConnection ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-gray-600">Loading items...</p>
              </div>
            ) : (
              <ItemGrid
                items={items}
                onItemAction={handleItemAction}
                cardSize="md"
              />
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ItemsPage;
