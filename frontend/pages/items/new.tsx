import React from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import Link from "next/link";

export default function CreateItemPage() {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Form submission will be implemented in the next phase
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <Layout title="Create Item">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/items">
            <Button variant="outline" size="sm">
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Items
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Create New Item
            </h1>
            <p className="text-gray-600">
              Add a new avatar item to your catalog
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Item Title"
                placeholder="Enter item title"
                required
              />

              <Select
                label="Clothing Type"
                placeholder="Select clothing type"
                options={[
                  { value: "weapons", label: "Weapons" },
                  { value: "casual wear", label: "Casual Wear" },
                  { value: "space gear", label: "Space Gear" },
                ]}
                required
              />

              <Input label="Price" type="number" placeholder="0" required />

              <Select
                label="Currency"
                placeholder="Select currency"
                options={[
                  { value: "diamonds", label: "Diamonds 💎" },
                  { value: "peanuts", label: "Peanuts 🥜" },
                ]}
                required
              />

              <Input label="Level" type="number" placeholder="1" required />

              <Select
                label="Layer"
                placeholder="Select layer"
                options={[
                  { value: "body_layer1", label: "Body Layer 1" },
                  { value: "head_layer1", label: "Head Layer 1" },
                  { value: "accessory", label: "Accessory" },
                ]}
                required
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                className="input min-h-[100px] resize-none"
                placeholder="Enter item description..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/items">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" isLoading={isLoading}>
                Create Item
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
