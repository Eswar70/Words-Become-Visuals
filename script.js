document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.generate-form');
    const promptInput = document.querySelector('.prompt-input');
    const imgQtySelect = document.querySelector('.img-quty');
    const loadingOverlay = document.querySelector('.loading-overlay');
    const generateImagesSection = document.querySelector('.generate-images');
    const imgQtyDisplay = document.querySelector('.img-qty-display');

    // Hugging Face API Setup
    const API_URL = 'https://api-inference.huggingface.co/models/cagliostrolab/animagine-xl-4.0';
    const API_KEY = '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'; // Replace with your API key

    // Function to show the loading overlay
    function showLoading() {
        loadingOverlay.style.display = 'flex';
    }

    // Function to hide the loading overlay
    function hideLoading() {
        loadingOverlay.style.display = 'none';
    }

    // Function to generate unique variations of images
    async function generateImages(prompt, imgQty) {
        showLoading();
        imgQtyDisplay.textContent = `Generating ${imgQty} image(s)...`;
        generateImagesSection.innerHTML = ''; // Clear previous images

        try {
            const imagePromises = [];

            // Loop to request multiple unique variations
            for (let i = 0; i < imgQty; i++) {
                const seed = Math.floor(Math.random() * 1000000); // Generate a random seed for variation
                imagePromises.push(fetchImage(prompt, seed));
            }

            // Wait for all image requests to complete
            const imageUrls = await Promise.all(imagePromises);

            // Display the generated images
            imageUrls.forEach(url => {
                if (url) displayImage(url);
            });

            imgQtyDisplay.textContent = `Generated ${imageUrls.length} unique image(s)`;
        } catch (error) {
            console.error("Error during image generation:", error);
            imgQtyDisplay.textContent = "Error generating images.";
            alert("Something went wrong while generating the images. Please try again later.");
        } finally {
            hideLoading();
        }
    }

    // Function to fetch a single unique image using a seed
    async function fetchImage(prompt, seed) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: prompt,
                    options: { wait_for_model: true },
                    parameters: { seed: seed } // Use a unique seed for variation
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed with status: ${response.status}`);
            }

            const contentType = response.headers.get("content-type");

            // Check if response is JSON
            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                console.log("API response:", data);

                if (data && data.length > 0 && data[0].url) {
                    return data[0].url;
                }
            } else {
                // Handle non-JSON (image blob)
                const imageBlob = await response.blob();
                return URL.createObjectURL(imageBlob);
            }
        } catch (error) {
            console.error("Error fetching image:", error);
            return null;
        }
    }

    // Function to display images
    function displayImage(imageUrl) {
        const imgCard = document.createElement('div');
        imgCard.classList.add('img-card');

        const imageElement = document.createElement('img');
        imageElement.classList.add('image');
        imageElement.src = imageUrl;

        const downloadButton = document.createElement('img');
        downloadButton.classList.add('img-dwd');
        downloadButton.src = 'images/download.png';
        downloadButton.alt = 'Download';
        downloadButton.addEventListener('click', () => downloadImage(imageUrl));

        imgCard.appendChild(imageElement);
        imgCard.appendChild(downloadButton);
        generateImagesSection.appendChild(imgCard);
    }

    // Function to handle image download
    function downloadImage(url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = 'generated-image.png';
        link.click();
    }

    // Form submit handler
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const prompt = promptInput.value.trim();
        const imgQty = parseInt(imgQtySelect.value);

        if (prompt) {
            generateImages(prompt, imgQty);
        } else {
            alert('Please enter a prompt!');
        }
    });
});
