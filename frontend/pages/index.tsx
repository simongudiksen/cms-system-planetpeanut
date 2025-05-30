import React from "react";
import type { NextPage } from "next";
import Head from "next/head";

const Home: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Planet Peanut CMS</title>
        <meta
          name="description"
          content="Content Management System for Planet Peanut"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Welcome to Planet Peanut CMS
        </h1>

        <p className="text-lg text-gray-700 mb-4">
          Your content management system is ready to be configured.
        </p>
      </main>
    </div>
  );
};

export default Home;
