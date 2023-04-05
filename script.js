let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
const SW = canvas.width
const SH = canvas.height
const TILE_W = 25;
let bgcolor = "green";

function update () {

}

function renderGrid() {
    context.fillStyle = "black";

    let x;
    for (let i = 0; i < SW / TILE_W; i++) {
        context.beginPath();
        context.moveTo(x,0);

        x += TILE_W;
    }
}

function render() {
    context.fillStyle = bgcolor;
    context.fillRect(0,0,SW,SH);
}

function play() {
    update();
    render();
}

setInterval(play,1000/60);