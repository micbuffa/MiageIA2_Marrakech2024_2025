// Path Following (Complex Path)
// The Nature of Code
// The Coding Train / Daniel Shiffman
// https://youtu.be/LrnR6dc2IfM
// https://thecodingtrain.com/learning/nature-of-code/5.7-path-following.html

// Path Following: https://editor.p5js.org/codingtrain/sketches/dqM054vBV
// Complex Path: https://editor.p5js.org/codingtrain/sketches/2FFzvxwVt

// Path Following
// Vehicle class

class Vehicle {
    static debug = false;

  // Constructor initialize all values
  constructor(x, y, ms, mf, image) {
    this.pos = createVector(x, y);
    this.r = 12;
    this.maxSpeed = ms;
    this.maxForce = mf;
    this.acc = createVector(0, 0);
    this.vel = createVector(this.maxSpeed, 0);
    this.color = "black";
    this.image = image;

    // Poids par défaut des différents comportements
    this.wanderWeight = 0;
    this.followPathWeight = 2;
    this.separateWeight = 3;

     // pour comportement wander
     this.distanceCercle = 250;
     this.wanderRadius = 60;
     this.wanderTheta = PI/2;
     this.displaceRange = random(-0.3, 0.3);
 
     // trainée derrière les véhicules
     this.pathMaxLength = 20;
     this.path = [];
  }

  // Implémente deux comportements : suivi de chemin complexe et séparation
  // que l'on verra plus tard
  applyBehaviors(vehicles, path) {
    // Suivi de chemin, le résultat est la force f
    let f = this.follow(path);
    // separation des autres véhicules, le resultat est la force s
    let s = this.separate(vehicles);
    let w = this.wander();

    // On fait une somme pondérée des deux forces
    f.mult(this.followPathWeight);
    s.mult(this.separateWeight); // essayez zéro ici !!!!
    w.mult(this.wanderWeight);

    // On applique les forces au véhicule
    this.applyForce(f);
    this.applyForce(s);
    this.applyForce(w);
  }

  applyForce(force) {
    // On pourrait ajouter une masse au véhicule ici, rappel : 
    // somme des forces = masse * accélération, d'où accélération = somme des forces / masse
    // il suffirait de diviser la force par une masse. On a choisi de ne pas le faire ici
    // et de supposer une masse de 1. 
    // A = F / M
    this.acc.add(force);
  }

  // Main "run" function
  run() {
    this.update();
    this.render();
  }

  // This function implements Craig Reynolds' path following algorithm
  // http://www.red3d.com/cwr/steer/PathFollow.html
  follow(path) {
    // Position du véhicule dans 25 frames
    let predict = this.vel.copy();
    predict.normalize();
    predict.mult(25);
    let predictpos = p5.Vector.add(this.pos, predict);

    // On cherche la projection sur le chemin.
    // Comme le chemin est composé de plusieurs segments, 
    // on cherche la projection sur chaque segment
    // et on gardera la plus proche comme étant la bonne

    let normal = null;
    let target = null;
    let worldRecord = 1000000; // distance max difficile à battre :-) 
    // (on cherche la plus petite distance)

    // On parcourt les points du chemin
    for (let i = 0; i < path.points.length; i++) {
      // segment courant a
      // segment suivant b, si a est le dernier segment, 
      // b devient le premier segment
      let a = path.points[i];
      let b = path.points[(i + 1) % path.points.length]; // le chemin boucle. On utilise un modulo

      // Calcul du point projecté sur le segment
      let normalPoint = findProjection(predictpos, a, b);

      // Cas particulier où le point est en dehors du segment
      // dir = le vecteur qui correspond au segment
      let dir = p5.Vector.sub(b, a);
      // si c'est le cas, on prendra le point b comme point normal
      //if (da + db > line.mag()+1) {
      if (
        normalPoint.x < min(a.x, b.x) ||
        normalPoint.x > max(a.x, b.x) ||
        normalPoint.y < min(a.y, b.y) ||
        normalPoint.y > max(a.y, b.y)
      ) {
        normalPoint = b.copy();
        // Si on est vraiment à la fin, alors on prend a et b du segment suivant
        a = path.points[(i + 1) % path.points.length];
        b = path.points[(i + 2) % path.points.length];
        dir = p5.Vector.sub(b, a);
      }

      // A quelle distance est le point prédit du chemin, est-il sur la route ?
      let d = p5.Vector.dist(predictpos, normalPoint);
      // Est-ce que d est vraiment le plus petit, rappellez-vous qu'on calcule d pour tous les segments
      if (d < worldRecord) {
        // oui, d est plus petit que la précédente distance mesurée,
        // on garde ce point comme étant le plus proche du chemin
        worldRecord = d;
        normal = normalPoint;

        // On va regarder un peu plus loin devant le point projeté sur le segment
        // On normalise le vecteur directeur du segment, et on lui donne une longueur de 25
        // et on ajoute ce vecteur au point projeté
        dir.normalize();
        // ce 25 pourrait changer en fonction de la vitesse du véhicule, plus il va vite, plus on regarde loin
        dir.mult(25);
        // On ajoute ce vecteur au point projeté pour avoir un point plus loin sur le segment
        target = normal.copy();
        target.add(dir);
      }
    }

    // dessin des infos de debug
    if (debug) {
      // future position devant le vaisseau
      stroke(0);
      fill(0);
      line(this.pos.x, this.pos.y, predictpos.x, predictpos.y);
      ellipse(predictpos.x, predictpos.y, 4, 4);

      // Point projeté
      stroke(0);
      fill(0);
      ellipse(normal.x, normal.y, 4, 4);
      // Cible que l'on cherche à atteindre (va de la position du vaisseau à la position projetée)
      line(predictpos.x, predictpos.y, target.x, target.y);

      if (worldRecord > path.radius) fill(255, 0, 0);
      noStroke();
      ellipse(target.x, target.y, 8, 8);
    }

    // Si la distance entre le point projeté et le point normal est plus grande que le rayon du chemin
    // alors on cherche à se rapprocher du point normal
    // sinon on renvoie un vecteur nul (force nulle, on continue dans la direction actuelle)
    if (worldRecord > path.radius) {
      return this.seek(target);
    } else {
      return createVector(0, 0);
    }
  }

  // Comportement Separation : on garde ses distances par rapport aux voisins
  // ON ETUDIERA CE COMPORTEMENT PLUS TARD !
  separate(boids) {
    let desiredseparation = this.r * 2;
    let steer = createVector(0, 0, 0);
    let count = 0;
    // On examine les autres boids pour voir s'ils sont trop près
    for (let i = 0; i < boids.length; i++) {
      let other = boids[i];
      let d = p5.Vector.dist(this.pos, other.pos);
      // Si la distance est supérieure à 0 et inférieure à une valeur arbitraire (0 quand on est soi-même)
      if (d > 0 && d < desiredseparation) {
        // Calculate vector pointing away from neighbor
        let diff = p5.Vector.sub(this.pos, other.pos);
        diff.normalize();
        diff.div(d); // poids en fonction de la distance. Plus le voisin est proche, plus le poids est grand
        steer.add(diff);
        count++; // On compte le nombre de voisins
      }
    }
    // On moyenne le vecteur steer en fonction du nombre de voisins
    if (count > 0) {
      steer.div(count);
    }

    // si la force de répulsion est supérieure à 0
    if (steer.mag() > 0) {
      // On implemente : Steering = Desired - Velocity
      steer.normalize();
      steer.mult(this.maxSpeed);
      steer.sub(this.vel);
      steer.limit(this.maxForce);
    }
    return steer;
  }

  wander() {
    // point devant le véhicule, centre du cercle
    let wanderPoint = this.vel.copy();
    wanderPoint.setMag(this.distanceCercle);
    wanderPoint.add(this.pos);

    if (Vehicle.debug) {
      // on le dessine sous la forme d'une petit cercle rouge
      fill(255, 0, 0);
      noStroke();
      circle(wanderPoint.x, wanderPoint.y, 8);

      // Cercle autour du point
      noFill();
      stroke(0);
      circle(wanderPoint.x, wanderPoint.y, this.wanderRadius * 2);

      // on dessine une ligne qui relie le vaisseau à ce point
      // c'est la ligne blanche en face du vaisseau
      line(this.pos.x, this.pos.y, wanderPoint.x, wanderPoint.y);
    }

    // On va s'occuper de calculer le point vert SUR LE CERCLE
    // il fait un angle wanderTheta avec le centre du cercle
    // l'angle final par rapport à l'axe des X c'est l'angle du vaisseau
    // + cet angle
    let theta = this.wanderTheta + this.vel.heading();

    let x = this.wanderRadius * cos(theta);
    let y = this.wanderRadius * sin(theta);

    // maintenant wanderPoint c'est un point sur le cercle
    wanderPoint.add(x, y);

    if (Vehicle.debug) {
      // on le dessine sous la forme d'un cercle vert
      fill(0, 255, 0);
      noStroke();
      circle(wanderPoint.x, wanderPoint.y, 16);

      // on dessine le vecteur desiredSpeed qui va du vaisseau au point vert
      stroke(0);
      line(this.pos.x, this.pos.y, wanderPoint.x, wanderPoint.y);
    }
    // On a donc la vitesse désirée que l'on cherche qui est le vecteur
    // allant du vaisseau au cercle vert. On le calcule :
    // ci-dessous, steer c'est la desiredSpeed directement !
    // Voir l'article de Craig Reynolds, Daniel Shiffman s'est trompé
    // dans sa vidéo, on ne calcule pas la formule classique
    // force = desiredSpeed - vitesseCourante, mais ici on a directement
    // force = desiredSpeed
    let steer = wanderPoint.sub(this.pos);

    steer.setMag(this.maxForce);
    

    // On déplace le point vert sur le cerlcle (en radians)
    this.wanderTheta += random(-this.displaceRange, this.displaceRange);

    return steer;
  }


  // Method to update position
  update() {
    // Update velocity
    this.vel.add(this.acc);
    // Limit speed
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    // Reset accelertion to 0 each cycle
    this.acc.mult(0);

    // on rajoute la position courante dans le tableau
    this.path.push(this.pos.copy());

    // si le tableau a plus de 50 éléments, on vire le plus ancien
    if(this.path.length > this.pathMaxLength) {
      this.path.shift();
    }
  }

  // A method that calculates and applies a steering force towards a target
  // STEER = DESIRED MINUS VELOCITY
  seek(target) {
    let desired = p5.Vector.sub(target, this.pos); // A vector pointing from the position to the target

    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.mult(this.maxSpeed);
    // Steering = Desired minus Vepositionity
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce); // Limit to maximum steering force

    return steer;
  }

  render() {
      // Simple boid is just a circle
      fill(this.color);
      stroke(0);
      push();
      translate(this.pos.x, this.pos.y);
      rotate(this.vel.heading() + Math.PI/2);
      //ellipse(0, 0, this.r, this.r);
      // on dessine this.image
      imageMode(CENTER);
      image(this.image, 0, 0, 32, 32);
      ellipse(0, 0, this.r, this.r);
      pop();
  }

  edges() {
    if (this.pos.x > width + this.r) {
      this.pos.x = -this.r;
    } else if (this.pos.x < -this.r) {
      this.pos.x = width + this.r;
    }
    if (this.pos.y > height + this.r) {
      this.pos.y = -this.r;
    } else if (this.pos.y < -this.r) {
      this.pos.y = height + this.r;
    }
  }
}

// A function to get the normal point from a point (p) to a line segment (a-b)
// This function could be optimized to make fewer new Vector objects
function findProjection(p, a, b) {
  // Vector from a to p
  let ap = p5.Vector.sub(p, a);
  // Vector from a to b
  let ab = p5.Vector.sub(b, a);
  ab.normalize(); // Normalize the line
  // Project vector "diff" onto line by using the dot product
  ab.mult(ap.dot(ab));
  let normalPoint = p5.Vector.add(a, ab);
  return normalPoint;
}
