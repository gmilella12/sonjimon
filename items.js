import { applyStats, GLUTEN_PENALTY } from "./utils.js";
import { addEffect } from "./effects.js";

export const ITEMS = {
  focaccia: { 
    name: "Focaccia", 
    type: "food",  
    stats: {satiety: 30, happiness: 5, energy: 20}, 
    gluten: true,
    text: "Buono, ma mi fara' molto male..."
    },
  gfBread: { 
    name: "Pane senza glutine", 
    type: "food", 
    stats: {satiety: 25, happiness: 10, energy: 20}, 
    gluten: false,
    text: "Crock... Crock...",
    },
  peroni: { 
    name: "Peroni", 
    type: "drink", 
    stats: {happiness: 15, energy: 5}, 
    effect: "drunk",
    text: "Ahh bella fresca!",
    },
};

export function useItem(s, itemId) {
    const item = ITEMS[itemId];
    applyStats(s, item.stats); 
    if (item.effect) addEffect(s, item.effect); // timed effect
    if (item.gluten) {
    applyStats(s, GLUTEN_PENALTY);
    addEffect(s, "sick");
    }
}