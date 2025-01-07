class Vehicle {
  static debug = false;
  constructor(x, y, image) {
    this.pos = createVector(x, y);
    this.vel = createVector(1, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 4;
    this.maxForce = 0.2;
    this.r = 46;
    // sprite image du véhicule
    // on va la teinter avec une couleur aléatoire
    this.image = image;
    this.color = color(random(255), random(255), random(255));
    let coloredImage = createGraphics(this.image.width, this.image.height);
    coloredImage.tint(this.color);
    coloredImage.image(this.image, 0, 0);
    this.image = coloredImage;
    // Si pas de couleur this.image = image aurait suffit

    // pour comportement wander
    this.distanceCercle = 150;
    this.wanderRadius = 50;
    this.wanderTheta = 0.1;
    this.displaceRange = 0.3;

    // path following vehicle
    this.path = [];
    this.longueurChemin = 70;
    this.nbPointsIgnores = 3;
  }

  applyBehaviors() {
    let force = this.wander();
    this.applyForce(force);
  }

  wander() {
    // point devant le véhicule, centre du cercle
    let centreCercleDevant = this.vel.copy();
    centreCercleDevant.setMag(this.distanceCercle);
    centreCercleDevant.add(this.pos);

    if (Vehicle.debug) {
      // on le dessine sous la forme d'une petit cercle rouge
      fill("red");
      circle(centreCercleDevant.x, centreCercleDevant.y, 8);

      // Cercle autour du point
      noFill();
      stroke("white");
      circle(centreCercleDevant.x, centreCercleDevant.y, this.wanderRadius * 2);

      // on dessine une ligne qui relie le vaisseau à ce point
      // c'est la ligne blanche en face du vaisseau
      line(this.pos.x, this.pos.y, centreCercleDevant.x, centreCercleDevant.y);
    }

    // On va s'occuper de calculer le point vert SUR LE CERCLE
    // il fait un angle wanderTheta avec le centre du cercle
    // l'angle final par rapport à l'axe des X c'est l'angle du vaisseau
    // + cet angle

    // on calcule les coordonnées du point vert
    let angleVaisseau = this.vel.heading();
    let angle = this.wanderTheta + angleVaisseau;
    let pointSurCercle = createVector(this.wanderRadius * cos(angle), this.wanderRadius * sin(angle));

    // on ajoute la position du vaisseau
    pointSurCercle.add(centreCercleDevant);

    // maintenant pointSurCercle c'est un point sur le cercle
    // on le dessine sous la forme d'un cercle vert
    if (Vehicle.debug) {
      fill("lightGreen");
      circle(pointSurCercle.x, pointSurCercle.y, 8);

      // on dessine une ligne qui va du vaisseau vers le point sur le 
      // cercle
      line(this.pos.x, this.pos.y, pointSurCercle.x, pointSurCercle.y)
    }
    // on calcule le vecteur desiredSpeed qui va du vaisseau au point vert
    let desiredSpeed = p5.Vector.sub(pointSurCercle, this.pos);
    // Craig reynolds dit que ce vecteur, c'est DIRECTEMENT LA FORCE
    // C'est un cas particulier.
    let force = desiredSpeed;
    force.limit(this.maxForce);

    // On déplace le point vert sur le cercle (en radians)
    this.wanderTheta += random(-this.displaceRange, this.displaceRange);

    return force;
  }

  evade(vehicle) {
    let pursuit = this.pursue(vehicle);
    pursuit.mult(-1);
    return pursuit;
  }

  pursue(vehicle) {
    let target = vehicle.pos.copy();
    let prediction = vehicle.vel.copy();
    prediction.mult(10);
    target.add(prediction);
    fill(0, 255, 0);
    circle(target.x, target.y, 16);
    return this.seek(target);
  }

  arrive(target) {
    // 2nd argument true enables the arrival behavior
    return this.seek(target, true);
  }

  flee(target) {
    return this.seek(target).mult(-1);
  }

  seek(target, arrival = false) {
    let force = p5.Vector.sub(target, this.pos);
    let desiredSpeed = this.maxSpeed;
    if (arrival) {
      let slowRadius = 100;
      let distance = force.mag();
      if (distance < slowRadius) {
        desiredSpeed = map(distance, 0, slowRadius, 0, this.maxSpeed);
      }
    }
    force.setMag(desiredSpeed);
    force.sub(this.vel);
    force.limit(this.maxForce);
    return force;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);

    // path following
    this.path.push(this.pos.copy());

    let nb = this.path.length - this.longueurChemin;
    // on enlève au path les nb points en trop
    for (let i = 0; i < nb; i++) {
      this.path.shift();
    }
  }

  show() {
    // dessin du vaisseau avec image
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading() - PI / 2);
    imageMode(CENTER);
    // ajoute une teinte aléatoire
    //tint(random(255), random(255), random(255));
    image(this.image, 0, 0, this.r * 2, this.r * 2);
    pop();

    // Dessin du chemin derrière le vaisseau
    // On veut une opacité qui va de 0 à 255
    // 0 pour les premiers (plus vieux) points
    // 255 pour les derniers (plus récents) points
    // 0 = transparent, 255 = pas transparent du tout
    let opacite = 0;
    let incrementOpacite = 255 / this.longueurChemin;
    this.path.forEach((p, index) => {
      if (index % this.nbPointsIgnores == 0) {
        // decomposition de la couleur this.color en r, g, b
        let r = red(this.color);
        let g = green(this.color);
        let b = blue(this.color);
        fill(r, g, b, opacite);
        
        noStroke();
        circle(p.x, p.y, 4);
      }
      opacite += incrementOpacite;
    });
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
