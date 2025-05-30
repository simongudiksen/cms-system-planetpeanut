import React from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { api, utils } from "@/utils/api";
import type { ItemStats } from "@/types";

export default function Dashboard() {
  const [stats, setStats] = React.useState<ItemStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await api.getItemStats();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (err) {
        setError("Failed to load dashboard statistics");
        console.error("Dashboard stats error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    {
      name: "Create New Item",
      description: "Add a new avatar item to the catalog",
      href: "/items/new",
      icon: "🆕",
      color: "bg-primary-500",
    },
    {
      name: "Browse Items",
      description: "View and manage existing items",
      href: "/items",
      icon: "📦",
      color: "bg-secondary-500",
    },
    {
      name: "Upload Images",
      description: "Bulk upload item images",
      href: "/items/upload",
      icon: "🖼️",
      color: "bg-accent-500",
    },
    {
      name: "Analytics",
      description: "View detailed analytics and reports",
      href: "/analytics",
      icon: "📊",
      color: "bg-info-500",
    },
  ];

  return (
    <Layout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 text-white">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold mb-2">
              Welcome to Planet Peanut CMS
            </h1>
            <p className="text-primary-100 text-lg">
              Manage your avatar items, upload images, and track analytics for
              the Planet Peanut learning app.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="bg-white rounded-xl p-6 shadow-soft border border-gray-100 hover:shadow-medium transition-shadow duration-200 group"
              >
                <div className="flex items-center mb-4">
                  <div
                    className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white text-xl`}
                  >
                    {action.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {action.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {action.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-6 shadow-soft border border-gray-100"
                >
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-error-50 border border-error-200 rounded-xl p-6">
              <p className="text-error-600">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                Retry
              </Button>
            </div>
          ) : stats ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Total Items
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.summary.totalItems}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="text-primary-600 text-xl">📦</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Published
                      </p>
                      <p className="text-2xl font-bold text-success-600">
                        {stats.summary.publishedItems}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                      <span className="text-success-600 text-xl">✅</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Draft Items
                      </p>
                      <p className="text-2xl font-bold text-warning-600">
                        {stats.summary.draftItems}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                      <span className="text-warning-600 text-xl">📝</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Avg. Price
                      </p>
                      <p className="text-2xl font-bold text-secondary-600">
                        {Math.round(stats.summary.averagePrice)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                      <span className="text-secondary-600 text-xl">💰</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Distribution Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Clothing Type Distribution */}
                <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Clothing Types
                  </h3>
                  <div className="space-y-3">
                    {stats.clothingTypeDistribution
                      .slice(0, 5)
                      .map((item, index) => (
                        <div
                          key={item._id}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-gray-600">
                            {utils.capitalize(item._id)}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${
                                    (item.count / stats.summary.totalItems) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-8 text-right">
                              {item.count}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    System Status
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                        <span className="text-sm text-success-700">
                          API Service
                        </span>
                      </div>
                      <span className="text-sm font-medium text-success-600">
                        Online
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                        <span className="text-sm text-success-700">
                          Database
                        </span>
                      </div>
                      <span className="text-sm font-medium text-success-600">
                        Connected
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                        <span className="text-sm text-success-700">
                          Image Storage
                        </span>
                      </div>
                      <span className="text-sm font-medium text-success-600">
                        Ready
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </Layout>
  );
}
