let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
const SW = canvas.width
const SH = canvas.height
const TILE_W = 25;
let bgcolor = "green";


class Soldier {
    constructor(pos,color,r,health,attack) {
        this.pos = pos;
        this.color = color;
        this.r = r;
        this.health = health;
        this.attack = attack;

        this.targets = [];
        this.targets[0] = new Vector(startPos.x + pathData[0].x,startPos.y + pathData[0].y);

        for (let i = 1; i < pathData.length; i++) {
            let prevTarget = this.targets[i -1];
            let path = pathData[i];

            let newTarget = new Vector(prevTarget.x + path.x, prevTarget.y + path.y);
            this.targets[i] = newTarget;
        }

        this.currentTarget = this.targets[0];
        this.dir = new Vector(0,0);
        this.speed = 4;
        this.minTargetDist = 2;
    }

    render(){
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.pos.x,this.pos.y,this.r,0,Math.PI* 2);
        context.fill();
    }
}


class Vector {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
}

let startPos = new Vector(100,0);

let pathData = [
    new Vector(0,200),
    new Vector(550,0),
    new Vector(0,250),
    new Vector(-500,0)
];

let soldier = new Soldier(startPos,"red",20,100,10);

function update() {

}

function renderPath() {
    let drawPos = new Vector(startPos.x,startPos.y);

    context.fillStyle = "gray";

    pathData.forEach(function(path){
        if (path.x == 0) {
           let x = drawPos.x - TILE_W;
           let y = drawPos.y - TILE_W;
           let w = TILE_W * 2;
           let h = path.y + TILE_W * 2;

           context.fillRect(x,y,w,h);
        }

        else {
            let x = drawPos.x - TILE_W;
            let y = drawPos.y - TILE_W;
            let w = path.x + TILE_W * 2;
            let h = TILE_W *2;

            context.fillRect(x,y,w,h);
        }

        drawPos.x += path.x;
        drawPos.y += path.y;
    });
}

function renderGrid() {
    context.fillStyle = "black";

    let x = 0;
    for (let i = 0; i < SW / TILE_W; i++) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, SH);
        context.stroke();

        x += TILE_W;
    }

    let y = 0;
    for (let i = 0; i < SH / TILE_W; i++) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(SW, y);
        context.stroke();

        y += TILE_W;
    }
}

function render() {
    context.fillStyle = bgcolor;
    context.fillRect(0, 0, SW, SH);

    renderPath();
    renderGrid();
}

function play() {
    update();
    render();
}

setInterval(play, 1000 / 60);