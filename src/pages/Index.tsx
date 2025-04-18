
import { useEffect, useState } from "react";
import "../App.css";

const Index = () => {
  // Redirect to our HTML game since we're using vanilla JS
  useEffect(() => {
    // Redirect to the root HTML file
    window.location.href = "/";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Unicorn Multiplication Fun</h1>
        <p className="text-xl text-gray-600">Loading the game...</p>
      </div>
    </div>
  );
};

export default Index;
