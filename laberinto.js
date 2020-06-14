//filas y columnas
var cols = 25;
var filas = 25;
var laberinto = new Array(cols);

//listas abiertas y cerradas
var abierta = [];
var cerrada = [];

//nodos de inicio y meta
var inicio;
var meta;

//variables para escalar el dibujo del laberinto
var ancho;
var alto;

var ruta = [];

//barrar elementos de la lista y acomodarla de nuevo
function quitar(arr, elemento){
    for(var i = arr.length;i>=0;i--){
        if(arr[i] == elemento){
            arr.splice(i,1);
        }
    }
}

function heuristica(a,b){
    //la funcion dist calcula la distancia
    //con el teorema de pitagoras 
    var d = dist(a.i,a.j,b.i,b.j);
    //var d = abs(a.i-b.i) + abs(a.j-b.j);
    return d;
}

//constructor del objeto casilla
function Casilla(i, j){
    //coordenadas de la casilla
    this.i = i;
    this.j = j;
    //costo estimado de la solucion mas barata
    this.f = 0;
    //costo del nodo de inicio al nodo n
    this.g = 0;
    //costo de la ruta mas barata del nodo n a la meta
    this.h = 0;
    //vecinos cercanos de un nodo
    this.vecinos = [];
    this.anterior = undefined;
    this.muro = false;

    //el 30 por ciento de las casillas seran muros
    if(random(1) < 0.2){
        this.muro = true;
    }

    this.mostrar = function(color){
        fill(color);
        //si es un muro se pinta de nego
        if(this.muro){
            fill(0);
        }
        noStroke();
        rect(this.i*ancho,this.j*alto,ancho-1,alto-1);
    }

    //se añaden los 8 posibles vecinos proximos
    this.anadirVecinos = function(laberinto){
        var i = this.i;
        var j = this.j;
        //verticales y horizontales
        if(i<cols-1){
            this.vecinos.push(laberinto[i+1][j]);
        }
        if(i>0){
            this.vecinos.push(laberinto[i-1][j]);
        }
        if(j<filas-1){
            this.vecinos.push(laberinto[i][j+1]);
        }
        if(j>0){
            this.vecinos.push(laberinto[i][j-1]);
        }
        //diagolanes
        /*if(i>0 && j>0){
            this.vecinos.push(laberinto[i-1][j-1]);
        }
        if(i<cols-1 && j>0){
            this.vecinos.push(laberinto[i+1][j-1]);
        }
        if(i>0 && j<filas-1){
            this.vecinos.push(laberinto[i-1][j+1]);
        }
        if(i<cols-1 && j<filas-1){
            this.vecinos.push(laberinto[i+1][j+1]);
        }*/
    }
}

function recargar(){
    location.reload();
}

function setup(){
    cols = prompt("Ingrese anchura del laberinto");
    filas = prompt("Ingrese altura del laberinto");
        
    var iniX = prompt("Ingrese coordenada X de inicio (Nota X>=0 && X<="+(cols-1)+")");
    var iniY = prompt("Ingrese coordenada Y de inicio (Nota Y>=0 && Y<="+(filas-1)+")");

    var metaX = prompt("Ingrese coordenada X de meta (Nota X>=0 && X<="+(cols-1)+")");
    var metaY = prompt("Ingrese coordenada Y de meta (Nota Y>=0 && Y<="+(filas-1)+")");

    canvas = createCanvas(500,500);

    boton = createButton('Nuevo laberinto');
    boton.position(0,canvas.height+30);
    boton.mousePressed(recargar);

    //para escalar el dibujo
    ancho = width/cols;
    alto = height/filas;

    //se inicializa laberinto como una matriz
    for(var i=0; i<cols; i++){
        laberinto[i] = new Array(filas);
    }

    //el laberinto será una matriz de objetos llamados Casilla
    for(var i=0; i<cols;i++){
        for(var j=0;j<filas; j++){
            laberinto[i][j] = new Casilla(i, j);
        }
    }

    //anadir a los vecinos cercanos
    for(var i=0; i<cols;i++){
        for(var j=0;j<filas; j++){
            laberinto[i][j].anadirVecinos(laberinto);
        }
    }

    //se inicializan los nodos de inicio y meta
    inicio = laberinto[iniX][iniY];
    meta = laberinto[metaX][metaY];
    inicio.muro = false;
    meta.muro = false;
    //meta = laberinto[10][10];

    //la lista abierta debe empezar por el nodo de inicio
    abierta.push(inicio);
}

//funcion para dibujar
function draw(){
    
    if(abierta.length > 0){
        //se puedo continuar
        var ganador = 0;
        for(var i=0; i<abierta.length; i++){
            //se busca quien tiene de momento la solucion mas barata
            if(abierta[i].f < abierta[ganador].f){
                ganador = i;
            }
        }

        var actual = abierta[ganador];

        //si se encuentra la meta
        if(actual === meta){
            noLoop();
            console.log("se ha acabado");
        }

        //quitar los visitados y anadir los no visitados
        quitar(abierta, actual);
        cerrada.push(actual);

        var vecinos = actual.vecinos;
        for(var i=0;i<vecinos.length;i++){
            var vecino = vecinos[i];
            //si la lista cerrada no contiene al vecino proximo
            if(!cerrada.includes(vecino) && !vecino.muro){
                var tempG = actual.g + 1;
                var nuevaRuta = false;
                //si el vecino se puede visitar
                if(abierta.includes(vecino)){
                    //si el costo de la ruta calculada es menor que 
                    //la ruta calculada actual, entonces encontrate
                    //una mejor ruta
                    if(tempG < vecino.g){
                        vecino.g = tempG;
                        nuevaRuta = true;
                    }
                }else{
                    vecino.g = tempG;
                    nuevaRuta = true;
                    abierta.push(vecino);
                }

                //se calcula la distancia entre el vecino y la meta
                if(nuevaRuta){
                    vecino.h = heuristica(vecino, meta);
                    vecino.f = vecino.g + vecino.h;
                    vecino.anterior = actual;
                }
            }
        }

    }else{
        //no hay solucion
        alert("No hay solución")
        noLoop();
        return;
    }

    background(0);

    //se pintan las casillas
    for(var i=0; i<cols; i++){
        for(var j=0;j<filas; j++){
            laberinto[i][j].mostrar(color(255));
        }
    }

    //colorear la lista cerrada
    for(var i=0; i<cerrada.length;i++){
        cerrada[i].mostrar(color(255, 0, 0));
    }

    //colorear la lista abierta
    for(var i=0; i<abierta.length;i++){
        abierta[i].mostrar(color(0, 255, 0));
    }

    //encontrar la ruta
    ruta = [];
    var temp = actual;
    ruta.push(temp);
    while(temp.anterior){
        ruta.push(temp.anterior);
        temp = temp.anterior;
    }

    //se pinta la ruta a seguir
    for(var i=0;i<ruta.length;i++){
        ruta[i].mostrar(color(0,0,255));
    }
}