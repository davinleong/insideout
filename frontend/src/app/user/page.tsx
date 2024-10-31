// src/app/user/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout"; // Import the Layout component

export default function UserLandingPage() {
  const router = useRouter();
  
  // State variables to manage app flow
  const [textInput, setTextInput] = useState("");
  const [imageFile, setImageFile] = useState<string>(""); // Initialize as an empty string
  const [apiCount, setApiCount] = useState(0); // Tracks remaining API calls
  const [maxReached, setMaxReached] = useState(false); // Tracks if max API calls reached
  const [responseMessage, setResponseMessage] = useState("");
  const [moodColor, setMoodColor] = useState(""); // Color data for smart light

  const userId = "user123"; // Replace with actual user ID as needed

  // Handle image upload and convert to base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.readAsDataURL(file);
  
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setImageFile(result.split(",")[1] || ""); // Extract base64 string if available
      }
    };
  };
  

  // Capture and analyze mood or text input
  const handleCaptureAndAnalyzeMood = async () => {
    // Check if user reached max API calls
    if (maxReached) {
      alert("You have reached the maximum number of API calls!");
      return;
    }

    const payload = {
      user_id: userId,
      text: textInput || "Detect my mood", // Use input text or default prompt
      ...(textInput.toLowerCase().includes("read my emotion") && imageFile ? { image: imageFile } : {}),
    };

    const response = await fetch("https://potipress.com/flaskapp/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const { response: moodResponse, color, api_count, max_reached } = await response.json();
    setApiCount(api_count);
    setMaxReached(max_reached);
    setResponseMessage(moodResponse);
    setMoodColor(color);



    if (max_reached) {
      alert("You have reached the maximum number of API calls.");
    }
  };

  // Control smart light based on mood color
  const handleControlSmartLight = async () => {
    await fetch("https://potipress.com/flaskapp/update-color", {
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
        <p className="mb-4 text-center">
          Let the app scan your mood or analyze text, and adjust the room's light color to match!
        </p>

        <p><strong>API Calls Remaining:</strong> {20 - apiCount}</p>
        {maxReached && <p className="text-red-500">You have reached the maximum API call limit.</p>}

        <div className="flex flex-col gap-4 w-full max-w-md items-center">
          <input
            type="text"
            placeholder="Enter text here (e.g., Tell me a joke)"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />

          {textInput.toLowerCase().includes("read my emotion") && (
            <div className="mb-3 w-full">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          )}

          <Button variant="default" onClick={handleCaptureAndAnalyzeMood}>
            Capture & Analyze Mood
          </Button>

          {moodColor && (
            <Button variant="secondary" onClick={handleControlSmartLight}>
              Set Light Color
            </Button>
          )}
        </div>

        {responseMessage && (
          <div className="mt-4 p-4 bg-white shadow rounded max-w-md w-full">
            <h3 className="font-semibold">Response from Server</h3>
            <p>{responseMessage}</p>
          </div>
        )}
      </main>
    </Layout>
  );
}
