// import { isNil } from 'lodash-es';

const colorNames: { [key:string]:string; } = {
  aqua: '#00ffff', black: '#000000', blue: '#0000ff', fuchsia: '#ff00ff',
  gray: '#808080', green: '#008000', lime: '#00ff00', maroon: '#800000',
  navy: '#000080', olive: '#808000', purple: '#800080', red: '#ff0000',
  silver: '#c0c0c0', teal: '#008080', white: '#ffffff', yellow: '#ffff00'
}

export function color2rgb(color: string) : [number, number, number] {
  if (color in colorNames) {
    color = colorNames[color];
  }

  if (!color) {
    return [0, 0, 0];
  }

  color = color.replace('#','');

  let r = parseInt(color.substring(0,2), 16);
  let g = parseInt(color.substring(2,4), 16);
  let b = parseInt(color.substring(4,6), 16);

  return [r, g, b];
}