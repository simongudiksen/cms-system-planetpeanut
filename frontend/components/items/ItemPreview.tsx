import React from "react";
import { cn } from "@/utils/cn";
import { Item } from "@/types";
import { formatCurrency, formatDate } from "@/utils/api";

interface ItemPreviewProps {
  item: Partial<Item>;
  className?: string;
  showDetails?: boolean;
}

const ItemPreview: React.FC<ItemPreviewProps> = ({
  item,
  className,
  showDetails = true,
}) => {
  // Get primary image from images object
  const primaryImage =
    item.images?.raised ||
    item.images?.shop ||
    item.images?.medium ||
    item.images?.thumbnail;
  const imageCount = item.images
    ? Object.values(item.images).filter(Boolean).length
    : 0;

  const statusColor = {
    draft: "bg-gray-100 text-gray-800",
    published: "bg-success-100 text-success-800",
    archived: "bg-warning-100 text-warning-800",
  };

  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 overflow-hidden",
        className
      )}
    >
      {/* Image Section */}
      <div className="aspect-square bg-gray-100 relative">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={item.title || "Item preview"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Status Badge */}
        {item.status && (
          <div className="absolute top-2 right-2">
            <span
              className={cn(
                "px-2 py-1 text-xs font-medium rounded-full",
                statusColor[item.status as keyof typeof statusColor] ||
                  statusColor.draft
              )}
            >
              {item.status}
            </span>
          </div>
        )}

        {/* Images Count */}
        {imageCount > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
            +{imageCount - 1} more
          </div>
        )}
      </div>

      {/* Details Section */}
      {showDetails && (
        <div className="p-4 space-y-3">
          {/* Title and Type */}
          <div>
            <h3 className="font-semibold text-gray-900 truncate">
              {item.title || "Untitled Item"}
            </h3>
            {item.clothingType && (
              <p className="text-sm text-gray-500 capitalize">
                {item.clothingType}
              </p>
            )}
          </div>

          {/* Price */}
          {item.price && (
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary-600">
                {formatCurrency(item.price, item.currency || "diamonds")}
              </span>
              {item.level && (
                <span className="text-sm text-gray-500">
                  Level {item.level}
                </span>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            {item.layer && (
              <span className="bg-gray-100 px-2 py-1 rounded">
                Layer {item.layer}
              </span>
            )}
            {item.createdAt && <span>{formatDate(item.createdAt)}</span>}
          </div>

          {/* Description Preview */}
          {item.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Compact version for lists
interface ItemAvatarProps {
  item: Partial<Item>;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const ItemAvatar: React.FC<ItemAvatarProps> = ({
  item,
  size = "md",
  className,
}) => {
  const primaryImage =
    item.images?.raised ||
    item.images?.shop ||
    item.images?.medium ||
    item.images?.thumbnail;
  const imageCount = item.images
    ? Object.values(item.images).filter(Boolean).length
    : 0;

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={cn(
        "bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg overflow-hidden flex-shrink-0 relative border border-primary-200",
        sizeClasses[size],
        className
      )}
    >
      {primaryImage ? (
        <img
          src={primaryImage}
          alt={item.title || "Item"}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.log("Image failed to load for item:", item.title);
          }}
          onLoad={() => {
            console.log("Image loaded for item:", item.title);
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-primary-600">
          <svg
            className={cn(iconSizes[size])}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {/* Multiple images indicator */}
      {imageCount > 1 && (
        <div className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {imageCount}
        </div>
      )}
    </div>
  );
};

export { ItemPreview, ItemAvatar };
