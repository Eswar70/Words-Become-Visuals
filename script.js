const form = document.querySelector('.generate-form');
const input = document.querySelector('.prompt-input');
const imagesContainer = document.querySelector('.generate-images');
const loadingOverlay = document.querySelector('.loading-overlay');

// ImagePig API Config
const IMAGEPIG_API_URL = 'https://api.imagepig.com/xl'; // Ensure correct endpoint
const IMAGEPIG_API_KEY = '75b32414-1dc0-4bec-b18f-ee93ec6d2cde'; // Your API Key
const MAX_IMAGES = 2; // Fixed to 2 images per request

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const prompt = input.value.trim();

    if (!prompt) return alert("Please enter a prompt!");

    // Show loading animation
    loadingOverlay.style.display = "flex";
    imagesContainer.innerHTML = ""; // Clear previous results

    try {
        for (let i = 0; i < MAX_IMAGES; i++) {
            const response = await fetch(IMAGEPIG_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "api-key": IMAGEPIG_API_KEY,
                },
                body: JSON.stringify({
                    prompt: prompt,
                    output_format: "webp",
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log("API Response:", data);

            if (!data || !data.image_data || !data.mime_type) {
                throw new Error("Invalid response: No image data found.");
            }

            // Convert Base64 string to an image URL
            const imgUrl = `data:${data.mime_type};base64,${data.image_data}`;
            const fileName = `${prompt.replace(/\s+/g, '_')}_image_${i + 1}.${data.mime_type.split('/')[1]}`;

            // Create image container
            const imgCard = document.createElement('div');
            imgCard.classList.add('img-card');

            imgCard.innerHTML = `
                <img src="${imgUrl}" alt="AI generated image" class="image">
                <a href="${imgUrl}" download="${fileName}" class="img-dwd">
                    <img src="/images/download.png" alt="Download">
                </a>
            `;
            imagesContainer.appendChild(imgCard);
        }
    } catch (error) {
        console.error("Error fetching AI images:", error);
        imagesContainer.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    } finally {
        // Hide loading animation
        loadingOverlay.style.display = "none";
    }
});
