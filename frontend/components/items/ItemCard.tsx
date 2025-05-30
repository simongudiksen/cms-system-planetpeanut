import React from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";
import { Item } from "@/types";
import { formatCurrency, formatDate, utils } from "@/utils/api";

interface ItemCardProps {
  item: Item;
  onEdit?: (item: Item) => void;
  onDelete?: (item: Item) => void;
  onPublish?: (item: Item) => void;
  onUnpublish?: (item: Item) => void;
  onArchive?: (item: Item) => void;
  className?: string;
  showActions?: boolean;
  size?: "sm" | "md" | "lg";
}

const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  onArchive,
  className,
  showActions = true,
  size = "md",
}) => {
  const primaryImage =
    item.images?.raised ||
    item.images?.shop ||
    item.images?.medium ||
    item.images?.thumbnail;
  const imageCount = item.images
    ? Object.values(item.images).filter(Boolean).length
    : 0;

  const statusColors = {
    published: "bg-success-100 text-success-800 border-success-200",
    draft: "bg-warning-100 text-warning-800 border-warning-200",
    archived: "bg-error-100 text-error-800 border-error-200",
  };

  const sizeClasses = {
    sm: "max-w-xs",
    md: "max-w-sm",
    lg: "max-w-md",
  };

  const imageHeightClasses = {
    sm: "h-48",
    md: "h-64",
    lg: "h-80",
  };

  const getStatusActions = () => {
    const actions = [];

    if (item.status === "draft" && onPublish) {
      actions.push({
        label: "Publish",
        action: () => onPublish(item),
        variant: "success" as const,
      });
    }

    if (item.status === "published" && onUnpublish) {
      actions.push({
        label: "Unpublish",
        action: () => onUnpublish(item),
        variant: "outline" as const,
      });
    }

    if (item.status !== "archived" && onArchive) {
      actions.push({
        label: "Archive",
        action: () => onArchive(item),
        variant: "outline" as const,
      });
    }

    return actions;
  };

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1",
        sizeClasses[size],
        className
      )}
    >
      {/* Image Section */}
      <div className={cn("relative bg-gray-100", imageHeightClasses[size])}>
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={item.title}
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
        <div className="absolute top-3 left-3">
          <span
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-full border",
              statusColors[item.status as keyof typeof statusColors] ||
                statusColors.draft
            )}
          >
            {utils.capitalize(item.status)}
          </span>
        </div>

        {/* Images Count */}
        {imageCount > 1 && (
          <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs font-medium">
            +{imageCount - 1}
          </div>
        )}

        {/* Level Badge */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-white bg-opacity-90 text-gray-900 px-2 py-1 rounded text-xs font-medium">
            Level {item.level}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Title and Type */}
        <div>
          <Link href={`/items/${item._id}`}>
            <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2">
              {item.title}
            </h3>
          </Link>
          <p className="text-sm text-gray-500 capitalize mt-1">
            {item.clothingType} • {item.layer}
          </p>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary-600">
            {formatCurrency(item.price, item.currency)}
          </span>
          {item.color && (
            <span className="text-sm text-gray-500">{item.color}</span>
          )}
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <span>Created {formatDate(item.createdAt)}</span>
          {item.tags && item.tags.length > 0 && (
            <span className="bg-gray-100 px-2 py-1 rounded">
              {item.tags.length} tag{item.tags.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center space-x-2 pt-3">
            <Link href={`/items/${item._id}`}>
              <Button variant="outline" size="sm" className="flex-1">
                Edit
              </Button>
            </Link>

            {/* Status Actions */}
            {getStatusActions().map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                size="sm"
                onClick={action.action}
                className="flex-1"
              >
                {action.label}
              </Button>
            ))}

            {/* More Actions Dropdown */}
            <div className="relative group">
              <Button variant="outline" size="sm">
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
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </Button>

              <div className="absolute right-0 bottom-full mb-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <div className="py-1">
                  <Link href={`/items/${item._id}`}>
                    <button className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      View Details
                    </button>
                  </Link>

                  {onArchive && item.status !== "archived" && (
                    <button
                      className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => onArchive(item)}
                    >
                      Archive
                    </button>
                  )}

                  <button
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `${window.location.origin}/items/${item._id}`
                      )
                    }
                  >
                    Copy Link
                  </button>

                  {onDelete && (
                    <button
                      className="block w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                      onClick={() => onDelete(item)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Grid container component
interface ItemGridProps {
  items: Item[];
  onItemAction?: (action: string, item: Item) => void;
  className?: string;
  cardSize?: "sm" | "md" | "lg";
  showActions?: boolean;
}

const ItemGrid: React.FC<ItemGridProps> = ({
  items,
  onItemAction,
  className,
  cardSize = "md",
  showActions = true,
}) => {
  const handleAction = (action: string, item: Item) => {
    onItemAction?.(action, item);
  };

  return (
    <div
      className={cn(
        "grid gap-6",
        {
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4":
            cardSize === "sm",
          "grid-cols-1 md:grid-cols-2 lg:grid-cols-3": cardSize === "md",
          "grid-cols-1 md:grid-cols-2": cardSize === "lg",
        },
        className
      )}
    >
      {items.map((item) => (
        <ItemCard
          key={item._id}
          item={item}
          size={cardSize}
          showActions={showActions}
          onEdit={(item) => handleAction("edit", item)}
          onDelete={(item) => handleAction("delete", item)}
          onPublish={(item) => handleAction("publish", item)}
          onUnpublish={(item) => handleAction("unpublish", item)}
          onArchive={(item) => handleAction("archive", item)}
        />
      ))}
    </div>
  );
};

export { ItemCard, ItemGrid };
