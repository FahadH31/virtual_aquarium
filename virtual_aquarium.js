const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

let fish = {
    x: 50,
    y: 50,
    x_directon: 1,
    y_direction: 1,
    speed: 1,
    frameCounter: 0
}

function gameLoop() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    calculateFishDirection(fish);
    updateFishDirection(fish);
    drawTriangleFish(fish.x, fish.y, fish.x_directon);

    requestAnimationFrame(gameLoop);
}

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
    tail.moveTo(x + 10, y + 40)
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

function updateFishDirection(fish) {
    // Handle wall collisions (change direction if the fish gets too close to the borders)
    if (fish.x < 100) {
        fish.x_directon = 1
    } else if (fish.y < 100) {
        fish.y_direction = 1
    } else if (fish.x > (canvas.width - 100)) {
        fish.x_directon = -1
    } else if (fish.y > (canvas.height - 100)) {
        fish.y_direction = -1;
    }

    fish.x += fish.x_directon * fish.speed // update positions with directions
    fish.y += fish.y_direction * fish.speed
}

function generateSpeed() {
    return (Math.random() * 2)
}

function generateColor() { }
function generateShape() { }
function generateSize() { } // make it rarer on both extremes (large and small)

// Function to create a number of fish
function generateFish(num) {
    // for num
    // fish = new Fish(
    // call function to randomly select a color-combo
    // call function to randomly select a shape
    // call function to randomly create a size (within bounds)
    // call position function that handles movement
    // cal speed function to randomly create a speed
    // )
    // add fish to array storing all fish
}

// Fish Object
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


// Fish Object:
// const fish = {shape: triangle/square/oval, color-pattern: red-blue/orange-green/...}
// also have properties for x-pos, y-pos, speed, direction-facing.
// speed can be random per fish within a certain range.
// direction facing depends on it's current movement.
// if x-pos increasing, it's facing right. if decreasing, facing left.

// How to store multiple fish?
// a simple array storing multiple fish objects

// Animation loop structure?
// draw method can be placed inside an infinite while loop
// 1. clear canvas (to delete the old frame)
// 2. update details (
//      function to calculate new positions (this will be with randomness),
//      function to calculate if collision (based on comparing fish x and y pos with fixed x and y pos)
// 3. draw on the canvas
// 4. wait for new frame (could do 60fps)