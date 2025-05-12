// Global variables
let capturedImage = null;
let stream = null;

// Language translation data
const translations = {
    "English": {
        "how_it_works_title": "How it works",
        "instructions": `
            <ol>
                <li>Upload an image of your palm or take a photo using your camera</li>
                <li>Make sure your palm lines are clearly visible</li>
                <li>Click on 'Read My Palm' to get your personalized reading</li>
            </ol>
        `,
        "upload_title": "Upload Your Palm Image",
        "upload_instruction": "Choose an image of your palm",
        "camera_instruction": "Take a photo of your palm",
        "reading_language_title": "Select Reading Language",
        "read_palm_btn": "✨ Read My Palm ✨",
        "reading_header": "Your Palm Reading",
        "spinner_text": "The mystic forces are analyzing your palm...",
        "try_again_text": "Wasn't satisfied with your reading? Try again with a clearer image!"
    },
    "Hindi": {
        "how_it_works_title": "यह कैसे काम करता है",
        "instructions": `
            <ol>
                <li>अपनी हथेली की तस्वीर अपलोड करें या अपने कैमरे का उपयोग करके फोटो लें</li>
                <li>सुनिश्चित करें कि आपकी हथेली की रेखाएं स्पष्ट रूप से दिखाई दे रही हैं</li>
                <li>अपना व्यक्तिगत पठन प्राप्त करने के लिए 'मेरी हथेली पढ़ें' पर क्लिक करें</li>
            </ol>
        `,
        "upload_title": "अपनी हथेली की छवि अपलोड करें",
        "upload_instruction": "अपनी हथेली की एक छवि चुनें",
        "camera_instruction": "अपनी हथेली की फोटो लें",
        "reading_language_title": "पठन भाषा चुनें",
        "read_palm_btn": "✨ मेरी हथेली पढ़ें ✨",
        "reading_header": "आपका हस्तरेखा पठन",
        "spinner_text": "रहस्यमय शक्तियाँ आपकी हथेली का विश्लेषण कर रही हैं...",
        "try_again_text": "अपने पठन से संतुष्ट नहीं हैं? एक स्पष्ट छवि के साथ फिर से प्रयास करें!"
    }
};

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize language
    changeUILanguage();
    
    // Initialize camera button state (disabled by default)
    document.getElementById('read-palm-btn').disabled = true;
});

// Function to switch between tabs
function switchTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Deactivate all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Show the selected tab content
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Activate the selected tab button
    event.currentTarget.classList.add('active');
    
    // If camera tab is active, initialize camera
    if (tabName === 'camera') {
        initCamera();
    } else if (stream) {
        // Stop camera stream if switching away from camera tab
        stopCamera();
    }
}

// Function to initialize camera
function initCamera() {
    const videoElement = document.getElementById('camera-preview');
    
    // Check if browser supports getUserMedia
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Stop any existing stream
        if (stream) {
            stopCamera();
        }
        
        // Get access to the camera
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(function(mediaStream) {
                stream = mediaStream;
                videoElement.srcObject = mediaStream;
                videoElement.play();
            })
            .catch(function(error) {
                console.error("Error accessing the camera: ", error);
                alert("Unable to access the camera. Please make sure you've granted permission or try using the image upload option instead.");
            });
    } else {
        alert("Sorry, your browser doesn't support camera access. Please use the image upload option instead.");
    }
}

// Function to stop camera stream
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => {
            track.stop();
        });
        stream = null;
    }
}

// Function to capture photo from camera
function capturePhoto() {
    const video = document.getElementById('camera-preview');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    
    // Set canvas dimensions to match video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob and create a preview
    canvas.toBlob(function(blob) {
        capturedImage = blob;
        displayImagePreview(blob);
        
        // Enable the "Read My Palm" button
        document.getElementById('read-palm-btn').disabled = false;
    }, 'image/jpeg', 0.8);
}

// Function to display uploaded image
function displayImage(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        capturedImage = file;
        displayImagePreview(file);
        
        // Enable the "Read My Palm" button
        document.getElementById('read-palm-btn').disabled = false;
    }
}

// Function to display image preview
function displayImagePreview(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const previewContainer = document.getElementById('image-preview-container');
        const imagePreview = document.getElementById('image-preview');
        
        imagePreview.src = e.target.result;
        previewContainer.style.display = 'block';
    };
    
    reader.readAsDataURL(file);
}

// Function to change UI language
function changeUILanguage() {
    const language = document.getElementById('ui-language').value;
    const translationData = translations[language];
    
    // Update all UI elements with the selected language
    document.getElementById('how-it-works-title').textContent = translationData.how_it_works_title;
    document.getElementById('instructions').innerHTML = translationData.instructions;
    document.getElementById('upload-title').textContent = translationData.upload_title;
    document.getElementById('upload-instruction').textContent = translationData.upload_instruction;
    document.getElementById('camera-instruction').textContent = translationData.camera_instruction;
    document.getElementById('reading-language-title').textContent = translationData.reading_language_title;
    document.getElementById('read-palm-btn').textContent = translationData.read_palm_btn;
    document.getElementById('reading-header').textContent = translationData.reading_header;
    document.getElementById('spinner-text').textContent = translationData.spinner_text;
    document.getElementById('try-again-text').textContent = translationData.try_again_text;
}

// Function to get palm reading
function getPalmReading() {
    if (!capturedImage) {
        alert("Please upload or capture a palm image first");
        return;
    }
    
    // Show loading spinner
    document.getElementById('loading-spinner').style.display = 'flex';
    document.getElementById('reading-result').textContent = '';
    document.getElementById('reading-result-container').style.display = 'block';
    
    // Create form data
    const formData = new FormData();
    formData.append('file', capturedImage);
    formData.append('language', document.getElementById('reading-language').value);
    
    // Make API request
    axios.post('/api/palm-reading/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    .then(function(response) {
        // Hide spinner
        document.getElementById('loading-spinner').style.display = 'none';
        
        // Display reading result
        if (response.data && response.data.reading) {
            // Set text content to display raw text
            document.getElementById('reading-result').outerHTML = response.data.reading;
        } else {
            document.getElementById('reading-result').textContent = "Sorry, we couldn't generate a reading. Please try again with a clearer image.";
        }
    })
    .catch(function(error) {
        // Hide spinner
        document.getElementById('loading-spinner').style.display = 'none';
        
        // Display error message
        document.getElementById('reading-result').textContent = 
            "An error occurred: " + (error.response && error.response.data.detail 
                ? error.response.data.detail 
                : "Failed to process the image. Please try again.");
        
        console.error("Error:", error);
    });
}
