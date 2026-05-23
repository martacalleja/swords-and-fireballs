export class Unidad {
    constructor(tipo){
        this.tipo = tipo;
        this.vidaMax = this.calcularVidaMax(tipo);
        this.vidaActual = this.vidaMax;
        this.ataque = this.aleatorio(10,20);
    }
    calcularVidaMax(tipo){
        switch (tipo){
            case 'Guerrero': return this.aleatorio(60,100);
            case 'Ladron': return this.aleatorio(50,80);
            case 'Mago': return this.aleatorio(40,60);
        };
    }
    recibeDaño(daño){
        this.vidaActual -= daño;
        this.vidaActual = Math.round(this.vidaActual); //Redondeamos para que no haya decimales
        this.controlarVida();
    }
    controlarVida(){
        if (this.vidaActual < 0) {
            this.vidaActual = 0;
            this.KO = true;
        } else if (this.vidaActual > this.vidaMax) {
            this.vidaActual = this.vidaMax;
        }
    }
    aleatorio(min, max){
        return Math.round(Math.random() * (max-min + 1) + min);
    }
    estaViva(){
        if (this.vidaActual > 0) {
            return true;
        } else {
            return false;
        }
    }
    recuperarVida(){
        this.vidaActual = this.vidaMax * 0.7;
        this.vidaActual = Math.round(this.vidaActual); //Redondeamos para que no haya decimales
        this.controlarVida();
    }
    
    recuperarHabilidad(){
        switch (this.tipo){
            case 'Guerrero': this.usosAtaqueConcentrado = 3; break;
            case 'Ladron': this.usosEsquivas = 2; break;
            case 'Mago': this.tieneBolaDeFuego = true; break;
        }
    }

    toString(){
        return (`${this.tipo} - PVs: ${this.vidaActual} / ${this.vidaMax}  ATK: ${this.ataque}`        );
    }
};
