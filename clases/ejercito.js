export class Ejercito {
    constructor(){
        this.unidades = [];
    }
    agregarUnidad(unidad){
        if (this.getUnidades() < 5){
            this.unidades.push(unidad);
        }
    }
    eliminarUnidad(indice){
        if (indice >= 0 && indice < this.getUnidades()){
            this.unidades.splice(indice,1);
        }
    }
    getUnidadesVivas(){
        let cont = 0;
        for (let i in this.unidades) {
            if (this.unidades[i].estaViva()){
                cont++;
            }
        }
        return cont;
    }
    getUnidades(){
        return this.unidades.length;
    }
    toString(){
        let texto = 'EJERCITO: \n'
        for (let i in this.unidades){
            texto += ' - ' + this.unidades[i].toString() +'\n';
        }
        return texto;
    }
}