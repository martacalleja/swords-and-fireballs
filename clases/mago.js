import { Unidad } from "./unidad.js";
export class Mago extends Unidad {

    constructor (){
        super('Mago');
        this.costeContratacion = 2000;
        this.gananciaRetirarlo = 1000;
        this.tieneBolaDeFuego = true;
    }
    //Si tiene bola de fuego se le suma 60 ptos al ataque, si no, devuelve solo su ataque
    bolaDeFuego(){
        if (this.tieneBolaDeFuego){
            this.tieneBolaDeFuego = false;
            return (60);
        } else {
            return this.ataque;
        }
    }
}