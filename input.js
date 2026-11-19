// --- commands
export const input = {
  up: false, 
  down: false, 
  left: false, 
  right: false,
  aPressed: false,
  upPressed: false,
  downPressed: false,
  leftPressed: false,
  rightPressed: false,
  bagPressed: false, // button to open the inventory
}

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") input.up = true;
  if (e.key === "ArrowDown") input.down = true;
  if (e.key === "ArrowLeft") input.left = true;
  if (e.key === "ArrowRight") input.right = true;
  if (e.key == " ") input.aPressed = true;
  if (e.key == "ArrowUp" && !e.repeat) input.upPressed = true;
  if (e.key == "ArrowDown" && !e.repeat) input.downPressed = true;
  if (e.key == "ArrowLeft" && !e.repeat) input.leftPressed = true;
  if (e.key == "ArrowRight" && !e.repeat) input.rightPressed = true;
  if (e.code === "KeyB" && !e.repeat) input.bagPressed = true; 
});
window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowUp") input.up = false;
  if (e.key === "ArrowDown") input.down = false;
  if (e.key === "ArrowLeft") input.left = false;
  if (e.key === "ArrowRight") input.right = false;
//   console.log(input);
});

function holdButton(id, dir){
    const btn = document.getElementById(id);
    btn.addEventListener("pointerdown", () => { 
      input[dir] = true;
      input[dir + "Pressed"] = true; 
    });
    btn.addEventListener("pointerup", () => { input[dir] = false; });
    btn.addEventListener("pointerleave", () => { input[dir] = false; });
}
holdButton("up", "up")
holdButton("down", "down")
holdButton("left", "left")
holdButton("right", "right")

document.getElementById("Interaction").addEventListener("pointerdown", () => {
    input.aPressed = true;
}); // button pressed once

document.getElementById("Bag").addEventListener("pointerdown", () => {
    input.bagPressed = true;
}); // button pressed once