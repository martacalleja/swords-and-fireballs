import { Unidad } from "./unidad.js";
export class Guerrero extends Unidad {
    constructor (){
        super('Guerrero');
        this.costeContratacion = 1000;
        this.gananciaRetirarlo = 500;
        this.usosAtaqueConcentrado = 3;
    }

    //Usar ataque concentrado, si lo tiene añade daño extra al ataque, sino, solo devuelve el ataque base
    ataqueConcentrado(){
        if (this.usosAtaqueConcentrado > 0){    //Si le quedan usos de ataque
            this.usosAtaqueConcentrado--;   //Se le resta uno
            return (this.ataque + this.aleatorio(5,10));  //Añade ataque extra
        } else {
            return this.ataque;
        }
    }
}