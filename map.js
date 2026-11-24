// --- load one map file and return its data
async function loadMap(file) {
  const response = await fetch(file); // ask the server for the file
  const data = await response.json(); // read it as JSON

  const W = data.width;
  const H = data.height;
  const T = data.tilewidth;

  const tileLayer = data.layers.find(l => l.type === "tilelayer");
  const objectLayer = data.layers.find(l => l.type === "objectgroup");

  // tile layer: flat list -> 2D grid
  const flat = tileLayer.data;
  const grid = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) {
      row.push(flat[y * W + x]);
    }
    grid.push(row);
  }

  // objects: every custom property is copied in (dialog, map, targetX, ...)
  const objs = [];
  const zns = [];
  for (const obj of objectLayer?.objects ?? []) {
    const props = {};
    for (const p of obj.properties ?? []) props[p.name] = p.value;

    const entry = {
      name: obj.name,
      kind: obj.type,
      tileX: Math.floor(obj.x / T),
      tileY: Math.floor(obj.y / T),
      // for the size, it means at least 1 tile, which is for 1-pixel door
      tileW: Math.max(1, Math.round(obj.width / T)),
      tileH: Math.max(1, Math.round(obj.height / T)),
      ...props,
    }
    // keep zone areas separated from map objects
    if (obj.type === 'zone'){ zns.push(entry); }
    else{ objs.push(entry);}
  }

  return { grid, width: W, height: H, objects: objs, tile: T , zones: zns};
}

// --- all maps, loaded once at startup
const MAPS = {
  city: await loadMap("./city.tmj"),
  house: await loadMap("./house_intern.tmj"),
  falegnameria: await loadMap("./falegnameria.tmj"),
};

// --- the current map (live: other files see changes automatically)
export let worldMap, MAP_W, MAP_H, objects, currentMap, zones;

export function setMap(name) {
  const m = MAPS[name];
  worldMap = m.grid;
  MAP_W = m.width;
  MAP_H = m.height;
  objects = m.objects;
  currentMap = name;
  zones = m.zones;
}
setMap("city"); // start in the city

// which object covers this tile?
export function objectAt(x, y) {
  return objects.find(o =>
    x >= o.tileX && x < o.tileX + o.tileW &&
    y >= o.tileY && y < o.tileY + o.tileH
  );
}

// is next tile a tile from a zone?
export function zoneAt(x, y) {
  return zones.find(z =>
    x >= z.tileX && x < z.tileX + z.tileW &&
    y >= z.tileY && y < z.tileY + z.tileH
  );
}

export const TILES = {
  0: { name: "empty", walkable: false },
  1: { name: "street", walkable: true },
  2: { name: "grass", walkable: true },
  3: { name: "building", walkable: false },
  4: { name: "sea", walkable: false },
  5: { name: "window", walkable: false },
  6: { name: "wallLeft", walkable: false },
  7: { name: "wallRight", walkable: false },
  8: { name: "floor", walkable: true },
  9: { name: "wallFace", walkable: false },
  10: { name: "wallTop", walkable: false },
  11: { name: "cornerLeft", walkable: false },
  12: { name: "cornerRight", walkable: false },
  13: { name: "floorFal", walkable: true },
  14: { name: "wallFal", walkable: false },
  15: { name: "wallFalPaints", walkable: false },
};

export const TILE = MAPS.city.tile;

export const tileset = new Image();
tileset.src = "./tiles.png";
await tileset.decode();   // wait until the image is loaded