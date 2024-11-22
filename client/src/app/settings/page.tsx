"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function EmotionSettingsPage() {
  const [userId, setUserId] = useState<string>("60"); // Replace with actual user ID logic

  // Separate states for each operation
  const [emotions, setEmotions] = useState<string[]>([]); // State to hold emotions
  const [createEmotionValue, setCreateEmotionValue] = useState<string>("");
  const [createRgbValue, setCreateRgbValue] = useState<string>("#000000"); // Color picker defaults to black

  const [updateEmotionValue, setUpdateEmotionValue] = useState<string>("");
  const [updateRgbValue, setUpdateRgbValue] = useState<string>("#000000");

  const [getEmotionValue, setGetEmotionValue] = useState<string>("");
  const [deleteEmotionValue, setDeleteEmotionValue] = useState<string>("");

  const [message, setMessage] = useState<string>(""); // Response message
  const [loading, setLoading] = useState<string | null>(null); // Tracks loading status per action

  // Helper function to convert hex to RGB decimal
  const hexToDecimalRGB = (hex: string) => {
    const parsed = parseInt(hex.replace("#", ""), 16);
    return parsed;
  };

  // Fetch emotions from the API
  useEffect(() => {
    const fetchEmotions = async () => {
      try {
        const response = await fetch(
          `https://potipress.com/api/v1/emotions/?user_id=${userId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch emotions.");
        }
        const data = await response.json();

        // Extract the 'emotion' field from each object
        setEmotions(data.map((item: any) => item.emotion));
      } catch (error) {
        console.error("Error fetching emotions:", error);
        setMessage("❌ Error fetching emotions.");
      }
    };

    fetchEmotions();
  }, [userId]);

  // Helper functions for API operations
  const createEmotion = async (emotion: string, rgb: string) => {
    setLoading("create");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/emotions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId, emotion, rgb: hexToDecimalRGB(rgb) }),
      });
  
      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("API Error Response:", errorResponse);
        throw new Error("Failed to create emotion.");
      }
  
      const newEmotion = await response.json(); // Get the created emotion from the API response
      setEmotions((prev) => [...prev, newEmotion.emotion]); // Update the emotions list
      setMessage(`✅ Emotion "${emotion}" created successfully.`);
    } catch (error) {
      console.error("Error creating emotion:", error);
      setMessage("❌ Error creating emotion.");
    } finally {
      setLoading(null);
    }
  };
  
  

  const getEmotionRGB = async (emotion: string) => {
    setLoading("get");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/emotions/${emotion}?user_id=${userId}`
      );

      if (!response.ok) {
        throw new Error("Failed to retrieve emotion RGB value.");
      }

      const data = await response.json();
      setMessage(`✅ Retrieved RGB value for "${emotion}": ${data.rgb}`);
    } catch (error) {
      console.error("Error retrieving RGB value:", error);
      setMessage("❌ Error retrieving RGB value.");
    } finally {
      setLoading(null);
    }
  };

  const updateEmotionRGB = async (emotion: string, newRgb: string) => {
    setLoading("update");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/emotions/${emotion}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId, rgb: hexToDecimalRGB(newRgb) }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update RGB value.");
      }

      setMessage(`✅ RGB value for "${emotion}" updated successfully.`);
    } catch (error) {
      console.error("Error updating RGB value:", error);
      setMessage("❌ Error updating RGB value.");
    } finally {
      setLoading(null);
    }
  };

  const deleteEmotion = async (emotion: string) => {
    setLoading("delete");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/emotions/${emotion}?user_id=${userId}`,
        {
          method: "DELETE",
        }
      );
  
      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("API Error Response:", errorResponse);
        throw new Error("Failed to delete emotion.");
      }
  
      setEmotions((prev) => prev.filter((e) => e !== emotion)); // Remove the deleted emotion
      setMessage(`✅ Emotion "${emotion}" deleted successfully.`);
    } catch (error) {
      console.error("Error deleting emotion:", error);
      setMessage("❌ Error deleting emotion.");
    } finally {
      setLoading(null);
    }
  };

  
  

  return (
    <main className="flex flex-col items-center justify-top min-h-screen p-4 md:p-8 bg-gray-100 gap-6">
      {/* Sticky Notification */}
      {message && (
        <div
          className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 p-4 rounded shadow ${
            message.startsWith("✅")
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
          style={{ zIndex: 1000 }}
        >
          <p>{message}</p>
        </div>
      )}

      <h1 className="text-2xl md:text-3xl font-bold text-center">Manage Emotions</h1>

      {/* Create Emotion Section */}
      <section className="w-full max-w-md p-4 bg-white shadow rounded">
        <h2 className="text-lg font-semibold mb-2">Create New Emotion</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter emotion"
            value={createEmotionValue}
            onChange={(e) => setCreateEmotionValue(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <div className="flex items-center gap-2">
            <label htmlFor="create-color-picker" className="text-gray-700 font-medium">
              Pick Color:
            </label>
            <input
              id="create-color-picker"
              type="color"
              value={createRgbValue}
              onChange={(e) => setCreateRgbValue(e.target.value)}
              className="w-12 h-12 border-none rounded"
            />
          </div>
          <Button
            variant="default"
            onClick={() => createEmotion(createEmotionValue, createRgbValue)}
            disabled={loading === "create"}
            className="w-full"
          >
            {loading === "create" ? "Creating..." : "Create Emotion"}
          </Button>
        </div>
      </section>

      {/* Get Emotion RGB Section */}
      <section className="w-full max-w-md p-4 bg-white shadow rounded">
        <h2 className="text-lg font-semibold mb-2">Get Emotion RGB</h2>
        <div className="flex flex-col gap-4">
          <select
            value={getEmotionValue}
            onChange={(e) => setGetEmotionValue(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="" disabled>
              Select an emotion
            </option>
            {emotions.map((emotion) => (
              <option key={emotion} value={emotion}>
                {emotion}
              </option>
            ))}
          </select>
          <Button
            variant="default"
            onClick={() => getEmotionRGB(getEmotionValue)}
            disabled={loading === "get"}
            className="w-full"
          >
            {loading === "get" ? "Retrieving..." : "Get RGB Value"}
          </Button>
        </div>
      </section>

      {/* Update Emotion RGB Section */}
      <section className="w-full max-w-md p-4 bg-white shadow rounded">
        <h2 className="text-lg font-semibold mb-2">Update Emotion RGB</h2>
        <div className="flex flex-col gap-4">
          <select
            value={updateEmotionValue}
            onChange={(e) => setUpdateEmotionValue(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="" disabled>
              Select an emotion
            </option>
            {emotions.map((emotion) => (
              <option key={emotion} value={emotion}>
                {emotion}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <label htmlFor="update-color-picker" className="text-gray-700 font-medium">
              Pick Color:
            </label>
            <input
              id="update-color-picker"
              type="color"
              value={updateRgbValue}
              onChange={(e) => setUpdateRgbValue(e.target.value)}
              className="w-12 h-12 border-none rounded"
            />
          </div>
          <Button
            variant="default"
            onClick={() => updateEmotionRGB(updateEmotionValue, updateRgbValue)}
            disabled={loading === "update"}
            className="w-full"
          >
            {loading === "update" ? "Updating..." : "Update RGB Value"}
          </Button>
        </div>
      </section>

      {/* Delete Emotion Section */}
      <section className="w-full max-w-md p-4 bg-white shadow rounded">
        <h2 className="text-lg font-semibold mb-2">Delete Emotion</h2>
        <div className="flex flex-col gap-4">
          <select
            value={deleteEmotionValue}
            onChange={(e) => setDeleteEmotionValue(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="" disabled>
              Select an emotion
            </option>
            {emotions.map((emotion) => (
              <option key={emotion} value={emotion}>
                {emotion}
              </option>
            ))}
          </select>
          <Button
            variant="default"
            onClick={() => deleteEmotion(deleteEmotionValue)}
            disabled={loading === "delete"}
            className="w-full"
          >
            {loading === "delete" ? "Deleting..." : "Delete Emotion"}
          </Button>
        </div>
      </section>
    </main>
  );
}
