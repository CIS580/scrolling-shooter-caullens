"use strict";

/**
 * @module PowerUp
 * A class representing a PowerUp
 */
module.exports = exports = PowerUp;

/**
 * @constructor PowerUp
 * Creates a PowerUp
 */
function PowerUp(pos) {
  this.position = pos;
  this.image = new Image();
  this.image.src = encodeURI('assets/power-up.png');
}

/**
 * @function update
 * Updates the PowerUp
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {Input} input object defining input, must have
 * boolean properties: up, left, right, down
 */
PowerUp.prototype.update = function(elapsedTime) {
 
}

/**
 * @function render
 * Renders the PowerUp helicopter in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
PowerUp.prototype.render = function(elapsedTime, ctx) {
  ctx.save();
  ctx.translate(this.position.x, this.position.y);
  ctx.drawImage(this.image,0,0);
  ctx.restore();
}

PowerUp.prototype.collidedWith = function(entity) {
    if(entity instanceof Player) {

    }
}