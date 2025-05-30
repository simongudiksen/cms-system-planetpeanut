import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/layout/Layout";
import { ItemForm } from "@/components/items/ItemForm";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/Modal";
import { Item, CreateItemRequest } from "@/types";
import { api, handleApiError } from "@/utils/api";

const EditItemPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning" | "info";
    message: string;
  } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isInDemoMode, setIsInDemoMode] = useState(false);

  // Mock data for demo mode (matching the main items list)
  const mockItems: Record<string, Item> = {
    "mock-1": {
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
    "mock-2": {
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
    "mock-3": {
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
  };

  // Load item data
  useEffect(() => {
    if (id && typeof id === "string") {
      loadItem(id);
    }
  }, [id]);

  const loadItem = async (itemId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if this is a mock item
      if (itemId.startsWith("mock-") && mockItems[itemId]) {
        console.log("Loading mock item:", itemId);
        setItem(mockItems[itemId]);
        setIsInDemoMode(true);
        setIsLoading(false);
        return;
      }

      // Try to load from API
      const response = await api.getItem(itemId);

      if (response.success && response.data) {
        setItem(response.data.item);
        setIsInDemoMode(false);
      } else {
        throw new Error(response.error?.message || "Failed to load item");
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      console.warn("Failed to load item from API:", errorMessage);

      // For non-mock items, show error
      if (!itemId.startsWith("mock-")) {
        setError(errorMessage);
      } else {
        // This shouldn't happen, but fallback just in case
        setError("Mock item not found");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: CreateItemRequest, images: File[]) => {
    if (!item) return;

    try {
      setIsSaving(true);
      setAlert(null);

      // In demo mode, just simulate success
      if (isInDemoMode) {
        setTimeout(() => {
          setAlert({
            type: "warning",
            message: `Demo Mode: Would update "${data.title}" if backend was connected.`,
          });
          setHasUnsavedChanges(false);
          setIsSaving(false);
        }, 1000);
        return;
      }

      // First, upload new images if any
      let imageUrls = {};
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((file, index) => {
          formData.append("images", file);
        });

        const uploadResponse = await api.uploadItemImages(formData);

        if (uploadResponse.success && uploadResponse.data) {
          imageUrls = uploadResponse.data.imageUrls;
        } else {
          throw new Error(
            uploadResponse.error?.message || "Failed to upload images"
          );
        }
      }

      // Update item with new data and image URLs
      const updateData: CreateItemRequest = {
        ...data,
        // Only update image URLs if new ones were uploaded
        ...(Object.keys(imageUrls).length > 0 && {
          imageRaisedUrl: (imageUrls as any).raised || item.images?.raised,
          imageShopUrl: (imageUrls as any).shop || item.images?.shop,
          imageThumbnailUrl:
            (imageUrls as any).raisedThumbnail || item.images?.thumbnail,
          imageMediumUrl:
            (imageUrls as any).raisedMedium || item.images?.medium,
        }),
      };

      const response = await api.updateItem(item._id, updateData);

      if (response.success && response.data) {
        setItem(response.data.item);
        setHasUnsavedChanges(false);
        setAlert({
          type: "success",
          message: `Item "${data.title}" updated successfully!`,
        });
      } else {
        throw new Error(response.error?.message || "Failed to update item");
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: handleApiError(error),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async (data: CreateItemRequest, images: File[]) => {
    // Save as draft is the same as regular save but with status: 'draft'
    await handleSubmit({ ...data, status: "draft" }, images);
  };

  const handleDelete = async () => {
    if (!item) return;

    try {
      setIsDeleting(true);

      // In demo mode, just simulate success
      if (isInDemoMode) {
        setAlert({
          type: "warning",
          message: `Demo Mode: Would delete "${item.title}" if backend was connected.`,
        });
        setTimeout(() => {
          router.push("/items");
        }, 1500);
        setIsDeleting(false);
        setShowDeleteModal(false);
        return;
      }

      const response = await api.deleteItem(item._id);

      if (response.success) {
        setAlert({
          type: "success",
          message: `Item "${item.title}" deleted successfully`,
        });

        // Redirect to items list after a short delay
        setTimeout(() => {
          router.push("/items");
        }, 1500);
      } else {
        throw new Error(response.error?.message || "Failed to delete item");
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: handleApiError(error),
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleStatusChange = async (
    action: "publish" | "unpublish" | "archive"
  ) => {
    if (!item) return;

    try {
      // In demo mode, just simulate success
      if (isInDemoMode) {
        setAlert({
          type: "warning",
          message: `Demo Mode: Would ${action} "${item.title}" if backend was connected.`,
        });
        return;
      }

      let response;
      switch (action) {
        case "publish":
          response = await api.publishItem(item._id);
          break;
        case "unpublish":
          response = await api.unpublishItem(item._id);
          break;
        case "archive":
          response = await api.archiveItem(item._id);
          break;
      }

      if (response.success && response.data) {
        setItem(response.data.item);
        setAlert({
          type: "success",
          message: `Item ${action}ed successfully`,
        });
      } else {
        throw new Error(response.error?.message || `Failed to ${action} item`);
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: handleApiError(error),
      });
    }
  };

  // Handle browser back/navigation with unsaved changes - only when not in demo mode
  useEffect(() => {
    console.log(
      "Setting up beforeunload handler. Demo mode:",
      isInDemoMode,
      "Unsaved changes:",
      hasUnsavedChanges
    );

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      console.log(
        "beforeunload triggered. Demo mode:",
        isInDemoMode,
        "Unsaved changes:",
        hasUnsavedChanges
      );
      // Only prevent navigation if there are actual unsaved changes and not in demo mode
      if (hasUnsavedChanges && !isInDemoMode) {
        console.log("Preventing navigation due to unsaved changes");
        e.preventDefault();
        e.returnValue = "";
      } else {
        console.log("Allowing navigation");
      }
    };

    // Completely disable the handler for now to test if this is the issue
    if (false) {
      // Temporarily disabled
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () =>
        window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [hasUnsavedChanges, isInDemoMode]);

  // Add router debugging
  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      console.log("Route change start:", url);
    };

    const handleRouteChangeComplete = (url: string) => {
      console.log("Route change complete:", url);
    };

    const handleRouteChangeError = (err: any, url: string) => {
      console.log("Route change error:", err, url);
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    router.events.on("routeChangeError", handleRouteChangeError);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      router.events.off("routeChangeError", handleRouteChangeError);
    };
  }, [router]);

  const retryLoad = () => {
    if (id && typeof id === "string") {
      loadItem(id);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">Loading item...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
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
                Failed to Load Item
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="flex justify-center space-x-3">
                <Button onClick={retryLoad} variant="primary">
                  Try Again
                </Button>
                <Button onClick={() => router.push("/items")} variant="outline">
                  Back to Items
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // No item found
  if (!item) {
    return (
      <Layout>
        <div className="p-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Item Not Found
              </h3>
              <p className="text-gray-600 mb-6">
                The item you're looking for doesn't exist or has been deleted.
              </p>
              <Button onClick={() => router.push("/items")} variant="primary">
                Back to Items
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Demo Mode Indicator */}
        {isInDemoMode && (
          <div className="mb-6 bg-warning-50 border border-warning-200 rounded-lg p-4">
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
                  Demo Mode - Mock Item
                </p>
                <p className="text-sm text-warning-700">
                  You're viewing a demo item. Changes won't be saved. Start
                  backend to edit real items.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  console.log("Back button clicked");
                  router.push("/items");
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isInDemoMode ? "View Item (Demo)" : "Edit Item"}
                </h1>
                <p className="text-gray-600">
                  {isInDemoMode ? "Viewing" : "Editing"} "{item.title}" •
                  <span
                    className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      item.status === "published"
                        ? "bg-success-100 text-success-800"
                        : item.status === "draft"
                        ? "bg-warning-100 text-warning-800"
                        : "bg-error-100 text-error-800"
                    }`}
                  >
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              {item.status === "draft" && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleStatusChange("publish")}
                  disabled={isInDemoMode}
                >
                  Publish
                </Button>
              )}

              {item.status === "published" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange("unpublish")}
                  disabled={isInDemoMode}
                >
                  Unpublish
                </Button>
              )}

              {item.status !== "archived" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange("archive")}
                  disabled={isInDemoMode}
                >
                  Archive
                </Button>
              )}

              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                disabled={isInDemoMode}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Alert */}
        {alert && (
          <div className="mb-6">
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          </div>
        )}

        {/* Form */}
        <ItemForm
          item={item}
          onSubmit={handleSubmit}
          onSaveDraft={handleSaveDraft}
          isLoading={isSaving}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Delete Item"
          message={`Are you sure you want to delete "${item.title}"? This action cannot be undone.`}
          confirmText="Delete"
          isLoading={isDeleting}
          variant="danger"
        />
      </div>
    </Layout>
  );
};

export default EditItemPage;
