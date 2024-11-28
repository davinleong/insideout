/* eslint-disable @typescript-eslint/camelcase */
// src/app/user/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/Spinner";
import strings from "@/lib/strings";

export default function UserLandingPage() {
  // State variables to manage app flow
  const [imageFile, setImageFile] = useState<string>(""); // Initialize as an empty string
  const [apiCount, setApiCount] = useState(0); // Tracks remaining API calls
  const [maxReached, setMaxReached] = useState(false); // Tracks if max API calls reached
  const [responseMessage, setResponseMessage] = useState("");
  const [moodColor, setMoodColor] = useState<number>(0); // Color data for smart light
  const [loading, setLoading] = useState(false); // Tracks loading status
  const [apiLoading, setApiLoading] = useState(true); // Tracks loading status for API calls
  const [userEmail, setUserEmail] = useState<string>(""); // State to store user information
  const [userId, setUserId] = useState<number>(0); // State to store user ID
  const [emotionMappings, setEmotionMappings] = useState<
    { emotion: string; color: number }[]
  >([]); // User-specific emotion mappings

  const router = useRouter();

  // Helper function to convert decimal color to RGB
  const decimalToRGB = (decimal: number) => ({
    r: (decimal >> 16) & 0xff,
    g: (decimal >> 8) & 0xff,
    b: decimal & 0xff,
  });

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

  // Fetch user details and stats
  const handleUser = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_USER_DATABASE}/verify-token`,
        {
          method: "GET",
          credentials: "include", // Include cookies in the request
        }
      );
      if (response.status !== 200) {
        router.push("/login");
        return;
      }

      const data = await response.json();
      setUserEmail(data.info.email);
      setUserId(data.info.id);

      const userStatsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_USER_DATABASE}/api-calls?user_id=${data.info.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!userStatsResponse.ok) {
        throw new Error("Failed to fetch user stats.");
      }

      const userStatsData = await userStatsResponse.json();
      const validStatusCount = userStatsData.filter(
        (item: { status_code: number; endpoint: string }) =>
          item.status_code === 200 &&
          item.endpoint === "https://potipress.com/api/v1/process"
      ).length;

      setApiCount(validStatusCount);
      setApiLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Fetch emotion-to-color mappings
  const fetchEmotionMappings = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/emotions`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch emotion mappings.");
      }

      const data = await response.json();
      setEmotionMappings(data);
    } catch (error) {
      console.error("Error fetching emotion mappings:", error);
    }
  };

  // Update specific emotion mapping
  const updateEmotionMapping = async (emotion: string, color: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/emotions/${emotion}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ color }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update emotion mapping.");
      }

      alert(`Updated color for emotion: ${emotion}`);
      fetchEmotionMappings(); // Refresh mappings after update
    } catch (error) {
      console.error("Error updating emotion mapping:", error);
    }
  };

  useEffect(() => {
    setApiLoading(true);
    handleUser();
    fetchEmotionMappings();
  }, []);

  useEffect(() => {
    if (maxReached) {
      alert(strings.maxApiCallsAlert);
    }
  }, [maxReached]);

  // Capture and analyze mood
  const handleCaptureAndAnalyzeMood = async () => {
    if (apiCount >= 20) {
      setMaxReached(true);
      return;
    }

    setLoading(true);

    const payload = {
      user_id: String(userId),
      image: imageFile,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/process`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { response: moodResponse, color } = await response.json();
      setApiCount(apiCount + 1);
      setResponseMessage(moodResponse);
      setMoodColor(color);

      if (color) {
        await handleControlSmartLight(color);
      }
    } catch (error) {
      console.error("Error analyzing mood:", error);
    } finally {
      setLoading(false);
    }
  };

  // Control smart light based on mood color
  const handleControlSmartLight = async (color: number) => {
    const rgb = decimalToRGB(color);
    const payload = {
      device: process.env.NEXT_PUBLIC_GOVEE_DEVICE_ID,
      model: process.env.NEXT_PUBLIC_GOVEE_DEVICE_MODEL,
      cmd: {
        name: "color",
        value: { r: rgb.r, g: rgb.g, b: rgb.b },
      },
    };

    try {
      const response = await fetch(
        "https://developer-api.govee.com/v1/devices/control",
        {
          method: "PUT",
          headers: {
            "Govee-API-Key": process.env.NEXT_PUBLIC_GOVEE_API_KEY || "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to control the light.");
      }
      alert(strings.smartLightUpdatedAlert);
    } catch (error) {
      console.error("Failed to control light:", error);
    }
  };


  return (
    <main className="flex flex-col items-center justify-top min-h-screen p-4 md:p-8 bg-gray-100 gap-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center">
        {strings.moodControlTitle}
      </h1>
      <p className="mb-4 text-center text-base md:text-lg">
        {strings.moodControlDescription}
      </p>

      <div className="text-center">
        <strong>Current User:</strong>{" "}
        {userEmail === "" ? (
          <span className="inline-block">
            <Skeleton className="w-[100px] h-[15px] rounded-full bg-gray-200" />
          </span>
        ) : (
          userEmail
        )}
      </div>
      <div className="text-center">
        <strong>{strings.apiCallsRemaining}:</strong>{" "}
        {apiLoading ? (
          <span className="inline-block">
            <Skeleton className="w-[50px] h-[15px] rounded-full bg-gray-200" />
          </span>
        ) : (
          20 - apiCount
        )}
      </div>

      {maxReached && (
        <p className="text-red-500 text-center">{strings.maxApiCallsReached}</p>
      )}

      <div className="flex flex-col gap-4 w-full max-w-md items-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full p-2 border border-gray-300 rounded"
        />

        <Button
          variant="default"
          onClick={handleCaptureAndAnalyzeMood}
          disabled={loading || maxReached}
          className="w-full"
        >
          {loading ? <Spinner /> : strings.analyzeMoodButton}
        </Button>
      </div>

      {responseMessage && !loading && (
        <div className="mt-4 p-4 bg-white shadow rounded max-w-md w-full">
          <h3 className="font-semibold">{strings.responseTitle}</h3>
          <p>{responseMessage}</p>
        </div>
      )}
    </main>
  );
}
