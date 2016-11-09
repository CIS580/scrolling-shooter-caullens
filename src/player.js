"use strict";

/* Classes and Libraries */
const Vector = require('./vector');
const Missile = require('./missile_pool');
const ExplodeParticles = require('./explode-particles');

/* Constants */
const PLAYER_SPEED = 5;
const BULLET_SPEED = 10;

/**
 * @module Player
 * A class representing a player's ship
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a player
 */
function Player(bullets, missiles) {
  this.bullets = bullets;
  this.missiles = missiles;
  this.level = 1;
  this.angle = 0;
  this.lives = 3;
  this.velocity = {x: 0, y: 0};
  this.img = new Image();
  this.img.src = 'assets/tyrian.shp.007D3C.png';
  this.radius = 12;
  this.init();
}

Player.prototype.init = function() {
  this.state = "Flying";
  this.position = {x: 200, y: 3254};
  this.health = 100;
  this.maxHealth = 100;
  this.score = 0;
  this.weapon = "Gun";
  this.particles = new ExplodeParticles(700);
}

/**
 * @function update
 * Updates the player based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {Input} input object defining input, must have
 * boolean properties: up, left, right, down
 */
Player.prototype.update = function(elapsedTime, input) {

  // set the velocity
  this.velocity.x = 0;
  if(input.left) this.velocity.x -= PLAYER_SPEED;
  if(input.right) this.velocity.x += PLAYER_SPEED;
  this.velocity.y = 0;
  if(input.up) this.velocity.y -= PLAYER_SPEED / 2;
  if(input.down) this.velocity.y += PLAYER_SPEED / 2;

  // determine player angle
  this.angle = 0;
  if(this.velocity.x < 0) this.angle = -1;
  if(this.velocity.x > 0) this.angle = 1;

  // move the player
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  this.position.y--;

  // don't let the player move off-screen
  if(this.position.x < 0) this.position.x = 0;
  if(this.position.x > 384) this.position.x = 384;
  if(this.position.y > 3584) this.position.y = 3584;

  // see if player has beaten level
  if(this.position.y < 200) {
    this.init();
    this.level++;
  }
}

/**
 * @function render
 * Renders the player helicopter in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Player.prototype.render = function(elapasedTime, ctx) {
  if(this.state == "Flying") {
    var offset = this.angle * 23;
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.drawImage(this.img, 48+offset, 57, 23, 27, -12.5, -12, 23, 27);
    ctx.restore();
  }
}

/**
 * @function fireBullet
 * Fires a bullet
 * @param {Vector} direction
 */
Player.prototype.fireBullet = function(direction) {
  var position = Vector.add(this.position, {x:30, y:30});
  var velocity = Vector.scale(Vector.normalize(direction), BULLET_SPEED);
  this.bullets.add(position, velocity);
}

/**
 * @function fireMissile
 * Fires a missile, if the player still has missiles
 * to fire.
 */
Player.prototype.fireMissile = function() {
  if(this.missileCount > 0){
    var position = Vector.add(this.position, {x:0, y:30})
    var missile = new Missile(position);
    this.missiles.push(missile);
    this.missileCount--;
  }
}

Player.prototype.collidedWith = function(entity) {
  die(this);
}

function die(self) {
  self.state = "Dead";
  self.particles.emit(self.position.x,self.position.y);
  self.lives--;
  self.init();
}
