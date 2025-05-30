import React, { useState } from "react";
import { Item } from "@/types";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";
import { EquippedItems } from "./AvatarPreview";

interface LayerManagerProps {
  equippedItems: EquippedItems;
  availableItems?: Item[];
  onEquipItem: (layer: string, item: Item | null) => void;
  onRemoveItem: (layer: string) => void;
  className?: string;
}

// Layer information with proper names
const LAYER_INFO = {
  accessoryBack: { name: "Accessory (Back)", category: "Accessories" },
  pants_layer_full: { name: "Pants (Full)", category: "Lower Body" },
  body_layer_full: { name: "Body (Full)", category: "Upper Body" },
  body_layer1: { name: "Body Layer 1", category: "Upper Body" },
  body_layer2: { name: "Body Layer 2", category: "Upper Body" },
  fullbody1: { name: "Full Body 1", category: "Full Body" },
  accessory: { name: "Accessory", category: "Accessories" },
  head_layer1: { name: "Head Layer 1", category: "Head" },
  head_layer2: { name: "Head Layer 2", category: "Head" },
  head_layer3: { name: "Head Layer 3", category: "Head" },
  head_layer_full: { name: "Head (Full)", category: "Head" },
  fullbody2: { name: "Full Body 2", category: "Full Body" },
} as const;

export const LayerManager: React.FC<LayerManagerProps> = ({
  equippedItems,
  availableItems = [],
  onEquipItem,
  onRemoveItem,
  className,
}) => {
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Group available items by clothing type
  const itemsByClothingType = React.useMemo(() => {
    const groups: Record<string, Item[]> = {};
    availableItems.forEach((item) => {
      const type = item.clothingType || "other";
      if (!groups[type]) groups[type] = [];
      groups[type].push(item);
    });
    return groups;
  }, [availableItems]);

  // Filter items that can be equipped on the selected layer
  const getCompatibleItems = (layer: string) => {
    return availableItems.filter((item) => {
      // Map our layer keys to item layer property
      const itemLayer = item.layer;

      // Direct match
      if (itemLayer === layer) return true;

      // Handle mapping between our layer names and item layer names
      const layerMappings: Record<string, string[]> = {
        accessoryBack: ["accessoryBack"],
        pants_layer_full: ["pants_layer_full"],
        body_layer_full: ["body_layer_full"],
        body_layer1: ["body_layer1"],
        body_layer2: ["body_layer2"],
        fullbody1: ["fullbody1"],
        accessory: ["accessory"],
        head_layer1: ["head_layer1"],
        head_layer2: ["head_layer2"],
        head_layer3: ["head_layer3"],
        head_layer_full: ["head_layer_full"],
        fullbody2: ["fullbody2"],
      };

      return layerMappings[layer]?.includes(itemLayer) || false;
    });
  };

  const categories = [
    "all",
    ...Array.from(new Set(Object.values(LAYER_INFO).map((l) => l.category))),
  ];

  const filteredLayers = Object.keys(LAYER_INFO).filter((layer) => {
    if (filterCategory === "all") return true;
    return (
      LAYER_INFO[layer as keyof typeof LAYER_INFO].category === filterCategory
    );
  });

  return (
    <div
      className={cn("bg-white rounded-lg border border-gray-200", className)}
    >
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Layer Manager
        </h3>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilterCategory(category)}
              className={cn(
                "px-3 py-1 rounded text-sm transition-colors",
                filterCategory === category
                  ? "bg-primary-100 text-primary-700 border border-primary-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {category === "all" ? "All Layers" : category}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {filteredLayers.map((layer) => {
          const layerInfo = LAYER_INFO[layer as keyof typeof LAYER_INFO];
          const equippedItem = equippedItems[layer];
          const compatibleItems = getCompatibleItems(layer);

          return (
            <div key={layer} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {layerInfo.name}
                  </h4>
                  <p className="text-xs text-gray-500">{layerInfo.category}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {equippedItem && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRemoveItem(layer)}
                    >
                      Remove
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant={selectedLayer === layer ? "primary" : "outline"}
                    onClick={() =>
                      setSelectedLayer(selectedLayer === layer ? null : layer)
                    }
                  >
                    {selectedLayer === layer ? "Close" : "Change"}
                  </Button>
                </div>
              </div>

              {/* Currently Equipped Item */}
              {equippedItem ? (
                <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                  {equippedItem.imageThumbnailUrl && (
                    <div className="w-10 h-10 relative">
                      <img
                        src={equippedItem.imageThumbnailUrl}
                        alt={equippedItem.title}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {equippedItem.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {equippedItem.clothingType} • Level {equippedItem.level}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-2 bg-gray-50 rounded text-center">
                  <p className="text-sm text-gray-500">No item equipped</p>
                </div>
              )}

              {/* Item Selection */}
              {selectedLayer === layer && (
                <div className="mt-3 border-t border-gray-200 pt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Compatible Items ({compatibleItems.length})
                  </p>

                  {compatibleItems.length > 0 ? (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {/* None option */}
                      <button
                        onClick={() => {
                          onEquipItem(layer, null);
                          setSelectedLayer(null);
                        }}
                        className="w-full flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
                      >
                        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">None</span>
                        </div>
                        <span className="text-sm text-gray-700">
                          Remove item
                        </span>
                      </button>

                      {compatibleItems.map((item) => (
                        <button
                          key={item._id}
                          onClick={() => {
                            onEquipItem(layer, item);
                            setSelectedLayer(null);
                          }}
                          className={cn(
                            "w-full flex items-center space-x-3 p-2 rounded transition-colors",
                            equippedItem?._id === item._id
                              ? "bg-primary-50 border border-primary-200"
                              : "hover:bg-gray-50"
                          )}
                        >
                          {item.imageThumbnailUrl && (
                            <div className="w-8 h-8 relative">
                              <img
                                src={item.imageThumbnailUrl}
                                alt={item.title}
                                className="w-full h-full object-cover rounded"
                              />
                            </div>
                          )}
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              Level {item.level} • {item.price} {item.currency}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-2">
                      No compatible items available
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
