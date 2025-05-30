import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Item } from "@/types";
import { cn } from "@/utils/cn";

// Layer order based on mobile app (bottom to top)
const LAYER_ORDER = [
  "accessoryBack", // layers.accessory.back
  "pants_layer_full", // layers.pants.full
  "body_layer_full", // layers.body.full
  "body_layer1", // layers.body[1]
  "body_layer2", // layers.body[2]
  "fullbody1", // layers.fullbody[1]
  "accessory", // layers.accessory[1] (renamed from conflicting accessoryBack)
  "head_layer1", // layers.head[1]
  "head_layer2", // layers.head[2]
  "head_layer3", // layers.head[3]
  "head_layer_full", // layers.head.full
  "fullbody2", // layers.fullbody[2] - highest layer
] as const;

// Available avatars
export const AVATAR_TYPES = [
  { id: "croc", name: "🐊 Croc", image: "/avatars/croc.png" },
  { id: "duck", name: "🦆 Duck", image: "/avatars/duck.png" },
  { id: "hamster", name: "🐹 Hamster", image: "/avatars/hamster.png" },
  { id: "monkey", name: "🐵 Monkey", image: "/avatars/monkey.png" },
  { id: "panda", name: "🐼 Panda", image: "/avatars/panda.png" },
] as const;

export interface EquippedItems {
  [key: string]: Item | null;
}

interface AvatarPreviewProps {
  selectedAvatar?: string;
  equippedItems?: EquippedItems;
  className?: string;
  width?: number;
  height?: number;
  showControls?: boolean;
  onAvatarChange?: (avatarId: string) => void;
  onItemToggle?: (layer: string, visible: boolean) => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
}

export const AvatarPreview: React.FC<AvatarPreviewProps> = ({
  selectedAvatar = "monkey",
  equippedItems = {},
  className,
  width = 400,
  height = 400,
  showControls = true,
  onAvatarChange,
  onItemToggle,
  zoom = 1,
  onZoomChange,
}) => {
  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>(
    {}
  );
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const currentAvatar =
    AVATAR_TYPES.find((a) => a.id === selectedAvatar) || AVATAR_TYPES[3]; // Default to monkey

  // Handle mouse events for pan functionality
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    },
    [pan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        setPan({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Toggle layer visibility
  const toggleLayerVisibility = useCallback(
    (layer: string) => {
      const newVisibility = !visibleLayers[layer];
      setVisibleLayers((prev) => ({ ...prev, [layer]: newVisibility }));
      onItemToggle?.(layer, newVisibility);
    },
    [visibleLayers, onItemToggle]
  );

  // Reset pan and zoom
  const resetView = useCallback(() => {
    setPan({ x: 0, y: 0 });
    onZoomChange?.(1);
  }, [onZoomChange]);

  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 overflow-hidden",
        className
      )}
    >
      {/* Preview Container */}
      <div
        ref={containerRef}
        className="relative bg-gray-50 overflow-hidden cursor-move"
        style={{ width, height }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Avatar and Item Layers */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center",
            transition: isDragging ? "none" : "transform 0.2s ease",
          }}
        >
          {/* Base Avatar */}
          <div className="absolute inset-0" style={{ zIndex: 1 }}>
            <Image
              src={currentAvatar.image}
              alt={currentAvatar.name}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Item Layers - rendered in correct order */}
          {LAYER_ORDER.map((layerKey, index) => {
            const item = equippedItems[layerKey];
            const isVisible = visibleLayers[layerKey] !== false; // Default to visible

            // Debug logging
            if (item) {
              console.log(`Rendering item layer ${layerKey}:`, {
                item: item.title,
                zIndex: index + 2,
                imageRaisedUrl: item.imageRaisedUrl,
                imageThumbnailUrl: item.imageThumbnailUrl,
                hasValidImage: !!(
                  item.imageRaisedUrl || item.imageThumbnailUrl
                ),
                isVisible,
              });
            }

            if (!item || !isVisible) return null;

            return (
              <div
                key={layerKey}
                className="absolute inset-0"
                style={{
                  zIndex: index + 2,
                  // Debug border to see if layers are rendering
                  border: "2px solid red",
                  pointerEvents: "none",
                }}
              >
                <Image
                  src={item.imageRaisedUrl || item.imageThumbnailUrl || ""}
                  alt={item.title}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    console.warn(`Failed to load image for ${item.title}:`, {
                      imageRaisedUrl: item.imageRaisedUrl,
                      imageThumbnailUrl: item.imageThumbnailUrl,
                    });
                  }}
                  onLoad={() => {
                    console.log(`Successfully loaded image for ${item.title}`);
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Zoom indicator */}
        {zoom !== 1 && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
            {Math.round(zoom * 100)}%
          </div>
        )}
      </div>

      {/* Controls */}
      {showControls && (
        <div className="p-4 border-t border-gray-200 space-y-4">
          {/* Avatar Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Avatar
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_TYPES.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => onAvatarChange?.(avatar.id)}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm transition-colors",
                    selectedAvatar === avatar.id
                      ? "bg-primary-100 text-primary-700 border border-primary-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {avatar.name}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Zoom</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onZoomChange?.(Math.max(0.5, zoom - 0.25))}
                className="p-1 rounded hover:bg-gray-100"
                disabled={zoom <= 0.5}
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
                    d="M20 12H4"
                  />
                </svg>
              </button>
              <span className="text-sm text-gray-600 w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => onZoomChange?.(Math.min(3, zoom + 0.25))}
                className="p-1 rounded hover:bg-gray-100"
                disabled={zoom >= 3}
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
              <button
                onClick={resetView}
                className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Layer Visibility Controls */}
          {Object.keys(equippedItems).length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Layer Visibility
              </label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {LAYER_ORDER.map((layerKey) => {
                  const item = equippedItems[layerKey];
                  if (!item) return null;

                  const isVisible = visibleLayers[layerKey] !== false;

                  return (
                    <div
                      key={layerKey}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleLayerVisibility(layerKey)}
                          className={cn(
                            "w-4 h-4 rounded border-2 flex items-center justify-center",
                            isVisible
                              ? "bg-primary-500 border-primary-500 text-white"
                              : "border-gray-300"
                          )}
                        >
                          {isVisible && (
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                        <span className="text-sm text-gray-700 truncate">
                          {item.title}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{layerKey}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
