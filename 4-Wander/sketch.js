let imageFusee;
let vehicle;
// un tableau pour stocker les véhicules
let vehicles = [];

function preload() {
  // on charge une image de fusée pour le vaisseau
  imageFusee = loadImage('./assets/vehicule.png');
}

function setup() {
  createCanvas(1000, 800);
  vehicle = new Vehicle(100, 100, imageFusee);
}

// Fonction bien pratique pour créer un slider qui change une propriété précice de tous les véhicules
function creerUnSlider(label, min, max, val, step, posX, posY, propriete) {
  let slider = createSlider(min, max, val, step);

  let labelP = createP(label);
  labelP.position(posX, posY);
  labelP.style('color', 'white');

  slider.position(posX + 150, posY + 17);

  let valueSpan = createSpan(slider.value());
  valueSpan.position(posX + 300, posY + 17);
  valueSpan.style('color', 'white');
  valueSpan.html(slider.value());

  slider.input(() => {
    valueSpan.html(slider.value());
    vehicles.forEach(vehicle => {
      vehicle[propriete] = slider.value();
    });
  });
}

function creerSliderPourNombreDeVehicules(nbVehicles) {
  // un slider pour changer le nombre de véhicules
  // min, max, valeur, pas
  let nbVehiclesSlider = createSlider(1, 200, 10, 1);
  nbVehiclesSlider.position(160, 185);
  let nbVehiclesLabel = createP("Nb de véhicules : " + nbVehicles);
  nbVehiclesLabel.position(10, 170);
  nbVehiclesLabel.style('color', 'white');
  // écouteur
  nbVehiclesSlider.input(() => {
    // on efface les véhicules
    vehicles = [];
    // on en recrée
    for (let i = 0; i < nbVehiclesSlider.value(); i++) {
      let vehicle = new Vehicle(100, 100, imageFusee);
      vehicles.push(vehicle);
    }
    // on met à jour le label
    nbVehiclesLabel.html("Nb de véhicules : " + nbVehiclesSlider.value());
  });
}

function creerSliderPourLongueurCheminDerriereVehicules(l) {
  let slider = createSlider(10, 150, l, 1);
  slider.position(160, 162);
  let label = createP("Longueur trainée : " + l);
  label.position(10, 145);
  label.style('color', 'white');
  // écouteur
  slider.input(() => {
    label.html("Longueur trainée : " + slider.value());
    vehicles.forEach(vehicle => {
      vehicle.path = [];
      vehicle.pathLength = slider.value();
    });
  });
}


// appelée 60 fois par seconde
function draw() {
  background(0);
  //background(0, 0, 0, 20);

  vehicle.applyBehaviors();

  vehicle.update();
  vehicle.show();
  vehicle.edges();
}

function keyPressed() {
  if (key === 'd') {
    Vehicle.debug = !Vehicle.debug;
  }
}
