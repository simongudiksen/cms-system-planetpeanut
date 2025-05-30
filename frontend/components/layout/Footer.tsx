import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-500">
              © 2025 Planet Peanut CMS. All rights reserved.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Version 1.0.0</span>
            <div
              className="w-2 h-2 bg-success-500 rounded-full"
              title="All systems operational"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};
