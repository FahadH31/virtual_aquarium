const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");


function moveFish(){
    while(true){
        draw()
    }
}

// will be modified to sit in infinite loop and pull information from variables 
function draw() {
    const triangleFishBody = new Path2D();
    const triangleFishTail = new Path2D();
    const triangleFishArc = new Path2D();
    const triangleFishEye = new Path2D()
    const triangleFishPupil = new Path2D()

    // Triangle Fish Tail
    triangleFishTail.moveTo(110, 150)
    triangleFishTail.lineTo(80, 140)
    triangleFishTail.lineTo(80, 170)
    triangleFishTail.closePath();
    context.fillStyle = "#f54f24";
    context.fill(triangleFishTail)

    // Triangle Fish Body
    triangleFishBody.moveTo(100, 100);
    triangleFishBody.lineTo(175, 150);
    triangleFishBody.lineTo(100, 200);
    triangleFishBody.closePath();
    context.fillStyle = "#b8ce0b";
    context.fill(triangleFishBody)

    // Triangle Fish Arc
    triangleFishArc.moveTo(135, 125)
    context.lineWidth = "4"
    triangleFishArc.quadraticCurveTo(120, 150, 135, 175);
    context.strokeStyle = "#f54f24";
    context.stroke(triangleFishArc);

    // Triangle Fish Eye
    triangleFishEye.moveTo(155, 150);
    triangleFishEye.arc(150, 150, 5, 0, Math.PI * 2, true);
    triangleFishPupil.arc(150, 150, 3, 0, Math.PI * 2, true);
    context.fillStyle = "yellow"
    context.fill(triangleFishEye)
    context.fillStyle = "black"
    context.fill(triangleFishPupil)

}


function generateSpeed(){}
function generateColor(){}
function generateShape(){}
function generateSize(){} // make it rarer on both extremes (large and small)
function updateFishPos(){}

// Function to create a number of fish
function createFish(num){
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

// Function to initalize and update fish object
function Fish(x_pos, y_pos, direction_facing, speed, shape, size, colors){
    this.x_pos = x_pos,
    this.y_pos = y_pos,
    this.direction_facing = direction_facing,
    this.speed = speed
    this.size = size
    this.shape = shape,
    this.colors = colors
}

draw();


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