let input
let words = []
let fallingLetters = []
let trails = []
let dropDelays = []
const MAX_FALLING_LETTERS = 2000
const TRAIL_FADE_RATE = 5
const GRAIN_NOISE_SIZE = 100
let noiseTexture
const lineSpace = 90
const sizeText = 100
let showNinguno = false
let y = 0
let velocity = 0.5
let acceleration = 0.4
let targetY
let isBouncing = false
let bounceVelocity = -2
let bounceThreshold = 0.5
let fading = false
let fadeAmount = 255 // Add fade amount initialization
let startTime

function setup() {
    createCanvas(windowWidth, windowHeight)
    background(0)

    textFont('roc-grotesk-condensed')
    input = createInput()
    input.position(20, 20)

    input.changed(addWord)

    // Generate noise texture for subtle grainy effect
    noiseTexture = createGraphics(GRAIN_NOISE_SIZE, GRAIN_NOISE_SIZE)
    noiseTexture.loadPixels()
    for (let i = 0; i < noiseTexture.pixels.length; i++) {
        noiseTexture.pixels[i] = random(50)
    }
    noiseTexture.updatePixels()

    // Set target Y position for "Ninguno"
    targetY = height / 2
    startTime = millis() // Initialize startTime here
}

function draw() {
    if (showNinguno) {
        textSize(240)
        background(255)
        fill(0)

        if (!fading && millis() - startTime > 5000) {
            fading = true // trigger fading after 5 seconds
        }

        // Draw "Ninguno" with easing and bounce effect
        textAlign(CENTER, CENTER)
        text('Ninguna', width / 2, y)

        if (!isBouncing) {
            let easing = 0.05
            let dy = targetY - y
            y += dy * easing

            if (abs(dy) < 1) {
                isBouncing = true
            }
        } else {
            y += bounceVelocity
            bounceVelocity += 0.1 // Gravity-like effect

            if (y > targetY) {
                y = targetY
                bounceVelocity = -bounceVelocity * 0.5 // Inertia effect

                if (abs(bounceVelocity) < bounceThreshold) {
                    bounceVelocity = 0
                    isBouncing = false
                }
            }
        }

        if (fading) {
            fadeAmount -= 5 // Progressive fade
            if (fadeAmount < 0) fadeAmount = 0
        }

        // Apply duotone halftone effect
        applyDuotoneHalftone(fadeAmount)

        // Display the text with fading effect
        fill(255, fadeAmount)
        text('Ninguna', width / 2, y)
    } else {
        background(0, 25)

        for (let i = 0; i < words.length; i++) {
            text(words[i], 20, 100 + i * lineSpace)
        }
        drawGrain()
        fill(255)
        textSize(sizeText)

        for (let i = fallingLetters.length - 1; i >= 0; i--) {
            let letterData = fallingLetters[i]
            fill(255)
            text(letterData.letter, letterData.x, letterData.y)
            trails.push({ letter: letterData.letter, x: letterData.x, y: letterData.y, alpha: 255 })

            letterData.x += letterData.speed
            letterData.speed += letterData.acceleration

            if (letterData.x > width) {
                fallingLetters.splice(i, 1)
            }
        }

        if (fallingLetters.length > MAX_FALLING_LETTERS) {
            fallingLetters.splice(0, fallingLetters.length - MAX_FALLING_LETTERS)
        }

        for (let i = 0; i < dropDelays.length; i++) {
            if (millis() - dropDelays[i].lastDropTime > dropDelays[i].delay) {
                dropLetters(i)
                dropDelays[i].lastDropTime = millis()
            }
        }
    }
}

function addWord() {
    let newWord = input.value().trim()

    if (newWord !== '') {
        words.push(newWord)
        dropDelays.push({ lastDropTime: millis(), delay: random(0, 2000) })
        input.value('')
    }
}

function dropLetters(wordIndex) {
    let word = words[wordIndex]
    let startY = 100 + wordIndex * lineSpace

    for (let j = 0; j < word.length; j++) {
        let letter = word[j]
        let x = 50 + j * 20 + random(-10, 10)
        let speed = map(j, 0, word.length, 2, 5)
        let acceleration = random(0.05, 0.1)

        fallingLetters.push({ letter: letter, x: x, y: startY, speed: speed, acceleration: acceleration })
    }
}

function applyDuotoneHalftone(alpha) {
    let dotSize = 30
    let spacing = 15
    for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
            let distance = dist(x, y, width / 2, height / 2)
            let maxSize = map(distance, 0, width / 2, dotSize, 2)
            fill(0, alpha) // Apply alpha to fill
            noStroke()
            ellipse(x, y, maxSize * (alpha / 255), maxSize * (alpha / 255)) // fade in sync with alpha
        }
    }
}

function drawGrain() {
    for (let i = 0; i < height / GRAIN_NOISE_SIZE + 1; i++) {
        for (let j = 0; j < width / GRAIN_NOISE_SIZE + 1; j++) {
            image(noiseTexture, j * GRAIN_NOISE_SIZE, i * GRAIN_NOISE_SIZE)
        }
    }
}

function resetCanvas() {
    words = []
    fallingLetters = []
    trails = []
    dropDelays = []
    input.remove()
    showNinguno = true
    fadeAmount = 255 // Reset fadeAmount when resetting
}

function keyPressed() {
    if (keyCode === 48) {
        resetCanvas()
    } else if (keyCode === 49) {
        showNinguno = false
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
    noiseTexture.resizeCanvas(GRAIN_NOISE_SIZE, GRAIN_NOISE_SIZE)
}
