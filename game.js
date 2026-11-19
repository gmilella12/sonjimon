import { input } from "./input.js";
import * as world from "./map.js";
import * as utils from "./utils.js";
import { DIALOGS } from "./dialogs.js";
import { ITEMS, useItem } from "./items.js";
import * as fx from "./effects.js";
import * as save from "./save.js";
import { playMusic, stopMusic } from "./music.js";
import { PHOTOS } from "./photos.js";
import { MOVIES } from "./cinema.js";

const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

const TILE = world.TILE;
const COLS = canvas.width / TILE;
const ROWS = canvas.height / TILE;

// --- data
const sonji = {
  satiety: 100,
  happiness: 100,
  energy: 100,
  socialBattery: 100,
  state: "awake",
  tileX: 3,
  tileY: 3,
  facing: "down",
  inventory: ["camera"], // list of ITEMS in the menu
  effects: [], // each effect has a name and duration
  map: "city", // map location
};
const DECAY = {
  satiety: 0.1,
  happiness: 0.15,
  energy: 0.2,
};
// load a saved game, if there is one
const saved = save.loadGame();
if (saved) Object.assign(sonji, saved.sonji);

// make sure she always has the camera, even with an old save 
// if (!sonji.inventory.includes("camera")) sonji.inventory.push("camera");

// switch to her saved map
world.setMap(sonji.map);

const sonjiImg = new Image(); // loading the sprite of sonji
sonjiImg.src = "./sonjiSprit.png";
await sonjiImg.decode();

const SPRITE_W = 32; // the size of ONE frame, as drawn in Piskel
const SPRITE_H = 48;

let progress = 0;
let targetX = 0;
let targetY = 0;

// --- action
let moving = false;
const stepDuration = 0.25;

const ACTIONS = {
  give: (s, choice) => {s.inventory.push(choice.item);}, // pushing items in the inventory
  use: (s, choice) => { useItem(s, choice.item);},
  stats: (s, choice) => { utils.applyStats(s, choice.stats); },
  sleep: (s, choice) => {
    s.state = "sleep";
    s.sleepUntil = Date.now() + 3000; // 2 seconds from now
    s.energy = 100;
  },
  music: (s, choice) => {
    playMusic(choice.genre); 
    utils.applyStats(s, { happiness: 10 });
  },
  stopMusic: () => { stopMusic(); },
  selectMovie: () => { selectMovie() },
  watchMovie: (s, choice) => { 
    watchMovie(choice.item);
    utils.applyStats(s, { happiness: 10 }); 
  },
};

// --- interaction
let dialog = null;
let bagMenu = null; // null = closed; { selected: 0 } = open

// --- text box
const LINES_PER_PAGE = 3;
const BOX_X = 4;
const BOX_Y = canvas.height - 44; // 44 px from the bottom
const BOX_W = canvas.width - 8; // 4 px margin left and right
const BOX_H = 80;

// onClose parameter when energy hits 0, so she moves back home 
function openDialog(text, choices = [], onClose = null){
  ctx.font = "12px monospace";
  dialog = {
    lines: utils.wrapText(ctx, text, BOX_W - 12),
    page: 0,
    choices: choices,
    selected: 0,
    choosing: false,
    onClose: onClose,
  };
};

function closeDialog() {
  const done = dialog.onClose;
  dialog = null;
  if (done) done();
};

// call it when energy is 0 and she close the dialog message
function goHomeAndSleep() {
  world.setMap("house");
  sonji.map = "house";
  sonji.tileX = 2; // a floor tile next to her bed
  sonji.tileY = 4;
  ACTIONS.sleep(sonji);
};

// open viewer for displaying photos
let openView = null; // null = closed; { selected: 0 } = open
const viewer = document.getElementById("viewer");
const viewerImg = document.getElementById("viewerImg");
const viewerCaption = document.getElementById("viewerCaption");
function showPhoto(photo){
  viewerImg.src = photo.path;
  viewerCaption.textContent = photo.caption;
}
function openViewer() {
  // enable the container for the open viewer
  viewer.classList.remove("hidden");
  // disabling the aPressed button when she opens the viewer, she can scroll also with the aPressed
  input.aPressed = false;
  openView = {selected: 0};
  const photo = PHOTOS[openView.selected]
  showPhoto(photo)
};

// --- watching a movie
// get element in the frame (HTML)
const cinema = document.getElementById("cinema");
const cinemaFrame = document.getElementById("cinemaFrame");

function todaysFilm(){
    return Math.floor(Date.now() / 86400000) % MOVIES.length; // picking film id corresponding to today's date
}
function selectMovie() {
    stopMovie(); // only one film at a time
    const film = MOVIES[todaysFilm()];
    openDialog(
      "Oggi al cinema: " + film.caption,
      [
        { label: "Lo guardo", action: "watchMovie", item: film },
        { label: "Non mi va", action: null, reply: "Mi faccio un giro." },
      ] 
    );

}
let movieView = null; // null = closed; { selected: 0 } = open
function watchMovie(film){
  // enable the container for the cinema frame
  cinema.classList.remove("hidden");
  cinemaFrame.src = `https://www.youtube-nocookie.com/embed/${film.id}`;
  movieView = film;
};
function stopMovie() {
  cinemaFrame.src = "";
  cinema.classList.add("hidden");
  movieView = null;
  input.bagPressed = false;
};

// emoji for the status bars
const BARS = [
  { stat: "energy", icon: "⚡" },
  { stat: "satiety", icon: "🍝" },
  { stat: "happiness", icon: "😊" },
];

function update(dt) {
  // save logic goes here (dt = seconds since last frame)

  // remove effects whose time is up 
  sonji.effects = sonji.effects.filter(e => e.until > Date.now());

  if (sonji.state === "sleep"){
    ACTIONS.stopMusic();
    if (Date.now() >= sonji.sleepUntil) sonji.state = "awake";
  } else {
    if (sonji.energy <= 0 && dialog === null) {
      openDialog("Non ho più energie... devo riposare. Torno a casa.", [], goHomeAndSleep);
    }
    for (const key in DECAY){
      sonji[key] = utils.clamp(sonji[key] - (DECAY[key] * dt));
    }
    // grid movement
    if (!moving && dialog === null && bagMenu === null && openView === null && movieView == null){
      if (input.up || input.down || input.left || input.right){
        targetX = sonji.tileX;
        targetY = sonji.tileY;
        if (input.up){
          targetY = sonji.tileY - 1;
          sonji.facing = "up";
        }
        else if (input.down){
          targetY = sonji.tileY + 1;
          sonji.facing = "down";
        }
        else if (input.left){
          targetX = sonji.tileX - 1;
          sonji.facing = "left";
        }
        else if (input.right){
          targetX = sonji.tileX + 1;
          sonji.facing = "right";
        }
        // adding effect of drunkness
        // 30% chance that she moves in a random direction
        if (fx.hasEffect(sonji, "drunk") && Math.random() < 0.3){
          const dirs = ["up", "down", "left", "right"];
          const d = dirs[Math.floor(Math.random() * dirs.length)];
          sonji.facing = d;
          const step = utils.FACINGDIRS[d];
          targetX = sonji.tileX + step.x;
          targetY = sonji.tileY + step.y;
        }
        if (utils.canWalk(targetX, targetY) && sonji.energy > 0){
          moving = true;
          progress = 0;
        }
      }
    }
    else if (moving){
      progress += dt / stepDuration * (0.60 + 0.40 * sonji.energy / 100);
      if (progress >= 1){
        sonji.tileX = targetX;
        sonji.tileY = targetY;

        // step onto a door
        const door = world.objectAt(sonji.tileX, sonji.tileY);
        // console.log("standing on:", door)
        if (door && door.kind === "door") {
          world.setMap(door.map);
          sonji.map = door.map;
          sonji.tileX = door.targetX;
          sonji.tileY = door.targetY;
        }

        moving = false;
      }
    }

    // adding effect of sickness
    const sickFactor = fx.hasEffect(sonji, "sick") ? 2 : 1;
    for (const key in DECAY){
      sonji[key] = utils.clamp(sonji[key] - (DECAY[key] * sickFactor * dt));
    }

    // interaction 
    if (input.aPressed && !moving && bagMenu === null && openView === null && movieView === null ){
      if (dialog === null){ // text box NOT open; open and add text
        // which tile in front?
        const facingTileX = sonji.tileX + utils.FACINGDIRS[sonji.facing].x;
        const facingTileY = sonji.tileY + utils.FACINGDIRS[sonji.facing].y;
        
        // is the next tile inside the map
        const inside = utils.isInside(facingTileX, facingTileY);
        if (inside){
          const facingTileID = world.worldMap[facingTileY][facingTileX];
          const object = world.objectAt(facingTileX, facingTileY);
          const tileName = world.TILES[world.worldMap[facingTileY][facingTileX]].name;

          // object first, otherwise the tile
          const entry = object ? DIALOGS[object.dialog] : DIALOGS[tileName];

          if (entry){ openDialog(entry.text, entry.choices ?? []); }
        }        
      }
      else{  // text box already open; go to next page or close it after the dialog.page++ * LINES_PER_PAGE is bigger than lines length
        if (dialog.choosing) {
          const choice = dialog.choices[dialog.selected];
          const before = dialog; // remember the dialog which is open now
      
          if (choice.action) ACTIONS[choice.action](sonji, choice); // check if there is an action and run one
          if (dialog === before){ // running only if the action did not open a new dialog
            if (choice.reply) {
              openDialog(choice.reply); // show the reply, with no further choices
            } else{
              closeDialog();
            }
          }
        }
        else{
          dialog.page++;
          if(dialog.page * LINES_PER_PAGE >= dialog.lines.length){
            if (dialog.choices.length > 0) {
              dialog.choosing = true; // set the choice menu
              dialog.page--; // go back one page, so the question stays visible
            }
            else{ closeDialog() } // no choices: close as before
            }
        }
      }
    } 

    // choice menu
    if (dialog !== null && dialog.choosing) {
      if (input.upPressed) dialog.selected = Math.max(0, dialog.selected - 1);
      if (input.downPressed) dialog.selected = Math.min(dialog.choices.length - 1, dialog.selected + 1);
    }

    // inventory
    // inventory button
    if (input.bagPressed && openView === null && movieView === null){
      if (bagMenu) { // open
        bagMenu = null; // close it next
      } else if (dialog === null && !moving){ // check if it's empty, otherwise initialize it
        if (sonji.inventory.length === 0) openDialog("The bag is empty.");
        else bagMenu = { selected: 0 };
      }    
    }
    // bagMenu open menu
    if (bagMenu && openView === null){
      if (input.upPressed) bagMenu.selected = Math.max(0, bagMenu.selected - 1);
      if (input.downPressed) bagMenu.selected = Math.min(sonji.inventory.length - 1, bagMenu.selected + 1);
      if (input.aPressed && sonji.inventory.length > 0 ){
        const itemId = sonji.inventory[bagMenu.selected];
        const item = ITEMS[itemId];
        if (item.type === "gadget"){
          bagMenu = null;
          // open the camera viewer
          openDialog(item.text, [], openViewer);
        }
        else{
          useItem(sonji, itemId);
          sonji.inventory.splice(bagMenu.selected, 1); // remove 1 item at that index
          bagMenu = null;
          
          let text = item.text ?? "Used " + item.name + ".";
          openDialog(text);
        }
      }
    }

    // viewer menu for photos
    if (openView){
      let position = openView.selected;
      // moving backwards, JS keeps the minus sign
      if ( input.leftPressed ) { 
        position = (position - 1 + PHOTOS.length) % PHOTOS.length; 
        openView.selected = position;
        showPhoto(PHOTOS[position]);
      }
      // moving forward
      if ( input.rightPressed || input.aPressed ){ 
        position = (position + 1) % PHOTOS.length;
        openView.selected = position;
        showPhoto(PHOTOS[position]); 
        input.aPressed = false; // resetting interaction button
      }
      if (input.bagPressed){
        viewer.classList.add("hidden");
        openView = null;
        input.bagPressed = false;
        // input.aPressed = false;
      }
    }

    // movie view
    if (movieView){
      if (input.bagPressed){ stopMovie()}
    }
  }
  // resetting interaction buttons
  input.aPressed = false; 
  input.upPressed = false;
  input.downPressed = false;
  input.bagPressed = false;
  input.leftPressed = false;
  input.rightPressed = false;

  // saving while playing (every 5 sec) or the moment she closes
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) save.saveGame(sonji);
  });
  let saveTimer = 0;
  saveTimer += dt;
  if (saveTimer >= 5) {
    save.saveGame(sonji);
    saveTimer = 0;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // sonji position in the world
  let drawX = sonji.tileX * TILE;
  let drawY = sonji.tileY * TILE;
  if (moving){
    drawX = Math.round((sonji.tileX + (targetX - sonji.tileX) * progress) * TILE);
    drawY = Math.round((sonji.tileY + (targetY - sonji.tileY) * progress) * TILE);
  }

  // camera centered on sonji
  let camX = Math.round(utils.clamp(drawX + TILE / 2 - canvas.width / 2, 0, world.MAP_W * TILE - canvas.width));
  let camY = Math.round(utils.clamp(drawY + TILE / 2 - canvas.height / 2, 0, world.MAP_H * TILE - canvas.height));

  // centre maps that are smaller than the screen
  const mapPxW = world.MAP_W * TILE;
  const mapPxH = world.MAP_H * TILE;
  if (mapPxW < canvas.width)  camX = Math.round((mapPxW - canvas.width) / 2);
  if (mapPxH < canvas.height) camY = Math.round((mapPxH - canvas.height) / 2);

  if (fx.hasEffect(sonji, "drunk")) {
    camX += Math.round(Math.sin(performance.now() / 300) * 2);
  }

  // map, shifted by camera, from png
  for (let y = 0; y < world.MAP_H; y++) {
    for (let x = 0; x < world.MAP_W; x++) {
      const tileID = world.worldMap[y][x];
      const sourceY = 0;
      let sourceX = (tileID - 1) * TILE;
      // ctx.fillStyle = world.TILES[tile].color;
      // ctx.fillRect(x * TILE - camX, y * TILE - camY, TILE, TILE);
      ctx.drawImage(
        world.tileset,
        sourceX, sourceY, TILE, TILE, // which piece of tiles.png to cut out (source)
        x * TILE - camX, y * TILE - camY, TILE, TILE // where on the screen to draw it (destination)
      );
    }
  }

  // objects (people, signs, ...)
  for (const o of world.objects) {
    if (o.kind === "building") continue; // skip buildings as they are already visible as tiles
    ctx.fillStyle = "#8b4513"; 
    ctx.fillRect(
      o.tileX * TILE - camX, // world position minus camera, like the map tiles
      o.tileY * TILE - camY,
      o.tileW * TILE, // size in pixels
      o.tileH * TILE
    );
  }

  // sonji
  const sx = drawX - camX; // NEW: her position on the screen
  const sy = drawY - camY;

  const ROW = { down: 0, up: 1, left: 2, right: 3 };
  // standing = frame 0; walking = step A for the first half of a tile, step B for the second
  const frame = moving ? (progress < 0.5 ? 1 : 2) : 0;

  ctx.drawImage(
    sonjiImg,
    frame * SPRITE_W, ROW[sonji.facing] * SPRITE_H, SPRITE_W, SPRITE_H, // cut this frame out of the sheet
    sx + (TILE - SPRITE_W) / 2, // centred on her tile
    sy + TILE - SPRITE_H, // feet on the bottom of her tile
    SPRITE_W, SPRITE_H
  );

  // facing line
  // ctx.fillStyle = "#f0f2e4";
  // if (sonji.facing === "up"){ ctx.fillRect(sx, sy, TILE, 1); }
  // if (sonji.facing === "down"){ ctx.fillRect(sx, sy + TILE - 1, TILE, 1); }
  // if (sonji.facing === "left"){ ctx.fillRect(sx, sy, 1, TILE); }
  // if (sonji.facing === "right"){ ctx.fillRect(sx + TILE - 1, sy, 1, TILE); }
  // ctx.fillStyle = "#2e412e";

  // bars
  ctx.font = "14px sans-serif";
  ctx.textBaseline = "middle";
  for (let i = 0; i < BARS.length; i++) {
    const b = BARS[i];
    const x = 4 + i * 104; // spacing between the three bars
    const y = 6;

    ctx.fillText(b.icon, x, y + 4); // the icon
    ctx.strokeStyle = "#0f380f"; 
    ctx.strokeRect(x + 20, y, 70, 8); // bar outline
    ctx.fillStyle = "#0f380f";
    ctx.fillRect(x + 20, y, 70 * (sonji[b.stat] / 100), 8); // bar fill
  }

  // active effects
  ctx.fillStyle = "#0f380f";
  ctx.font = "10px monospace";
  ctx.textBaseline = "top";
  for (let i = 0; i < sonji.effects.length; i++) {
    const e = sonji.effects[i];
    const label = fx.EFFECTS[e.name].label;
    const secondsLeft = Math.ceil((e.until - Date.now()) / 1000);
    ctx.fillText(label + " " + secondsLeft + "s", 2, 20 + i * 9);
  }

  // sleeping: darken the screen and show Zzz
  if (sonji.state === "sleep") {
    ctx.fillStyle = "rgba(0, 0, 0, 0.91)"; // dark blue, 60% opaque
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const bob = Math.sin(performance.now() / 300) * 3; // gentle up-and-down
    ctx.fillStyle = "#ffffff";
    ctx.font = "16px monospace";
    ctx.textBaseline = "top";
    ctx.fillText("Zzz", sx + TILE, sy - 24 + bob);
  }

  // dialog box 
  if (dialog !== null) {
    ctx.fillStyle = "#e0f8d0"; // background
    ctx.fillRect(BOX_X, BOX_Y, BOX_W, BOX_H);

    ctx.strokeStyle = "#0f380f"; // border
    ctx.strokeRect(BOX_X + 0.5, BOX_Y + 0.5, BOX_W - 1, BOX_H - 1);

    // text: only the lines of the current page
    ctx.fillStyle = "#0f380f";
    ctx.font = "12px monospace";
    ctx.textBaseline = "top";

    const start = dialog.page * LINES_PER_PAGE;
    const pageLines = dialog.lines.slice(start, start + LINES_PER_PAGE);

    for (let i = 0; i < pageLines.length; i++) {
      ctx.fillText(pageLines[i], BOX_X + 6, BOX_Y + 6 + i * 20);
    }

    const morePages = start + LINES_PER_PAGE < dialog.lines.length;
    const blinkOn = Math.floor(performance.now() / 400) % 2 === 0;
    if (morePages && blinkOn) {
      ctx.fillText("▼", BOX_X + BOX_W - 12, BOX_Y + BOX_H - 12);
    }

    //choice box
    if (dialog.choosing){
      // choice box will appear above the text box
      const choiceH = dialog.choices.length * 20 + 8; 
      const choiceY = BOX_Y - choiceH - 8;

      ctx.fillStyle = "#e0f8d0";
      ctx.fillRect(BOX_X, choiceY, BOX_W, choiceH);
      ctx.strokeStyle = "#0f380f";
      ctx.strokeRect(BOX_X + 0.5, choiceY + 0.5, BOX_W - 1, choiceH - 1);

      ctx.fillStyle = "#0f380f";
      for (let i = 0; i < dialog.choices.length; i++) {
        const marker = i === dialog.selected ? "▶ " : "  ";
        ctx.fillText(marker + dialog.choices[i].label, BOX_X + 6, choiceY + 4 + i * 20);
      }
    }
  }

  // bag menu 
  if (bagMenu !== null){
    const bagW = 90;
    const bagH = sonji.inventory.length * 20 + 18; // 10 px per item + room for the title
    const bagX = canvas.width - bagW - 4; // right side of the screen
    const bagY = 28;

    ctx.fillStyle = "#e0f8d0";
    ctx.fillRect(bagX, bagY, bagW, bagH);
    ctx.strokeStyle = "#0f380f";
    ctx.strokeRect(bagX + 0.5, bagY + 0.5, bagW - 1, bagH - 1);

    ctx.fillStyle = "#0f380f";
    ctx.font = "12px monospace";
    ctx.textBaseline = "top";
    ctx.fillText("BAG", bagX + 6, bagY + 4);

    for (let i = 0; i < sonji.inventory.length; i++) {
      const marker = i === bagMenu.selected ? "▶ " : "  ";
      const name = ITEMS[sonji.inventory[i]].name;
      ctx.fillText(marker + name, bagX + 6, bagY + 14 + i * 10);
      }
  }
}

let last = performance.now();
function loop(now) {
  const dt = (now - last) / 1000;
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(loop); // ask the browser to call loop again next frame
}
requestAnimationFrame(loop);