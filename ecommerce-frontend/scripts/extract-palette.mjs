#!/usr/bin/env node
import { Vibrant } from 'node-vibrant';
import fs from 'fs';
import path from 'path';

const image = path.resolve('./public/assets/logo.png');

const legoFallback = {
  primary: '#DA1A32',
  secondary: '#FFCF00',
  accent: '#0057A6',
  support1: '#008F4B',
  support2: '#F06D1F'
};

function hexToRgb(hex) {
  const s = hex.replace('#', '');
  const num = parseInt(s, 16);
  return [num >> 16 & 255, num >> 8 & 255, num & 255];
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function luminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrast(hex1, hex2) {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const l1 = luminance(r1, g1, b1) + 0.05;
  const l2 = luminance(r2, g2, b2) + 0.05;
  return l1 > l2 ? l1 / l2 : l2 / l1;
}

function ensureContrast(hex, against = '#ffffff', ratio = 4.5) {
  let [h, s, l] = rgbToHsl(...hexToRgb(hex));
  while (contrast(rgbToHex(...hslToRgb(h, s, l)), against) < ratio && l < 95) {
    l += 1;
  }
  const [r, g, b] = hslToRgb(h, s, l);
  const newHex = rgbToHex(r, g, b);
  return { hex: newHex, hsl: `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%` };
}

const palette = await Vibrant.from(image).getPalette();
const pick = (swatch, fallback) => (swatch ? swatch.hex : fallback);

const tokens = {
  brand: {
    primary: ensureContrast(pick(palette.Vibrant, legoFallback.primary)),
    secondary: ensureContrast(pick(palette.LightVibrant, legoFallback.secondary)),
    accent: ensureContrast(pick(palette.Muted, legoFallback.accent)),
    support1: ensureContrast(pick(palette.DarkVibrant, legoFallback.support1)),
    support2: ensureContrast(pick(palette.DarkMuted, legoFallback.support2))
  },
  neutral: {
    "0": "#ffffff",
    "50": "#f8f9fa",
    "900": "#111827"
  },
  semantic: {
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#0ea5e9"
  }
};

fs.writeFileSync(
  path.resolve('./src/theme/tokens.json'),
  JSON.stringify(tokens, null, 2)
);

console.log('Tokens generated at src/theme/tokens.json');
