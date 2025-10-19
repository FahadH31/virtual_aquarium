// Arrays to store fish and food particles
ArrayList<Fish> allFish = new ArrayList<Fish>();
ArrayList<Food> allFoodParticles = new ArrayList<Food>();

// Mouse location variables (initially off screen)
float mouseXPos = -1000;
float mouseYPos = -1000;

PImage bgImage;

// UI elements
int fishCount = 15;

// Pre-rendered fish shapes (one for each color scheme)
PGraphics[] fishSprites;
int[] fishColorIndices = new int[50]; // Max 50 fish

void setup() {
  size(1500, 1000, P2D); // Use P2D renderer for hardware acceleration
  
bgImage = loadImage("background_img.jpg"); // background image
bgImage.resize(width, height); // resize for window
  
  // Pre-render fish sprites for each color scheme
  createFishSprites();
  
  // Generate initial fish
  generateFish(fishCount);
  
  frameRate(60);
}

void draw() {
  // Draw background
  image(bgImage, 0, 0);

  
  // Update and draw all fish
  for (int i = 0; i < allFish.size(); i++) {
    Fish fish = allFish.get(i);
    updateFish(fish);
    drawFishSprite(fish, i);
  }
  
  // Update and draw food
  noStroke();
  fill(255, 165, 0);
  for (int i = allFoodParticles.size() - 1; i >= 0; i--) {
    Food food = allFoodParticles.get(i);
    food.y += 0.5;
    if (food.y > height) {
      allFoodParticles.remove(i);
    } else {
      ellipse(food.x, food.y, 10, 10);
    } //<>//
  }
  
  // Display fish count
  textSize(12);
  textAlign(LEFT);
  text("Fish: " + fishCount, 15, height - 20);
}

void mousePressed() {
  allFoodParticles.add(new Food(mouseX, mouseY));
}

void mouseMoved() {
  mouseXPos = mouseX;
  mouseYPos = mouseY;
}


// To increase/decrease number of fish
void keyPressed() {
  if (key == '+' || key == '=') {
    if (fishCount < 50) {
      fishCount++;
      generateFish(1);
    }
  } else if (key == '-' || key == '_') {
    if (fishCount > 1) {
      fishCount--;
      if (allFish.size() > 0) allFish.remove(allFish.size() - 1);
    }
  }
}

// Create fish sprites
void createFishSprites() {
  fishSprites = new PGraphics[6];
  
  color[][] colorSchemes = {
    {color(0, 194, 203), color(255, 217, 61)},
    {color(215, 38, 61), color(255, 158, 0)},
    {color(0, 48, 73), color(102, 155, 188)},
    {color(52, 41, 255), color(157, 78, 221)},
    {color(255, 127, 17), color(255, 255, 255)},
    {color(255, 215, 0), color(255, 244, 176)}
  };
  
  for (int i = 0; i < 6; i++) {
    fishSprites[i] = createGraphics(120, 120);
    fishSprites[i].beginDraw();
    fishSprites[i].clear();
    
    color pColor = colorSchemes[i][0];
    color sColor = colorSchemes[i][1];
    
    // Offset all drawing by 20 pixels to account for fish tails
    int offsetX = 20;
    
    // Tail
    fishSprites[i].noStroke();
    fishSprites[i].fill(sColor);
    fishSprites[i].triangle(offsetX + 30, 40, offsetX - 20, 40, offsetX - 20, 70);
    
    // Body
    fishSprites[i].fill(pColor);
    fishSprites[i].triangle(offsetX, 0, offsetX + 75, 50, offsetX, 100);
    
    // Stripe
    fishSprites[i].stroke(sColor);
    fishSprites[i].strokeWeight(4);
    fishSprites[i].noFill();
    fishSprites[i].bezier(offsetX + 35, 25, offsetX + 20, 37.5, offsetX + 20, 62.5, offsetX + 35, 75);
    
    // Eye
    fishSprites[i].noStroke();
    fishSprites[i].fill(255, 255, 0);
    fishSprites[i].ellipse(offsetX + 50, 50, 10, 10);
    fishSprites[i].fill(0);
    fishSprites[i].ellipse(offsetX + 50, 50, 6, 6);
    
    fishSprites[i].endDraw();
  }
}

// Draw fish using the pre-rendered sprites
void drawFishSprite(Fish fish, int index) {
  pushMatrix();
  translate(fish.x, fish.y);
  if (fish.facingLeft) {
    scale(-1, 1);
  }
  image(fishSprites[fishColorIndices[index]], -70, -60);
  popMatrix();
}

// Combined update function for fish
void updateFish(Fish fish) {
  // Random movement counter
  fish.frameCounter++;
  if (fish.frameCounter >= fish.nextDirectionChange) {
    float r = random(1);
    fish.xDirection = (r < 0.5) ? 1 : -1;
    fish.yDirection = (r % 0.5 < 0.25) ? 1 : -1;
    fish.frameCounter = 0;
  }
  
  float currentSpeed = fish.speed;
  
  // Mouse interaction
  float dx = mouseXPos - fish.x;
  float dy = mouseYPos - fish.y;
  float distSq = dx * dx + dy * dy;
  
  if (distSq < 22500) { // 150^2
    currentSpeed = fish.speed * 2;
    fish.fleeTimer = 60;
    fish.xDirection = (dx < 0) ? 1 : -1;
    fish.yDirection = (dy < 0) ? 1 : -1;
    fish.fleeDirectionX = fish.xDirection;
    fish.fleeDirectionY = fish.yDirection;
  }
  
  // Continue fleeing
  if (fish.fleeTimer > 0) {
    fish.fleeTimer--;
    currentSpeed = fish.speed * 2;
    fish.xDirection = fish.fleeDirectionX;
    fish.yDirection = fish.fleeDirectionY;
  } else if (allFoodParticles.size() > 0) {
    // Food seeking
    Food nearest = allFoodParticles.get(0);
    float nearestDistSq = Float.MAX_VALUE;
    
    for (Food food : allFoodParticles) {
      float fdx = food.x - fish.x;
      float fdy = food.y - fish.y;
      float fDistSq = fdx * fdx + fdy * fdy;
      if (fDistSq < nearestDistSq) {
        nearestDistSq = fDistSq;
        nearest = food;
      }
    }
    
    if (nearestDistSq < 400) { // 20^2
      allFoodParticles.remove(nearest);
    } else if (nearestDistSq < 62500) { // 250^2
      fish.xDirection = (nearest.x < fish.x) ? -1 : 1;
      fish.yDirection = (nearest.y < fish.y) ? -1 : 1;
    }
  }
  
  // Update movement direction
  fish.x += fish.xDirection * currentSpeed;
  fish.y += fish.yDirection * currentSpeed;
  
  // After updating position clamp to bounds (avoiding phasing past walls)
  fish.x = constrain(fish.x, 15, width - 15);
  fish.y = constrain(fish.y, 30, height - 30);
  
  // Wall collisions
  if (fish.x < 100) fish.xDirection = 1;
  else if (fish.x > width - 100) fish.xDirection = -1;
  if (fish.y < 100) fish.yDirection = 1;
  else if (fish.y > height - 100) fish.yDirection = -1;
  
  // Update facing
  float moved = fish.x - fish.lastFlipX;
  if (moved > 10) {
    fish.facingLeft = false;
    fish.lastFlipX = fish.x;
  } else if (moved < -10) {
    fish.facingLeft = true;
    fish.lastFlipX = fish.x;
  }
}

// Generate fish
void generateFish(int num) {
  for (int i = 0; i < num; i++) {
    int idx = allFish.size();
    allFish.add(new Fish(
      random(100) + 300,
      random(100) + 300,
      random(1) < 0.5 ? 1 : -1,
      random(1) < 0.5 ? 1 : -1,
      random(1) + 0.5
    ));
    
    // Assign color scheme
    float r = random(1);
    if (r < 0.20) fishColorIndices[idx] = 0;
    else if (r < 0.40) fishColorIndices[idx] = 1;
    else if (r < 0.60) fishColorIndices[idx] = 2;
    else if (r < 0.80) fishColorIndices[idx] = 3;
    else if (r < 0.99) fishColorIndices[idx] = 4;
    else fishColorIndices[idx] = 5;
  }
}

// Fish class
class Fish {
  float x, y, lastFlipX, speed;
  int xDirection, yDirection;
  boolean facingLeft;
  int nextDirectionChange, frameCounter, fleeTimer;
  int fleeDirectionX, fleeDirectionY;
  
  Fish(float x, float y, int xDir, int yDir, float spd) {
    this.x = x;
    this.y = y;
    this.xDirection = xDir;
    this.yDirection = yDir;
    this.facingLeft = false;
    this.lastFlipX = x;
    this.speed = spd;
    this.nextDirectionChange = (int)random(300) + 200;
    this.frameCounter = 0;
    this.fleeTimer = 0;
    this.fleeDirectionX = 0;
    this.fleeDirectionY = 0;
  }
}

// Food class
class Food {
  float x, y;
  Food(float x, float y) {
    this.x = x;
    this.y = y;
  }
}
