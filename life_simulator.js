document.addEventListener("DOMContentLoaded", () => {
  const createLifeButton = document.getElementById("createLifeButton");
  const lifeDisplay = document.getElementById("lifeDisplay");
  const loadingSpinner = document.getElementById("loadingSpinner");

  // --- Gemini API Call Helper ---
  async function callGeminiAPI(prompt) {
    const apiKey = ""; // Canvas will automatically provide the API key at runtime
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });

    const payload = { contents: chatHistory };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API error:", errorData);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        return result.candidates[0].content.parts[0].text;
      } else {
        console.warn("Gemini API response structure unexpected:", result);
        return "Could not generate content.";
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return `Failed to get response: ${error.message}`;
    }
  }

  // --- Function to create life using Gemini API ---
  async function createLife() {
    // Disable button and show spinner
    createLifeButton.disabled = true;
    createLifeButton.textContent = "Generating...";
    loadingSpinner.classList.remove("hidden");
    lifeDisplay.textContent = ""; // Clear previous content

    const prompt = "Describe a unique, fictional life form in a few sentences (max 50 words). Include its name, appearance, and one interesting ability or characteristic. Make it sound whimsical or fantastical.";

    const generatedLife = await callGeminiAPI(prompt);

    // Display the generated life or an error message
    if (generatedLife && !generatedLife.startsWith("Failed to get response:")) {
      lifeDisplay.textContent = generatedLife;
      lifeDisplay.style.color = "#e0e0e0"; // Reset text color to default light
    } else {
      lifeDisplay.textContent = `Error creating life: ${generatedLife}`;
      lifeDisplay.style.color = "red"; // Indicate error
    }

    // Re-enable button and hide spinner
    createLifeButton.disabled = false;
    createLifeButton.innerHTML = '✨ Create Life'; // Reset button text with sparkle
    loadingSpinner.classList.add("hidden");
  }

  // --- Event Listener ---
  if (createLifeButton) {
    createLifeButton.addEventListener("click", createLife);
  }
});
