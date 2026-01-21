import React from 'react';

// Simulated assets using standard shapes/colors or placeholder services
export const STICKERS = [
  // Tapes & Adhesives
  { id: 'tape-yellow', src: 'tape-yellow', label: 'Masking Tape' },
  { id: 'tape-pink', src: 'tape-pink', label: 'Rose Tape' },
  { id: 'tape-blue', src: 'tape-blue', label: 'Blue Tape' },
  { id: 'tape-washi', src: 'washi', label: 'Washi Tape' },

  // Clips & Pins
  { id: 'clip-silver', src: 'clip-silver', label: 'Silver Clip' },
  { id: 'clip-gold', src: 'clip-gold', label: 'Gold Clip' },
  { id: 'clip-rose', src: 'clip-rose', label: 'Rose Gold' },
  { id: 'clip-black', src: 'clip-black', label: 'Black Clip' },
  { id: 'pin-red', src: 'pin-red', label: 'Red Pin' },
  { id: 'pin-blue', src: 'pin-blue', label: 'Blue Pin' },
  
  // Shapes & Celestial
  { id: 'star-yellow', src: '⭐', label: 'Star' },
  { id: 'heart-white', src: '🤍', label: 'Heart' },
  { id: 'sparkles', src: '✨', label: 'Sparkles' },
  { id: 'moon', src: '🌙', label: 'Moon' },
  { id: 'cloud', src: '☁️', label: 'Cloud' },
  { id: 'sun', src: '☀️', label: 'Sun' },
  
  // Nature
  { id: 'leaf', src: '🌿', label: 'Leaf' },
  { id: 'flower', src: '🌸', label: 'Flower' },
  { id: 'sunflower', src: '🌻', label: 'Flora' },
  { id: 'mushroom', src: '🍄', label: 'Fungi' },
  { id: 'cactus', src: '🌵', label: 'Cactus' },
  { id: 'butterfly', src: '🦋', label: 'Fly' },
  { id: 'shell', src: '🐚', label: 'Shell' },
  { id: 'maple', src: '🍁', label: 'Maple' },
  { id: 'snow', src: '❄️', label: 'Frost' },
  
  // Objects & Vintage
  { id: 'stamp-1', src: 'stamp', label: 'Postage' },
  { id: 'key', src: '🗝️', label: 'Key' },
  { id: 'camera', src: '📷', label: 'Cam' },
  { id: 'candle', src: '🕯️', label: 'Mood' },
  { id: 'envelope', src: '✉️', label: 'Note' },
  { id: 'book', src: '📖', label: 'Read' },
  { id: 'pen', src: '🖊️', label: 'Ink' },
  { id: 'ribbon', src: '🎀', label: 'Ribbon' },
  { id: 'yarn', src: '🧶', label: 'Yarn' },
  { id: 'thread', src: '🧵', label: 'Sew' },
  { id: 'teddy', src: '🧸', label: 'Soft' },
  { id: 'basket', src: '🧺', label: 'Picnic' },
  { id: 'clock', src: '🕰️', label: 'Time' },
  { id: 'umbrella', src: '☂️', label: 'Rain' },
  { id: 'glasses', src: '👓', label: 'Specs' },
  { id: 'hat', src: '👒', label: 'Hat' },
  
  // Food & Cafe
  { id: 'coffee', src: '☕', label: 'Brew' },
  { id: 'bread', src: '🍞', label: 'Toast' },
  { id: 'croissant', src: '🥐', label: 'Pastry' },
  { id: 'pretzel', src: '🥨', label: 'Salty' },
  { id: 'bagel', src: '🥯', label: 'Bagel' },
  { id: 'pancakes', src: '🥞', label: 'Stack' },
  { id: 'lemon', src: '🍋', label: 'Zest' },
  { id: 'blueberries', src: '🫐', label: 'Berry' },
];

export const FONTS = [
  'Andada Pro', 
  'Times New Roman',
  'Georgia'
];

// Morandi Color Palette
export const COLORS = [
  '#A4B494', // Sage Green
  '#B5C0D0', // Dusty Blue
  '#E6C9C9', // Dusty Pink/Rose
  '#DDBEA9', // Warm Beige/Peach
  '#6D6D6D', // Charcoal Grey
  '#8E806A', // Taupe
  '#F4F4F2', // Off White
];

// Helper to generate a random ID
export const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper for Ransom Note logic
export const getRandomRotation = () => Math.random() * 20 - 10;
export const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];
export const getRandomFont = () => FONTS[Math.floor(Math.random() * FONTS.length)];