"use strict";

/**
 * @module exports the Entity Manager class
 */
module.exports = exports = EntityManager;

/**
 * @constructor EntityManager
 * Creates a new EntityManager object
 */
function EntityManager() {
  this.entities = [];
}

EntityManager.prototype.addEntity = function(entity) {
  this.entities.push(entity);
}

EntityManager.prototype.destroyEntity = function(entity){
  var idx = this.entities.indexOf(entity);
  this.entities.splice(idx, 1);
}

EntityManager.prototype.reset = function() {
  this.entities = [];
}

EntityManager.prototype.update = function(elapsedTime) {
  var toBeDestroyed = [];
  var self = this;
  this.entities.forEach(function(entity){
    if(entity.retain()){
      entity.update(elapsedTime);
    }
    else{
      toBeDestroyed.push(entity);
    }
  });

  toBeDestroyed.forEach(function(entity){
    self.destroyEntity(entity);
  });

  this.entities.sort(function(a,b){return a.position.x - b.position.x});

  // The active list will hold all entities
  // we are currently considering for collisions
  var active = [];

  // The potentially colliding list will hold
  // all pairs of entities that overlap in the x-axis,
  // and therefore potentially collide
  var potentiallyColliding = [];

  // For each entity in the axis list, we consider it
  // in order
  this.entities.forEach(function(entity, aindex){
    // remove entities from the active list that are
    // too far away from our current entity to collide
    // The Array.prototype.filter() method will return
    // an array containing only elements for which the
    // provided function's return value was true
    active = active.filter(function(entityTwo){
      return entity.position.x - entityTwo.position.x  < entity.radius + entityTwo.radius;
    });
    // Since only enitites within colliding distance of
    // our current entity are left in the active list,
    // we pair them with the current entity and add
    // them to the potentiallyColliding array.
    active.forEach(function(entityTwo){
      potentiallyColliding.push({a: entityTwo, b: entity});
    });
    // Finally, we add our current ball to the active
    // array to consider it in the next pass down the
    // axisList
    active.push(entity);
  });

  // At this point we have a potentaillyColliding array
  // containing all pairs overlapping in the x-axis.  Now
  // we want to check for REAL collisions between these pairs.
  // We'll store those in our collisions array.
  var collisions = [];
  potentiallyColliding.forEach(function(pair){
    // Calculate the distance between entities; we'll keep
    // this as the squared distance, as we just need to
    // compare it to a distance equal to the radius of
    // both entities summed.  Squaring this second value
    // is less computationally expensive than taking
    // the square root to get the actual distance.
    // In fact, we can cheat a bit more and use a constant
    // for the sum of radii, as we know the radius of our
    // entities won't change.
    var distSquared =
      Math.pow(pair.a.position.x - pair.b.position.x, 2) +
      Math.pow(pair.a.position.y - pair.b.position.y, 2);
    if(distSquared < Math.pow(pair.a.radius + pair.b.radius, 2)) {
      // Push the colliding pair into our collisions array
      collisions.push(pair);
    }
  });

  collisions.forEach(function(pair){
    pair.a.collided(pair.b);
    pair.b.collided(pair.a);
  })
}

EntityManager.prototype.render = function(elapsedTime, ctx) {
  this.entities.forEach(function(entity){
    entity.render(elapsedTime, ctx);
  });
}