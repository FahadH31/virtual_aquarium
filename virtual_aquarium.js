const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

let fish = {
    x: 50,
    y: 50,
    x_directon: 1,
    y_direction: 1,
    speed: generateSpeed(),
    frameCounter: 0
}

// Array to store all fish
let allFish = [];
// Mouse location variables
let mouse_x = -1000;
let mouse_y = -1000;

function gameLoop() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    calculateFishDirection(fish);
    updateFishDirection(fish);
    drawTriangleFish(fish.x, fish.y, fish.x_directon);

    requestAnimationFrame(gameLoop);
}

// Track mouse location
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse_x = event.clientX - rect.left
    mouse_y = event.clientY - rect.top
})

// Function to get distance between mouse/fish/food
function getDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

// Function to draw triangle fish on the canvas
function drawTriangleFish(x, y, x_directon) {
    const body = new Path2D();
    const tail = new Path2D();
    const stripe = new Path2D();
    const eye = new Path2D()
    const pupil = new Path2D()

    context.save();

    // If moving left
    if (x_directon == -1) {
        context.translate(x, 0)
        context.scale(-1, 1);
        context.translate(-x, 0)
    }

    // Triangle Tail
    tail.moveTo(x + 30, y + 40)
    tail.lineTo(x - 20, y + 40)
    tail.lineTo(x - 20, y + 70)
    tail.closePath();
    context.fillStyle = "#f54f24";
    context.fill(tail)

    // Triangle Body
    body.moveTo(x, y);
    body.lineTo(x + 75, y + 50);
    body.lineTo(x, y + 100);
    body.closePath();
    context.fillStyle = "#b8ce0b";
    context.fill(body)

    // Stripe
    stripe.moveTo(x + 35, y + 25)
    context.lineWidth = "4"
    stripe.quadraticCurveTo(x + 20, y + 50, x + 35, y + 75);
    context.strokeStyle = "#f54f24";
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
function calculateFishDirection(fish) {
    fish.frameCounter++;

    if (fish.frameCounter >= 240) { // randomly update direction every 240 frames
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
function updateFishDirection(fish) {

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

    // Only handle mouse interactions outside wall deadzone (to avoid bugs with fish movement)
    if (fish.x > 150 && fish.x < (canvas.width - 150) && fish.y > 150 && fish.y < canvas.height - 150) {
        // Handle mouse interactions
        let mouse_distance = getDistance(mouse_x, mouse_y, fish.x, fish.y);
        if (mouse_distance < 75) {
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

    fish.x += fish.x_directon * fish.speed // update positions with directions
    fish.y += fish.y_direction * fish.speed
}

// Function to generate a given number of fish
function generateFish(num) {
    for (i; i < num; i++) {
        fish = new Fish(
            // call function to randomly select a color-combo
            // call function to randomly select a shape
            // call function to randomly create a size (within bounds)
            speed = generateSpeed()
        )
        allFish.push(fish)   // add fish to array
    }
}

// Function to randomly generate a movement speed
function generateSpeed() {
    return (Math.random() + 1)
}

function generateColor() { }
function generateShape() { }
function generateSize() { } // make it rarer on both extremes (large and small)

function Fish(x_pos, y_pos, direction_facing, speed, shape, size, colors) {
    this.x_pos = x_pos,
        this.y_pos = y_pos,
        this.direction_facing = direction_facing,
        this.speed = speed,
        this.size = size,
        this.shape = shape,
        this.colors = colors
}

gameLoop();