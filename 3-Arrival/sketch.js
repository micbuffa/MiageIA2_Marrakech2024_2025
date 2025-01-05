let target, vehicle;
let font;

// Appelée avant de démarrer l'animation, utile pour l'exercice avec text2points
function preload() {
  // en général on charge des images, des fontes de caractères etc.
  font = loadFont('./assets/inconsolata.otf');
}

function setup() {
  createCanvas(800, 800);

  target = createVector(0, 0);
  vehicle = new Vehicle(400, 400);
}



// appelée 60 fois par seconde
function draw() {
  // couleur pour effacer l'écran
  background(0);
  // pour effet psychedelique
  //background(0, 0, 0, 10);

  // Cible qui suit la souris, cercle rouge de rayon 32
  target.x = mouseX;
  target.y = mouseY;

  // dessin de la cible en rouge
  fill(255, 0, 0);
  noStroke();
  ellipse(target.x, target.y, 32);

  vehicle.applyBehaviors(target);
  vehicle.update();
  vehicle.show();
}

function keyPressed() {
  if (key === 'd') {
    Vehicle.debug = !Vehicle.debug;
  }
}