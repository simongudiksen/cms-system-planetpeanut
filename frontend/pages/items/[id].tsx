import React from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function EditItemPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Layout title="Edit Item">
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
            <h1 className="text-2xl font-bold text-gray-900">Edit Item</h1>
            <p className="text-gray-600">Item ID: {id}</p>
          </div>
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Edit Item
            </h3>
            <p className="text-gray-500 mb-6">
              This page will allow editing of existing items. The full
              implementation will be added in the next phase.
            </p>
            <Link href="/items">
              <Button>Back to Items</Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
