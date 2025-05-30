import React from "react";
import { Layout } from "@/components/layout/Layout";

export default function Analytics() {
  return (
    <Layout title="Analytics">
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Track your items performance and user engagement.
          </p>
        </div>

        {/* Demo Content */}
        <div className="bg-info-50 border border-info-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <svg
              className="w-8 h-8 text-info-600 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h2 className="text-lg font-semibold text-info-800">
              Analytics Page
            </h2>
          </div>
          <p className="text-info-700">
            This is the Analytics page. You successfully navigated here from the
            sidebar!
          </p>
        </div>

        {/* Stats Grid Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Total Views
            </h3>
            <p className="text-2xl font-bold text-gray-900">1,234</p>
            <p className="text-sm text-success-600">+12% this month</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Active Users
            </h3>
            <p className="text-2xl font-bold text-gray-900">567</p>
            <p className="text-sm text-success-600">+8% this month</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Popular Items
            </h3>
            <p className="text-2xl font-bold text-gray-900">89</p>
            <p className="text-sm text-warning-600">-3% this month</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Revenue</h3>
            <p className="text-2xl font-bold text-gray-900">$12,345</p>
            <p className="text-sm text-success-600">+15% this month</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
