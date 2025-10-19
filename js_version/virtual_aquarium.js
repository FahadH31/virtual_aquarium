const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

// Arrays
let all_fish = [];
let all_food_particles = [];

// Mouse location variables
let mouse_x = -1000;
let mouse_y = -1000;

// Scale factor
let scale_factor = 1;

// Generate with 15 fish initially
generateFish(15);

// Update number of fish with user-inputted amount
const fish_input = document.getElementById('fishCount');
fish_input.addEventListener('input', function () {
    all_fish = [];
    const num_fish = this.value;
    generateFish(num_fish);
});


// Infinite loop that runs the game itself
function gameLoop() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Loop through and draw all fish
    for (let i = 0; i < all_fish.length; i++) {
        let fish = all_fish[i];
        calculateRandomMovement(fish);
        moveFish(fish);
        drawTriangleFish(fish.x, fish.y, fish.facing_left,
            fish.primary_color, fish.secondary_color, fish.eye_color);
    }

    for (let i = 0; i < all_food_particles.length; i++) {
        let should_remove = moveFood(all_food_particles[i]);
        if (should_remove) {
            all_food_particles.splice(i, 1);
        } else {
            drawFood(all_food_particles[i]);
        }
    }

    requestAnimationFrame(gameLoop); // loop every frame
}

// To match canvas internal size with css size
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    updateScale();
}

// Calculate the scale factor for fish based on canvas size
function updateScale() {
    const reference_width = 1500;
    const reference_height = 1000;
    const width_scale = canvas.width / reference_width;
    const height_scale = canvas.height / reference_height;
    scale_factor = Math.min(width_scale, height_scale, 1); // cap at 1 to avoid too large fish
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
    const click_x = event.clientX - rect.left
    const click_y = event.clientY - rect.top
    all_food_particles.push(new Food(click_x, click_y)) // store food particle to array with coordinates it should be created at
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
    for (let i = 0; i < all_food_particles.length; i++) {
        currentFood = all_food_particles[i];
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
    if (food_particle.y > canvas.height) { // delete food that goes off screen
        return true; // signal that this food should be removed
    }
    return false;
}

// Function to draw triangle fish on the canvas
function drawTriangleFish(x, y, facing_left, primary_color, secondary_color, eye_color) {
    const body = new Path2D();
    const tail = new Path2D();
    const stripe = new Path2D();
    const eye = new Path2D()
    const pupil = new Path2D()

    // Scale for all dimensions according to canvas size
    const s = scale_factor;

    context.save();

    // If fish set to facing left, flip it
    if (facing_left) {
        context.translate(x, 0)
        context.scale(-1, 1);
        context.translate(-x, 0)
    }

    // Triangle Tail
    tail.moveTo(x + 30 * s, y + 40 * s)
    tail.lineTo(x - 20 * s, y + 40 * s)
    tail.lineTo(x - 20 * s, y + 70 * s)
    tail.closePath();
    context.fillStyle = secondary_color;
    context.fill(tail)

    // Triangle Body
    body.moveTo(x, y);
    body.lineTo(x + 75 * s, y + 50 * s);
    body.lineTo(x, y + 100 * s);
    body.closePath();
    context.fillStyle = primary_color;
    context.fill(body)

    // Stripe
    stripe.moveTo(x + 35 * s, y + 25 * s)
    context.lineWidth = 4 * s;
    stripe.quadraticCurveTo(x + 20 * s, y + 50 * s, x + 35 * s, y + 75 * s);
    context.strokeStyle = secondary_color;
    context.stroke(stripe);

    // Eye/Pupil
    eye.moveTo(x + 55 * s, y + 50 * s);
    eye.arc(x + 50 * s, y + 50 * s, 5 * s, 0, Math.PI * 2, true);
    pupil.arc(x + 50 * s, y + 50 * s, 3 * s, 0, Math.PI * 2, true);
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

    // Only handle mouse interactions outside wall deadzone (to avoid bugs with fish movement)
    if (fish.x > 150 && fish.x < (canvas.width - 150) && fish.y > 150 && fish.y < canvas.height - 150) {
        let mouse_distance = getDistance(mouse_x, mouse_y, fish.x, fish.y);

        // Handle mouse interactions
        if (mouse_distance < 150) { // flee when mouse is less than 150px away (predator effect)
            current_speed = fish.speed * 2 // give a speed boost
            // Set flee timer for at least 2 seconds (120 frames at 60fps)
            fish.fleeTimer = 60;
            // x-direction
            if (mouse_x < fish.x) {
                fish.x_directon = 1
                fish.fleeDirectionX = 1;
            } else {
                fish.x_directon = -1
                fish.fleeDirectionX = -1;
            }
            // y-direction
            if (mouse_y < fish.y) {
                fish.y_direction = 1
                fish.fleeDirectionY = 1;
            } else {
                fish.y_direction = -1
                fish.fleeDirectionY = -1;
            }
        }
    }

    // Continue fleeing in same direction if flee timer is active
    if (fish.fleeTimer > 0) {
        fish.fleeTimer--;
        current_speed = fish.speed * 2;
        fish.x_directon = fish.fleeDirectionX;
        fish.y_direction = fish.fleeDirectionY;
    } else {
        // Handle food navigation only when not fleeing
        if (all_food_particles.length > 0) {
            let { nearestFood, nearestFoodDistance } = getNearestFood(fish);
            if (nearestFoodDistance < 20) { // remove food once fish is close enough (eaten)
                let i = all_food_particles.indexOf(nearestFood)
                all_food_particles.splice(i, 1)
            } else if (nearestFoodDistance < 250) { // get nearest food within 250px
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
        }
    }

    fish.x += fish.x_directon * current_speed // update positions with directions
    fish.y += fish.y_direction * current_speed

    // Handle wall collisions (change direction if the fish gets too close to borders)
    if (fish.x < 100) {
        fish.x_directon = 1
    }
    if (fish.y < 100) {
        fish.y_direction = 1
    }
    if (fish.x > (canvas.width - 100)) {
        fish.x_directon = -1
    }
    if (fish.y > (canvas.height - 100)) {
        fish.y_direction = -1;
    }

    // Calc distance since last horizontal flip
    const distanceMovedSinceFlip = fish.x - fish.last_flip_x;

    // If moved 20+ pixels to the right, face right
    // (this is to avoid 'ghosting' issues where the fish get stuck in place swapping directions)
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
            0
        )
        all_fish.push(fish)   // add fish to array
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
        primary_color = "#3429ffff"
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

function Fish(x, y, x_directon, y_direction, facing_left, speed, primary_color, secondary_color, eye_color, frameCounter) {
    this.x = x;
    this.y = y;
    this.x_directon = x_directon;
    this.y_direction = y_direction;
    this.facing_left = facing_left;
    this.last_flip_x = x;  // x position at last flip
    this.speed = speed;
    this.primary_color = primary_color;
    this.secondary_color = secondary_color;
    this.eye_color = eye_color;
    this.next_direction_change = Math.floor(Math.random() * 300) + 200; // random amount of time until next direction change (avoid all fish movement patterns syncing)
    this.frameCounter = frameCounter;
    this.fleeTimer = 0; // timer for flee behavior
    this.fleeDirectionX = 0; // locked flee direction X
    this.fleeDirectionY = 0; // locked flee direction Y
}

function Food(x, y) {
    this.x = x,
        this.y = y
}

gameLoop();

resizeCanvas();
window.addEventListener('resize', resizeCanvas);