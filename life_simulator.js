document.addEventListener("DOMContentLoaded", () => {
  const lifeDisplay = document.getElementById("lifeDisplay");
  const loadingSpinner = document.getElementById("loadingSpinner");

  const userPromptInput = document.getElementById("userPrompt");
  const customLifeButton = document.getElementById("customLifeButton");

  // --- Gemini API Call Helper ---
  async function callGeminiAPI(prompt) {
    const apiKey = "AIzaSyDy6GljVqk1XQKZQOz-ONlzIYNYxpUhYUU"; // Your API key
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
        console.error("Gemini API error response:", errorData);
        const errorMessage = errorData.error && errorData.error.message ? errorData.error.message : `${response.status} ${response.statusText}`;
        throw new Error(`API error: ${errorMessage}`);
      }

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const generatedText = result.candidates[0].content.parts[0].text;
        return generatedText;
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
    customLifeButton.textContent = "Generating... (this may take long)";
    loadingSpinner.classList.remove("hidden");
    lifeDisplay.textContent = ""; // Clear previous content

    // Updated prompt: removed "whimsical or fantastical" and added default for normal humans
    const prompt = `Describe a unique, fictional life form based on this idea: "${userIdea}". Keep it to a detailed description. Count up from zero up until 100 years old, unless there is a specified age they want the character to die (if the character is immortal, end the story with "and there are still adventures to see." If not specified, describe a normal human life in a human world with no other beings except things in the normal world. Otherwise, follow the specific instructions.`;

    const generatedLife = await callGeminiAPI(prompt);

    // Display the generated life or an error message
    if (generatedLife && !generatedLife.startsWith("Failed to get response:") && !generatedLife.includes("Could not generate content.")) {
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
  if (customLifeButton) {
    customLifeButton.addEventListener("click", createCustomLife);
  }
});
