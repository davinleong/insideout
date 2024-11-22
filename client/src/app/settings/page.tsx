"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function EmotionSettingsPage() {
  const [userId] = useState<string>("60"); // Replace with actual user ID logic

  // State to hold emotions and form inputs
  const [emotions, setEmotions] = useState<string[]>([]);
  const [createEmotionValue, setCreateEmotionValue] = useState<string>("");
  const [createRgbValue, setCreateRgbValue] = useState<string>("#000000");
  const [updateEmotionValue, setUpdateEmotionValue] = useState<string>("");
  const [updateRgbValue, setUpdateRgbValue] = useState<string>("#000000");
  const [getEmotionValue, setGetEmotionValue] = useState<string>("");
  const [deleteEmotionValue, setDeleteEmotionValue] = useState<string>("");

  // Response message and loading state
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<string | null>(null);

  // Helper function to convert hex to RGB decimal
  const hexToDecimalRGB = (hex: string) => parseInt(hex.replace("#", ""), 16);

  // Fetch emotions from the API
  useEffect(() => {
    const fetchEmotions = async () => {
      setLoading("fetch");
      try {
        const data = await apiRequest(
          `https://potipress.com/api/v1/emotions/?user_id=${userId}`,
          { method: "GET" }
        );
        setEmotions(data.map((item: any) => item.emotion));
        console.log("Fetched emotions:", data);
      } catch (error) {
        setMessage("❌ Error fetching emotions.");
      } finally {
        setLoading(null);
      }
    };

    fetchEmotions();
  }, [userId]);

  // Reusable API request function
  const apiRequest = async (url: string, options: RequestInit) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("API Error Response:", errorResponse);
        throw new Error(errorResponse.message || "API request failed.");
      }
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  const createEmotion = async () => {
    if (!createEmotionValue) {
      setMessage("❌ Please enter an emotion name.");
      return;
    }
    if (!createRgbValue || createRgbValue === "#000000") {
      setMessage("❌ Please select an RGB value.");
      return;
    }

    setLoading("create");
    try {
      const newEmotion = await apiRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/emotions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            emotion: createEmotionValue,
            rgb: hexToDecimalRGB(createRgbValue),
          }),
        }
      );
      setEmotions((prev) => [...prev, newEmotion.emotion]); // Update the emotions list
      setMessage(`✅ Emotion "${createEmotionValue}" created successfully.`);
      setCreateEmotionValue(""); // Reset input field
      setCreateRgbValue("#000000"); // Reset color picker
    } catch (error) {
      setMessage("❌ Error creating emotion.");
    } finally {
      setLoading(null);
    }
  };

  const getEmotionRGB = async () => {
    if (!getEmotionValue) {
      setMessage("❌ Please select an emotion to retrieve its RGB value.");
      return;
    }

    setLoading("get");
    try {
      const data = await apiRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/emotions/${getEmotionValue}?user_id=${userId}`,
        { method: "GET" }
      );
      setMessage(`✅ Retrieved RGB value for "${getEmotionValue}": ${data.rgb}`);
    } catch (error) {
      setMessage("❌ Error retrieving RGB value.");
    } finally {
      setLoading(null);
    }
  };

  const updateEmotionRGB = async () => {
    if (!updateEmotionValue) {
      setMessage("❌ Please select an emotion to update.");
      return;
    }
    if (!updateRgbValue || updateRgbValue === "#000000") {
      setMessage("❌ Please select a new RGB value.");
      return;
    }

    setLoading("update");
    try {
      await apiRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/emotions/${updateEmotionValue}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            rgb: hexToDecimalRGB(updateRgbValue),
          }),
        }
      );
      setMessage(`✅ RGB value for "${updateEmotionValue}" updated successfully.`);
    } catch (error) {
      setMessage("❌ Error updating RGB value.");
    } finally {
      setLoading(null);
    }
  };

  const deleteEmotion = async () => {
    if (!deleteEmotionValue) {
      setMessage("❌ Please select an emotion to delete.");
      return;
    }

    setLoading("delete");
    try {
      await apiRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/emotions/${deleteEmotionValue}?user_id=${userId}`,
        { method: "DELETE" }
      );
      setEmotions((prev) => prev.filter((e) => e !== deleteEmotionValue)); // Remove deleted emotion
      setMessage(`✅ Emotion "${deleteEmotionValue}" deleted successfully.`);
    } catch (error) {
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
            message.startsWith("✅") ? "bg-green-500" : "bg-red-500"
          } text-white`}
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
            onClick={createEmotion}
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
            {emotions.map((emotion, index) => (
              <option key={index} value={emotion}>
                {emotion}
              </option>
            ))}
          </select>
          <Button
            variant="default"
            onClick={getEmotionRGB}
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
            {emotions.map((emotion, index) => (
              <option key={index} value={emotion}>
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
            onClick={updateEmotionRGB}
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
            {emotions.map((emotion, index) => (
              <option key={index} value={emotion}>
                {emotion}
              </option>
            ))}
          </select>
          <Button
            variant="default"
            onClick={deleteEmotion}
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
