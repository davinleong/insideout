/* eslint-disable @typescript-eslint/camelcase */
// src/app/settings/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function EmotionSettingsPage() {
  const [userId, setUserId] = useState<string>("60"); // Replace with actual user ID logic
  const [emotion, setEmotion] = useState<string>(""); // Current emotion
  const [rgb, setRgb] = useState<string>(""); // RGB value in decimal format
  const [message, setMessage] = useState<string>(""); // Response message

  // Helper function for API call to create an emotion
  const createEmotion = async (emotion: string, rgb: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/emotions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId, emotion, rgb }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessage(`Emotion created successfully: ${data.message}`);
    } catch (error) {
      console.error("Error creating emotion:", error);
      setMessage("Error creating emotion.");
    }
  };

  // Helper function to get RGB for a specific emotion
  const getEmotionRGB = async (emotion: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/emotions/${emotion}?user_id=${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRgb(data.rgb); // Set the RGB value
      setMessage(`Retrieved RGB value for emotion "${emotion}": ${data.rgb}`);
    } catch (error) {
      console.error("Error retrieving emotion RGB value:", error);
      setMessage("Error retrieving emotion RGB value.");
    }
  };

  // Helper function to update RGB for a specific emotion
  const updateEmotionRGB = async (emotion: string, newRgb: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/emotions/${emotion}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId, rgb: newRgb }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessage(`Emotion RGB updated successfully: ${data.message}`);
    } catch (error) {
      console.error("Error updating emotion RGB value:", error);
      setMessage("Error updating emotion RGB value.");
    }
  };

  // Helper function to delete a specific emotion
  const deleteEmotion = async (emotion: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/emotions/${emotion}?user_id=${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setMessage(`Emotion "${emotion}" deleted successfully.`);
    } catch (error) {
      console.error("Error deleting emotion:", error);
      setMessage("Error deleting emotion.");
    }
  };

  return (
    <main className="flex flex-col items-center justify-top min-h-screen p-4 md:p-8 bg-gray-100 gap-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center">
        Manage Emotions
      </h1>
      <div className="flex flex-col gap-4 w-full max-w-md items-center">
        <input
          type="text"
          placeholder="Enter emotion"
          value={emotion}
          onChange={(e) => setEmotion(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          placeholder="Enter RGB value (decimal)"
          value={rgb}
          onChange={(e) => setRgb(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <Button
          variant="default"
          onClick={() => createEmotion(emotion, rgb)}
          className="w-full"
        >
          Create Emotion
        </Button>
        <Button
          variant="default"
          onClick={() => getEmotionRGB(emotion)}
          className="w-full"
        >
          Get Emotion RGB
        </Button>
        <Button
          variant="default"
          onClick={() => updateEmotionRGB(emotion, rgb)}
          className="w-full"
        >
          Update Emotion RGB
        </Button>
        <Button
          variant="default"
          onClick={() => deleteEmotion(emotion)}
          className="w-full"
        >
          Delete Emotion
        </Button>
      </div>
      {message && (
        <div className="mt-4 p-4 bg-white shadow rounded max-w-md w-full">
          <p>{message}</p>
        </div>
      )}
    </main>
  );
}
