let target, vehicle;

// la fonction setup est appelée une fois au démarrage du programme par p5.js
function setup() {
  console.log("setup");
  // on crée un canvas de 800px par 800px
  createCanvas(800, 800);

  // on crée un vecteur pour stocker la position de la souris
  target = createVector(0, 0);

  // on crée un véhicule
  vehicle = new Vehicle(400, 400);


  // Je crée une instance de la classe Target
  // vitesseX, vitesseY, couleur, rayon
  target = createVector(0, 0);

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


  // je déplace et dessine le véhicule
  vehicle.applyBehaviors(target);
  vehicle.update();
  vehicle.show();

  // TODO: boucle sur le tableau de véhicules
  // pour chaque véhicule : seek, update, show
}
