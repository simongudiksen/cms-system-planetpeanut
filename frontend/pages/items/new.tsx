import React, { useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/layout/Layout";
import { ItemForm } from "@/components/items/ItemForm";
import { Alert } from "@/components/ui/Alert";
import { CreateItemRequest } from "@/types";
import { api, handleApiError } from "@/utils/api";

const NewItemPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning" | "info";
    message: string;
  } | null>(null);

  const handleSubmit = async (data: CreateItemRequest, images: File[]) => {
    try {
      setIsLoading(true);
      setAlert(null);

      // First, upload images if any
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

      // Create item with image URLs
      const itemData: CreateItemRequest = {
        ...data,
        imageRaisedUrl: (imageUrls as any).raised,
        imageShopUrl: (imageUrls as any).shop,
        imageThumbnailUrl: (imageUrls as any).raisedThumbnail,
        imageMediumUrl: (imageUrls as any).raisedMedium,
      };

      const response = await api.createItem(itemData);

      if (response.success && response.data) {
        setAlert({
          type: "success",
          message: `Item "${data.title}" created successfully!`,
        });

        // Redirect to the item's edit page after a short delay
        setTimeout(() => {
          router.push(`/items/${response.data?.item._id}`);
        }, 1500);
      } else {
        throw new Error(response.error?.message || "Failed to create item");
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: handleApiError(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async (data: CreateItemRequest, images: File[]) => {
    // Save as draft is the same as regular save but with status: 'draft'
    await handleSubmit({ ...data, status: "draft" }, images);
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
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
                Create New Item
              </h1>
              <p className="text-gray-600">
                Add a new item to your Planet Peanut collection
              </p>
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
          onSubmit={handleSubmit}
          onSaveDraft={handleSaveDraft}
          isLoading={isLoading}
        />
      </div>
    </Layout>
  );
};

export default NewItemPage;
