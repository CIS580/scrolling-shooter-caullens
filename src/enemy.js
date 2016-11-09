"use strict";

/* Classes and Libraries */
const Vector = require('./vector');
const Missile = require('./missile_pool');
const ExplodeParticles = require('./explode-particles');

/* Constants */
const ENEMY_SPEED = 1;
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
function Enemy(player, pos, bullets) {
  this.player = player;
  this.position = pos;
  this.bullets = bullets;
  this.angle = 0;
  var sign = 1;
  if(Math.random() < 0.5) sign = -1;
  this.velocity = {x: ENEMY_SPEED, y: ENEMY_SPEED};
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
            self.image.src = encodeURI('assets/tempEnemy.png');
            break;
        case 2:
            self.image.src = encodeURI('assets/tempEnemy1.png');
            break;
        case 3:
            self.image.src = encodeURI('assets/tempEnemy2.png');
            break;
        case 4:
            self.image.src = encodeURI('assets/tempEnemy3.png');
            break;
        case 5:
            self.image.src = encodeURI('assets/tempEnemy4.png');
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
Enemy.prototype.update = function(elapsedTime) {
  var dx = this.player.position.x - this.position.x;
  var dy = this.player.position.y - this.position.y;
  var angle = Math.atan2(dy,dx);
  if(this.player.position.x - 12 > this.position.x) {
      this.position.x += this.velocity.x*Math.sin(angle);
  }
  if(this.player.position.x - 12< this.position.x) {
      this.position.x -= this.velocity.x*Math.sin(angle);
  }
  this.position.y -= this.velocity.y;

  if(elapsedTime % 1000 == 0) this.fireBullet({x: 0, y: 1});
}

/**
 * @function render
 * Renders the Enemy helicopter in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Enemy.prototype.render = function(elapsedTime, ctx) {
  ctx.save();
  ctx.translate(this.position.x, this.position.y);
  ctx.drawImage(this.image,0,0);
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

Enemy.prototype.collidedWith = function(entity) {
}