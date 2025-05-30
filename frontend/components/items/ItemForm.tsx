import React, { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ImageUpload } from "./ImageUpload";
import { ItemPreview } from "./ItemPreview";
import { Alert } from "@/components/ui/Alert";
import { cn } from "@/utils/cn";
import {
  Item,
  CreateItemRequest,
  ClothingType,
  Currency,
  Layer,
  ItemStatus,
  SelectOption,
} from "@/types";

// Validation schema
const itemSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  price: z.number().min(0, "Price must be positive"),
  currency: z.enum(["diamonds", "peanuts"]),
  level: z
    .number()
    .min(1, "Level must be at least 1")
    .max(100, "Level must be less than 100"),
  clothingType: z.enum([
    "weapons",
    "Official Planet Peanut Work Wear",
    "space gear",
    "utility gear",
    "Planetary Governance Wear",
    "battle armor",
    "tribal wear",
    "experimental tech",
    "casual wear",
  ]),
  layer: z.enum([
    "body_layer1",
    "body_layer2",
    "body_layer3",
    "body_layer_full",
    "head_layer1",
    "head_layer2",
    "head_layer3",
    "head_layer_full",
    "pants_layer1",
    "pants_layer2",
    "pants_layer3",
    "pants_layer_full",
    "accessory",
    "accessoryBack",
    "fullbody1",
    "fullbody2",
  ]),
  color: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  releaseDate: z.string().optional(),
  retireDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type ItemFormData = z.infer<typeof itemSchema>;

interface ItemFormProps {
  item?: Item;
  onSubmit: (data: CreateItemRequest, images: File[]) => Promise<void>;
  onSaveDraft?: (data: CreateItemRequest, images: File[]) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

const clothingTypeOptions: SelectOption[] = [
  { value: "weapons", label: "Weapons" },
  {
    value: "Official Planet Peanut Work Wear",
    label: "Official Planet Peanut Work Wear",
  },
  { value: "space gear", label: "Space Gear" },
  { value: "utility gear", label: "Utility Gear" },
  { value: "Planetary Governance Wear", label: "Planetary Governance Wear" },
  { value: "battle armor", label: "Battle Armor" },
  { value: "tribal wear", label: "Tribal Wear" },
  { value: "experimental tech", label: "Experimental Tech" },
  { value: "casual wear", label: "Casual Wear" },
];

const layerOptions: SelectOption[] = [
  { value: "body_layer1", label: "Body Layer 1" },
  { value: "body_layer2", label: "Body Layer 2" },
  { value: "body_layer3", label: "Body Layer 3" },
  { value: "body_layer_full", label: "Body Layer Full" },
  { value: "head_layer1", label: "Head Layer 1" },
  { value: "head_layer2", label: "Head Layer 2" },
  { value: "head_layer3", label: "Head Layer 3" },
  { value: "head_layer_full", label: "Head Layer Full" },
  { value: "pants_layer1", label: "Pants Layer 1" },
  { value: "pants_layer2", label: "Pants Layer 2" },
  { value: "pants_layer3", label: "Pants Layer 3" },
  { value: "pants_layer_full", label: "Pants Layer Full" },
  { value: "accessory", label: "Accessory" },
  { value: "accessoryBack", label: "Accessory Back" },
  { value: "fullbody1", label: "Full Body 1" },
  { value: "fullbody2", label: "Full Body 2" },
];

const currencyOptions: SelectOption[] = [
  { value: "diamonds", label: "💎 Diamonds" },
  { value: "peanuts", label: "🥜 Peanuts" },
];

const statusOptions: SelectOption[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const ItemForm: React.FC<ItemFormProps> = ({
  item,
  onSubmit,
  onSaveDraft,
  isLoading = false,
  className,
}) => {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning" | "info";
    message: string;
  } | null>(null);
  const [previewData, setPreviewData] = useState<Partial<Item> | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      title: item?.title || "",
      description: item?.description || "",
      price: item?.price || 0,
      currency: item?.currency || "diamonds",
      level: item?.level || 1,
      clothingType: item?.clothingType || "casual wear",
      layer: item?.layer || "body_layer1",
      color: item?.color || "",
      status: item?.status || "draft",
      releaseDate: item?.releaseDate || "",
      retireDate: item?.retireDate || "",
      tags: item?.tags || [],
    },
  });

  const watchedValues = watch();

  // Memoize watched values to prevent infinite loops
  const memoizedWatchedValues = useMemo(() => {
    return {
      title: watchedValues.title,
      description: watchedValues.description,
      price: watchedValues.price,
      currency: watchedValues.currency,
      level: watchedValues.level,
      clothingType: watchedValues.clothingType,
      layer: watchedValues.layer,
      color: watchedValues.color,
      status: watchedValues.status,
      tags: watchedValues.tags,
      releaseDate: watchedValues.releaseDate,
    };
  }, [
    watchedValues.title,
    watchedValues.description,
    watchedValues.price,
    watchedValues.currency,
    watchedValues.level,
    watchedValues.clothingType,
    watchedValues.layer,
    watchedValues.color,
    watchedValues.status,
    watchedValues.tags,
    watchedValues.releaseDate,
  ]);

  // Update preview when form values change
  useEffect(() => {
    const currentImages = item?.images || {};
    setPreviewData({
      ...memoizedWatchedValues,
      images: currentImages,
      createdAt: item?.createdAt || new Date().toISOString(),
    } as Partial<Item>);
  }, [memoizedWatchedValues, item?.images, item?.createdAt]);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(isDirty || uploadedImages.length > 0);
  }, [isDirty, uploadedImages]);

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleFormSubmit = async (data: ItemFormData, isDraft = false) => {
    try {
      setAlert(null);
      const formData: CreateItemRequest = {
        ...data,
        status: isDraft ? "draft" : data.status || "published",
        tags: data.tags || [],
      };

      if (isDraft && onSaveDraft) {
        await onSaveDraft(formData, uploadedImages);
      } else {
        await onSubmit(formData, uploadedImages);
      }

      setAlert({
        type: "success",
        message: isDraft
          ? "Item saved as draft successfully!"
          : "Item saved successfully!",
      });
      setHasUnsavedChanges(false);
      setUploadedImages([]);
    } catch (error) {
      setAlert({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to save item",
      });
    }
  };

  const handleImageUpload = (files: File[]) => {
    setUploadedImages(files);
  };

  const handleTagInput = (value: string) => {
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    setValue("tags", tags, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className={cn("space-y-8", className)}>
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {item ? "Edit Item" : "Create New Item"}
            </h2>

            <form className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Basic Information
                </h3>

                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Title"
                      placeholder="Enter item title"
                      error={errors.title?.message}
                      {...field}
                    />
                  )}
                />

                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        className="input w-full"
                        placeholder="Enter item description"
                        {...field}
                      />
                      {errors.description && (
                        <p className="text-sm text-error-600 mt-1">
                          {errors.description.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="clothingType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="Clothing Type"
                        placeholder="Select type"
                        error={errors.clothingType?.message}
                        options={clothingTypeOptions}
                        {...field}
                      />
                    )}
                  />

                  <Controller
                    name="layer"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="Layer"
                        placeholder="Select layer"
                        error={errors.layer?.message}
                        options={layerOptions}
                        {...field}
                      />
                    )}
                  />
                </div>

                <Controller
                  name="color"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Color"
                      placeholder="Enter color (optional)"
                      {...field}
                    />
                  )}
                />
              </div>

              {/* Pricing & Level */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Pricing & Level
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="price"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        label="Price"
                        placeholder="0"
                        error={errors.price?.message}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />

                  <Controller
                    name="currency"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="Currency"
                        options={currencyOptions}
                        {...field}
                      />
                    )}
                  />
                </div>

                <Controller
                  name="level"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      label="Level"
                      placeholder="1"
                      error={errors.level?.message}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>

              {/* Status & Dates */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Status & Dates
                </h3>

                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select label="Status" options={statusOptions} {...field} />
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="releaseDate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="date"
                        label="Release Date (Optional)"
                        {...field}
                      />
                    )}
                  />

                  <Controller
                    name="retireDate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="date"
                        label="Retire Date (Optional)"
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Tags</h3>

                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Tags"
                      placeholder="Enter tags separated by commas"
                      value={field.value?.join(", ") || ""}
                      onChange={(e) => handleTagInput(e.target.value)}
                      helpText="Separate multiple tags with commas"
                    />
                  )}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Images</h3>

                <ImageUpload
                  value={
                    item?.images
                      ? Object.values(item.images).filter(Boolean)
                      : []
                  }
                  onChange={handleImageUpload}
                  maxFiles={4}
                  disabled={isLoading}
                />
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                {onSaveDraft && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      handleSubmit((data) => handleFormSubmit(data, true))()
                    }
                    isLoading={isLoading}
                    disabled={isLoading}
                  >
                    Save as Draft
                  </Button>
                )}

                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSubmit((data) =>
                    handleFormSubmit(data, false)
                  )}
                  isLoading={isLoading}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {item ? "Update Item" : "Create Item"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
            {previewData && (
              <ItemPreview item={previewData} className="sticky top-6" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { ItemForm };
