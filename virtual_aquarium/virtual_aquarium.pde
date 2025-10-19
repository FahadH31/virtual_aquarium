// Virtual Aquarium - Processing Version
// Arrays to store fish and food particles
ArrayList<Fish> allFish = new ArrayList<Fish>();
ArrayList<Food> allFoodParticles = new ArrayList<Food>();

// Mouse location variables
float mouseXPos = -1000;
float mouseYPos = -1000;

// Canvas dimensions
int canvasWidth = 1500;
int canvasHeight = 1000;

// Background image
PImage bgImage;

// UI elements
int fishCount = 15;
boolean mouseOverInput = false;

void setup() {
  size(1500, 1000);
  
  // Try to load background image (optional - will work without it)
  try {
    bgImage = loadImage("background_img.jpg");
  } catch (Exception e) {
    bgImage = null;
  }
  
  // Generate initial fish
  generateFish(fishCount);
}

void draw() {
  // Draw background
  if (bgImage != null) {
    image(bgImage, 0, 0, width, height);
  } else {
    background(50, 100, 150); // Blue ocean background if no image
  }
  
  // Update and draw all fish
  for (int i = 0; i < allFish.size(); i++) {
    Fish fish = allFish.get(i);
    calculateRandomMovement(fish);
    moveFish(fish);
    drawTriangleFish(fish);
  }
  
  // Update and draw all food particles
  for (int i = allFoodParticles.size() - 1; i >= 0; i--) {
    Food food = allFoodParticles.get(i);
    boolean shouldRemove = moveFood(food);
    if (shouldRemove) {
      allFoodParticles.remove(i);
    } else {
      drawFood(food);
    }
  }
  
  // Draw UI
  drawUI();
}

void mousePressed() {
  // Check if clicking in input area
  if (mouseY > height - 80 && mouseY < height - 20 && 
      mouseX > 20 && mouseX < 250) {
    // Input area clicked - handle in keyPressed
    mouseOverInput = true;
  } else {
    // Add food particle at click location
    allFoodParticles.add(new Food(mouseX, mouseY));
  }
}

void keyPressed() {
  if (mouseOverInput) {
    if (key >= '0' && key <= '9') {
      // Update fish count (simple implementation)
      int digit = key - '0';
      if (fishCount < 10) {
        fishCount = fishCount * 10 + digit;
      } else {
        fishCount = digit;
      }
      if (fishCount > 50) fishCount = 50;
      
      // Regenerate fish
      allFish.clear();
      generateFish(fishCount);
    } else if (keyCode == BACKSPACE && fishCount > 0) {
      fishCount = fishCount / 10;
      allFish.clear();
      generateFish(max(fishCount, 1));
    } else if (key == ENTER || key == RETURN) {
      mouseOverInput = false;
    }
  }
}

void mouseMoved() {
  mouseXPos = mouseX;
  mouseYPos = mouseY;
}

void mouseDragged() {
  mouseXPos = mouseX;
  mouseYPos = mouseY;
}

// Draw UI elements
void drawUI() {
  // Draw semi-transparent box for controls
  fill(255, 255, 255, 200);
  stroke(51, 51, 255);
  strokeWeight(2);
  rect(20, height - 80, 230, 60, 8);
  
  // Draw label
  fill(51, 51, 255);
  textSize(14);
  textAlign(LEFT, CENTER);
  text("Number of Fish:", 30, height - 50);
  
  // Draw input box
  fill(240, 240, 255);
  stroke(51, 51, 255);
  strokeWeight(1);
  rect(150, height - 65, 80, 30, 5);
  
  // Draw fish count
  fill(20, 71, 255);
  textSize(14);
  textAlign(CENTER, CENTER);
  text(fishCount, 190, height - 50);
  
  // Instructions
  fill(51, 51, 255, 180);
  textSize(11);
  textAlign(LEFT);
  text("Click to feed | Move mouse to scare fish | Type number to change count", 10, 20);
}

// Function to draw food particle
void drawFood(Food food) {
  noStroke();
  fill(255, 165, 0); // Orange
  ellipse(food.x, food.y, 10, 10);
}

// Function to move food (with gravity)
boolean moveFood(Food food) {
  food.y += 0.5; // Gravity effect
  if (food.y > height) {
    return true; // Signal removal
  }
  return false;
}

// Function to draw a triangle fish
void drawTriangleFish(Fish fish) {
  pushMatrix();
  
  // If fish is facing left, flip it
  if (fish.facingLeft) {
    translate(fish.x, 0);
    scale(-1, 1);
    translate(-fish.x, 0);
  }
  
  // Draw tail
  fill(fish.secondaryColor);
  noStroke();
  triangle(
    fish.x + 30, fish.y + 40,
    fish.x - 20, fish.y + 40,
    fish.x - 20, fish.y + 70
  );
  
  // Draw body
  fill(fish.primaryColor);
  triangle(
    fish.x, fish.y,
    fish.x + 75, fish.y + 50,
    fish.x, fish.y + 100
  );
  
  // Draw stripe
  stroke(fish.secondaryColor);
  strokeWeight(4);
  noFill();
  beginShape();
  vertex(fish.x + 35, fish.y + 25);
  quadraticVertex(fish.x + 20, fish.y + 50, fish.x + 35, fish.y + 75);
  endShape();
  
  // Draw eye
  fill(255, 255, 0); // Yellow
  noStroke();
  ellipse(fish.x + 50, fish.y + 50, 10, 10);
  
  // Draw pupil
  fill(0); // Black
  ellipse(fish.x + 50, fish.y + 50, 6, 6);
  
  popMatrix();
}

// Function to calculate random movement
void calculateRandomMovement(Fish fish) {
  fish.frameCounter++;
  
  if (fish.frameCounter >= fish.nextDirectionChange) {
    float random = random(1);
    if (random <= 0.25) {
      fish.xDirection = 1;
      fish.yDirection = 1;
    } else if (random <= 0.5) {
      fish.xDirection = 1;
      fish.yDirection = -1;
    } else if (random <= 0.75) {
      fish.xDirection = -1;
      fish.yDirection = 1;
    } else {
      fish.xDirection = -1;
      fish.yDirection = -1;
    }
    fish.frameCounter = 0;
  }
}

// Function to move fish
void moveFish(Fish fish) {
  float currentSpeed = fish.speed;
  
  // Only handle mouse interactions outside wall deadzone
  if (fish.x > 150 && fish.x < (width - 150) && 
      fish.y > 150 && fish.y < height - 150) {
    float mouseDist = dist(mouseXPos, mouseYPos, fish.x, fish.y);
    
    // Handle mouse interactions (predator effect)
    if (mouseDist < 150) {
      currentSpeed = fish.speed * 2; // Speed boost
      fish.fleeTimer = 60;
      
      // X-direction
      if (mouseXPos < fish.x) {
        fish.xDirection = 1;
        fish.fleeDirectionX = 1;
      } else {
        fish.xDirection = -1;
        fish.fleeDirectionX = -1;
      }
      
      // Y-direction
      if (mouseYPos < fish.y) {
        fish.yDirection = 1;
        fish.fleeDirectionY = 1;
      } else {
        fish.yDirection = -1;
        fish.fleeDirectionY = -1;
      }
    }
  }
  
  // Continue fleeing if timer is active
  if (fish.fleeTimer > 0) {
    fish.fleeTimer--;
    currentSpeed = fish.speed * 2;
    fish.xDirection = fish.fleeDirectionX;
    fish.yDirection = fish.fleeDirectionY;
  } else {
    // Handle food navigation when not fleeing
    if (allFoodParticles.size() > 0) {
      Food nearestFood = getNearestFood(fish);
      float nearestDist = dist(fish.x, fish.y, nearestFood.x, nearestFood.y);
      
      if (nearestDist < 20) {
        // Remove food (eaten)
        allFoodParticles.remove(nearestFood);
      } else if (nearestDist < 250) {
        // Navigate toward food
        if (nearestFood.x < fish.x) {
          fish.xDirection = -1;
        } else {
          fish.xDirection = 1;
        }
        
        if (nearestFood.y < fish.y) {
          fish.yDirection = -1;
        } else {
          fish.yDirection = 1;
        }
      }
    }
  }
  
  // Update positions
  fish.x += fish.xDirection * currentSpeed;
  fish.y += fish.yDirection * currentSpeed;
  
  // Handle wall collisions
  if (fish.x < 100) fish.xDirection = 1;
  if (fish.y < 100) fish.yDirection = 1;
  if (fish.x > width - 100) fish.xDirection = -1;
  if (fish.y > height - 100) fish.yDirection = -1;
  
  // Calculate distance since last flip
  float distMovedSinceFlip = fish.x - fish.lastFlipX;
  
  // Update facing direction
  if (distMovedSinceFlip > 20) {
    fish.facingLeft = false;
    fish.lastFlipX = fish.x;
  }
  
  if (distMovedSinceFlip < -20) {
    fish.facingLeft = true;
    fish.lastFlipX = fish.x;
  }
}

// Get nearest food to a fish
Food getNearestFood(Fish fish) {
  Food nearest = allFoodParticles.get(0);
  float nearestDist = dist(fish.x, fish.y, nearest.x, nearest.y);
  
  for (Food food : allFoodParticles) {
    float d = dist(fish.x, fish.y, food.x, food.y);
    if (d < nearestDist) {
      nearest = food;
      nearestDist = d;
    }
  }
  
  return nearest;
}

// Generate fish
void generateFish(int num) {
  for (int i = 0; i < num; i++) {
    ColorSet colors = generateColors();
    int randomDir1 = random(1) < 0.5 ? 1 : -1;
    int randomDir2 = random(1) < 0.5 ? 1 : -1;
    
    allFish.add(new Fish(
      random(100) + 300,
      random(100) + 300,
      randomDir1,
      randomDir2,
      false,
      random(1) + 0.5,
      colors.primary,
      colors.secondary,
      colors.eye
    ));
  }
}

// Generate random colors
ColorSet generateColors() {
  float num = random(1);
  color primary, secondary, eye;
  
  if (num < 0.20) {
    primary = color(0, 194, 203);
    secondary = color(255, 217, 61);
    eye = color(255, 255, 255);
  } else if (num < 0.40) {
    primary = color(215, 38, 61);
    secondary = color(255, 158, 0);
    eye = color(255, 240, 224);
  } else if (num < 0.60) {
    primary = color(0, 48, 73);
    secondary = color(102, 155, 188);
    eye = color(184, 239, 255);
  } else if (num < 0.80) {
    primary = color(52, 41, 255);
    secondary = color(157, 78, 221);
    eye = color(255, 214, 250);
  } else if (num < 0.99) {
    primary = color(255, 127, 17);
    secondary = color(255, 255, 255);
    eye = color(255, 238, 221);
  } else {
    // Rare golden fish
    primary = color(255, 215, 0);
    secondary = color(255, 244, 176);
    eye = color(255, 255, 255);
  }
  
  return new ColorSet(primary, secondary, eye);
}

// Fish class
class Fish {
  float x, y;
  int xDirection, yDirection;
  boolean facingLeft;
  float lastFlipX;
  float speed;
  color primaryColor, secondaryColor, eyeColor;
  int nextDirectionChange;
  int frameCounter;
  int fleeTimer;
  int fleeDirectionX, fleeDirectionY;
  
  Fish(float x, float y, int xDir, int yDir, boolean left, 
       float spd, color pColor, color sColor, color eColor) {
    this.x = x;
    this.y = y;
    this.xDirection = xDir;
    this.yDirection = yDir;
    this.facingLeft = left;
    this.lastFlipX = x;
    this.speed = spd;
    this.primaryColor = pColor;
    this.secondaryColor = sColor;
    this.eyeColor = eColor;
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

// Helper class for color sets
class ColorSet {
  color primary, secondary, eye;
  
  ColorSet(color p, color s, color e) {
    this.primary = p;
    this.secondary = s;
    this.eye = e;
  }
}
