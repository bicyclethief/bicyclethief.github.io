
var Game = {
  pixelsPerMove: 2,
  backgroundColor: "#aaaaaa",
  isOver: true,
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
  points: 10
};

// sprite sheet
Game.tileSheet = new Image();
Game.tileSheet.src = "images/tanks_sheet.png";
// don't start game until sprite sheet is loaded
Game.tileSheet.addEventListener('load', eventSheetLoaded, false);

KEYS = {
  up: [38],
  down: [40],
  left: [37],
  right: [39]
};

function eventSheetLoaded() {
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");
  Game.start();
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//-----------------
// Game methods
//-----------------
Game.start = function() {
  this.isOver = false;
  this.maxWidth = canvas.width - 32;
  this.maxHeight = canvas.height - 32;
  this.drawBackground();
  this.player.setup();
  this.enemy.setup();
  this.bullet.setup();
  this.loop();
};

Game.stop = function() {
  this.isOver = true;
};

Game.drawGameOver = function() {
  context.fillStyle = '#FFF';
  context.font = (canvas.height / 15) + 'px sans-serif';
  context.textAlign = 'center';
  context.fillText('GAME OVER', canvas.width/2, canvas.height/2);
};

Game.drawBackground = function() {
  context.fillStyle = this.backgroundColor;
  context.fillRect(0, 0, 600, 400);
};

Game.draw = function() {
  this.drawBackground();
  this.bullet.draw();
  this.player.draw();
  this.enemy.draw();
};

Game.isCollision = function() {
  if ((this.player.x >= Game.enemy.x-25) && (this.player.x <= Game.enemy.x+25) &&
      (this.player.y >= Game.enemy.y-25) && (this.player.y <= Game.enemy.y+25)) {
    return true;
  }
  else {
    return false;
  }
};

Game.update = function() {
  Game.player.move();
  Game.enemy.move();
  if (Game.isCollision()) {
    Game.stop();
  }
  else if (Game.player.onBullet()) {
    Game.player.score += Game.bullet.points;
    Game.bullet.place();
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

Game.handleKeyDown = function(e) {
  var lastKey = KEYS.getKey(e.keyCode);
  if (['up', 'down', 'left', 'right'].indexOf(lastKey) >= 0) {
    Game.player.current_direction = lastKey;
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

Game.player.draw = function() {
  var rotation;
  switch (this.current_direction) {
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
  context.translate(this.x + 16, this.y + 16);
  context.rotate(angleInRadians);
  var sourceX = Math.floor(Game.animationFrames[this.frameIndex] % 8) *32;
  var sourceY = Math.floor(Game.animationFrames[this.frameIndex] / 8) *32;

  if (sourceX == 0 && sourceY == 32)
    console.log("BLUE tank!!");

  context.drawImage(Game.tileSheet, sourceX, sourceY, 32, 32, -16, -16, 32, 32);
  context.restore();

  this.frameIndex++;
  if (this.frameIndex == Game.animationFrames.length) {
     this.frameIndex = 0;
  }
};

Game.player.onBullet = function() {
  if ((this.x >= Game.bullet.x-15) && (this.x <= Game.bullet.x+15) &&
      (this.y >= Game.bullet.y-20) && (this.y <= Game.bullet.y+20)) {
    return true;
  }
  else {
    return false;
  }
};

Game.player.move = function() {
  switch(Game.player.current_direction) {
    case "up":
      if (!Game.atWallTop(Game.player))
        this.y -= Game.pixelsPerMove;
      break;
    case "right":
      if (!Game.atWallRight(Game.player))
        this.x += Game.pixelsPerMove;
      break;
    case "down":
      if (!Game.atWallBottom(Game.player))
        this.y += Game.pixelsPerMove;
      break;
    case "left":
      if (!Game.atWallLeft(Game.player))
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

Game.enemy.draw = function() {
  var rotation;
  switch (this.current_direction) {
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
  context.translate(this.x + 16, this.y + 16);
  context.rotate(angleInRadians);
  var sourceX = Math.floor(Game.animationFrames[this.frameIndex] % 8) *32;
  var sourceY = (Math.floor(Game.animationFrames[this.frameIndex] / 8)+1) *32;

  context.drawImage(Game.tileSheet, sourceX, sourceY, 32, 32, -16, -16, 32, 32);
  context.restore();

  this.frameIndex++;
  if (this.frameIndex == Game.animationFrames.length) {
     this.frameIndex = 0;
  }
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
  this.place();
};

Game.bullet.place = function() {
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
  if (!Game.isOver) {
    Game.update();
    Game.draw();
  }
  else {
    Game.drawExplosion(Game.player);
    Game.drawGameOver();
  }
  Game.drawScore(Game.player);
};

window.setInterval(Game.loop, 100);
