import React from "react";
import Hero from "./components/Hero";
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <Hero />
    </div>
  );
}
