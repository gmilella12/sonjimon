import { worldMap, MAP_H, MAP_W, TILES, objectAt} from "./map.js";

export function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
};

export function canWalk(x, y){
  // return (x < cols && x >= 0) && (y < rows && y >= 0);
  // inside the map and not against building
  const obj = objectAt(x, y);
  if (obj && obj.kind === "door") return isInside(x, y); // doors are always enterable
  return isInside(x, y) && TILES[worldMap[y][x]].walkable && !obj;
};

export function isInside(x, y){
  return x >= 0 && x < MAP_W && y >= 0 && y < MAP_H;
}

// applying effects of the action, e.g. drinking, eating, ...
export function applyStats(s, stats){
  for (const stat in stats){
    s[stat] = clamp(s[stat] + stats[stat])
  }
}

export const GLUTEN_PENALTY = { happiness: -30, energy: -20};
// export const GLUTEN_TEXT = "Oh... I'm feeling sick :(";

export const FACINGDIRS = {
  up: {x: 0, y: -1},
  down: {x: 0, y: 1},
  left: {x: -1, y: 0},
  right: {x: 1, y: 0},
}; // dictionary of the tile she is facing

export function wrapText(ctx, text, maxWidth){
  // const words = text.split(" ");
  let lines = [];
  let currentLine = "";

  for (const word of text.split(" ")) {
    let test = "";
    if (currentLine === ""){ test = word; }
    else{  test = currentLine + " " + word; }
  
    if (ctx.measureText(test).width > maxWidth){
      lines.push(currentLine)
      currentLine = word;
    }
    else{currentLine = test;}
  }

  lines.push(currentLine);
  return lines;
}

