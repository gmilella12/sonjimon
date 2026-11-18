export const EFFECTS = {
  drunk: { label: "DRUNK", duration: 20 },
  sick:  { label: "SICK",  duration: 20 },
};

export function addEffect(s, name){
    const until = Date.now() + EFFECTS[name].duration * 1000; // date gives the current time in milliseconds
    const effect = s.effects.find( e => e === name ); // finding effects in sonji

    // if she has it, extend; otherwise push a new one
    if ( effect ){
        effect.until = until;
    }
    else { s.effects.push({ name, until }); };
};

export function hasEffect(s, name){
    return s.effects.some(e => e.name === name);
};