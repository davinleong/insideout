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
  const [moodColor, setMoodColor] = useState(""); // Color data for smart light
  const [loading, setLoading] = useState(false); // Tracks loading status
  const [userEmail, setUserEmail] = useState<string>("Guest"); // State to store user information (userId = email)
  const [userId, setUserId] = useState<number>(0); // State to store user information

  const router = useRouter();

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
          `${process.env.NEXT_PUBLIC_API_URL}/api_count?user_id=${data.info.id}`,
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
  
        // Log the raw response object
        console.log("Raw user stats response:", userStatsResponse);
  
        // Parse the JSON data from the response
        const userStatsData = await userStatsResponse.json();
  
        // Log the parsed JSON data
        console.log("Parsed user stats data:", userStatsData);
  
        // Check if api_count is a valid number
        if (typeof userStatsData.api_count !== 'number') {
          throw new Error(`Invalid api_count value: ${userStatsData.api_count}`);
        }
  
        setApiCount(userStatsData.api_count);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
  
      // Handle verification response here
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Run handleUser on page load
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
      // eslint-disable-next-line @typescript-eslint/camelcase
      user_id: userId,
      image: imageFile,
    };

    try {
      console.log("Sending payload:", payload);
      console.log(process.env.API_URL);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/process`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      console.log("Received response:", response);

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
  // const handleControlSmartLight = async () => {
  //   await fetch(`${process.env.API_URL}/update-color`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ color: moodColor }),
  //   });

  //   alert(strings.smartLightUpdatedAlert);
  // };

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

        {moodColor && (
          <Button
            variant="secondary"
            // onClick={handleControlSmartLight}
            className="w-full"
          >
            {strings.updateLightColorButton}
          </Button>
        )}
      </div>

      {loading && (
        <div className="mt-4 p-4 text-center">
          <span className="loader">Loading...</span>
        </div>
      )}

      {responseMessage && !loading && (
        <div className="mt-4 p-4 bg-white shadow rounded max-w-md w-full">
          <h3 className="font-semibold">{strings.responseTitle}</h3>
          <p>{responseMessage}</p>
        </div>
      )}
    </main>
  );
}
