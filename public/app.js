// public/app.js
// Define API base URL from environment or default to localhost
const API_URL = "http://localhost:3000"; 

// Load messages from the server and set up a global variable for messages
let messages = {};

// Function to load messages
async function loadMessages() {
  try {
    const response = await fetch("/lang/messages.json");
    messages = await response.json();
    console.log("Messages loaded successfully", messages);
  } catch (error) {
    console.error("Failed to load messages:", error);
  }
}

// Function to set light color based on emotion
async function setEmotionLight() {
  const emotion = document.getElementById("emotionSelect").value;
  try {
    const response = await fetch(`${API_URL}/api/set-emotion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emotion }),
    });

    const result = await response.json();
    if (response.ok) {
      document.getElementById("setEmotionMessage").textContent =
        messages.setEmotion.success + emotion;
    } else {
      document.getElementById("setEmotionMessage").textContent =
        result.message || messages.errors.lightControlFailed;
    }
  } catch (error) {
    console.error(error);
    document.getElementById("setEmotionMessage").textContent =
      messages.errors.lightControlFailed;
  }
}

// Function to customize color for a specific emotion
async function customizeEmotionColor() {
  const emotion = document.getElementById("customEmotionSelect").value;
  const r = parseInt(document.getElementById("red").value, 10);
  const g = parseInt(document.getElementById("green").value, 10);
  const b = parseInt(document.getElementById("blue").value, 10);

  // Validate RGB values
  if (isNaN(r) || isNaN(g) || isNaN(b) || r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
    document.getElementById("customizeMessage").textContent = messages.customizeEmotion.invalidRgb;
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/emotions/${emotion}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ r, g, b }),
    });

    const result = await response.json();
    if (response.ok) {
      document.getElementById("customizeMessage").textContent =
        messages.customizeEmotion.success + emotion;
    } else {
      document.getElementById("customizeMessage").textContent =
        result.message || messages.errors.invalidColorValue;
    }
  } catch (error) {
    console.error(error);
    document.getElementById("customizeMessage").textContent =
      messages.errors.lightControlFailed;
  }
}

// Convert hex color to RGB and update hidden RGB inputs
function updateRGBInputs(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  document.getElementById("red").value = r;
  document.getElementById("green").value = g;
  document.getElementById("blue").value = b;
}

// Ensure messages are loaded before attaching functions to the window
loadMessages().then(() => {
  // Export functions globally for usage in HTML after messages are loaded
  window.setEmotionLight = setEmotionLight;
  window.customizeEmotionColor = customizeEmotionColor;
  window.updateRGBInputs = updateRGBInputs;
});