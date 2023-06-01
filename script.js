let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
const SW = canvas.width;
const SH = canvas.height;
const TILE_W = 25;
let bgcolor = "green";

let towers = [];
let projectiles = [];
let soldiers = [];

class Tower {
  constructor(pos, range, color) {
    this.pos = pos;
    this.range = range;
    this.color = color;
    this.targets = [];
  }

  shoot() {
    if (this.targets.length > 0) {
      let target = this.targets[0];
      let dx = target.pos.x - this.pos.x;
      let dy = target.pos.y - this.pos.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      let velocity = { x: dx / distance, y: dy / distance };
      let projectile = new Projectile(this.pos.x, this.pos.y, velocity, 10);
      projectiles.push(projectile);
    }
  }
}

canvas.addEventListener("click", function (event) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
  
    // Check if click is within canvas boundaries
    if (
      mouseX >= 0 &&
      mouseX <= canvas.width &&
      mouseY >= 0 &&
      mouseY <= canvas.height
    ) {
      // Check if user has enough resources to build a tower
  
      // Check if the clicked position is on the path
      let onPath = false;
      let drawPos = new Vector(startPos.x, startPos.y);
      pathData.forEach(function (path) {
        if (path.x == 0) {
          if (
            mouseX >= drawPos.x - TILE_W &&
            mouseX <= drawPos.x + TILE_W &&
            mouseY >= drawPos.y - TILE_W &&
            mouseY <= drawPos.y + path.y + TILE_W
          ) {
            onPath = true;
          }
        } else {
          if (
            mouseX >= drawPos.x - TILE_W &&
            mouseX <= drawPos.x + path.x + TILE_W &&
            mouseY >= drawPos.y - TILE_W &&
            mouseY <= drawPos.y + TILE_W
          ) {
            onPath = true;
          }
        }
        drawPos.x += path.x;
        drawPos.y += path.y;
      });
  
      if (!onPath) {
        // Create new tower object at clicked position with predefined range
        let newTower = new Tower(new Vector(mouseX, mouseY), 100, "gray");
        towers.push(newTower);
      }
    }
  });

function update() {
  // Loop through soldiers and towers to check for targets
  soldiers.forEach(function (s) {
    towers.forEach(function (t) {
      let dist = Math.sqrt(
        (s.pos.x - t.pos.x) ** 2 + (s.pos.y - t.pos.y) ** 2
      );
      if (dist <= t.range) {
        if (!t.targets.includes(s)) {
          t.targets.push(s);
        }
      } else {
        let index = t.targets.indexOf(s);
        if (index != -1) {
          t.targets.splice(index, 1);
        }
      }
    });
  });

  // Loop through towers and shoot projectiles
  towers.forEach(function (t) {
    t.shoot();
  });

  // Loop through projectiles and update position
  for (let i = 0; i < projectiles.length; i++) {
    let projectile = projectiles[i];
    projectile.update();

    // Check for collisions with soldiers
    for (let j = 0; j < soldiers.length; j++) {
      let soldier = soldiers[j];
      let dx = soldier.pos.x - projectile.pos.x;
      let dy = soldier.pos.y - projectile.pos.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < soldier.r) {
        soldier.health -= projectile.damage;
      }
    }
  }
}

function render() {
  // Clear canvas
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Loop through towers and draw circles
  towers.forEach(function (t) {
    context.beginPath();
    context.fillStyle = t.color;
    context.arc(t.pos.x, t.pos.y, t.range, 0, Math.PI * 2);
    context.fill();

    // Loop through targeted soldiers and draw transparent circles
    t.targets.forEach(function (s) {
      context.beginPath();
      context.fillStyle = "rgba(255, 0, 0, 0.2)";
      context.arc(s.pos.x, s.pos.y, s.r, 0, Math.PI * 2);
      context.fill();
    });
  });

  // Loop through soldiers and render
  soldiers.forEach(function (s) {
    s.render();
  });
}

class Soldier {
  constructor(pos, color, r, health, attack) {
    this.pos = pos;
    this.color = color;
    this.r = r;
    this.maxHealth = health;
    this.health = health;
    this.attack = attack;

    this.targets = [];
    this.targets[0] = new Vector(startPos.x + pathData[0].x, startPos.y + pathData[0].y);

    for (let i = 1; i < pathData.length; i++) {
      let prevTarget = this.targets[i - 1];
      let path = pathData[i];

      let newTarget = new Vector(prevTarget.x + path.x, prevTarget.y + path.y);
      this.targets[i] = newTarget;
    }

    this.currentTarget = this.targets[0];
    this.dir = new Vector(0, 0);
    this.speed = 4;
    this.minTargetDist = 2;
  }

  renderHealthBar() {
    let x = this.pos.x - this.r;
    let y = this.pos.y + this.r + 5;
    let w = this.r * 2;
    let h = 5;
    let healthPct = this.health / this.maxHealth;
    let healthColor = "green";
    if (healthPct < 0.5) {
      healthColor = "yellow";
    }
    if (healthPct < 0.2) {
      healthColor = "red";
    }
    context.fillStyle = "gray";
    context.fillRect(x, y, w, h);
    context.fillStyle = healthColor;
    context.fillRect(x, y, w * healthPct, h);
  }

  update() {
    if (this.currentTarget == null) return;

    let dir = new Vector(this.currentTarget.x - this.pos.x, this.currentTarget.y - this.pos.y);
    let distance = (dir.x ** 2 + dir.y ** 2) ** (1 / 2);

    if (distance == 0) return;

    dir.x /= distance;
    dir.y /= distance;

    this.pos.x += dir.x * this.speed;
    this.pos.y += dir.y * this.speed;

    let xDist = Math.abs(this.pos.x - this.currentTarget.x);
    let yDist = Math.abs(this.pos.y - this.currentTarget.y);

    if (xDist <= this.minTargetDist && yDist <= this.minTargetDist) {
      this.targets.splice(0, 1);

      if (this.targets.length == 0) {
        let index = soldiers.indexOf(this);
        if (index != -1) {
          soldiers.splice(index, 1);
        }
      } else {
        this.currentTarget = this.targets[0];
      }
    }
  }

  render() {
    context.fillStyle = this.color;
    context.beginPath();
    context.arc(this.pos.x, this.pos.y, this.r, 0, Math.PI * 2);
    context.fill();
    this.renderHealthBar();
  }
}

class Projectile {
  constructor(x, y, velocity, damage) {
    this.pos = new Vector(x, y);
    this.velocity = velocity;
    this.damage = damage;
  }

  update() {
    this.pos.x += this.velocity.x * 5;
    this.pos.y += this.velocity.y * 5;
  }
}

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

let startPos = new Vector(100, 0);

let pathData = [
  new Vector(0, 100),
  new Vector(900, 0),
  new Vector(0, 200),
  new Vector(350, 0),
  new Vector(0, 150),
  new Vector(-1250, 0),
  new Vector(0, 250),
  new Vector(1200, 0),
  new Vector(0, 150),
  new Vector(-950, 0),
  new Vector(0, 250),
];

const NUM_SOLDIERS = 100;

let soldierStart = new Vector(100, 0);

for (let i = 0; i < NUM_SOLDIERS; i++) {
  let newSoldier = new Soldier(
    new Vector(soldierStart.x, soldierStart.y),
    "blue",
    20,
    100,
    10
  );
  soldiers[soldiers.length] = newSoldier;
  soldierStart.y -= 100;
}

function update() {
  soldiers.forEach(function (s) {
    s.update();
  });

  towers.forEach(function (t) {
    t.targets = [];

    soldiers.forEach(function (s) {
      let dist = Math.sqrt(
        (s.pos.x - t.pos.x) ** 2 + (s.pos.y - t.pos.y) ** 2
      );
      if (dist <= t.range) {
        if (!t.targets.includes(s)) {
          t.targets.push(s);
        }
      }
    });
  });

  towers.forEach(function (t) {
    t.shoot();
  });

  for (let i = projectiles.length - 1; i >= 0; i--) {
    let projectile = projectiles[i];
    projectile.update();

    for (let j = soldiers.length - 1; j >= 0; j--) {
      let soldier = soldiers[j];
      let dx = soldier.pos.x - projectile.pos.x;
      let dy = soldier.pos.y - projectile.pos.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < soldier.r) {
        soldier.health -= projectile.damage;

        if (soldier.health <= 0) {
          soldiers.splice(j, 1);
        }

        projectiles.splice(i, 1);
        break;
      }
    }
  }
}

function renderPath() {
  let drawPos = new Vector(startPos.x, startPos.y);

  context.fillStyle = "gray";

  pathData.forEach(function (path) {
    if (path.x == 0) {
      let x = drawPos.x - TILE_W;
      let y = drawPos.y - TILE_W;
      let w = TILE_W * 2;
      let h = path.y + TILE_W * 2;

      context.fillRect(x, y, w, h);
    } else {
      let x = drawPos.x - TILE_W;
      let y = drawPos.y - TILE_W;
      let w = path.x + TILE_W * 2;
      let h = TILE_W * 2;

      context.fillRect(x, y, w, h);
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
    context.clearRect(0, 0, SW, SH);
  
    context.fillStyle = bgcolor;
    context.fillRect(0, 0, SW, SH);
  
    renderPath();
    renderGrid();
  
    towers.forEach(function (t) {
      context.beginPath();
      context.fillStyle = "rgba(128, 128, 128, 0.5)"; // Set range color with transparency
      context.arc(t.pos.x, t.pos.y, t.range, 0, Math.PI * 2);
      context.fill();
  
      context.beginPath();
      context.fillStyle = t.color;
      context.arc(t.pos.x, t.pos.y, 20, 0, Math.PI * 20); // Add small circle within the range
      context.fill();
  
      t.targets.forEach(function (s) {
        context.beginPath();
        context.fillStyle = "rgba(255, 0, 0, 0.5)";
        context.arc(s.pos.x, s.pos.y, s.r, 0, Math.PI * 2);
        context.fill();
      });
    });
  
    soldiers.forEach(function (s) {
      context.fillStyle = s.color;
      context.beginPath();
      context.arc(s.pos.x, s.pos.y, s.r, 0, Math.PI * 2);
      context.fill();
  
      let healthPct = s.health / s.maxHealth;
      let healthColor = "green";
      if (healthPct < 0.5) {
        healthColor = "yellow";
      }
      if (healthPct < 0.2) {
        healthColor = "red";
      }
  
      context.fillStyle = "gray";
      context.fillRect(s.pos.x - s.r, s.pos.y + s.r + 5, s.r * 2, 5);
      context.fillStyle = healthColor;
      context.fillRect(
        s.pos.x - s.r,
        s.pos.y + s.r + 5,
        s.r * 2 * healthPct,
        5
      );
    });
  
    projectiles.forEach(function (p) {
      context.fillStyle = "black";
      context.beginPath();
      context.arc(p.pos.x, p.pos.y, 3, 0, Math.PI * 2);
      context.fill();
    });
  }
  

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

gameLoop();