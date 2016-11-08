"use strict";

/* Classes and Libraries */
const Vector = require('./vector');
const Missile = require('./missile_pool');
const ExplodeParticles = require('./explode-particles');

/* Constants */
const ENEMY_SPEED = 5;
const BULLET_SPEED = 10;

/**
 * @module Enemy
 * A class representing a Enemy's ship
 */
module.exports = exports = Enemy;

/**
 * @constructor Enemy
 * Creates a Enemy
 * @param {EntityManager} entityManager The entity manager
 */
function Enemy(entityManager, player, pos) {
  this.em = entityManager;
  this.player = player;
  this.position = pos;
  this.angle = 0;
  this.velocity = {x: 0, y: 0};
  this.radius = 12;
  this.init();
}

Enemy.prototype.init = function() {
  determineEnemy(this);
  this.health = 10;
  this.maxHealth = 10;
  this.particles = new ExplodeParticles(700);
}

function determineEnemy(self) {
    var enemyNum = Math.floor(Math.random()*5);
    self.num = enemyNum;
    self.image = new Image();
    switch(enemyNum) {
        case 1:
            self.src = encodeURI();
            break;
        case 2:
            self.src = encodeURI();
            break;
        case 3:
            self.src = encodeURI();
            break;
        case 4:
            self.src = encodeURI();
            break;
        case 5:
            self.src = encodeURI();
            break;
    }
}

/**
 * @function update
 * Updates the Enemy based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {Input} input object defining input, must have
 * boolean properties: up, left, right, down
 */
Enemy.prototype.update = function(elapsedTime, input) {

  // set the velocity
  this.velocity.x = 0;
  if(input.left) this.velocity.x -= Enemy_SPEED;
  if(input.right) this.velocity.x += Enemy_SPEED;
  this.velocity.y = 0;
  if(input.up) this.velocity.y -= Enemy_SPEED / 2;
  if(input.down) this.velocity.y += Enemy_SPEED / 2;

  // determine Enemy angle
  this.angle = 0;
  if(this.velocity.x < 0) this.angle = -1;
  if(this.velocity.x > 0) this.angle = 1;

  // move the Enemy
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  this.position.y--;

  // don't let the Enemy move off-screen
  if(this.position.x < 0) this.position.x = 0;
  if(this.position.x > 384) this.position.x = 384;
  if(this.position.y > 3584) this.position.y = 3584;

  //see if Enemy has beaten level
  if(this.position.y < 200) {
    this.position = {x: 200, y: 3454};
    this.level++;
  }
}

/**
 * @function render
 * Renders the Enemy helicopter in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Enemy.prototype.render = function(elapasedTime, ctx) {
  var offset = this.angle * 23;
  ctx.save();
  ctx.translate(this.position.x, this.position.y);
  ctx.drawImage(this.img, 48+offset, 57, 23, 27, -12.5, -12, 23, 27);
  ctx.restore();
}

/**
 * @function fireBullet
 * Fires a bullet
 * @param {Vector} direction
 */
Enemy.prototype.fireBullet = function(direction) {
  var position = Vector.add(this.position, {x:30, y:30});
  var velocity = Vector.scale(Vector.normalize(direction), BULLET_SPEED);
  this.bullets.add(position, velocity);
}