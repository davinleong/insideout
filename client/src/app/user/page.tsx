/* eslint-disable @typescript-eslint/camelcase */
// src/app/user/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import strings from "@/lib/strings";

export default function UserLandingPage() {
  // State variables to manage app flow
  const [imageFile, setImageFile] = useState<string>(""); // Initialize as an empty string
  const [apiCount, setApiCount] = useState(0); // Tracks remaining API calls
  const [maxReached, setMaxReached] = useState(false); // Tracks if max API calls reached
  const [responseMessage, setResponseMessage] = useState("");
  const [moodColor, setMoodColor] = useState<number>(0); // Color data for smart light
  const [loading, setLoading] = useState(false); // Tracks loading status
  const [userEmail, setUserEmail] = useState<string>("Guest"); // State to store user information (userId = email)
  const [userId, setUserId] = useState<number>(0); // State to store user information

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
      console.log("Verification response:", data);

      try {
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
          throw new Error(`HTTP error! status: ${userStatsResponse.status}`);
        }

        const userStatsData = await userStatsResponse.json();
        console.log("Parsed user stats data:", userStatsData);

        const validStatusCount = userStatsData.filter(
          (item: { status_code: number }) => item.status_code === 200
        ).length;
        console.log(
          `Number of items with status_code 200: ${validStatusCount}`
        );

        setApiCount(validStatusCount);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    handleUser();
  }, []);

  // Capture and analyze mood
  const handleCaptureAndAnalyzeMood = async () => {
    if (maxReached) {
      alert(strings.maxApiCallsReached);
      return;
    }

    setLoading(true); // Start loading

    const payload = {
      user_id: String(userId),
      image: imageFile,
    };

    try {
      console.log("Sending payload:", payload);

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

      const responseText = await response.text();
      console.log("Received response text:", responseText);

      if (!responseText) {
        throw new Error("Empty response body");
      }

      const {
        response: moodResponse,
        color,
        api_count,
        max_reached,
      } = JSON.parse(responseText);

      setApiCount(api_count);
      setMaxReached(max_reached);
      setResponseMessage(moodResponse);
      setMoodColor(color);

      if (color) {
        await handleControlSmartLight(color); // Update light color
      }

      if (max_reached) {
        alert(strings.maxApiCallsAlert);
      }
    } catch (error) {
      console.error("Error analyzing mood:", error);
    } finally {
      setLoading(false); // End loading
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
        value: {
          r: rgb.r,
          g: rgb.g,
          b: rgb.b,
        },
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

      const data = await response.json();
      if (!response.ok) {
        throw new Error(`Error: ${data.message}`);
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

      <p className="text-center">
        <strong>Current User:</strong> {userEmail}
      </p>

      <p className="text-center">
        <strong>{strings.apiCallsRemaining}:</strong> {20 - apiCount}
      </p>
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
          disabled={loading}
          className="w-full"
        >
          {loading ? "Analyzing..." : strings.analyzeMoodButton}
        </Button>
      </div>

      {/* {loading && (
        <div className="mt-4 p-4 text-center">
          <span className="loader">Loading...</span>
        </div>
      )} */}

      {responseMessage && !loading && (
        <div className="mt-4 p-4 bg-white shadow rounded max-w-md w-full">
          <h3 className="font-semibold">{strings.responseTitle}</h3>
          <p>{responseMessage}</p>
        </div>
      )}
    </main>
  );
}
