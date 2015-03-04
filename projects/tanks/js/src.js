
var Game = {
  pixelsPerMove: 2,
  backgroundColor: "#aaaaaa",
  isOver: true,  // flag that signals to draw explosion and game over text
  isSleep: true, // flag to stop drawing completely
  animationFrames: [1, 2, 3, 4, 5, 6, 7, 8],
  explosionFrames: [1, 2, 3],
  maxWidth: null,
  maxHeight: null
};

Game.player = {
  x: null,
  y: null,
  current_direction: null,
  explosionIndex: null,
  frameIndex: null,
  score: 0
};

Game.enemy = {
  x: null,
  y: null,
  current_direction: null,
  frameIndex: null
};

Game.bullet = {
  x: null,
  y: null,
  pointsValue: 10
};

// sprite sheet
Game.tileSheet = new Image();
Game.tileSheet.src = "images/tanks_sheet.png";
// don't start game until sprite sheet is loaded
Game.tileSheet.addEventListener('load', eventSheetLoaded, false);

function eventSheetLoaded() {
  // Global variables
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");

  Game.start();
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawText(text, font, color, align, x, y) {
  context.fillStyle = color;
  context.font = font;
  context.textAlign = align;
  context.fillText(text, x, y);
}

//-----------------
// Game methods
//-----------------
Game.start = function() {
  this.wake();
  this.isOver = false;
  this.maxWidth = canvas.width - 32;
  this.maxHeight = canvas.height - 32;
  this.player.setup();
  this.enemy.setup();
  this.bullet.setup();
  this.loop();
};

Game.stop = function() {
  this.isOver = true;
};

Game.sleep = function() {
  this.isSleep = true;
};

Game.wake = function() {
  this.isSleep = false;
};

Game.drawGameOver = function() {
// function drawText(text, font, color, align, x, y) {
  var fontType = 'sans-serif';
  var font = (canvas.height / 15) + 'px ' + fontType;
  var color = '#FFF';
  var align = 'center';
  var x = canvas.width/2;
  var y = canvas.height/2;

  drawText('GAME OVER', font, color, align, x, y);

  font = (canvas.height / 25) + 'px ' + fontType;
  x = canvas.width/2;
  y = canvas.height/2 + 40;

  drawText('(Press spacebar to play again)', font, color, align, x, y);
};

Game.drawBackground = function() {
  context.fillStyle = this.backgroundColor;
  context.fillRect(0, 0, 600, 400);
};

Game.isCollision = function(object1, object2, widthPad, heightPad) {
  if ((object1.x >= object2.x-widthPad) && (object1.x <= object2.x+widthPad) &&
      (object1.y >= object2.y-heightPad) && (object1.y <= object2.y+heightPad)) {
    return true;
  }
  else {
    return false;
  }
};

Game.draw = function() {
  if (Game.isOver) {
    this.drawExplosion(Game.player);
    this.drawGameOver();
    this.sleep();
  }
  else {
    this.drawBackground();
    this.bullet.draw();
    this.drawFrame(this.player, 0);
    this.drawFrame(this.enemy, 1);
    this.drawScore(Game.player);
  }
};

Game.update = function() {
  this.player.move();
  this.enemy.move();
  if (this.isCollision(this.player, this.enemy, 25, 25)) {
    this.stop();
  }
  else if (Game.player.isOverObject(Game.bullet, 15, 20)) {
    this.player.score += Game.bullet.pointsValue;
    this.bullet.placeRandom();
  }
};

Game.drawFrame = function(objectToDraw, rowMinimum) {
  var rotation;
  switch (objectToDraw.current_direction) {
    case "up":
      rotation = 0;
      break;
    case "right":
      rotation = 90;
      break;
    case "down":
      rotation = 180;
      break;
    case "left":
      rotation = 270;
      break;
  }
  context.save();
  context.setTransform(1,0,0,1,0,0);
  var angleInRadians = rotation * Math.PI / 180;
  context.translate(objectToDraw.x + 16, objectToDraw.y + 16);
  context.rotate(angleInRadians);
  var sourceX = Math.floor(Game.animationFrames[objectToDraw.frameIndex] % 8) *32;
  var sourceY = (Math.floor(Game.animationFrames[objectToDraw.frameIndex] / 8)+rowMinimum) *32;

  context.drawImage(Game.tileSheet, sourceX, sourceY, 32, 32, -16, -16, 32, 32);
  context.restore();

  objectToDraw.frameIndex++;
  if (objectToDraw.frameIndex == Game.animationFrames.length) {
     objectToDraw.frameIndex = 0;
  }
};


Game.drawScore = function (object) {
  context.fillStyle = '#FFF';
  context.font = (canvas.height / 30) + 'px sans-serif';
  context.textAlign = 'left';
  context.fillText('SCORE: ' + object.score, 10, 20);
};

Game.atWallTop = function(object) {
  return (object.y <= 0) ? true : false;
};

Game.atWallBottom = function(object) {
  return (object.y >= canvas.height-32) ? true : false;
};

Game.atWallRight = function(object) {
  return (object.x >= canvas.width-32) ? true : false;
};

Game.atWallLeft = function(object) {
  return (object.x <= 0) ? true : false;
};

Game.drawExplosion = function(object) {
  var sourceX = 32 * Game.explosionFrames[object.explosionIndex];
  var sourceY = 2 * 32;
  context.drawImage(Game.tileSheet, sourceX, sourceY, 32, 32, object.x, object.y, 32, 32);
  if (object.explosionIndex < Game.explosionFrames.length)
    object.explosionIndex++;
};

KEYS = {
  up: [38],
  down: [40],
  left: [37],
  right: [39],
  spacebar: [32]
};

Game.handleKeyDown = function(e) {
  var lastKey = KEYS.getKey(e.keyCode);
  if (['up', 'down', 'left', 'right'].indexOf(lastKey) >= 0) {
    Game.player.current_direction = lastKey;
  }
  else if (lastKey == 'spacebar') {
    Game.start();
  }
};

//-----------------------
// Game.player methods
//-----------------------
Game.player.setup = function() {
  this.x = canvas.width/4;
  this.y = (canvas.height/4) * 3;
  this.current_direction = "up";
  this.frameIndex = 0;
  this.explosionIndex = 0;
  this.score = 0;
};



Game.player.isOverObject = function(bullet, widthPad, heightPad) {
  if ((this.x >= bullet.x-widthPad) && (this.x <= bullet.x+widthPad) &&
      (this.y >= bullet.y-heightPad) && (this.y <= bullet.y+heightPad)) {
    return true;
  }
  else {
    return false;
  }
};

Game.player.move = function() {
  switch(Game.player.current_direction) {
    case "up":
      if (!Game.atWallTop(this))
        this.y -= Game.pixelsPerMove;
      break;
    case "right":
      if (!Game.atWallRight(this))
        this.x += Game.pixelsPerMove;
      break;
    case "down":
      if (!Game.atWallBottom(this))
        this.y += Game.pixelsPerMove;
      break;
    case "left":
      if (!Game.atWallLeft(this))
        this.x -= Game.pixelsPerMove;
      break;
  }
};

//-----------------------
// Game.enemy methods
//-----------------------
Game.enemy.setup = function() {
  this.x = (canvas.width/4) * 3;
  this.y = canvas.height/4;
  this.current_direction = "down";
  this.frameIndex = 0;
};

Game.enemy.move = function() {
  // stupid AI: 80% go in current direction, 20% close distance to player
  var decision = getRandomInt(0, 100);
  if (decision >= 20) {
    if (this.current_direction == "up")
      this.y -= 1;
    else if (this.current_direction == "right")
      this.x += 1;
    else if (this.current_direction == "down")
      this.y += 1;
    else
      this.x -= 1;
  }
  else {
    xDistance = this.x - Game.player.x;
    yDistance = this.y - Game.player.y;
    if (Math.abs(xDistance) > Math.abs(yDistance)) {
      if (xDistance > 0) {
        this.x -= Game.pixelsPerMove;
        this.current_direction = "left";
      }
      else {
        this.x += Game.pixelsPerMove;
        this.current_direction = "right";
      }
    }
    else {
      if (yDistance > 0) {
        this.y -= Game.pixelsPerMove;
        this.current_direction = "up";
      }
      else {
        this.y += Game.pixelsPerMove;
        this.current_direction = "down";
      }
    }
  }
};

//-----------------------
// Game.bullet methods
//-----------------------
Game.bullet.setup = function() {
  this.placeRandom();
};

Game.bullet.placeRandom = function() {
  this.x = getRandomInt(1, Game.maxWidth);
  this.y = getRandomInt(1, Game.maxHeight);
};

Game.bullet.draw = function() {
  var sourceX = 4*32;
  var sourceY = 2*32;
  context.drawImage(Game.tileSheet, sourceX, sourceY, 32, 32, this.x, this.y, 32, 32);
};



addEventListener("keydown", Game.handleKeyDown, false);

Object.prototype.getKey = function(value){
  for(var key in this){
    if(this[key] instanceof Array && this[key].indexOf(value) >= 0){
      return key;
    }
  }
  return null;
};



Game.loop = function() {
  if (!Game.isSleep) {
    Game.update();
    Game.draw();
  }
};

window.setInterval(Game.loop, 100);
