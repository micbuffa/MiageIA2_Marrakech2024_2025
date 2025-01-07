class Target extends Vehicle {
    constructor(x, y, r) {
        super(x, y);
        this.r = r;
      

        // pour la detection des poursuivants
        this.rayonDetection = 250;

        // On lui donne une vitesse aléatoire
        this.vel.x = random(-10, 10);
        this.vel.y = random(-10, 10);

        // toutes les 3s, tu changes de vitesse
        /*
        setInterval(() => {
            
        }, 1000);
        */
    }

    applyBehaviors(pursuer) {
        let distance = dist(this.pos.x, this.pos.y, pursuer.pos.x, pursuer.pos.y);
        if(distance < this.rayonDetection) {
            // On augmente la vitesse et la forceMax
            this.maxSpeed = 15;
            this.maxForce = 0.8;
            let force = this.flee(pursuer);
            this.applyForce(force);  
            console.log("flee");
        } else {
            // On remet les valeurs par défaut
            if(random(1) < 0.05) {
                let angle = this.vel.heading();
                angle += random(-0.5, 0.5);
                this.vel.setHeading(angle);
            }
            this.maxSpeed = 6;
            this.maxForce = 0.1;
            let force = createVector(0, 0);
            this.applyForce(force);  
            return force;
        }
    }

    show() {
        // On dessine la target comme un gros cercle rose
        push();
        translate(this.pos.x, this.pos.y);

        fill("pink");
        stroke("green");
        strokeWeight(10);
        circle(0, 0, this.r * 2);

        // cercle de détection
        noFill();
        stroke("green");
        strokeWeight(5);
        circle(0, 0, this.rayonDetection * 2);
        pop();
    }
}