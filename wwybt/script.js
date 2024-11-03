const imageUpload = document.getElementById('image-upload');
const nameInput = document.getElementById('name-input');
const goButton = document.getElementById('go-button');
const imageDisplayContainer = document.getElementById('image-display-container');
const topMessage = document.getElementById('top-message');
const imageDisplay = document.getElementById('image-display');
const bottomMessage = document.getElementById('bottom-message');
const audioPlayer = document.getElementById('audio-player');

let isImageUploaded = false;
let isNameEntered = false;

// Check if both image and name are provided
function checkInputs() {
    if (isImageUploaded && isNameEntered) {
        goButton.style.display = 'block';
    } else {
        goButton.style.display = 'none';
    }
}

// Step 1: Handle image upload
imageUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];

    if (file) {
        isImageUploaded = true;
        checkInputs();
    }
});

// Step 2: Handle name input
nameInput.addEventListener('input', function() {
    const name = nameInput.value.trim();

    if (name !== "") {
        isNameEntered = true;
    } else {
        isNameEntered = false;
    }
    checkInputs();
});

// Step 3: When "Go" is clicked, show image, play audio, and display message
goButton.addEventListener('click', function() {
    const name = nameInput.value.trim();
    const file = imageUpload.files[0];

    if (file && name !== "") {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            imageDisplay.innerHTML = '';  // Clear any previous image
            imageDisplay.appendChild(img);

            // Show image display container
            imageDisplayContainer.style.display = 'block';

            // Set the top message with the name
            topMessage.innerHTML = `Who will ${name} be tonight?`;

            // Play the audio
            audioPlayer.play();

            // Hide the inputs and button
            imageUpload.style.display = 'none';
            nameInput.style.display = 'none';
            goButton.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
});
