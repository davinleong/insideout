// src/app/user/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout"; // Import the Layout component

export default function UserLandingPage() {
  const router = useRouter();
  
  // State variables to manage app flow
  const [moodColor, setMoodColor] = useState(""); // Color data for smart light

  const handleCaptureAndAnalyzeMood = async () => {
    alert("Capturing facial expression...");

    const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...";
    
    const response = await fetch("https://your-backend1-url.com/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64Image, text: "Detect my mood" }),
    });

    const { mood, color } = await response.json();
    setMoodColor(color);
    alert(`Mood detected: ${mood} with color: ${color}`);
  };

  const handleControlSmartLight = async () => {
    await fetch("https://your-backend2-url.com/update-color", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ color: moodColor }),
    });

    alert("Smart light color updated!");
  };

  return (
    <Layout>
      <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100 gap-4">
        <h1 className="text-3xl font-bold mb-4">Mood-Based Light Control</h1>
        <p className="mb-4 text-center">Let the app scan your mood and adjust the room's light color to match!</p>

        <div className="flex flex-col gap-4 w-full max-w-md items-center">
          <Button variant="default" onClick={handleCaptureAndAnalyzeMood}>
            Capture & Analyze Mood
          </Button>
          
          {moodColor && (
            <Button variant="secondary" onClick={handleControlSmartLight}>
              Set Light Color
            </Button>
          )}
        </div>
      </main>
    </Layout>
  );
}
