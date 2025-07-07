document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded event fired. Script is running.");

  const lifeDisplay = document.getElementById("lifeDisplay");
  const loadingSpinner = document.getElementById("loadingSpinner");

  const userPromptInput = document.getElementById("userPrompt");
  const customLifeButton = document.getElementById("customLifeButton");

  // Check if elements are found
  if (!lifeDisplay) console.error("lifeDisplay element not found!");
  if (!loadingSpinner) console.error("loadingSpinner element not found!");
  if (!userPromptInput) console.error("userPromptInput element not found!");
  if (!customLifeButton) console.error("customLifeButton element not found!");


  // --- Gemini API Call Helper ---
  async function callGeminiAPI(prompt) {
    const apiKey = "AIzaSyDy6GljVqk1XQKZQOz-ONlzIYNYxpUhYUU"; // Your API key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });

    const payload = { contents: chatHistory };
    console.log("Sending prompt to Gemini:", prompt);

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
      console.log("Gemini API raw result:", result);

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const generatedText = result.candidates[0].content.parts[0].text;
        console.log("Gemini API generated text:", generatedText);
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
    console.log("createCustomLife function entered.");
    const userIdea = userPromptInput.value.trim();
    console.log("User idea:", userIdea);

    if (!userIdea) {
      lifeDisplay.textContent = "Please enter your life idea!";
      lifeDisplay.style.color = "orange";
      console.log("User idea was empty, returning.");
      return;
    }

    // Disable button and show spinner
    customLifeButton.disabled = true;
    customLifeButton.textContent = "Generating...";
    loadingSpinner.classList.remove("hidden");
    lifeDisplay.textContent = ""; // Clear previous content
    console.log("Button disabled, spinner shown, display cleared.");

    const prompt = `Describe a unique, fictional life form based on this idea: "${userIdea}". Keep it to a few sentences (max 50 words). Include its name, appearance, and one interesting ability or characteristic. Make it sound whimsical or fantastical.`;
    console.log("Prompt for Gemini:", prompt);

    const generatedLife = await callGeminiAPI(prompt);
    console.log("Generated life response from API:", generatedLife);

    // Display the generated life or an error message
    if (generatedLife && !generatedLife.startsWith("Failed to get response:") && !generatedLife.includes("Could not generate content.")) {
      lifeDisplay.textContent = generatedLife;
      lifeDisplay.style.color = "#e0e0e0"; // Reset text color to default light
      console.log("Life generated and displayed successfully.");
    } else {
      lifeDisplay.textContent = `Error creating life: ${generatedLife}`;
      lifeDisplay.style.color = "red"; // Indicate error
      console.error("Failed to generate or display life:", generatedLife);
    }

    // Re-enable button and hide spinner
    customLifeButton.disabled = false;
    customLifeButton.innerHTML = '✨ Generate from My Idea'; // Reset button text with sparkle
    loadingSpinner.classList.add("hidden");
    console.log("Button re-enabled, spinner hidden.");
  }

  // --- Event Listener ---
  if (customLifeButton) {
    customLifeButton.addEventListener("click", createCustomLife);
    console.log("Event listener attached to customLifeButton.");
  } else {
    console.error("customLifeButton element not found to attach event listener!");
  }
});
