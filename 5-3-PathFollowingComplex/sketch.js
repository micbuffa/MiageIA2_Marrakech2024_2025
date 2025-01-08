// Path Following (Complex Path)
// The Nature of Code
// The Coding Train / Daniel Shiffman
// https://youtu.be/LrnR6dc2IfM
// https://thecodingtrain.com/learning/nature-of-code/5.7-path-following.html

// Path Following: https://editor.p5js.org/codingtrain/sketches/dqM054vBV
// Complex Path: https://editor.p5js.org/codingtrain/sketches/2FFzvxwVt

// Crowd Path Following
// Via Reynolds: http://www.red3d.com/cwr/steer/CrowdPath.html

// Pour debug on/off affichage des lignes etc.
let debug = false;
let voitureImg;
// le chemin
let path;

// Tableau des véhicules
let vehicles = [];

function preload() {
  // On charge les images
  voitureImg = loadImage("assets/voiture.webp");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // la fonction suivante créer un chemin composé de plusieurs points
  newPath();

  // On crée n véhicules placés aléatoirement sur le canvas
  const nbVehicules = 1;

  for (let i = 0; i < nbVehicules; i++) {
    newVehicle(random(width), random(height));
  }
  createP(
    "Appuyez sur 'd' pour afficher les infos de debug.<br/>Click souris pour générer de nouveaux véhicules."
  ); 
}

function draw() {
  background(240);
  // Affichage du chemin
  path.display();

  for (let v of vehicles) {
    // On applique les comportements pour suivre le chemin
    v.applyBehaviors(vehicles, path);
    v.edges();
    // on a regroupé update, draw etc. dans une méthode run (update, borders, display, etc.)
    v.run();
  }
}

function newPath() {
  // Simple suite de points partant de 30, 30 et allant vers 30, height - 30 etc.
  
  path = new Path();
  let offset = 100;
  path.addPoint(offset, offset);
  path.addPoint(300, 180);
  path.addPoint(width - offset, offset);
  path.addPoint(width - offset, height - offset);
  path.addPoint(width / 2, height - offset * 3);
  path.addPoint(200,550);
  path.addPoint(offset, height - offset);
  

  /*
  path = new Path();
  let offset = 100;
  path.addPoint(offset, offset);
  path.addPoint(width -offset, offset);
  path.addPoint(300, 300);
  */
}

function newVehicle(x, y) {
  let maxSpeed = random(2, 4);
  let maxForce = 0.3;
  let v = new Vehicle(x, y, maxSpeed, maxForce, voitureImg);
  vehicles.push(v);
  return v;
}

function keyPressed() {
  if (key == "d") {
    debug = !debug;
    Vehicle.debug = !debug;
  } else if(key == "s") {
    // On crée à la position de la souris un véhicule rapide rouge
    let v = new Vehicle(mouseX, mouseY, 10, 0.25, voitureImg);
    v.color = "red";
    vehicles.push(v);
  } else if (key == "w") {
    // On crée un véhicule wander
    let v = new Vehicle(mouseX, mouseY, 3, 0.25, voitureImg);
    v.color = "lightgreen";
    v.r = 50;
    v.wanderWeight = 1;
    v.followPathWeight = 0;
    v.separateWeight = 0.2;
    vehicles.push(v);
  }
}

function mouseDragged() {
  newVehicle(mouseX, mouseY);
}
