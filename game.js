var oso;
var derecha;
var izquierda;
var aglomeraciones;
var texto; 
var spacebar;
var sonidoDisparo;
var damage;
var recarga_alcohol;

var iniciar;
var instruciones;

const vidaOso = 3;
const municionInicial =5;
const velocidadOso = 800;
const minAglomeraciones = 2;
const maxAglomeraciones = 3;
const velocidadCaida = 5;
const tiempoAparicion = 600;
const probabilidadAlcohol = 20;
const municionPorAlcohol = 5;
//Escena1
var Inicio = new Phaser.Class({
    
    Extends: Phaser.Scene,

    initialize:
     
        function Inicio(){
            Phaser.Scene.call(this, {key: 'Inicio'});
        },
    preload(){
        this.load.image("fondo1", "./assets/sprites/fondo1.png");
    },
    create(){
        this.fondo1=this.add.image(1200/2,600/2,"fondo1");
        iniciar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        iniciar.reset();
    },
    update(){
        if(iniciar.isDown){
            this.scene.start("instrucciones");
        }
    }

});
//Escena2
var instrucciones=new Phaser.Class({
    Extends: Phaser.Scene,

    initialize:

        function Inicio() {
            Phaser.Scene.call(this, { key: 'instrucciones' });
        },
    preload() {
            
            this.load.image("indicaciones", "./assets/sprites/indicaciones.png");
    },

    create() {
        this.fondo1=this.add.image(1200/2,600/2,"indicaciones");
        var texto = this.add.text(game.config.width / 2, game.config.height / 2, "", {
            fontSize: '40px',
            fill: '#000000'
        }).setOrigin(0.5).setInteractive();
        texto.on('pointerdown', () => {
            this.scene.start('Principal');
        });
//con un enter
        iniciar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
//para resetear
        iniciar.reset();
   

    },
    update(){
        //
        if(iniciar.isDown){
            this.scene.start('Principal');
        }
    }

 });


//Escena3
 var Principal = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize:
        function Principal(){
            Phaser.Scene.call(this, { key: "Principal"});
        },
    
        preload(){
        this.load.image("background", "./assets/sprites/background.png");
        this.load.image('oso', 'assets/sprites/oso.png');
        this.load.spritesheet('aglomeraciones', 'assets/sprites/aglomeraciones.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('mascarilla', 'assets/sprites/mascarilla.png');
        this.load.image('alcohol', 'assets/sprites/alcohol.png');

        this.load.audio('sonidoDisparo', 'assets/sonidos/disparo.wav');
        this.load.audio('damage', 'assets/sonidos/damage.wav');
        this.load.audio('recarga_alcohol', 'assets/sonidos/recarga_energia.wav');
        },

        create(){
            this.fondo1=this.add.image(1200/2,600/2,"background");
            oso = this.physics.add.sprite(game.config.width / 2, game.config.height - 100, 'oso');
            oso.vida = vidaOso;
            oso.municion = municionInicial;
            oso.setCollideWorldBounds(true);
    
            sonidoDisparo = this.sound.add('sonidoDisparo');
            damage = this.sound.add('damage');
            recarga_alcohol = this.sound.add('recarga_alcohol');
    
            texto = this.add.text(10, 10, '', {
                fontSize: '40px',
                fill: 'black'
            }).setDepth(0.1);
            this.actulizarTexto();
    
            aglomeraciones = this.physics.add.group({
                defaultKey: 'aglomeraciones',
                frame: 0,
                maxSize: 50
            });
    
            mascarillas = this.physics.add.group({
                classType: mascarilla,
                maxSize: 10,
                runChildUpdate: true
            });
    
            tAlcohol = this.physics.add.group({
                defaultKey: 'alcohol',
                maxSize: 20
            });
    
            this.time.addEvent({
                delay: tiempoAparicion,
                loop: true,
                callback: () => {
                    this.generarAglomeraciones()
                }
            });
    
            this.physics.add.overlap(oso, aglomeraciones, this.colisionOsoAglomeracion, null, this);
            this.physics.add.overlap(mascarillas, aglomeraciones, this.colisionMascarillaAglomeracion, null, this);
            this.physics.add.overlap(oso, tAlcohol, this.colisionOsoAlcohol, null, this);
    
            derecha = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
            izquierda = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
            spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
            derecha.reset();
            izquierda.reset();
    
        },
        update() {
            Phaser.Actions.IncY(aglomeraciones.getChildren(), velocidadCaida);
            aglomeraciones.children.iterate(function (aglomeracion) {
                if (aglomeracion.y > 600) {
                    aglomeraciones.killAndHide(aglomeracion);
                }
            });
    
            Phaser.Actions.IncY(tAlcohol.getChildren(), velocidadCaida);
            tAlcohol.children.iterate(function (alcohol) {
                if (alcohol.y > 600) {
                    tAlcohol.killAndHide(alcohol);
                }//
            });
    
            oso.body.setVelocityX(0);
            if (izquierda.isDown) {
                oso.body.setVelocityX(-velocidadOso);
            }
            else if (derecha.isDown) {
                oso.body.setVelocityX(velocidadOso);
            }
    
            if (Phaser.Input.Keyboard.JustDown(spacebar) && oso.municion > 0) {
                var mascarilla = mascarillas.get();
    
                if (mascarilla) {
                    sonidoDisparo.play();
                    mascarilla.fire(oso.x, oso.y);
                    oso.municion--;
                    this.actulizarTexto();
                }
            }
        },
        generarAglomeraciones() {
            var numeroAglomeraciones = Phaser.Math.Between(minAglomeraciones, maxAglomeraciones);
    
            for (let i = 0; i < numeroAglomeraciones; i++) {
                var aglomeracion = aglomeraciones.get();
    
                if (aglomeracion) {
                    aglomeracion.setActive(true).setVisible(true);
                    aglomeracion.setFrame(Phaser.Math.Between(0, 1));
                    aglomeracion.y = -100;
                    aglomeracion.x = Phaser.Math.Between(0, game.config.width);
                    this.physics.add.overlap(aglomeracion, aglomeraciones, (aglomeracionEnColicion) => {
                        aglomeracionEnColicion.x = Phaser.Math.Between(0, game.config.width);
                    });
                }
            }
    
            var numeroProbabilidad = Phaser.Math.Between(1, 100);
    
            if (numeroProbabilidad <= probabilidadAlcohol) {
                var alcohol = tAlcohol.get();
    
                if (alcohol) {
                    alcohol.setActive(true).setVisible(true);
                    alcohol.y = -100;
                    alcohol.x = Phaser.Math.Between(0, game.config.width);
                    this.physics.add.overlap(alcohol, aglomeraciones, (alcoholEnColicion) => {
                        alcoholEnColicion.x = Phaser.Math.Between(0, game.config.width);
                    });
                }
            }
        },
        colisionOsoAglomeracion(oso, aglomeracion) {
            if (aglomeracion.active) {
                aglomeraciones.killAndHide(aglomeracion);
                aglomeracion.setActive(false);
                aglomeracion.setVisible(false);
                damage.play();
                if (oso.vida > 0) {
                    oso.vida--;
                    if(oso.vida <= 0){
                        this.add.text(game.config.width / 2, game.config.height / 2, 'Perdiste todas las vidas', {
                            fontSize: '60px',
                            fill: 'black'
                        }).setOrigin(0.5);
                        this.scene.pause();
                        setTimeout(()=>{
                            this.scene.stop();
                            this.scene.start('Inicio');
                        },2000)
                    }
                }
                this.actulizarTexto();
            }
        },
        colisionMascarillaAglomeracion(mascarilla, aglomeracion) {
            if (mascarilla.active && aglomeracion.active) {
                mascarillas.killAndHide(mascarilla);
                mascarilla.setActive(false);
                mascarilla.setVisible(false);
                aglomeraciones.killAndHide(aglomeracion);
                aglomeracion.setActive(false);
                aglomeracion.setVisible(false);
            }
        },
        colisionOsoAlcohol(oso, alcohol) {
            if (alcohol.active) {
                tAlcohol.killAndHide(alcohol);
                alcohol.setActive(false);
                alcohol.setVisible(false);
                recarga_alcohol.play();
                oso.municion += municionPorAlcohol;
                this.actulizarTexto();
            }
        },
        actulizarTexto() {
    
            texto.setText('Vida: ' + oso.vida + '\nAlcohol Reunido: ' + oso.municion);
        }
    
    });
    
    var config = {
        type: Phaser.AUTO,
        width: 1200,
        height: 600,
        backgroundColor: 'black',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scene: [Inicio,instrucciones,Principal]
    };
    
    var game = new Phaser.Game(config);
        