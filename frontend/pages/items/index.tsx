import React from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function ItemsPage() {
  return (
    <Layout title="Items">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Items</h1>
            <p className="text-gray-600">
              Manage your avatar items and inventory
            </p>
          </div>
          <Link href="/items/new">
            <Button>
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Create Item
            </Button>
          </Link>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Items Management
            </h3>
            <p className="text-gray-500 mb-6">
              This page will display and manage all avatar items. The full
              implementation will be added in the next phase.
            </p>
            <Link href="/items/new">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
