import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import {
  AvatarPreview,
  EquippedItems,
  AVATAR_TYPES,
} from "@/components/preview/AvatarPreview";
import { LayerManager } from "@/components/preview/LayerManager";
import { Button } from "@/components/ui/Button";
import { Item } from "@/types";
import { api, handleApiError } from "@/utils/api";

export default function AvatarPreviewPage() {
  const [selectedAvatar, setSelectedAvatar] = useState("monkey");
  const [equippedItems, setEquippedItems] = useState<EquippedItems>({});
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Mock items for demo (same as items page)
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
        raised:
          "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=400&fit=crop&crop=center&auto=format&q=80",
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
        raised:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center&auto=format&q=80",
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
      status: "published",
      images: {
        thumbnail:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
        raised:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center&auto=format&q=80",
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

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to load from API first
      const response = await api.getItems({ page: 1, limit: 50 });

      if (response.success && response.data) {
        setAvailableItems(response.data.items);
      } else {
        throw new Error("API failed");
      }
    } catch (error) {
      console.warn("Failed to load items from API, using mock data:", error);
      // Fallback to mock data
      setAvailableItems(mockItems);
      setError("Using demo data - start backend for real items");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEquipItem = (layer: string, item: Item | null) => {
    console.log("Equipping item:", { layer, item: item?.title || "none" });
    setEquippedItems((prev) => {
      const updated = {
        ...prev,
        [layer]: item,
      };
      console.log("Updated equipped items:", updated);
      return updated;
    });
  };

  const handleRemoveItem = (layer: string) => {
    setEquippedItems((prev) => {
      const updated = { ...prev };
      delete updated[layer];
      return updated;
    });
  };

  const handleClearAll = () => {
    setEquippedItems({});
  };

  const handleRandomOutfit = () => {
    const newEquipment: EquippedItems = {};

    // Randomly equip some items
    const layers = ["head_layer_full", "body_layer_full", "body_layer1"];

    layers.forEach((layer) => {
      const compatibleItems = availableItems.filter(
        (item) => item.layer === layer
      );
      if (compatibleItems.length > 0) {
        const randomItem =
          compatibleItems[Math.floor(Math.random() * compatibleItems.length)];
        newEquipment[layer] = randomItem;
      }
    });

    setEquippedItems(newEquipment);
  };

  const exportPreview = () => {
    // This would capture the preview as an image
    // For now, just show a placeholder
    alert(
      "Export functionality would capture the current avatar preview as an image file."
    );
  };

  return (
    <Layout title="Avatar Preview System">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Avatar Dress-Up System
              </h1>
              <p className="text-gray-600">
                Test and preview how clothing items look on different avatars
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={handleClearAll}>
                Clear All
              </Button>
              <Button variant="outline" onClick={handleRandomOutfit}>
                Random Outfit
              </Button>
              <Button variant="primary" onClick={exportPreview}>
                Export Preview
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-warning-50 border border-warning-200 rounded-lg p-3">
              <p className="text-warning-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar Preview */}
          <div className="lg:col-span-2">
            <AvatarPreview
              selectedAvatar={selectedAvatar}
              equippedItems={equippedItems}
              onAvatarChange={setSelectedAvatar}
              zoom={zoom}
              onZoomChange={setZoom}
              width={600}
              height={600}
              className="mx-auto"
            />
          </div>

          {/* Layer Manager */}
          <div>
            <LayerManager
              equippedItems={equippedItems}
              availableItems={availableItems}
              onEquipItem={handleEquipItem}
              onRemoveItem={handleRemoveItem}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Preview Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">
                {AVATAR_TYPES.length}
              </p>
              <p className="text-sm text-gray-600">Available Avatars</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary-600">
                {availableItems.length}
              </p>
              <p className="text-sm text-gray-600">Available Items</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-600">
                {Object.keys(equippedItems).length}
              </p>
              <p className="text-sm text-gray-600">Items Equipped</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-info-600">
                {selectedAvatar.charAt(0).toUpperCase() +
                  selectedAvatar.slice(1)}
              </p>
              <p className="text-sm text-gray-600">Current Avatar</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
