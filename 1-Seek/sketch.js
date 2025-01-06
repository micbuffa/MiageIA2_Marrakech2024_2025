let target, vehicle;
let vehicles = [];

// la fonction setup est appelée une fois au démarrage du programme par p5.js
function setup() {
  console.log("setup");
  // on crée un canvas de la taille de la fenêtre
  createCanvas(windowWidth, windowHeight);

  // on crée un vecteur pour stocker la position de la souris
  target = createVector(0, 0);

  // on crée un véhicule
  //vehicle = new Vehicle(400, 400);

  creerVehicles(10);

  // x, y, label, min, max, value, step, propriete à changer
  creerSlider(10, 10, "Vitesse Max", 0, 10, 6, 0.1, "maxSpeed");
  creerSlider(10, 40, "Force Max", 0, 1, 0.25, 0.01, "maxForce");

  // Un curseur pour changer le nombre de véhicules
  creerSliderNbVehicules(10, 70, "Nombre de véhicules", 1, 200, 10, 1);
  
}

function creerSlider(x, y, textLabel, min, max, value, step, propriete) {
  // On cree un slider pour changer la vitesse max des vehicules
  // on ajoute un label pour le slider
  let label = createP(textLabel + " : ");
  // couleur blanche
  label.style('color', 'white');
  // on le positionne avant le slider
  let labelX = x;
  let labelY = y;
  label.position(labelX, labelY);
  let slider = createSlider(min, max, value, step);
  slider.position(labelX + 150, labelY + 18);
  // On affiche la valeur du slider à droite du slider
  let sliderValue = createP(slider.value());
  // couleur blanche
  sliderValue.style('color', 'white');
  sliderValue.position(labelX + 300, labelY+2);
  // on ajoute un écouteur sur le slider
  slider.input(() => {
    // on met à jour la valeur du label
    sliderValue.html(slider.value());
    // on met à jour la vitesse max des véhicules
    vehicles.forEach(vehicle => {
      vehicle[propriete] = slider.value();
    });
  });
}

function creerSliderNbVehicules(x, y, textLabel, min, max, value, step) {
  // On cree un slider pour changer la vitesse max des vehicules
  // on ajoute un label pour le slider
  let label = createP(textLabel + " : ");
  // couleur blanche
  label.style('color', 'white');
  // on le positionne avant le slider
  let labelX = x;
  let labelY = y;
  label.position(labelX, labelY);
  let slider = createSlider(min, max, value, step);
  slider.position(labelX + 150, labelY + 18);
  // On affiche la valeur du slider à droite du slider
  let sliderValue = createP(slider.value());
  // couleur blanche
  sliderValue.style('color', 'white');
  sliderValue.position(labelX + 300, labelY+2);

  slider.input(() => {
    // on met à jour la valeur du label
    sliderValue.html(slider.value());
    
    // On remet à 0 le tableau des vehicules
    vehicles = [];
    //... et on en recrée
    creerVehicles(slider.value());
  });
}

function creerVehicles(nbVehicules) {
  for (let i = 0; i < nbVehicules; i++) {
    vehicles.push(new Vehicle(random(width), random(height)));
    // on met une valeur randoml pour la vitesse max
    vehicles[i].maxSpeed = random(0.5, 6);
    // idem pour la force max
    vehicles[i].maxForce = random(0.1, 2);
  }
}

// la fonction draw est appelée en boucle par p5.js, 60 fois par seconde par défaut
// Le canvas est effacé automatiquement avant chaque appel à draw
function draw() {
  // On efface le canvas avec un fond noir, params = couleurs
  background("black");

  // A partir de maintenant toutes les formes pleines seront en rouge
  fill("red");
  // pas de contours pour les formes.
  // epaisseur du trait par défaut 1px;
  stroke("white")

  // mouseX et mouseY sont des variables globales de p5.js, elles correspondent à la position de la souris
  // on les stocke dans un vecteur pour pouvoir les utiliser avec la méthode seek (un peu plus loin)
  // du vehicule

  target.x = mouseX;
  target.y = mouseY;

  // Dessine un cercle de rayon 32px à la position de la souris
  // la couleur de remplissage est rouge car on a appelé fill(255, 0, 0) plus haut
  // pas de contours car on a appelé noStroke() plus haut
  // x, y, diametre (et pas rayon)
  circle(target.x, target.y, 32);


  vehicles.forEach(vehicle => {
    // je déplace et dessine le véhicule courant
    vehicle.applyBehaviors(target);
    vehicle.update();
    vehicle.edges();
    vehicle.show();

    // si le véhicule est arrivé près de la cible, on le fait 
    // reaparaitre à un endroit aléatoire
    let distance = p5.Vector.dist(vehicle.pos, target);
    if(distance < 32) {
      vehicle.pos.x = random(width);
      vehicle.pos.y = random(height);
    }
  });
}
