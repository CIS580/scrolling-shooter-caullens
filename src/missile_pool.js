"use strict";

/**
 * @module MissilePool
 * A class for managing missiles in-game
 * We use a Float32Array to hold our missle info,
 * as this creates a single memory buffer we can
 * iterate over, minimizing cache misses.
 * Values stored are: positionX, positionY, velocityX,
 * velocityY in that order.
 */
module.exports = exports = MissilePool;

var image = new Image();
image.src = encodeURI('assets/missile.png');

/**
 * @constructor MissilePool
 * Creates a MissilePool of the specified size
 * @param {uint} size the maximum number of bullets to exits concurrently
 */
function MissilePool(maxSize) {
  this.pool = new Float32Array(4 * maxSize);
  this.end = 0;
  this.max = maxSize;
}

/**
 * @function add
 * Adds a new missile to the end of the MissilePool.
 * If there is no room left, no missile is created.
 * @param {Vector} position where the missile begins
 * @param {Vector} velocity the missile's velocity
*/
MissilePool.prototype.add = function(position, velocity) {
  if(this.end < this.max) {
    this.pool[4*this.end] = position.x;
    this.pool[4*this.end+1] = position.y;
    this.pool[4*this.end+2] = velocity.x;
    this.pool[4*this.end+3] = velocity.y;
    this.end++;
  }
}

/**
 * @function update
 * Updates the missile using its stored velocity, and
 * calls the callback function passing the transformed
 * missile.  If the callback returns true, the missile is
 * removed from the pool.
 * Removed missiles are replaced with the last missile's values
 * and the size of the missile array is reduced, keeping
 * all live missiles at the front of the array.
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {function} callback called with the missile's position,
 * if the return value is true, the missile is removed from the pool
 */
MissilePool.prototype.update = function(elapsedTime, callback) {
  for(var i = 0; i < this.end; i++){
    // Move the missile
    this.pool[4*i] += this.pool[4*i+2];
    this.pool[4*i+1] += this.pool[4*i+3];
    // If a callback was supplied, call it
    if(callback && callback({
      x: this.pool[4*i],
      y: this.pool[4*i+1]
    })) {
      // Swap the current and last missile if we
      // need to remove the current missile
      this.pool[4*i] = this.pool[4*(this.end-1)];
      this.pool[4*i+1] = this.pool[4*(this.end-1)+1];
      this.pool[4*i+2] = this.pool[4*(this.end-1)+2];
      this.pool[4*i+3] = this.pool[4*(this.end-1)+3];
      // Reduce the total number of missiles by 1
      this.end--;
      // Reduce our iterator by 1 so that we update the
      // freshly swapped missile.
      i--;
    }
  }
}

/**
 * @function render
 * Renders all missiles in our array.
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
MissilePool.prototype.render = function(elapsedTime, ctx) {
  // Render the missiles as a single path
  ctx.save();
  ctx.beginPath();
  for(var i = 0; i < this.end; i++) {
    ctx.moveTo(this.pool[4*i], this.pool[4*i+1]);
    ctx.drawImage(image, this.pool[4*i], this.pool[4*i+1], 64, 64);
  }
  ctx.fill();
  ctx.restore();
}