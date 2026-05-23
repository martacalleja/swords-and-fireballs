import { Mago } from "./mago.js";
import { Guerrero } from "./guerrero.js";
import { Ladron } from "./ladron.js";
import { Ejercito } from "./ejercito.js";
class Juego {
    constructor(modo,dificultad){
        this.modo = modo;
        if (this.modo == 'nueva'){
            this.dificultad = dificultad;
            this.oro = 5000;
            this.victoriasRequeridas = this.setVictorias();
            this.derrotasMax = 2;
            this.victorias = 0;
            this.derrotas = 0;
            this.intentosContratacion = 6;
            this.recuperacion = false;
            this.ejercito = new Ejercito(); //NO ES UN ARRAY!! ES UN OBJETO. EL ARRAY ES JUEGO.EJERCITO.UNIDADES!!!
        } else {
            let datos = JSON.parse(localStorage.getItem('partidaGuardada')); 
            this.dificultad = datos.dificultad;
            this.oro = datos.oro;
            this.victoriasRequeridas = datos.victoriasRequeridas;
            this.derrotasMax = datos.derrotasMax;
            this.victorias = datos.victorias;
            this.derrotas = datos.derrotas;
            this.intentosContratacion = datos.intentosContratacion;
            this.recuperacion = datos.recuperacion;
            this.ejercito = this.añadirEjercito(datos.ejercito);
        }
        
        this.tropasTienda = []; //Aquí se almacenarán las tropas que se generen al darle a contratar
        this.ejercitoEnemigo = new Ejercito; //Ejército enemigo
        this.enemigosDerrotados = 0; //Contador de enemigos derrotados
        this.aliadosDerrotados = 0;  //Contador de aliados derrotados
        this.turno = 0;  //Contador de turnos
        //Aqui guardaremos las unidades que luchan en el 1vs1
        this.unidadJugador;
        this.unidadEnemigo;
        this.oroGanado = 0;
        this.enCombate = false;
    }
    //Establece las victorias según dificultad
    setVictorias(){
        if (this.dificultad == 'facil'){
            return 2;
        } else {
            return 4;
        }
    }
    añadirEjercito(unidades){
        let ejercitoTemporal = new Ejercito();
        for (let i in unidades){
            switch (unidades[i].tipo){
                case 'Guerrero': ejercitoTemporal.agregarUnidad(new Guerrero()); break;
                case 'Ladron': ejercitoTemporal.agregarUnidad(new Ladron()); break;
                case 'Mago': ejercitoTemporal.agregarUnidad(new Mago()); break;
            }
            ejercitoTemporal.unidades[i].vidaActual = unidades[i].vidaActual;
            ejercitoTemporal.unidades[i].vidaMax = unidades[i].vidaMax;
            ejercitoTemporal.unidades[i].ataque = unidades[i].ataque;
            switch (unidades[i].tipo){
                case 'Guerrero': ejercitoTemporal.unidades[i].usosAtaqueConcentrado = unidades[i].usosAtaqueConcentrado; break;
                case 'Ladron': ejercitoTemporal.unidades[i].usosEsquivas = unidades[i].usosEsquivas; break;
                case 'Mago': ejercitoTemporal.unidades[i].tieneBolaDeFuego = unidades[i].tieneBolaDeFuego; break;
            }
        }
        return ejercitoTemporal;
    }
}
//Crea un objeto juego con los valores pasados en el inicio
let juego = new Juego(localStorage.getItem('modo'), localStorage.getItem('dificultad'));
actualizarValores();    //Muestra la información de la partida en el navegador
cargarFetch('instrucciones.html');  //Carga las instrucciones al comenzar
//Crea un número aleatorio entre 2 valores
function numAleatorio(min,max){
    return Math.floor(Math.random() * (max-min + 1) + min);
}
//Actualiza los valores de la columna derecha
function actualizarValores(){
    document.getElementById('oroActual').textContent = juego.oro;
    document.getElementById('intentosContratacion').textContent = juego.intentosContratacion;
    document.getElementById('numTropas').textContent = juego.ejercito.getUnidades();
    document.getElementById('victorias').textContent = juego.victorias + '/' + juego.victoriasRequeridas;
    document.getElementById('derrotas').textContent = juego.derrotas + '/' + juego.derrotasMax;
    if (juego.recuperacion){    //Cambiamos el true/false por si/no
        document.getElementById('recuperacion').textContent = 'Si';
    } else {
        document.getElementById('recuperacion').textContent = 'No';
    }
}
//Muestra la pantalla correspondiente al botón que pulse
document.getElementById('botones').addEventListener('click', (ev) => {
    let botonPulsado = ev.target.id;
    switch (botonPulsado) {
        case 'contratarAccionBtn': cargarFetch('contratar.html'); break;
        case 'despedirAccionBtn': cargarFetch('despedir.html'); break;
        case 'combatirAccionBtn': cargarFetch('combatir.html'); break;
        case 'informacionBtn': cargarFetch('informacion.html'); break; 
        case 'guardarBtn': cargarFetch('guardarPartida.html'); break;
        case 'salirBtn': cargarFetch('salir.html'); break;       
    }
});
//Muestra en la pantalla central el archivo indicado, según el botón pulsado
function cargarFetch(archivo){
    fetch(archivo)
        .then(response => {
            if (!response.ok){
                throw new Error('Error al cargar el archivo');
            }
            return response.text();
        })
        .then(html => {
            document.getElementById('pantallaCentro').innerHTML = html;
            switch (archivo){
                case 'contratar.html': {
                    if (juego.oro >= 1000 && juego.intentosContratacion > 0 && juego.ejercito.getUnidades() < 5){
                        listenerContratar();
                        contratar();
                    //Si no, muestra el mensaje de aviso de que no puede contratar, especificando el motivo
                    } else if (juego.oro < 1000) {  
                        document.getElementById('tropasContratar').className = 'oculto';
                        document.getElementById('btnGenerarOtras').className = 'oculto';
                        document.getElementById('avisoContratar').textContent = 'No tienes suficiente dinero';
                    } else if (juego.intentosContratacion == 0 && juego.ejercito.getUnidades() == 0) {
                        document.getElementById('tropasContratar').className = 'oculto';
                        document.getElementById('btnGenerarOtras').className = 'oculto';
                        document.getElementById('avisoContratar').innerHTML = `<p>Te has quedado sin intentos y no tienes tropas en el ejército. <br>Quieres empezar una nueva partida?</p>`;
                        let botonSalir = document.createElement('button');
                        botonSalir.classList.add('btnAbandonar');
                        botonSalir.id = 'salir';
                        botonSalir.innerHTML = `Salir`;
                        document.getElementById('avisoContratar').appendChild(botonSalir);
                        deshabilitarBotones();
                        document.getElementById('salir').addEventListener('click', () => {
                            salir();
                        })
                    } else if (juego.intentosContratacion == 0) {
                        document.getElementById('tropasContratar').className = 'oculto';
                        document.getElementById('avisoContratar').textContent = 'Te has quedado sin intentos de contratación';
                    } else if (juego.ejercito.getUnidades() == 5){
                        document.getElementById('tropasContratar').className = 'oculto';
                        document.getElementById('avisoContratar').textContent = 'Tienes el ejército lleno, no puedes contratar';
                    } 
                } break;
                case 'despedir.html': {
                    //Vemos si cumple los requisitos para poder despedir
                    if (juego.ejercito.getUnidades() > 0){
                        listenerDespedir();
                        despedir();
                    } else {
                      //  document.getElementById('tropasDespedir').attributes['class'].nodeValue = 'oculto';
                        document.getElementById('avisoDespedir').textContent = 'No tienes unidades para despedir';
                    }
                } break;
                case 'combatir.html': {
                    if (juego.ejercito.getUnidadesVivas() > 0){
                        iniciarCombate();
                        
                        
                    } else if (juego.ejercito.getUnidades() == 0 ){
                        document.getElementById('combate').className = 'oculto';
                        document.getElementById('pantallaFinalCombate').className = 'oculto';
                        document.getElementById('avisoCombatir').textContent = 'No tienes unidades para combatir';
                    } else if (juego.ejercito.getUnidadesVivas() == 0){
                        document.getElementById('combate').className = 'oculto';
                        document.getElementById('pantallaFinalCombate').className = 'oculto';
                        document.getElementById('avisoCombatir').textContent = 'Recupera a tu ejército antes de combatir!!';
                    }
                } break;
                case 'informacion.html': {
                    if (juego.ejercito.getUnidades() > 0){
                        listenerCurar();
                        informacion();
                    } else {
                        document.getElementById('muestraInfo').className = 'oculto';
                        document.getElementById('botonCurar').className = 'oculto';
                        document.getElementById('avisoInfo').textContent = 'No tienes unidades en tu ejército';
                    }
                } break;
                case 'partidaGanada.html': {
                    deshabilitarBotones(); //Deshabilitamos los botones
                    //Mostramos la info final
                    let contenedor = document.getElementById('partidaGanada');
                    let div = document.createElement('div');
                    div.innerHTML = `<p>Enhorabuena!! Has ganado!! Has derrotado a todos los oponentes.</p>
                        <p>Victorias: ${juego.victorias}</p>
                        <p>Derrotas: ${juego.derrotas}</p>
                        <img src="../fotos/victoria.png">
                        <button id='salir'>Volver al inicio </button>`;
                    contenedor.appendChild(div);
                    //Si la partida que acabamos de terminar es la que estaba guardada, la eliminamos ya
                    if (juego.modo == 'cargar'){
                        localStorage.clear();
                    }
                    listenerSalir();
                    } break; 
                case 'partidaPerdida.html': {
                    deshabilitarBotones();
                    //Mostramos la info final
                    let contenedor = document.getElementById('partidaPerdida');
                    let div = document.createElement('div');
                    div.innerHTML = `<p>Lo siento! Has perdido , otra vez se te dará mejor!</p>
                        <p>Victorias: ${juego.victorias}</p>
                        <p>Derrotas: ${juego.derrotas}</p>
                        <img src="../fotos/derrota.png">
                        <button id='salir'>Volver al inicio </button>`;
                    contenedor.appendChild(div);
                    //Si la partida que acabamos de terminar es la que estaba guardada, la eliminamos ya
                    if (juego.modo == 'cargar'){
                        localStorage.clear();
                    }
                    listenerSalir();
                    } break; 
                case 'guardarPartida.html': {
                    document.getElementById('guardarBoton').addEventListener('click', () => {
                        guardarPartida();
                        let p = document.createElement('p');
                        p.classList.add('avisoGuardar');
                        p.innerHTML = `Partida guardada correctamente.`;
                        document.getElementById('guardarPartida').appendChild(p);
                    })}break;
                case 'salir.html': {
                    let div = document.createElement('div');
                    document.getElementById('avisoSalir').appendChild(div);
                    if (localStorage.getItem('partidaGuardada')){
                        div.classList.add('avisoSalirPartidaGuardada');
                        div.innerHTML = `<p>¿Seguro que quieres salir de la partida? <br>
                        Tienes una partida guardada </p>
                        <button id="salirBoton"> Salir </button>`;
                    } else {
                        div.classList.add('avisoSalirPartidaSinGuardar');
                        div.innerHTML = `<p>¿Seguro que quieres salir de la partida? <br>
                        No tienes ninguna partida guardada </p>
                        <button id="salirBoton"> Salir </button>`;
                    }
                    
                    if (juego.enCombate){
                        div.classList.add('avisoSalirEnCombate');
                        div.innerHTML = `<p>¿Seguro que quieres salir de la partida? <br>
                        Tienes un combate a medias, quieres continuar luchando? </p>
                        <button id="salirBoton"> Salir </button> <button id = 'seguirCombate'> Volver al combate </button>`;
                    }
                    document.getElementById('salirBoton').addEventListener('click', () => {
                        salir();
                    })
                    document.getElementById('seguirCombate').addEventListener('click', () => {
                            cargarFetch('combatir.html');
                        })
                }
            }
        })
        .catch(error => {
            console.log(error);
        })
}
//Devuelve la foto correspondiente al tipo de unidad indicada
function fotoTropa(unidad){
    switch (unidad.tipo){    
        case 'Guerrero': return "../fotos/guerrero.png"; 
        case 'Ladron': return "../fotos/ladron.png";
        case 'Mago': return "../fotos/mago.png";
    }
}
//Deshabilita todos los botones excepto el de salir
function deshabilitarBotones(){
    document.getElementById('contratarAccionBtn').disabled = true;
    document.getElementById('despedirAccionBtn').disabled = true;
    document.getElementById('combatirAccionBtn').disabled = true;
    document.getElementById('informacionBtn').disabled = true;
    document.getElementById('guardarBtn').disabled = true;
}
//Para ver que botón pulsa y que unidad quiere contratar
function listenerContratar(){
    //Vemos que unidad quiere contratar
    document.getElementById('tropasContratar').addEventListener('click', (ev) => {
        let botonPulsado = ev.target.dataset.index; //Recogemos lo que ha pulsado
        //Comprobamos que haya pulsado el boton y no otro sitio (si pulsa otro sitio sale undefined)
        if (botonPulsado != undefined){
            botonPulsado = parseInt(botonPulsado);  //Convertimos a int lo que pulsa, ya que por defecto lo recibe tipo string
            juego.ejercito.agregarUnidad(juego.tropasTienda[botonPulsado]);    //La agregamos a nuestro ejército
            juego.oro -= juego.tropasTienda[botonPulsado].costeContratacion;   //Restamos el oro correspondiente a la unidad contratada
            actualizarValores();    //Actualizamos la información de nuevo
            //Una vez ha contratado, vemos si nos sigue quedando oro, intentos y espacio en nuestro ejército para poder seguir contratrando 
            if (juego.oro >= 1000 && juego.intentosContratacion > 0 && juego.ejercito.getUnidades() < 5){
                contratar();  //Si es así, vamos a 'contratar'   
            } else {    //Si no, nos avisará de que no podemos contratar más
                document.getElementById('tropasContratar').className = 'oculto';
                document.getElementById('btnGenerarOtras').className = 'oculto';
                document.getElementById('avisoContratar').textContent = 'Ya no puedes contratar más';
            }
        }
    });
    document.getElementById('btnGenerarOtras').addEventListener('click', () => {
        if (juego.oro >= 1000 && juego.intentosContratacion > 0 && juego.ejercito.getUnidades() < 5){
            contratar();     
        } else {    
            document.getElementById('tropasContratar').className = 'oculto';
            document.getElementById('btnGenerarOtras').className = 'oculto';
            document.getElementById('avisoContratar').textContent = 'Ya no puedes contratar más';
        }
    });
}
//Genera las unidades que podemos contratar 
function contratar(){
    juego.tropasTienda = []; //Primero vaciamos el array, por si había tropas de antes
    //Generamos 3 tropas nuevas para la tienda
    for (let i = 0 ; i < 3 ; i++){
        juego.tropasTienda.push(generarTropa());
    }
    //Primero carga el spinner en todas las tarjetas
    for (let i in juego.tropasTienda){
        i = parseInt(i);    //Convierte i en numero (antes era 01)
        spinnerCarga(i);    //Pone el spinner a funcionar
    }
    //Se van mostrando las tropas, despues de unos segundos aleatorios
    for (let i in juego.tropasTienda){
        i = parseInt(i);
        //Espera unos segundos
        cargarTropa(numAleatorio(0.5,1.5)*1000) //Devuelve una promesa resuelta tras x segundos
            .then(()=> {    //Cuando se resuelve
                eliminarSpinner(i); //Elimina el spinner
                mostrarTropaContratar(i);   //Muestra la info de la unidad
            });
        
    }
    juego.intentosContratacion--;   //Cada vez que generas unidades, se pierde un intento
    actualizarValores();    //Actualiza la información de la partida
}
//Genera una unidad aleatoriamente
function generarTropa(){
    let prob = numAleatorio(0,100); //Genera un número aleatorio
    //Segun el número que salga, devuelve una unidad u otra
    if (prob < 20){
        return new Mago();
    } else if (prob < 50) {
        return new Ladron();
    } else {
        return new Guerrero();
    }
}
//Genera un nuevo spinner que girará
function spinnerCarga(i){
    //Quita el texto que podría haber en la tarjeta
    document.getElementById(`nombreTropa${i+1}Contratar`).textContent = '';
    document.getElementById(`fotoTropa${i+1}Contratar`).attributes["src"].nodeValue = "";
    document.getElementById(`fotoTropa${i+1}Contratar`).style.visibility = 'hidden';
    document.getElementById(`vidaTropa${i+1}Contratar`).textContent = '';
    document.getElementById(`ataqueTropa${i+1}Contratar`).textContent = '';
    document.getElementById(`oroTropa${i+1}Contratar`).textContent = '';
    document.getElementById(`btnContratarTropa${i+1}`).className = 'oculto';
    let tarjeta = document.getElementById(`tropa${i+1}Contratar`);
    //Busca si existe una clase 'spinner' dentro de ese div
        //Si no existe, lo crea
    if (!tarjeta.querySelector('.spinner')){
        let spinner = document.createElement('div');    //Crea un nuevo div llamado spinner
        spinner.classList.add('spinner');   //Esto permite añadirlo al css y hacerlo girar
        tarjeta.prepend(spinner);   //Lo añade al html dentro de la tarjeta
    }
}
//Elimina el spinner, una vez haya cargado
function eliminarSpinner(i){
    let tarjeta = document.getElementById(`tropa${i+1}Contratar`); 
    let spinner = tarjeta.querySelector('.spinner');    //Busca si existe el spinner
    //Solo si existe, lo elimina
    if (spinner){
       spinner.remove(); 
       document.getElementById(`fotoTropa${i+1}Contratar`).style.visibility = 'visible';
    }
}
//Deja cargando la tropa durante x segundos
function cargarTropa(ms){
    return new Promise(resolve => { //Devuelve una promesa resuelta
        setTimeout(resolve,ms);
    })
}
//Muestra la información de cada tropa
function mostrarTropaContratar(i){
    document.getElementById(`nombreTropa${i+1}Contratar`).textContent = juego.tropasTienda[i].tipo;
        //document.getElementById(`fotoTropa${i+1}Contratar`).attributes['src'].nodeValue = fotoTropa(juego.tropasTienda[i]);
        let img = document.getElementById(`fotoTropa${i+1}Contratar`);
        img.style.visibility = 'hidden';
        img.onload = function() {
            this.style.visibility = 'visible';
        }
        img.src = fotoTropa(juego.tropasTienda[i]);
        document.getElementById(`vidaTropa${i+1}Contratar`).textContent = `PVs: ${juego.tropasTienda[i].vidaActual}`;
        document.getElementById(`ataqueTropa${i+1}Contratar`).textContent = `ATK: ${juego.tropasTienda[i].ataque}`;
        document.getElementById(`oroTropa${i+1}Contratar`).textContent = `Precio: ${juego.tropasTienda[i].costeContratacion} de oro`;
        document.getElementById(`btnContratarTropa${i+1}`).className = '';
        //Si no tenemos oro suficiente para comprar alguna unidad, deshabilitamos el boton
        if (juego.oro < juego.tropasTienda[i].costeContratacion){
            document.getElementById(`btnContratarTropa${i+1}`).disabled = true;
        } else {
            document.getElementById(`btnContratarTropa${i+1}`).disabled = false;
        }
    
}

function iniciarCombate() {
    deshabilitarBotones();  //Desactivo el resto de botones mientras se da el combate
    //Elimino las unidades que hubiera anteriormente en el equipo enemigo, para generar otras nuevas
    let i = 0;
    while (juego.ejercitoEnemigo.getUnidades() > 0) {
        juego.ejercitoEnemigo.eliminarUnidad(0);
    }
    //Creamos un Ejercito enemigo aleatorio, entre 3 y 5 unidades:
    for (let i = 0; i < numAleatorio(3,5) ; i++){
        juego.ejercitoEnemigo.agregarUnidad(generarTropa());
    }
    //Inicializamos contadores cada vez que inicia un combate
    juego.enemigosDerrotados = 0; //Contador de enemigos derrotados
    juego.aliadosDerrotados = juego.ejercito.getUnidades() - juego.ejercito.getUnidadesVivas();;  //Contador de aliados derrotados
    juego.turno = 0;  //Contador de turnos
    juego.oroGanado = 0; //Contador de oro ganado en el combate
    //Sacamos la primera unidad viva d cada ejercito
    juego.unidadJugador = primeraUnidadViva(juego.ejercito.unidades);
    juego.unidadEnemigo = primeraUnidadViva(juego.ejercitoEnemigo.unidades);
    juego.enCombate = true;
    listenerCombatir();
}
//Vemos que botón pulsa, para saber que unidad quiere despedir
function listenerDespedir(){
    document.getElementById('tropasDespedir').addEventListener('click', (ev) => {
        let botonPulsado = ev.target.dataset.index; //Recogemos el data-index del botón
        if (botonPulsado != undefined){ //Comprobamos que pulse el botón y no cualquier otra cosa
            botonPulsado = parseInt(botonPulsado);  //Lo pasamos a int
            juego.oro += juego.ejercito.unidades[botonPulsado].gananciaRetirarlo;   //Sumamos la ganancia que nos da al retirlar la unidad al oro que tenemos
            juego.ejercito.eliminarUnidad(botonPulsado);    //Lo eliminamos
        }
        actualizarValores(); //Actualizamos el oro y el número de tropas que tenemos
        //Si todavia podemos seguir despidiendo, volvemos a mostrar las unidades, sino, muestra el aviso
        if (juego.ejercito.getUnidades() > 0){
            despedir();
        } else {
            document.getElementById('tropasDespedir').innerHTML = '';   //Vaciamos el contenedor para que no muestre las tropas ya eliminadas
            document.getElementById('avisoDespedir').textContent = 'No tienes unidades para despedir'; 
        }
    });
}
//Muestra las unidades que tenemos para despedir
function despedir(){
    let contenedor = document.getElementById('tropasDespedir'); //Dentro de aquí se generarán los divs de cada unidad
    contenedor.innerHTML = '';  //Lo inicializa vacío y elimina lo que habia dentro
    //Muestra las unidades que tenemos
    for (let i in juego.ejercito.unidades){
        i = parseInt(i); 
        //Crea un div con la tarjeta correspondiente por cada unidad que haya
        let div = document.createElement('div');
        div.classList.add('tarjetaTropa');  //para el css
        //Vemos que vida tienen para poner la barra con el color correspondiente
        let porcentajeVida = calcularPorcentajeVida(juego.ejercito.unidades[i]);
        let colorBarra = calcularColorBarra(porcentajeVida);
        //Crea el contenido
        div.innerHTML = crearHTMLTarjeta(juego.ejercito.unidades[i]) + 
            `<p>Ganancia: ${juego.ejercito.unidades[i].gananciaRetirarlo}</p>
            <button data-index="${i}">Despedir</button>`;
        contenedor.appendChild(div);    //Lo añade al html
    }
    actualizarValores();
}
function crearHTMLTarjeta(unidad){
    let porcentajeVida = calcularPorcentajeVida(unidad);
    let colorBarra = calcularColorBarra(porcentajeVida);
    return `<p>${unidad.tipo}</p>
        <img src="${fotoTropa(unidad)}">
        <p>PVs: ${unidad.vidaActual} / ${unidad.vidaMax} ATK: ${unidad.ataque}</p>
        <div class="barra-fondo">
            <div class="barra-vida" style="width: ${Math.round(porcentajeVida * 100)}%; background-color: ${colorBarra}"></div>
        </div>`;
}
function calcularPorcentajeVida(tropa){
    return tropa.vidaActual / tropa.vidaMax;
}
function calcularColorBarra(porcentaje){
    if (porcentaje > 0.6) {
        return 'rgb(26, 181, 26)';    //verde
    } else if (porcentaje > 0.3) {
        return 'rgb(225, 170, 33)';   // amarillo
    } else {
        return 'rgb(169, 16, 16)';    //rojo
    }
}
//Vemos si pulsa el botón para luchar
function listenerCombatir(){
    //Muestra la info de las unidades que van a luchar
    mostrarTropasCombate();
    //Cuando le da al boton d fight en combatir
    document.getElementById('botonFight').addEventListener('click', () => {
        //Si hay unidades vivas se da el combate
        if (juego.ejercito.getUnidadesVivas() > 0 && juego.ejercitoEnemigo.getUnidadesVivas() > 0){
            document.getElementById('infoCombate').className = '';
            combatir();
        } else {
            document.getElementById('combate').className = 'oculto';
            document.getElementById('avisoCombatir').textContent = 'No hay unidades vivas';
        }
    });
}
//Muestra la info de las unidades que combaten en el 1vs1
function mostrarTropasCombate(){
    //Muestra info de los contadores
    document.getElementById('enemigosDerrotados').textContent = juego.enemigosDerrotados;
    document.getElementById('numEjercitoEnemigo').textContent = juego.ejercitoEnemigo.getUnidades();
    document.getElementById('aliadosDerrotados').textContent = juego.aliadosDerrotados;
    document.getElementById('numEjercitoMio').textContent = juego.ejercito.getUnidades();
    //Info del jugador
    let claseTipoJugador = document.getElementsByClassName('tipoJugador');
    for (let i of claseTipoJugador){
        i.textContent = juego.unidadJugador.tipo;
    }
    let porcentajeVidaJugador = calcularPorcentajeVida(juego.unidadJugador);
    let colorBarraJugador = calcularColorBarra(porcentajeVidaJugador);
    document.getElementById('fotoTropaJugador').attributes["src"].nodeValue = fotoTropa(juego.unidadJugador);
    document.getElementById('ataqueBaseJugador').textContent = juego.unidadJugador.ataque;
    document.getElementById('vidaActualJugador').textContent = juego.unidadJugador.vidaActual;
    document.getElementById('vidaMaxJugador').textContent = juego.unidadJugador.vidaMax;
    document.getElementById('barraVidaJugador').style.width = Math.round(porcentajeVidaJugador * 100) + '%';
    document.getElementById('barraVidaJugador').style.backgroundColor = colorBarraJugador;
    //info del enemigo
    let claseTipoEnemigo = document.getElementsByClassName('tipoEnemigo');
    for (let i of claseTipoEnemigo){
        i.textContent = juego.unidadEnemigo.tipo;
    }
    let porcentajeVidaEnemigo = calcularPorcentajeVida(juego.unidadEnemigo);
    let colorBarraEnemigo = calcularColorBarra(porcentajeVidaEnemigo);
    document.getElementById('fotoTropaEnemigo').attributes["src"].nodeValue = fotoTropa(juego.unidadEnemigo);
    document.getElementById('ataqueBaseEnemigo').textContent = juego.unidadEnemigo.ataque;
    document.getElementById('vidaActualEnemigo').textContent = juego.unidadEnemigo.vidaActual;
    document.getElementById('vidaMaxEnemigo').textContent = juego.unidadEnemigo.vidaMax;
    document.getElementById('barraVidaEnemigo').style.width = Math.round(porcentajeVidaEnemigo * 100) + '%';
    document.getElementById('barraVidaEnemigo').style.backgroundColor = colorBarraEnemigo;
}
//Lleva a cabo el combate
function combatir(){
    //Sacamos la primera unidad viva d cada ejercito
    juego.unidadJugador = primeraUnidadViva(juego.ejercito.unidades);
    juego.unidadEnemigo = primeraUnidadViva(juego.ejercitoEnemigo.unidades);
    juego.turno++;
    //Oculto el bloque del ataque del enemigo primero
    document.getElementById('divAtaqueEnemigo').className  = 'oculto';
    //Calculamos el daño que hará, empezando por el jugador ya que es el primero que ataca
        //Voy a ver si usará habilidad especial para atacar o no, para poder mostrarlo después (tanto jugador como enemigo)
        let habilidadJugador = '';
        let habilidadEnemigo = '';
        switch (juego.unidadJugador.tipo) {
            case 'Guerrero': 
                if (juego.unidadJugador.usosAtaqueConcentrado > 0) {
                    habilidadJugador = '[Ataque concentrado]';
                }
            break;
            case 'Mago':
                if (juego.unidadJugador.tieneBolaDeFuego) {
                    habilidadJugador = '[Bola de fuego]';
                }
            break;
        }
    let dañoJugador = calcularDaño(juego.unidadJugador);
    let dañoVentajaJugador = ventaja(juego.unidadJugador,juego.unidadEnemigo);
    let esquivadoEnemigo = false;   //para ver si luego esquiva el ataque el ladrón
    //Vemos si el enemigo es un ladrón y si esquiva el ataque o no
    if (juego.unidadEnemigo.tipo === 'Ladron'){
        esquivadoEnemigo = juego.unidadEnemigo.esquivas(dañoJugador * dañoVentajaJugador);  //Si lo esquiva, recibe true
        //Vemos si lo esquiva o no, para poder mostrarlo luego
        if (esquivadoEnemigo){
            habilidadEnemigo = '[Esquivado]';
        }
    } else {
        juego.unidadEnemigo.recibeDaño(dañoJugador * dañoVentajaJugador); 
    }
    //Creo las variables para luego poder usarlas fuera del if
    let dañoEnemigo;
    let dañoVentajaEnemigo;
    let esquivadoJugador = false;
    //Si el enemigo sigue con vida despues del ataque, este responde
    if(juego.unidadEnemigo.estaViva()){
        //Mostramos el bloque del ataque del enemigo
        document.getElementById('divAtaqueEnemigo').className = '';
        //Veo si va a usar habilidades especiales 
        switch (juego.unidadEnemigo.tipo) {
            case 'Guerrero': 
                if (juego.unidadEnemigo.usosAtaqueConcentrado > 0) {
                    habilidadEnemigo = '[Ataque concentrado]';
                }
            break;
            case 'Mago':
                if (juego.unidadEnemigo.tieneBolaDeFuego) {
                    habilidadEnemigo = '[Bola de fuego]';
                }
            break;
        }
        //Calcula el daño que hará el enemigo
        dañoEnemigo = calcularDaño(juego.unidadEnemigo);
        dañoVentajaEnemigo = ventaja(juego.unidadEnemigo,juego.unidadJugador);
        esquivadoJugador = false;
        //Si el jugador es un ladron, vemos si lo esquiva o no
        if (juego.unidadJugador.tipo === 'Ladron'){
            esquivadoJugador = juego.unidadJugador.esquivas(dañoEnemigo * dañoVentajaEnemigo);  //Si lo esquiva, recibe true
            //Vemos si lo esquiva o no, para poder mostrarlo luego
            if (esquivadoJugador){
                habilidadJugador = '[Esquivado]';
            }
        } else {
            juego.unidadJugador.recibeDaño(dañoEnemigo * dañoVentajaEnemigo);
        }
    }
    if (!juego.unidadJugador.estaViva()){
        juego.aliadosDerrotados++;
    } else if(!juego.unidadEnemigo.estaViva()){
        juego.enemigosDerrotados++;
        juego.oroGanado += 500; //500 de oro por cada unidad derrotada
    }
    //Actualiza la información de las tropas
    mostrarTropasCombate();
    //Muestra el combate
    mostrarInfoCombate(habilidadJugador,habilidadEnemigo,dañoJugador,dañoEnemigo,dañoVentajaJugador,dañoVentajaEnemigo,esquivadoJugador,esquivadoEnemigo);
    //Vemos si el jugador gana el combate
    if (juego.ejercitoEnemigo.getUnidadesVivas() == 0){
        juego.victorias ++;
        finCombate();
        document.getElementById('derrotaCombate').className = 'oculto';
        document.getElementById('victoriaCombate').className = '';
        document.getElementById('oroGanado').textContent = juego.oroGanado;
    } else if (juego.ejercito.getUnidadesVivas() == 0){
        juego.derrotas++;
        finCombate();
        document.getElementById('victoriaCombate').className = 'oculto';
        document.getElementById('derrotaCombate').className = '';
        document.getElementById('oroGanado').textContent = juego.oroGanado;
    }
}
//Nos devuelve la primera unidad viva de ambos ejércitos
function primeraUnidadViva(ejercito){   
    for (let i in ejercito){
        if (ejercito[i].estaViva()){
            return ejercito[i];
        }
    }
    return -1;
}
//Vemos si tienen ventaja a la hora de atacar o no
function ventaja(unidadAtacante, unidadDefensora){
    if (unidadAtacante.tipo === 'Mago' && unidadDefensora.tipo === 'Guerrero'){
        return 1.5;
    } else if (unidadAtacante.tipo === 'Guerrero' && unidadDefensora.tipo === 'Ladron') {
        return 1.5;
    } else if (unidadAtacante.tipo === 'Ladron' && unidadDefensora.tipo === 'Mago') {
        return 1.5;
    } else {
        return 1;
    }
}
//Devuelve el daño total que hará
function calcularDaño(atacante){
    switch (atacante.tipo){
        case 'Guerrero': return atacante.ataqueConcentrado();
        case 'Ladron': return atacante.ataque;
        case 'Mago': return atacante.bolaDeFuego();
    }
}
//Muestra la info del combate, el daño que hace, si usa habilidades.....
function mostrarInfoCombate(habilidadJugador,habilidadEnemigo,dañoJugador,dañoEnemigo,dañoVentajaJugador,dañoVentajaEnemigo,esquivadoJugador,esquivadoEnemigo){
    document.getElementById('tituloCombate').textContent = 'TURNO ' + juego.turno;
    //Tipojugador clase
    let claseTipoJugador = document.getElementsByClassName('tipoJugador');
    for (let i of claseTipoJugador){
        i.textContent = juego.unidadJugador.tipo;
    }
    //Habilidad jugador
    switch (juego.unidadJugador.tipo){
        case 'Guerrero':
            document.getElementById('habilidadJugador').textContent = habilidadJugador;
        break;
        case 'Ladron':
            document.getElementById('habilidadEsquivarJugador').textContent = habilidadJugador;
        break;
        case 'Mago':
            document.getElementById('habilidadJugador').textContent = habilidadJugador;
        break;
    }
    //Si tiene ventaja
    if (dañoVentajaJugador > 1){
        document.getElementById('ventajaJugador').textContent = '[Ventaja de tipo]';
    } else {
        document.getElementById('ventajaJugador').textContent = '';
    } 
    document.getElementById('dañoJugador').textContent = dañoJugador;
    let claseTipoEnemigo = document.getElementsByClassName('tipoEnemigo');
    for (let i of claseTipoEnemigo){
        i.textContent = juego.unidadEnemigo.tipo;
    }
    document.getElementById('vidaEnemigo').textContent = juego.unidadEnemigo.vidaActual;
    let porcentajeVidaEnemigo = calcularPorcentajeVida(juego.unidadEnemigo);
    let colorBarraEnemigo = calcularColorBarra(porcentajeVidaEnemigo);
    document.getElementById('barraVidaEnemigo').style.width = Math.round(porcentajeVidaEnemigo * 100) + '%';
    document.getElementById('barraVidaEnemigo').style.backgroundColor = colorBarraEnemigo;
    //Habilidad enemigo
    switch (juego.unidadEnemigo.tipo){
        case 'Guerrero':
            document.getElementById('habilidadEnemigo').textContent = habilidadEnemigo;
        break;
        case 'Ladron':
            document.getElementById('habilidadEsquivarEnemigo').textContent = habilidadEnemigo;
        break;
        case 'Mago':
            document.getElementById('habilidadEnemigo').textContent = habilidadEnemigo;
        break;
    }
    if (dañoVentajaEnemigo > 1){
        document.getElementById('ventajaEnemigo').textContent = '[Ventaja de tipo]';
    } else {
        document.getElementById('ventajaEnemigo').textContent = '';
    } 
    document.getElementById('dañoEnemigo').textContent = dañoEnemigo;
    document.getElementById('vidaJugador').textContent = juego.unidadJugador.vidaActual;
    let porcentajeVidaJugador = calcularPorcentajeVida(juego.unidadJugador);
    let colorBarraJugador = calcularColorBarra(porcentajeVidaJugador);
    document.getElementById('barraVidaJugador').style.width = Math.round(porcentajeVidaJugador * 100) + '%';
    document.getElementById('barraVidaJugador').style.backgroundColor = colorBarraJugador;
}
//Habilita los botones despues del combate y actualiza los valores
function finCombate(){
    habilitarBotones();
    document.getElementById('combate').className = 'oculto';
    document.getElementById('avisoCombatir').textContent = '';
    document.getElementById('pantallaFinalCombate').className = ''
    juego.recuperacion = true;  //Habilitamos la recuperación
    juego.oro += juego.oroGanado;
    juego.intentosContratacion = 6; //Reinicio los intentos de contratación
    juego.enCombate = false;
    actualizarValores();
    document.getElementById('infoCombate').className = 'oculto';    //Oculto el texto del combate
    finPartida();
}
function habilitarBotones(){
    document.getElementById('contratarAccionBtn').disabled = false;
    document.getElementById('despedirAccionBtn').disabled = false;
    document.getElementById('combatirAccionBtn').disabled = false;
    document.getElementById('informacionBtn').disabled = false;
    document.getElementById('guardarBtn').disabled = false;
}
//Vemos si despues del combate, ha terminado la partida ganando o perdiendo, o sigue jugando
function finPartida(){
    if (juego.derrotas == juego.derrotasMax){
        cargarFetch('partidaPerdida.html');
    } else if (juego.victorias == juego.victoriasRequeridas) {
        cargarFetch('partidaGanada.html');
    }
}
//Muestra las unidades que tenemos en nuestro ejército
function informacion(){
    let contenedor = document.getElementById('muestraInfo');
    contenedor.innerHTML= '';
    for (let i in juego.ejercito.unidades){
        i = parseInt(i);
        let div = document.createElement('div');
        div.classList.add('tarjetaTropa');
        let porcentajeVida = calcularPorcentajeVida(juego.ejercito.unidades[i]);
        let colorBarra = calcularColorBarra(porcentajeVida);
        div.innerHTML = crearHTMLTarjeta(juego.ejercito.unidades[i]);
        contenedor.appendChild(div);
    }
    if (juego.recuperacion === false){
        document.getElementById('botonCurar').disabled = true;
    } else {
        document.getElementById('botonCurar').disabled = false;
    }
    
}
function listenerCurar(){
    document.getElementById('botonCurar').addEventListener('click', () => {
        recuperar();
    })
}
//Recupera la vida y las habilidades de cada unidad del ejército
function recuperar(){
    for (let i in juego.ejercito.unidades){
        juego.ejercito.unidades[i].recuperarVida();
        juego.ejercito.unidades[i].recuperarHabilidad();
    }
    juego.recuperacion = false;
    actualizarValores();
    informacion();
}
//Guardamos la partida en local
function guardarPartida(){
    //JSON con la info a almacenar
    let partidaGuardada = {
        dificultad: juego.dificultad,
        oro: juego.oro,
        victoriasRequeridas: juego.victoriasRequeridas,
        derrotasMax: juego.derrotasMax,
        victorias: juego.victorias,
        derrotas: juego.derrotas,
        intentosContratacion: juego.intentosContratacion,
        recuperacion: juego.recuperacion,
        ejercito: juego.ejercito.unidades,
    }
    localStorage.setItem('partidaGuardada', JSON.stringify(partidaGuardada));
}
function listenerSalir(){
    document.getElementById('salir').addEventListener('click', () => {
        salir();
    })
}
//Vuelve la inicio
function salir(){
    location.replace('../html/inicio.html');
}