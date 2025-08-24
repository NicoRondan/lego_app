import tokens from './tokens.json';

const hexToRgb = (hex) => {
  const s = hex.replace('#', '');
  const num = parseInt(s, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const applyTokens = () => {
  const root = document.documentElement;
  const { brand, semantic } = tokens;

  const setBrand = (name, value) => {
    root.style.setProperty(`--color-${name}-hsl`, value.hsl);
    root.style.setProperty(`--color-${name}`, `hsl(${value.hsl})`);
  };

  setBrand('primary', brand.primary);
  setBrand('secondary', brand.secondary);
  setBrand('accent', brand.accent);

  const setSemantic = (name, hex) => {
    const hsl = rgbToHsl(...hexToRgb(hex));
    root.style.setProperty(`--color-${name}-hsl`, hsl);
    root.style.setProperty(`--color-${name}`, `hsl(${hsl})`);
  };

  Object.entries(semantic).forEach(([name, hex]) => setSemantic(name, hex));
};

export default applyTokens;
