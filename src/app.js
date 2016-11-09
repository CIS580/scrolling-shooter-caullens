"use strict";

/* Classes and Libraries */
const Game = require('./game');
const Vector = require('./vector');
const Camera = require('./camera');
const Player = require('./player');
const Enemy = require('./enemy');
const BulletPool = require('./bullet_pool');
const Misisle = require('./missile');
const Tilemap = require('./Tilemap');
const CollisionManager = require('./collision-manager');


/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var input = {
  up: false,
  down: false,
  left: false,
  right: false
}
var bullets = new BulletPool(10);
var missiles = [];
var player = new Player(bullets, missiles);
var camera = new Camera(canvas);
var enemies = [];
var entities = [];
var hasPressed = false;
var OneBG = require('../assets/groundOne.json');
var Clouds = require('../assets/cloudsOne.json');
var TwoBG = require('../assets/groundTwo.json');
var ThreeBG = require('../assets/groundThree.json');

entities.push(player);

var tilemaps = [];

tilemaps.push(new Tilemap(OneBG, {
  onload: function() {
    checkLoaded();
  }
}));

tilemaps.push(new Tilemap(TwoBG, {
  onload: function() {
    checkLoaded();
  }
}));

tilemaps.push(new Tilemap(ThreeBG, {
  onload: function() {
    checkLoaded();
  }
}));

tilemaps.push(new Tilemap(Clouds, {
  onload: function() {
    checkLoaded();
  }
}));

var toLoad = 4;
function checkLoaded() {
  toLoad--;
  if(toLoad == 0) {
    masterLoop(performance.now());
  }
}

/**
 * @function onkeydown
 * Handles keydown events
 */
window.onkeydown = function(event) {
  switch(event.key) {
    case "ArrowUp":
    case "w":
      input.up = true;
      event.preventDefault();
      break;
    case "ArrowDown":
    case "s":
      input.down = true;
      event.preventDefault();
      break;
    case "ArrowLeft":
    case "a":
      input.left = true;
      event.preventDefault();
      break;
    case "ArrowRight":
    case "d":
      input.right = true;
      event.preventDefault();
      break;
    case "p":
      game.pause(!game.paused);
      event.preventDefault();
      break;
    case " ":
      if(!hasPressed && player.weapon == "Gun") {
        bullets.add(player.position, {x: 0, y: 5});
        hasPressed = true;
      }
      event.preventDefault();
      break;
    case "e":
      if(player.missileCount > 0)
        missiles.add(player.position, {x: 0, y: 5});
  }
}

/**
 * @function onkeyup
 * Handles keydown events
 */
window.onkeyup = function(event) {
  switch(event.key) {
    case "ArrowUp":
    case "w":
      input.up = false;
      event.preventDefault();
      break;
    case "ArrowDown":
    case "s":
      input.down = false;
      event.preventDefault();
      break;
    case "ArrowLeft":
    case "a":
      input.left = false;
      event.preventDefault();
      break;
    case "ArrowRight":
    case "d":
      input.right = false;
      event.preventDefault();
      break;
    case " ":
      hasPressed = false;
      event.preventDefault();
      break;
  }
}

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}

/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {

  // update the player
  player.update(elapsedTime, input);

  // update the camera
  camera.update(player.position);

  // Update bullets
  bullets.update(elapsedTime, function(bullet){
    if(!camera.onScreen(bullet)) return true;
    return false;
  });

  // Update missiles
  var markedForRemoval = [];
  missiles.forEach(function(missile, i){
    missile.update(elapsedTime);
    if(Math.abs(missile.position.x - camera.x) > camera.width * 2)
      markedForRemoval.unshift(i);
  });
  // Remove missiles that have gone off-screen
  markedForRemoval.forEach(function(index){
    missiles.splice(index, 1);
  });

  // spawn new enemy
  if(Math.floor(Math.random()*100) == 5 && enemies.length < 10) {
    console.log("Spawning enemy");
    var x = Math.floor(Math.random()*canvas.width);
    var y = player.position.y - 50 - Math.random()*50;
    var newEnemy = new Enemy(player, {x: x, y: y});
    enemies.push(newEnemy);
    entities.push(newEnemy);
  }

  // update enemies
  if(enemies.length > 0) {
    enemies.forEach(function(enemy) {
      enemy.update(elapsedTime);
    });
  }

  // check collisions
  CollisionManager.checkForCollision(entities);
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {

  ctx.fillStyle = 'black';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  if(player.level <= 3) {
    ctx.save();
    ctx.translate(0, -camera.y*0.3);
    tilemaps[player.level - 1].render(ctx);
    ctx.restore();

    ctx.save();
    ctx.translate(0, -camera.y);
    tilemaps[3].render(ctx);
    ctx.restore();
  } else {
    game.pause(true);
    ctx.fillStyle = 'white';
    ctx.font = '50px Segoe UI Light';
    ctx.fillText("gg",ctx.width/2,ctx.height/2);
  }
  
  // Transform the coordinate system using
  // the camera position BEFORE rendering
  // objects in the world - that way they
  // can be rendered in WORLD cooridnates
  // but appear in SCREEN coordinates
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  renderWorld(elapsedTime, ctx);
  ctx.restore();

  // Render the GUI without transforming the
  // coordinate system
  renderGUI(elapsedTime, ctx);
}

/**
  * @function renderWorld
  * Renders the entities in the game world
  * IN WORLD COORDINATES
  * @param {DOMHighResTimeStamp} elapsedTime
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function renderWorld(elapsedTime, ctx) {
    // Render the bullets
    bullets.render(elapsedTime, ctx);

    // Render the missiles
    missiles.forEach(function(missile) {
      missile.render(elapsedTime, ctx);
    });

    // Render the player
    if(player.level <= 3) {
      player.render(elapsedTime, ctx);
    }

    // Render the enemy
    if(player.level <= 3) {
      enemies.forEach(function(enemy) {
        enemy.render(elapsedTime, ctx);
      });
    }
}

/**
  * @function renderGUI
  * Renders the game's GUI IN SCREEN COORDINATES
  * @param {DOMHighResTimeStamp} elapsedTime
  * @param {CanvasRenderingContext2D} ctx
  */
function renderGUI(elapsedTime, ctx) {
  // TODO: Render the GUI
}
