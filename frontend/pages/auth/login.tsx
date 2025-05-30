import React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

export default function LoginPage() {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Authentication will be implemented in the next phase
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-brand rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
            🥜
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Planet Peanut CMS
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to your admin account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-soft sm:rounded-xl sm:px-10 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email address"
              type="email"
              placeholder="admin@planetpeanut.com"
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              required
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            <Button type="submit" fullWidth isLoading={isLoading}>
              Sign in
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Development Mode
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/">
                <Button variant="outline" fullWidth>
                  Continue to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
