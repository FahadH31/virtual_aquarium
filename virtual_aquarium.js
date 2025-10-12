const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

// Arrays
let allFish = [];
let allFoodParticles = [];

// Mouse location variables
let mouse_x = -1000;
let mouse_y = -1000;

// Generate a number of fish
generateFish(15);

function gameLoop() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Loop through and draw all fish
    for (let i = 0; i < allFish.length; i++) {
        let fish = allFish[i];
        calculateRandomMovement(fish);
        moveFish(fish);
        drawTriangleFish(fish.x, fish.y, fish.facing_left,
            fish.primary_color, fish.secondary_color, fish.eye_color);
    }

    for (let i = 0; i < allFoodParticles.length; i++) {
        moveFood(allFoodParticles[i])
        drawFood(allFoodParticles[i])
    }

    requestAnimationFrame(gameLoop); // loop every frame
}

// To match canvas internal size with css size
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}

// Track mouse location
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse_x = event.clientX - rect.left
    mouse_y = event.clientY - rect.top
})

// Handle food creation on mouse click
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse_x = event.clientX - rect.left
    mouse_y = event.clientY - rect.top
    allFoodParticles.push(new Food(mouse_x, mouse_y)) // store food particle to array with coordinates it should be created at
})

// Function to get distance between mouse/fish/food
function getDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

// Function to find the nearest food to a fish
function getNearestFood(fish) {
    let nearestFood, nearestFoodDistance, currentFood, currentFoodDistance;
    for (let i = 0; i < allFoodParticles.length; i++) {
        currentFood = allFoodParticles[i];
        currentFoodDistance = getDistance(fish.x, fish.y, currentFood.x, currentFood.y)
        if (i == 0) {
            nearestFood = currentFood
            nearestFoodDistance = currentFoodDistance;
        } else if (currentFoodDistance < nearestFoodDistance) { // update if a closer food is found
            nearestFood = currentFood
            nearestFoodDistance = currentFoodDistance
        }
    }
    return { nearestFood, nearestFoodDistance };
}

// For initial fish spawn
function getRandomDirection() {
    let num = Math.random()
    let result;
    if (num < 0.5) {
        result = 1
    } else {
        result = -1
    }
    return result
}

// Functions to draw and move food
function drawFood(food_particle) {
    const food_drawing = new Path2D();
    food_drawing.arc(food_particle.x, food_particle.y, 5, 0, Math.PI * 2, true);
    context.fillStyle = "orange";
    context.fill(food_drawing);
}

function moveFood(food_particle) {
    food_particle.y += 0.5  // gravity effect
    if (food_particle.y < 0) { // delete food that goes off screen
        let i = allFoodParticles.indexOf(food_particle)
        allFoodParticles.splice(i, 1)
    }
}

// Function to draw triangle fish on the canvas
function drawTriangleFish(x, y, facing_left, primary_color, secondary_color, eye_color) {
    const body = new Path2D();
    const tail = new Path2D();
    const stripe = new Path2D();
    const eye = new Path2D()
    const pupil = new Path2D()

    context.save();

    // If fish set to facing left, flip it
    if (facing_left) {
        context.translate(x, 0)
        context.scale(-1, 1);
        context.translate(-x, 0)
    }

    // Triangle Tail
    tail.moveTo(x + 30, y + 40)
    tail.lineTo(x - 20, y + 40)
    tail.lineTo(x - 20, y + 70)
    tail.closePath();
    context.fillStyle = secondary_color;
    context.fill(tail)

    // Triangle Body
    body.moveTo(x, y);
    body.lineTo(x + 75, y + 50);
    body.lineTo(x, y + 100);
    body.closePath();
    context.fillStyle = primary_color;
    context.fill(body)

    // Stripe
    stripe.moveTo(x + 35, y + 25)
    context.lineWidth = "4"
    stripe.quadraticCurveTo(x + 20, y + 50, x + 35, y + 75);
    context.strokeStyle = secondary_color;
    context.stroke(stripe);

    // Eye/Pupil
    eye.moveTo(x + 55, y + 50);
    eye.arc(x + 50, y + 50, 5, 0, Math.PI * 2, true);
    pupil.arc(x + 50, y + 50, 3, 0, Math.PI * 2, true);
    context.fillStyle = "yellow"
    context.fill(eye)
    context.fillStyle = "black"
    context.fill(pupil)

    context.restore();
}

// Function to calculate fish movements
function calculateRandomMovement(fish) {
    fish.frameCounter++;

    if (fish.frameCounter >= fish.next_direction_change) { // randomly update direction
        const random = Math.random()
        if (random <= 0.25) {
            fish.x_directon = 1
            fish.y_direction = 1
        } else if (random > 0.25 && random <= 0.5) {
            fish.x_directon = 1
            fish.y_direction = -1
        } else if (random > 0.5 && random <= 0.75) {
            fish.x_directon = -1
            fish.y_direction = 1
        } else {
            fish.x_directon = -1
            fish.y_direction = -1
        }
        fish.frameCounter = 0 // reset counter
    }
}

// Function to apply fish movements
function moveFish(fish) {
    let current_speed = fish.speed;

    // Handle wall collisions (change direction if the fish gets too close to borders)
    if (fish.x < 100) {
        fish.x_directon = 1
    } else if (fish.y < 100) {
        fish.y_direction = 1
    } else if (fish.x > (canvas.width - 100)) {
        fish.x_directon = -1
    } else if (fish.y > (canvas.height - 100)) {
        fish.y_direction = -1;
    }

    // Handle food navigation
    let { nearestFood, nearestFoodDistance } = getNearestFood(fish);
    if (nearestFoodDistance < 20) { // remove food once fish is close enough (eaten)
        let i = allFoodParticles.indexOf(nearestFood)
        allFoodParticles.splice(i, 1)
    } else if (nearestFoodDistance < 300) {
        if (nearestFood.x < fish.x) {
            fish.x_directon = -1
        } else {
            fish.x_directon = 1
        }
        // y-direction
        if (nearestFood.y < fish.y) {
            fish.y_direction = -1
        } else {
            fish.y_direction = 1
        }
    }

    // Only handle mouse interactions outside wall deadzone (to avoid bugs with fish movement)
    if (fish.x > 150 && fish.x < (canvas.width - 150) && fish.y > 150 && fish.y < canvas.height - 150) {
        let mouse_distance = getDistance(mouse_x, mouse_y, fish.x, fish.y);

        // Handle mouse interactions
        if (mouse_distance < 200) {
            shouldChasefood = false; // prevent food chasing when mouse is nearby to avoid conflict
            current_speed = fish.speed * 2 // give a speed boost
            // x-direction
            if (mouse_x < fish.x) {
                fish.x_directon = 1
            } else {
                fish.x_directon = -1
            }
            // y-direction
            if (mouse_y < fish.y) {
                fish.y_direction = 1
            } else {
                fish.y_direction = -1
            }
        }

    }

    fish.x += fish.x_directon * current_speed // update positions with directions
    fish.y += fish.y_direction * current_speed

    // Calc distance since last horizontal flip
    const distanceMovedSinceFlip = fish.x - fish.last_flip_x;

    // If moved 20+ pixels to the right, face right
    if (distanceMovedSinceFlip > 20) {
        fish.facing_left = false;
        fish.last_flip_x = fish.x;  // Reset tracking position
    }

    // If moved 20+ pixels to the left, face left
    if (distanceMovedSinceFlip < -20) {
        fish.facing_left = true;
        fish.last_flip_x = fish.x;
    }
}

// Function to generate a given number of fish
function generateFish(num) {
    for (let i = 0; i < num; i++) {
        let { primary_color, secondary_color, eye_color } = generateColors(); // generate colors
        let fish = new Fish(
            (Math.random() * 100) + 300, //random initial x position
            (Math.random() * 100) + 300, //random initial y position
            getRandomDirection(), // random initial x direction
            getRandomDirection(), // random initial y direction
            false,
            speed = generateSpeed(),
            primary_color,
            secondary_color,
            eye_color,
            // call function to randomly select a shape
            0
        )
        allFish.push(fish)   // add fish to array
    }
}

// Function to randomly generate a movement speed
function generateSpeed() {
    return (Math.random() + 0.5)
}

// Function to randomly generate a random color combo
function generateColors() {
    num = Math.random()

    if (num < 0.20) {
        primary_color = "#00C2CBFF"
        secondary_color = "#FFD93DFF"
        eye_color = "#FFFFFFCC"
    } else if (num >= 0.20 && num < 0.40) {
        primary_color = "#D7263DFF"
        secondary_color = "#FF9E00FF"
        eye_color = "#FFF0E0FF"
    } else if (num >= 0.40 && num < 0.60) {
        primary_color = "#003049FF"
        secondary_color = "#669BBCFF"
        eye_color = "#B8EFFFCC"
    } else if (num >= 0.60 && num < 0.80) {
        primary_color = "#0d00ffcc"
        secondary_color = "#9D4EDDFF"
        eye_color = "#FFD6FAFF"
    } else if (num >= 0.80 && num < 0.99) {
        primary_color = "#FF7F11FF"
        secondary_color = "#FFFFFFEE"
        eye_color = "#FFEEDDFF"
    } else {
        // rare golden fish
        primary_color = "#FFD700FF"
        secondary_color = "#FFF4B0FF"
        eye_color = "#FFFFFFEE"
    }

    return { primary_color, secondary_color, eye_color }
}




function generateShape() { }
function generateSize() { }

function Fish(x, y, x_directon, y_direction, facing_left, speed, primary_color, secondary_color, eye_color, frameCounter) {
    this.x = x;
    this.y = y;
    this.x_directon = x_directon;
    this.y_direction = y_direction;
    this.facing_left = facing_left;
    this.last_flip_x = x;  // x position at last flip
    this.speed = speed;
    // this.shape = shape,
    this.primary_color = primary_color;
    this.secondary_color = secondary_color;
    this.eye_color = eye_color;
    this.next_direction_change = Math.floor(Math.random() * 300) + 200; // random amount of time until next direction change (avoid all fish movement patterns syncing)
    this.frameCounter = frameCounter;
}

function Food(x, y) {
    this.x = x,
        this.y = y
}

gameLoop();

resizeCanvas();
window.addEventListener('resize', resizeCanvas);