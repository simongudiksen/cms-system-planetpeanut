import React, { useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ConfirmModal } from "@/components/ui/Modal";
import { ItemAvatar } from "./ItemPreview";
import { Item, ItemFilters, PaginationInfo, SelectOption } from "@/types";
import { formatCurrency, formatDate, utils } from "@/utils/api";

interface ItemListProps {
  items: Item[];
  pagination: PaginationInfo;
  filters: ItemFilters;
  onFiltersChange: (filters: ItemFilters) => void;
  onItemDelete: (item: Item) => Promise<void>;
  onItemPublish: (item: Item) => Promise<void>;
  onItemUnpublish: (item: Item) => Promise<void>;
  onItemArchive: (item: Item) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

const statusOptions: SelectOption[] = [
  { value: "", label: "All Statuses" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

const currencyOptions: SelectOption[] = [
  { value: "", label: "All Currencies" },
  { value: "diamonds", label: "💎 Diamonds" },
  { value: "peanuts", label: "🥜 Peanuts" },
];

const levelOptions: SelectOption[] = [
  { value: "", label: "All Levels" },
  { value: "1-10", label: "Level 1-10" },
  { value: "11-25", label: "Level 11-25" },
  { value: "26-50", label: "Level 26-50" },
  { value: "51-75", label: "Level 51-75" },
  { value: "76-100", label: "Level 76-100" },
];

const sortOptions: SelectOption[] = [
  { value: "createdAt:desc", label: "Newest First" },
  { value: "createdAt:asc", label: "Oldest First" },
  { value: "title:asc", label: "Title A-Z" },
  { value: "title:desc", label: "Title Z-A" },
  { value: "price:desc", label: "Price High-Low" },
  { value: "price:asc", label: "Price Low-High" },
  { value: "level:desc", label: "Level High-Low" },
  { value: "level:asc", label: "Level Low-High" },
];

const ItemList: React.FC<ItemListProps> = ({
  items,
  pagination,
  filters,
  onFiltersChange,
  onItemDelete,
  onItemPublish,
  onItemUnpublish,
  onItemArchive,
  isLoading = false,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState(filters.search || "");
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "delete" | "publish" | "unpublish" | "archive";
    item?: Item;
  }>({ isOpen: false, type: "delete" });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Use ref to track mounted state
  const isMountedRef = useRef(true);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Debug logging for items
  React.useEffect(() => {
    console.log("ItemList - Received items:", items);
    console.log("ItemList - Items count:", items.length);
    items.forEach((item, index) => {
      console.log(`Item ${index}:`, {
        title: item.title,
        description: item.description,
        price: item.price,
        level: item.level,
        status: item.status,
      });
    });
  }, [items]);

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Debounced search with improved implementation
  const debouncedSearch = useCallback(
    (query: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          onFiltersChange({ ...filters, search: query, page: 1 });
        }
      }, 500);
    },
    [filters, onFiltersChange]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleFilterChange = useCallback(
    (key: keyof ItemFilters, value: any) => {
      onFiltersChange({ ...filters, [key]: value, page: 1 });
    },
    [filters, onFiltersChange]
  );

  const handleSortChange = useCallback(
    (value: string) => {
      const [sortBy, sortOrder] = value.split(":") as [string, "asc" | "desc"];
      onFiltersChange({ ...filters, sortBy, sortOrder, page: 1 });
    },
    [filters, onFiltersChange]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      onFiltersChange({ ...filters, page });
    },
    [filters, onFiltersChange]
  );

  const handleConfirmAction = useCallback(async () => {
    if (!confirmModal.item) return;

    try {
      setActionLoading(confirmModal.item._id);

      switch (confirmModal.type) {
        case "delete":
          await onItemDelete(confirmModal.item);
          break;
        case "publish":
          await onItemPublish(confirmModal.item);
          break;
        case "unpublish":
          await onItemUnpublish(confirmModal.item);
          break;
        case "archive":
          await onItemArchive(confirmModal.item);
          break;
      }

      setConfirmModal({ isOpen: false, type: "delete" });
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setActionLoading(null);
    }
  }, [
    confirmModal,
    onItemDelete,
    onItemPublish,
    onItemUnpublish,
    onItemArchive,
  ]);

  const getStatusBadgeClass = useCallback((status: string) => {
    switch (status) {
      case "published":
        return "bg-success-100 text-success-800";
      case "draft":
        return "bg-warning-100 text-warning-800";
      case "archived":
        return "bg-error-100 text-error-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  const getQuickActions = useCallback((item: Item) => {
    const actions = [];

    if (item.status === "draft") {
      actions.push({
        label: "Publish",
        action: () => setConfirmModal({ isOpen: true, type: "publish", item }),
        variant: "success" as const,
      });
    } else if (item.status === "published") {
      actions.push({
        label: "Unpublish",
        action: () =>
          setConfirmModal({ isOpen: true, type: "unpublish", item }),
        variant: "warning" as const,
      });
    }

    if (item.status !== "archived") {
      actions.push({
        label: "Archive",
        action: () => setConfirmModal({ isOpen: true, type: "archive", item }),
        variant: "outline" as const,
      });
    }

    actions.push({
      label: "Delete",
      action: () => setConfirmModal({ isOpen: true, type: "delete", item }),
      variant: "danger" as const,
    });

    return actions;
  }, []);

  // Memoize the current sort value to prevent unnecessary re-renders
  const currentSortValue = useMemo(() => {
    return `${filters.sortBy || "createdAt"}:${filters.sortOrder || "desc"}`;
  }, [filters.sortBy, filters.sortOrder]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            leftIcon={
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
          />

          <Select
            placeholder="Status"
            value={filters.status || ""}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            options={statusOptions}
          />

          <Select
            placeholder="Currency"
            value={filters.currency || ""}
            onChange={(e) => handleFilterChange("currency", e.target.value)}
            options={currencyOptions}
          />

          <Select
            placeholder="Sort by"
            value={currentSortValue}
            onChange={(e) => handleSortChange(e.target.value)}
            options={sortOptions}
          />
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Loading items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8-4 4-4-4m4 4V3m4 4h-2m-4 4v8"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No items found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first item.
            </p>
            <div className="mt-6">
              <Link href="/items/new">
                <Button variant="primary">Create Item</Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-4">Item</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-1">Level</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Item Info */}
                    <div className="col-span-4">
                      <div className="flex items-center space-x-3">
                        <ItemAvatar item={item} size="md" />
                        <div className="min-w-0 flex-1">
                          <Link href={`/items/${item._id}`}>
                            <p className="text-sm font-medium text-gray-900 truncate hover:text-primary-600 transition-colors">
                              {item.title}
                            </p>
                          </Link>
                          <p className="text-sm text-gray-500 truncate">
                            {utils.truncate(item.description || "", 50)}
                          </p>
                          <p className="text-xs text-gray-400">
                            Created {formatDate(item.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Type */}
                    <div className="col-span-2">
                      <p className="text-sm text-gray-900 capitalize">
                        {item.clothingType}
                      </p>
                      <p className="text-xs text-gray-500">{item.layer}</p>
                    </div>

                    {/* Price */}
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.price, item.currency)}
                      </p>
                    </div>

                    {/* Level */}
                    <div className="col-span-1">
                      <p className="text-sm text-gray-900">{item.level}</p>
                    </div>

                    {/* Status */}
                    <div className="col-span-1">
                      <span
                        className={cn(
                          "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                          getStatusBadgeClass(item.status)
                        )}
                      >
                        {utils.capitalize(item.status)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2">
                      <div className="flex items-center space-x-2">
                        <Link href={`/items/${item._id}`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>

                        {/* Quick Actions Dropdown */}
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

                          <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <div className="py-1">
                              {getQuickActions(item).map((action, index) => (
                                <button
                                  key={index}
                                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                  onClick={action.action}
                                  disabled={actionLoading === item._id}
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-6 py-3">
          <div className="flex items-center text-sm text-gray-500">
            Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
            {Math.min(
              pagination.currentPage * pagination.limit,
              pagination.totalCount
            )}{" "}
            of {pagination.totalCount} items
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage || isLoading}
            >
              Previous
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  const pageNum = pagination.currentPage - 2 + i;
                  if (pageNum < 1 || pageNum > pagination.totalPages)
                    return null;

                  return (
                    <Button
                      key={pageNum}
                      variant={
                        pageNum === pagination.currentPage
                          ? "primary"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={isLoading}
                    >
                      {pageNum}
                    </Button>
                  );
                }
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: "delete" })}
        onConfirm={handleConfirmAction}
        title={`${utils.capitalize(confirmModal.type)} Item`}
        message={`Are you sure you want to ${confirmModal.type} "${confirmModal.item?.title}"? This action cannot be undone.`}
        confirmText={utils.capitalize(confirmModal.type)}
        isLoading={actionLoading === confirmModal.item?._id}
        variant={confirmModal.type === "delete" ? "danger" : "warning"}
      />
    </div>
  );
};

export { ItemList };
