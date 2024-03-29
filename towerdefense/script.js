var turretVersion = 1.00;

var keys = [];

// Hulpprogrammafuncties
var utils = {
  radians: function(degrees){
    return degrees * Math.PI / 180
  },
  random: function(min, max){
    return min+Math.round(Math.random() * (max - min));
  },
  nearest: function(numb, to){
    return Math.round(numb / to) * to;
  },
  range: function(entity1,entity2){
    return Math.sqrt(Math.pow(entity1.y - entity2.y,2) + Math.pow(entity1.x - entity2.x,2));
  },
  calculateShot: function(entity1,entity2){
    var range = this.range(entity1,entity2);
    var speedX = ((entity1.x - entity2.x) / range) * 5;
    var speedY = ((entity1.y - entity2.y) / range) * 5;
    return {
      vx: speedX+entity1.vx,
      vy: speedY+entity1.vy,
    }
  },
  squareCollison: function(rect1,rect2){
    return rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.height + rect1.y > rect2.y;
  },
  circleCollision: function(circle1,circle2){
    var dx = circle1.x - circle2.x;
    var dy = circle1.y - circle2.y;
    var distance = Math.sqrt(dx * dx + dy * dy);

    return (distance < circle1.radius + circle2.radius)
  },
  roundTo: function(numb,to){
    to = Math.pow(10,to);
    return Math.round(numb*to)/to;
  },
  pointToRect(r1, r2) {
    return !(r2.left > r1.right || 
           r2.right < r1.left || 
           r2.top > r1.bottom ||
           r2.bottom < r1.top);
  }
}

// Controleer of het spel is afgelopen
function checkGameOver() {
  if (lives <= 0) {
    var GameOver = document.getElementById("GameOver");
    GameOver.style.display = "block";
  }
}

// Vernieuw het spel
function refreshGame() {
  location.reload();
}

// Luister naar toetsaanslagen
$(document).keydown(function (e) {
    keys[e.keyCode] = true;
});

$(document).keyup(function (e) {
    delete keys[e.keyCode];
});

// Punten van het pad
var pathPoints = [
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 1000, y: 100 },
    { x: 1000, y: 300 },
    { x: 1375, y: 300 },
    { x: 1375, y: 425 },
    { x: 100, y: 425 },
    { x: 100, y: 675 },
    { x: 1350,  y: 675 },
    { x: 1350,  y: 850 },
    { x: 350,  y: 850 },
    { x: 350,  y: 1250 }
];


var enemies = {};  // Object om vijanden bij te houden
var turrets = {};  // Object om torens bij te houden
var bullets = {};  // Object om kogels bij te houden
var particles = {};  // Object om deeltjes bij te houden

var cooldown = 1000;  // Cooldown tijd voor speciale aanval

var FPS = 60;  // Frames per seconde
var lives = 40;  // Aantal levens van de speler

var money = 500;  // Geldbedrag van de speler

var nextWaveIn = 100;  // Tijd tot de volgende golf
var waveCount = 0;  // Aantal golven voltooid

var mouseX = 0;  // X-positie van de muis
var mouseY = 0;  // Y-positie van de muis

// enemies
var basic = {
  speed: 5,
  color: "black",
  hp: 10,
  size: 20,
}
var fast = {
  speed: 4,
  color: "blue",
  hp: 15,
  size: 10,
}
var boss = {
  speed: 1/2,
  color: "red",
  hp: 1000,
  size: 25,
  special: "summon",
}
var dodger = {
  speed: 3,
  color: "darkkhaki",
  hp: 25,
  size: 14,
  special: "dodger",
}
var runner = {
  speed: 2,
  color: "orange",
  hp: 35,
  size: 15,
  special: "summonFast",
}
var teleporter = {
  speed: 1,
  color: "lime",
  hp: 15,
  size: 15,
  special: "teleport",
}
var summoner = {
  speed: 1,
  color: "brown",
  hp: 20,
  size: 20,
  special: "summon",
}
var healer = {
  speed: 2,
  color: "white",
  hp: 20,
  size: 15,
  special: "heal",
}
var heavy = {
  speed: 1,
  color: "grey",
  hp: 200,
  size: 15,
}


// Torens 
var normal = {
  x: Math.random()*600,
  y: 50, // 50
  dmg: 2, // 1
  fireRate: 25, // 20
  fire: 0, // always 0
  range: 100, // 100
  color: "yellow",
  strokeColor: "goldenrod",
  level: 0,
  upgrades: {
    lvl1:{
      dmg: 2,
      fireRate: 25,
      range: 100,
      price: 10,
    },
    lvl2:{
      dmg: 2,
      fireRate: 20,
      range: 110,
      price: 20,
    },
    lvl3:{
      dmg: 3,
      fireRate: 18,
      range: 125,
      price: 25,
    },
    lvl4:{
      dmg: 5,
      fireRate: 16,
      range: 150,
      price: 30,
    },
    lvl5:{
      dmg: 5,
      fireRate: 14,
      range: 200,
      price: 30,
    }
  }
}
var shotgun = {
  x: Math.random()*600,
  y: 50, // 50
  dmg: 6, // 1
  fireRate: 90, // 20
  fire: 0, // always 0
  range: 80, // 100
  color: "red",
  strokeColor: "black",
  level: 0,
  upgrades: {
    lvl1:{
      dmg: 6,
      fireRate: 90,
      range: 80,
      price: 50,
    },
    lvl2:{
      dmg: 7,
      fireRate: 85,
      range: 90,
      price: 25,
    },
    lvl3:{
      dmg: 10,
      fireRate: 80,
      range: 100,
      price: 30,
    },
    lvl4:{
      dmg: 15,
      fireRate: 75,
      range: 110,
      price: 30,
    },
    lvl5:{
      dmg: 20,
      fireRate: 60,
      range: 125,
      price: 50,
    },
  }
}
var sniper = {
  x: Math.random()*600,
  y: 50, // 50
  dmg: 10, // 10
  fireRate: 100, // 20
  fire: 0, // always 0
  range: 800, // 100
  color: "blue",
  strokeColor: "black",
  level: 0,
  upgrades: {
    lvl1:{
      dmg: 10,
      fireRate: 100,
      range: 820,
      price: 40,
    },
    lvl2:{
      dmg: 15,
      fireRate: 90,
      range: 850,
      price: 30,
    },
    lvl3:{
      dmg: 15,
      fireRate: 85,
      range: 880,
      price: 30,
    },
    lvl4:{
      dmg: 18,
      fireRate: 80,
      range: 910,
      price: 30,
    },
    lvl5:{
      dmg: 25,
      fireRate: 70,
      range: 1000,
      price: 50,
    },
  }
}
var minigun = {
  x: Math.random()*600,
  y: 50, // 50
  dmg: 0.5, // 10
  fireRate: 5, // 20
  fire: 0, // always 0
  range: 75, // 100
  color: "white",
  strokeColor: "black",
  level: 0,
  upgrades: {
    lvl1:{
      dmg: 0.6,
      fireRate: 4,
      range: 80,
      price: 25,
    },
    lvl2:{
      dmg: 0.8,
      fireRate: 4,
      range: 85,
      price: 15,
    },
    lvl3:{
      dmg: 1,
      fireRate: 3,
      range: 90,
      price: 20,
    },
    lvl4:{
      dmg: 1.2,
      fireRate: 3,
      range: 95,
      price: 25,
    },
    lvl5:{
      dmg: 1.5,
      fireRate: 2,
      range: 100,
      price: 25,
    },
  }
}
var flamethrower = {
  x: Math.random()*600,
  y: 50, // 50
  dmg: 1/4, // 10
  fireRate: 5, // 20
  fire: 0, // always 0
  range: 80, // 100
  color: "orange",
  strokeColor: "black",
  level: 0,
  upgrades: {
    lvl1:{
      dmg: 1/6,
      fireRate: 5,
      range: 80,
      price: 25,
    },
    lvl2:{
      dmg: 2/5,
      fireRate: 5,
      range: 85,
      price: 15,
    },
    lvl3:{
      dmg: 6/4,
      fireRate: 5,
      range: 90,
      price: 20,
    },
    lvl4:{
      dmg: 2,
      fireRate: 3,
      range: 95,
      price: 25,
    },
    lvl5:{
      dmg: 15/5,
      fireRate: 2,
      range: 100,
      price: 25,
    },
  }
}
var poison = {
  x: Math.random()*600,
  y: 50, // 50
  dmg: 1/4, // 10
  fireRate: 5, // 20
  fire: 0, // always 0
  range: 100, // 100
  color: "lime",
  strokeColor: "black",
  level: 0,
  upgrades: {
    lvl1:{
      dmg: 1/2,
      fireRate: 25,
      range: 100,
      price: 25,
    },
    lvl2:{
      dmg: 1,
      fireRate: 20,
      range: 105,
      price: 20,
    },
    lvl3:{
      dmg: 1.5,
      fireRate: 15,
      range: 110,
      price: 25,
    },
    lvl4:{
      dmg: 2,
      fireRate: 10,
      range: 120,
      price: 25,
    },
    lvl5:{
      dmg: 2,
      fireRate: 5,
      range: 130,
      price: 25,
    },
  }
}

var slow = {
  x: Math.random()*600,
  y: 50, // 50
  dmg: 1/4, // 10
  fireRate: 5, // 20
  fire: 0, // always 0
  range: 100, // 100
  color: "purple",
  strokeColor: "black",
  level: 0,
  upgrades: {
    lvl1:{
      dmg: 1/2,
      fireRate: 25,
      range: 100,
      price: 25,
    },
    lvl2:{
      dmg: 1,
      fireRate: 20,
      range: 105,
      price: 20,
    },
    lvl3:{
      dmg: 1.5,
      fireRate: 15,
      range: 110,
      price: 25,
    },
    lvl4:{
      dmg: 2,
      fireRate: 10,
      range: 120,
      price: 25,
    },
    lvl5:{
      dmg: 2,
      fireRate: 5,
      range: 130,
      price: 25,
    },
  }
}

// Functie die nieuwe enemies aanmaakt
function newEnemy(type, x, y, pathNode) {
  if (!type) type = "basic";
  var speed = window[type].speed;
  var color = window[type].color;
  var hp = window[type].hp;
  var hpMax = hp;
  if (!x){var x = 0;}
  if(!y){var y = 20;}
  var size = window[type].size;
  var special = window[type].special;
  
  x = Math.ceil(x/2) * 2;
  
  if (!pathNode) pathNode = 0;
  

  var id = Math.random();

  var e = {
    x: x,
    y: y,
    vx:speed,
    vy:speed,
    speed: speed,
    color: color,
    size: size,
    hp: hp,
    hpMax: hpMax,
    special: special,
    pathNode: pathNode,
    goToPosX: true,
    goToPosY: false,
    selected: false,
    onFire: 0,
    poison: 0,
    slow: 0,
  }

  enemies[id] = e;
}

// Functie die kogels aan maakt
function newBullet(x,y, dmg, vx, vy, fire, poison, slow) {
  
  var id = Math.random();
  
  if (!fire) fire = 0;
  if (!poison) poison = 0;
  if (!slow) slow = 0;

  var b = {
    x: x,
    y: y,
    vx: vx,
    vy: vy,
    life: 0,
    dmg: dmg,
    fire: fire,
    poison: poison,
    slow: slow,
  }

  bullets[id] = b;
}


// Functie die turrets laat werken
function newTurret(type, x, y) {
  if (!type) type = "normal";
  
  var id = Math.random();
  
  var t = {
    x: x,
    y: y, // 50
    dmg: window[type].dmg, // 1
    fireRate: window[type].fireRate, // 20
    fire: 0, // always 0
    range: window[type].range, // 100
    type: type,
    strokeColor: window[type].strokeColor,
    color: window[type].color,
    selected: false,
    level: 1,
    upgrades: window[type].upgrades,
    isSold: false,
  }
  

  turrets[id] = t;
}

// Functie die particles laat werken
function newParticle(x, y, life, color){
  var randx = Math.random()*2-1;
  var randy = Math.random()*2-1;
  
  if (!color) color = "black";
  
  var p = {
    x: x,
    y: y,
    vx: randy,
    vy: randx,
    color: color,
    life: life,
  }
  particles[Math.random()] = p;
}

// functie die de canvas aanmaakt
var ctx = document.getElementById("canvas").getContext("2d");
// var image = new Image();

// image.src = "mapjeTD_EXPO.png";
// image.onload = function() {
//   ctx.drawImage(image, 0, 0);
// };



// Functie die het geld, levens en de rondes bij houdt.
function engine() {
    $("#gold").html("Gold: " + Math.floor(money * 10) / 10); 
    $("#lives").html("Lives: " + Math.floor(lives));
    $("#wave").html("Round: " + waveCount);
    
    $("#turret_version").html("v" + turretVersion);

  ctx.fillStyle = "#F7C85B";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  drawMap();
  
  for (var key in enemies){
    if (enemies[key] && cooldown > 0){
      cooldown -= 1;
      break;
    }
  }
  
  var disabledColor = "#5e5e5e";
  var enabledColor = "#0cb53c";
  
  $('#specialAttackBtn').html("Special attack<br>"+cooldown+"s");
  if (cooldown <= 0) $('#specialAttackBtn').css("background-color",enabledColor);
  if (cooldown > 0) $('#specialAttackBtn').css("background-color",disabledColor);
  
  var enemiesAreAlive = false;
  
  for (var key in enemies){
    if (enemies[key])$('#nextWaveBtn').css("background-color",disabledColor);
    enemiesAreAlive = true;
  }
  if (!enemiesAreAlive) $('#nextWaveBtn').css("background-color",enabledColor);
  
  if (lives <= 0){
    
  }

  for (var key in enemies) {
    entity(enemies[key]);
    if (enemies[key].hp <= 0) {
      for (var i = 0; i < 10; i++){
        newParticle(enemies[key].x,enemies[key].y, 100);
      }
      money += Math.floor(enemies[key].hpMax / 10);
      delete enemies[key];
    }
  }
  
  for (var key in bullets){
    bulletEngine(bullets[key]);
    if (bullets[key].x < 0 || bullets[key].x >= canvas.width || bullets[key].y < 0 || bullets[key].y >= canvas.height){
      for (var i = 0; i < 10; i++){
        newParticle(bullets[key].x,bullets[key].y,150);
      }
      delete bullets[key];
    }
  }

  for (var key in turrets) {
    turretEngine(turrets[key]);
    if (turrets[key].isSold){
      delete turrets[key];
    }
  }
  
  for (var key in particles) {
    particle(particles[key]);
    if (particles[key].life <= 0) {
      delete particles[key];
    }
  }
  
  
  var towers = ["normal","shotgun","minigun","sniper","poison","flamethrower", "slow"];
  
  for (var i = 0; i < towers.length; i++){
    var checked = document.getElementById(towers[i]).checked;
    if (checked){
      var tower = window[towers[i]];
      ctx.fillStyle = "black";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(mouseX,mouseY,tower.range,0,Math.PI*2,true);
      ctx.stroke();
      
      ctx.fillStyle = tower.color;
      ctx.strokeStyle = tower.strokeColor;
      ctx.beginPath();
      ctx.arc(mouseX,mouseY,10,0,Math.PI*2,true);
      ctx.stroke();
      ctx.fill();
    }
  }
  
  
  

  setTimeout(engine, 1000 / FPS);
}
engine();


// functie voor special attack
function entity(ent) {
  ctx.fillStyle = ent.color;
  ctx.fillRect(ent.x, ent.y, ent.size, ent.size);

  //ctx.font = "12px Arial";
  //ctx.fillText(Math.floor(ent.hp * 10) / 10, ent.x, ent.y - 10);
  
  for (var key in bullets){
      if (ent.x < bullets[key].x + 5 && ent.x + ent.size > bullets[key].x && ent.y < bullets[key].y + 5 && ent.size + ent.y > bullets[key].y){
        ent.hp -= bullets[key].dmg;
        ent.poison = bullets[key].poison;
        ent.onFire = bullets[key].fire;
        ent.slow = bullets[key].slow;
        for (var i = 0; i < 5; i++){
          newParticle(bullets[key].x,bullets[key].y,60);
        }
        delete bullets[key];
    }
  }
  
  if (ent.y >= 1200){ 
    ent.hp = 0;
    lives--;

  lives -= 1;
  checkGameOver();
  }
  
  var perc = ent.hp / ent.hpMax;
  
  ctx.fillStyle = "black";
  ctx.fillRect(ent.x, ent.y-10, ent.size, 5);

  ctx.fillStyle = "red";
  ctx.fillRect(ent.x, ent.y-10, ent.size * perc, 5);
  
  if (ent.special == "summonFast"){
    var rand = Math.random();
    if (rand < 0.01){
      newEnemy("fast",ent.x,ent.y, ent.pathNode);
    }
  }
  if (ent.special == "dodger"){
    var rand = Math.random();
    if (rand < 0.15){
      Math.random() < 0.5 ? ent.y += 10 : ent.y -= 10
    }
  }
  
  if (ent.special == "teleport"){
    var rand = Math.random();
    if (rand < 0.02){
      if (ent.goToPosX) ent.x += ent.speed * 5;
      if (ent.goToPosX == false) ent.x -= ent.speed * 5;
      for (var key in enemies){
        var range = Math.sqrt(Math.pow(enemies[key].y - ent.y,2) + Math.pow(enemies[key].x - ent.x,2));
        if (range < 100 && ent.goToPosX){
          enemies[key].x += enemies[key].speed * 5;
        }
        if (range < 100 && ent.goToPosX == false){
          enemies[key].x -= enemies[key].speed * 5;
        }
      }
    }
  }
  if (ent.special == "summon"){
    var rand = Math.random();
    if (rand < 0.01){
      newEnemy("basic",ent.x,ent.y, ent.pathNode);
    }
  }
  if (ent.special == "heal" && ent.hp < 20){
    ent.hp += 1/30;
    for (var key in enemies){
      var range = Math.sqrt(Math.pow(enemies[key].y - ent.y,2) + Math.pow(enemies[key].x - ent.x,2));
      if (range < 50 && enemies[key].hp < 20){
        enemies[key].hp+=1/20;
      }
    }
  }
  
  var path = ent.pathNode;
  
  if (ent.y > pathPoints[path].y){
    ent.y-=ent.speed;
    ent.vx = 0;
    ent.vy = ent.speed;
    ent.goToPosY = true;
  }
  
  if (ent.y < pathPoints[path].y){
    ent.y+=ent.speed;
    ent.vx = 0;
    ent.vy = ent.speed;
    ent.goToPosY = true;
  }
  
  if (ent.x < pathPoints[path].x){
    ent.x+= ent.speed;
    ent.vx = ent.speed;
    ent.vy = 0;
    ent.goToPosX = true;
    ent.goToPosY = false;
  }
  
  if (ent.x > pathPoints[path].x){
    ent.x-=ent.speed;
    ent.vx = -ent.speed;
    ent.vy = 0;
    ent.goToPosX = false;
    ent.goToPosY = false;
  }
  
  // 997 - 1003
  if (ent.x-3 <= pathPoints[path].x && ent.x+3 >= pathPoints[path].x && ent.y-3 <= pathPoints[path].y && ent.y+3 >= pathPoints[path].y){
    ent.pathNode++;
  }
  
  if (ent.selected){
    ctx.font = "600 16px Arial bold";
    ctx.fillStyle = "black";
    ctx.fillText((Math.floor(ent.hp*10)/10)+" hp",ent.x-10,ent.y-10);
  }
  
  if (ent.onFire > 0){
    ent.onFire -= 0.04;
    ent.hp -= 1/10;
    newParticle(ent.x+ent.size/2,ent.y+ent.size/2,60,"red");
    newParticle(ent.x+ent.size/2,ent.y+ent.size/2,40,"yellow");
  }
  if (ent.poison > 0){
    ent.poison -= 0.02;
    ent.hp -= 1/20;
    newParticle(ent.x+ent.size/2,ent.y+ent.size/2,100,"lime");
  }
  
  if (ent.slow > 0){
    slow(ent, 2000)
    newParticle(ent.x+ent.size/2,ent.y+ent.size/2,100,"blue");
  }
  
  
}

function slow(entity, str) {
  var speed = entity.speed;
  var slow = entity.slow;
  
  entity.speed /= 2;

  function newEnemySlow() {
    entity.speed = speed;
    entity.slow = 0
  }
  
  setTimeout(newEnemySlow, str);
  
}


// functie voor de waves
function wave(type, amount, timeout, speedup) {
  var x = 0;

  function newEnemyToWave() {
    if (x < amount) {
      newEnemy(type);
    }
    x++;

    if (!speedup) setTimeout(newEnemyToWave, timeout);
    if (speedup) setTimeout(newEnemyToWave, timeout/(x/2));
  }
  newEnemyToWave();
}

function turretEngine(turret) {
  if (turret.fire < turret.fireRate){
    turret.fire++;
  }
  
  ctx.beginPath();
  ctx.arc(turret.x, turret.y, 10, 0, 2 * Math.PI, false);
  ctx.fillStyle = turret.color;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = turret.strokeColor;
  ctx.stroke();
  
  var showRange = document.getElementById("showrange").checked;
  
  if (showRange == true || turret.selected){
    ctx.fillStyle = turret.color;
    ctx.beginPath();
    ctx.arc(turret.x,turret.y,turret.range,0,Math.PI*2,true);
    ctx.stroke();
    ctx.font = "600 16px Arial bold";
    ctx.fillStyle = "black";
    // turret -> upgrades -> lvl1 -> dmg
    var upDmg = turret.upgrades["lvl"+(turret.level+1)].dmg;
    var upFire = turret.upgrades["lvl"+(turret.level+1)].fireRate;
    var upPrice = turret.upgrades["lvl"+(turret.level+1)].price;
    
    if (turret.level == 4){
      var fireRate = (Math.floor(1000/60 * turret.fireRate*100/1000)/100);
      ctx.fillText(turret.dmg+" dmg",turret.x-10,turret.y-30);
      ctx.fillText(fireRate+"s",turret.x-10,turret.y-20);
    }
    
    if (turret.level < 4){
      ctx.fillText((Math.floor(turret.dmg*100)/100)+" dmg -> "+upDmg,turret.x-10,turret.y-45);
      var fireRate = (Math.floor(1000/60 * turret.fireRate*100/1000)/100);
      upFire = (Math.floor(1000/60 * upFire*100/1000)/100);
      ctx.fillText(fireRate+"s -> "+upFire+"s",turret.x-10,turret.y-30);
      ctx.fillText(upPrice+"$",turret.x-10,turret.y-15);
      ctx.fillText(turret.level,turret.x-3,turret.y+3);
    }
  }
  
  var perc = turret.fire / turret.fireRate;
  
  ctx.fillStyle = "black";
  ctx.fillRect(turret.x-10, turret.y+10, 20, 5);

  ctx.fillStyle = "yellow";
  ctx.fillRect(turret.x-10, turret.y+10, 20 * perc, 5);
  
  if (turret.fire >= turret.fireRate) {
      for (var key in enemies){
      
        var range = Math.sqrt(Math.pow(enemies[key].y - turret.y,2) + Math.pow(enemies[key].x - turret.x,2));
          
        if (range <= turret.range){
        
            var shot = utils.calculateShot(enemies[key], turret);
        
          turret.fire = 0;

          if (turret.type == "flamethrower"){
            newBullet(turret.x,turret.y,0, shot.vx, shot.vy, turret.dmg*10);
            break;
          }
          if (turret.type == "poison"){
            newBullet(turret.x,turret.y,0, shot.vx, shot.vy, 0, turret.dmg*10);
          }
          
          if (turret.type !== "poison" && turret.type !== "flamethrower"){
            newBullet(turret.x,turret.y,turret.dmg, shot.vx, shot.vy);
          }
          
          if (turret.type !== "shotgun" && turret.type !== "poison"){
            break;
          }
          
        if (turret.type == "slow"){
            newBullet(turret.x,turret.y,0, shot.vx, shot.vy, 0, 0, 2000);
            break;
          }
          
        }
      }
  }
  // turret -> upgrades -> lvl1 -> dmg
  var level = "lvl"+turret.level;
  
  var stats = turret.upgrades[level];
  
  turret.range = stats.range;
  turret.dmg = stats.dmg;
  turret.fireRate = stats.fireRate;
  
  var upPrice = turret.upgrades[("lvl"+(turret.level+1))].price;
  
  var nextLevel = turret.upgrades[("lvl"+(turret.level+1))];
  //                          U
  if (turret.selected && keys[85] && turret.level < 4){
    var newFireRate = (Math.floor(1000/60 * nextLevel.fireRate*100/1000)/100);
    var actualFireRate = (Math.floor(1000/60 * turret.fireRate*100/1000)/100);
    $('#dialog-msg').html("Are you sure you want to spend <b><u>"+upPrice+"$</u></b> for upgrade?<br>Damage: "+(Math.floor(turret.dmg*100)/100)+" &#x279C; "+(Math.floor(nextLevel.dmg*100)/100)+"<br>Fire rate: "+(Math.floor(actualFireRate*100)/100)+"s &#x279C; "+(Math.floor(newFireRate*100)/100)+"s<br>Range: "+turret.range.toFixed(0)+"m &#x279C; "+nextLevel.range.toFixed(0)+"m");
    $('#dialog').dialog({
      modal: true,
      draggable: false,
      resizeable: false,
      title: "Are you sure?",
      buttons:{
        "OK":function(){
          if (money >= upPrice){
            money -= upPrice;
            turret.level++;
            $(this).dialog("close");
          }
        },
        "CANCEL":function(){
          $(this).dialog("close");
        }
      }
    });
  }
  //                          S
  if (turret.selected && keys[83]){
    var sellPrice = Math.floor(stats.price);
    $('#dialog-msg').html("Sell turret for "+sellPrice+"$ ?")
    $('#dialog').dialog({
      modal: true,
      draggable: false,
      resizeable: false,
      title: "Are you sure?",
      buttons:{
        "Yes":function(){
          money += sellPrice;
          turret.isSold = true;
          $(this).dialog("close");
        },
        "No":function(){
          $(this).dialog("close");
        }
      }
    });
  }
  
}

// functie voor bulletEngine

function bulletEngine(bullet){
  ctx.fillStyle = "black";
  if (bullet.fire > 0) ctx.fillStyle = "red";
  if (bullet.poison > 0) ctx.fillStyle = "lime";
  ctx.beginPath();
  ctx.arc(bullet.x, bullet.y, 2.5, 0, 2 * Math.PI, false);
  ctx.fill();
  bullet.x += bullet.vx;
  bullet.y += bullet.vy;
  
}

function particle(particle){
  ctx.fillStyle = particle.color;
  ctx.fillRect(particle.x,particle.y,particle.life/50,particle.life/50);
  
  particle.x += particle.vx;
  particle.y += particle.vy;
  particle.life--;
}


// functie die de map tekent
function drawMap(){
  ctx.beginPath();
  ctx.strokeStyle = "brown";
  ctx.lineWidth=50;
  ctx.lineJoin='round'; 
  var lastPoint = null;
  for(var i = 0; i < pathPoints.length; i++) {
    var curPoint = pathPoints[i];
    if (lastPoint)
      ctx.lineTo(curPoint.x, curPoint.y);
      ctx.moveTo(curPoint.x, curPoint.y);
      lastPoint = curPoint;
    }
  ctx.stroke();
  ctx.lineWidth = 2;
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}
// window.oncontextmenu = function(){
//   document.getElementById("select").checked = true;
//   return false;
// }
function placeTower(){
  // check collision with mouse
  for (var key in turrets){
    var dx = turrets[key].x - mouseX;
    var dy = turrets[key].y - mouseY;
    var distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 13){
      turrets[key].selected = true;
      break;
    }
    if (distance > 13){
      for (var key in turrets){
        turrets[key].selected = false;
      }
    }
  }
  
  for (var key in enemies){
    var dx = enemies[key].x - mouseX;
    var dy = enemies[key].y - mouseY;
    var distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < enemies[key].size + 3){
      enemies[key].selected = true;
      break;
    }
    if (distance > 13){
      for (var key in enemies){
        enemies[key].selected = false;
      }
    }
  }
  
  var normalChecked = document.getElementById("normal").checked;
  var shotgunChecked = document.getElementById("shotgun").checked;
  var minigunChecked = document.getElementById("minigun").checked;
  var sniperChecked = document.getElementById("sniper").checked;
  var poisonChecked = document.getElementById("poison").checked;
  var flamethrowerChecked = document.getElementById("flamethrower").checked;
  var slowChecked = document.getElementById("slow").checked;
  
  if (normalChecked && money >= 20){
    newTurret("normal",mouseX,mouseY);
    money -= 20;
  }
  if (shotgunChecked && money >= 100){
    newTurret("shotgun",mouseX,mouseY);
    money -= 100;
  }
  if (minigunChecked && money >= 30){
    newTurret("minigun",mouseX,mouseY);
    money -= 30;
  }
  if (sniperChecked && money >= 75){
    newTurret("sniper",mouseX,mouseY);
    money -= 75;
  }
  if (poisonChecked && money >= 35){
    newTurret("poison",mouseX,mouseY);
    money -= 35;
  }
  if (flamethrowerChecked && money >= 40){
    newTurret("flamethrower",mouseX,mouseY);
    money -= 40;
  }
  if (slowChecked && money >= 35){
    newTurret("slow",mouseX,mouseY);
    money -= 35;
  }  
  
  // document.getElementById("select").checked = true;
  
}

document.onmousemove = function(mouse){
  mouseX = mouse.clientX - document.getElementById('canvas').getBoundingClientRect().left;
  mouseY = mouse.clientY - document.getElementById('canvas').getBoundingClientRect().top;
};

// basic, fast, boss, dodger, runner, teleporter, summoner, healer, heavy
function nextWave(){
  
  waveCount++;
  money += 5;
  var enemies = ["basic","fast","boss","dodger","runner","teleporter","summoner","healer","heavy"];
  var teamWork = Math.random();
  
  var type = Math.floor((Math.random()*31*waveCount)+1);
  
  var rand = Math.random() < 0.5 ? true : false;
  
  var randSpeed = Math.floor((Math.random()*2500)+500);
  if (waveCount > 10){
    randSpeed = 1000;
  }
  if (waveCount > 25){
    randSpeed = 500;
  }
  if (waveCount > 50){
    randSpeed = 250;
  }
  if (waveCount > 100){
    randSpeed = 100;
  }
  if (waveCount > 200){
    randSpeed = 50;
  }
  
  rand = true;
  
  if (type > 0){
    wave("basic",waveCount*3,randSpeed,rand);
  }
  if (type > 200 && waveCount % 10 !== 0 && waveCount % 25 !== 0){
    wave("fast",waveCount*2,randSpeed,rand);
  }
  if (type > 300 && waveCount % 10 !== 0 && waveCount % 25 !== 0){
    wave("dodger",waveCount*2,randSpeed,rand);
  }
  if (type > 400 && waveCount % 10 !== 0 && waveCount % 25 !== 0){
    wave("runner",waveCount*2,randSpeed,rand);
  }
  if (type > 500 && waveCount % 10 !== 0 && waveCount % 25 !== 0){
    wave("teleporter",waveCount*5,randSpeed,rand);
  }
  if (type > 600 && waveCount % 10 !== 0 && waveCount % 25 !== 0){
    wave("summoner",waveCount*3,randSpeed,rand);
  }
  if (type > 700 && teamwork > 0.8 && waveCount % 10 !== 0 && waveCount % 25 !== 0){
    wave("healer",waveCount*2,randSpeed,rand);
  }
  if (waveCount % 10 == 0){
    wave("heavy",waveCount/10,randSpeed,rand);
  }
  if (waveCount % 25 == 0){
    wave("boss",waveCount/25,randSpeed,rand);
  }
  
}
// x,y, dmg, vx, vy
function specialAttack(){
  var wall = document.getElementById("wall").checked;
  var spiral = document.getElementById("spiral").checked;
  var sniperSkill = document.getElementById("sniperSkill").checked;
  
  if (cooldown <= 0){
    cooldown = 1000;
    //wall
    if (wall){
      for (var i = 0; i < 25; i++){
        newBullet(580,i*16,10,-10,0);
      }
      for (var i = 0; i < 25; i++){
        newBullet(0,i*16,10,10,0);
      }
      for (var i = 0; i < 25; i++){
        newBullet(i*50,0,10,0,10);
      }
      for (var i = 0; i < 25; i++){
        newBullet(i*50,400,10,0,-10);
      }
    }
    // spiral
    if (spiral){
      for (var i = 0; i < 50; i++){
        var vx = Math.sin(i) * 5;
        var vy = Math.cos(i) * 5;
        newBullet(300,200,10,vx,vy);
      }
    }
    // accurate
    if (sniperSkill){
      for (var key in enemies){
        var range = Math.sqrt(Math.pow(enemies[key].y - 200,2) + Math.pow(enemies[key].x - 625,2));

        var speedX = ((enemies[key].x - 300) / range) * 4;
        var speedY = ((enemies[key].y - 200) / range) * 4;
        
        if (enemies[key].goToPosY){
          speedY = speedY + enemies[key].speed;
        }
        
        newBullet(300,200, 10, speedX, speedY);

            
      }
    }
    
  }
}
$('input[type=checkbox]').checkboxradio();
$('input[type=radio]').checkboxradio({
  icon: false
});
