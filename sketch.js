let input
let words = [] // To store entered words
let fallingLetters = [] // To store letters that are moving
let trails = [] // To store previous instances of letters
let dropDelays = [] // To store drop delays for each word
const MAX_FALLING_LETTERS = 2000 // Limit total letters in motion (reduced for better performance)
const TRAIL_FADE_RATE = 5 // Trail fade rate
const GRAIN_NOISE_SIZE = 100 // Size of noise texture
let noiseTexture // For grainy effect
const lineSpace = 40

function setup() {
    // Create the canvas
    createCanvas(windowWidth, windowHeight)
    background(0) // Black background

    // Create the input HTML element
    input = createInput()
    input.position(20, 20) // Position of the input on the page

    // Detect when the user presses "Enter"
    input.changed(addWord)

    // Generate noise texture for subtle grainy effect
    noiseTexture = createGraphics(GRAIN_NOISE_SIZE, GRAIN_NOISE_SIZE)
    noiseTexture.loadPixels()
    for (let i = 0; i < noiseTexture.pixels.length; i++) {
        noiseTexture.pixels[i] = random(50) // Fill with random grayscale values (more subtle)
    }
    noiseTexture.updatePixels()
}

function draw() {
    background(0, 25)
    drawGrain()

    fill(255)
    textSize(40) 

    for (let i = 0; i < words.length; i++) {
        text(words[i], 20, 100 + i * lineSpace) // Draw the word
    }

    // Draw all the moving letters
    for (let i = fallingLetters.length - 1; i >= 0; i--) {
        let letterData = fallingLetters[i]

        // Draw the current letter
        fill(255) // White
        text(letterData.letter, letterData.x, letterData.y) // Draw the letter

        // Save the current position for the trail
        trails.push({ letter: letterData.letter, x: letterData.x, y: letterData.y, alpha: 255 }) // Store initial alpha at 255

        // Update the X position to move right
        letterData.x += letterData.speed
        letterData.speed += letterData.acceleration // Increase speed due to acceleration

        // Restart the letter if it goes off-screen
        if (letterData.x > width) {
            fallingLetters.splice(i, 1) // Remove letter if it goes off-screen
        }
    }

    // Limit the number of moving letters
    if (fallingLetters.length > MAX_FALLING_LETTERS) {
        fallingLetters.splice(0, fallingLetters.length - MAX_FALLING_LETTERS) // Keep only the most recent letters
    }

    // Handle letter movement based on assigned delay
    for (let i = 0; i < dropDelays.length; i++) {
        if (millis() - dropDelays[i].lastDropTime > dropDelays[i].delay) {
            dropLetters(i) // Move letters of the corresponding word
            dropDelays[i].lastDropTime = millis() // Update the last drop time
        }
    }
}

// Function to add the word to the array when "Enter" is pressed
function addWord() {
    let newWord = input.value().trim() // Clean the input

    if (newWord !== '') {
        words.push(newWord) // Add the new word to the array
        // Add a random delay for this word (between 0 and 2000 milliseconds)
        dropDelays.push({ lastDropTime: millis(), delay: random(0, 2000) }) // Adjust the range as needed
        input.value('') // Clear the input
    }
}

// Function to drop letters of the words
function dropLetters(wordIndex) {
    let word = words[wordIndex]
    let startY = 100 + wordIndex * lineSpace // Initial Y position of the word

    // Add each letter of the word to the moving letters array
    for (let j = 0; j < word.length; j++) {
        let letter = word[j]
        let x = 50 + j * 20 + random(-10, 10) // Initial X position of the letter (spacing and variation)
        let speed = map(j, 0, word.length, 2, 5) // Adjust speed to move to the end of the screen
        let acceleration = random(0.05, 0.1) // Random acceleration for each letter

        // Add the letter and its properties to the array
        fallingLetters.push({ letter: letter, x: x, y: startY, speed: speed, acceleration: acceleration })
    }
}

// Function to draw the grain effect
function drawGrain() {
    // Draw the noise texture multiple times to create a grain effect
    for (let i = 0; i < height / GRAIN_NOISE_SIZE + 1; i++) {
        for (let j = 0; j < width / GRAIN_NOISE_SIZE + 1; j++) {
            image(noiseTexture, j * GRAIN_NOISE_SIZE, i * GRAIN_NOISE_SIZE)
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
    noiseTexture.resizeCanvas(GRAIN_NOISE_SIZE, GRAIN_NOISE_SIZE) // Resize the noise texture with the canvas
}
