import { Unidad } from "./unidad.js";
export class Ladron extends Unidad {
    constructor (){
        super('Ladron');
        this.costeContratacion = 1500;
        this.gananciaRetirarlo = 750;
        this.usosEsquivas = 2;
    }
    //Habilidad especial del ladrón
    esquivas(daño){
        if (this.usosEsquivas > 0){    //Si le quedan usos de esquivar
            if (super.aleatorio(0,100) < 35){
                this.recibeDaño(0);
                this.usosEsquivas--;
                return true;
            } else {
                this.recibeDaño(daño)
                return false;
            }
        } else {
            this.recibeDaño(daño);
            return false;
        }
    }
}