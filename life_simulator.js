document.addEventListener("DOMContentLoaded", () => {
  // Removed: createLifeButton as it's being removed from HTML
  const lifeDisplay = document.getElementById("lifeDisplay");
  const loadingSpinner = document.getElementById("loadingSpinner");

  // Elements for custom prompt
  const userPromptInput = document.getElementById("userPrompt");
  const customLifeButton = document.getElementById("customLifeButton");

  // --- Gemini API Call Helper ---
  async function callGeminiAPI(prompt) {
    // IMPORTANT: If running outside of the Canvas environment (e.g., from GitHub),
    // you MUST replace the empty string below with your actual Gemini API Key.
    // Get your API key from Google AI Studio: https://aistudio.google.com/app/apikey
    const apiKey = "AIzaSyDy6GljVqk1XQKZQOz-ONlzIYNYxpUhYUU"; // <-- PASTE YOUR ACTUAL GEMINI API KEY HERE IF NOT IN CANVAS!
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
        // Provide more specific error message from API if available
        const errorMessage = errorData.error && errorData.error.message ? errorData.error.message : `${response.status} ${response.statusText}`;
        throw new Error(`API error: ${errorMessage}`);
      }

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        return result.candidates[0].content.parts[0].text;
      } else {
        console.warn("Gemini API response structure unexpected:", result);
        return "Could not generate content. (Unexpected API response)";
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return `Failed to get response: ${error.message}`;
    }
  }

  // --- Function to create life using a custom user prompt ---
  async function createCustomLife() {
    const userIdea = userPromptInput.value.trim();
    if (!userIdea) {
      lifeDisplay.textContent = "Please enter your life idea!";
      lifeDisplay.style.color = "orange";
      return;
    }

    // Disable button and show spinner
    customLifeButton.disabled = true;
    customLifeButton.textContent = "Generating...";
    loadingSpinner.classList.remove("hidden");
    lifeDisplay.textContent = ""; // Clear previous content

    const prompt = `Describe a unique, fictional life form based on this idea: "${userIdea}". Keep it to a few sentences (max 50 words). Include its name, appearance, and one interesting ability or characteristic. Make it sound whimsical or fantastical.`;

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
    customLifeButton.disabled = false;
    customLifeButton.innerHTML = '✨ Generate from My Idea'; // Reset button text with sparkle
    loadingSpinner.classList.add("hidden");
  }

  // --- Event Listener ---
  // Removed: createLifeButton event listener
  if (customLifeButton) {
    customLifeButton.addEventListener("click", createCustomLife);
  }
});
