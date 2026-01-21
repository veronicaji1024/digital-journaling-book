export enum ItemType {
  PHOTO = 'PHOTO',
  STICKER = 'STICKER',
  TEXT = 'TEXT',
  RANSOM = 'RANSOM',
  TAPE = 'TAPE'
}

export interface ScrapItem {
  id: string;
  type: ItemType;
  content: string; // URL for images, text content for text
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
  meta?: any; // For extra properties like 'tape color' or 'font'
}

export interface ScrapPage {
  id: string;
  items: ScrapItem[];
  paperType: 'grid' | 'dot' | 'kraft';
}

export interface Coordinates {
  x: number;
  y: number;
}