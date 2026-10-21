import { AttrEntry, indent } from './Shape.js';
import { LeafShape } from './LeafShape.js';

export class Line extends LeafShape {
  constructor(
    id: string,
    public x1: number,
    public y1: number,
    public x2: number,
    public y2: number,
    stroke?: string,
  ) {
    super(id);
    this.stroke = stroke;
  }

  get tag(): string {
    return 'line';
  }

  get geomAttrs(): AttrEntry[] {
    return [
      { name: 'x1', value: String(this.x1) },
      { name: 'y1', value: String(this.y1) },
      { name: 'x2', value: String(this.x2) },
      { name: 'y2', value: String(this.y2) },
    ];
  }

  moveGeom(dx: number, dy: number): void {
    this.x1 += dx;
    this.y1 += dy;
    this.x2 += dx;
    this.y2 += dy;
  }

  scaleGeom(f: number): void {
    this.x1 *= f;
    this.y1 *= f;
    this.x2 *= f;
    this.y2 *= f;
  }

  setGeom(attr: string, value: string): boolean {
    const n = Number(value);
    if (Number.isNaN(n)) return false;
    switch (attr) {
      case 'x1':
        this.x1 = n;
        return true;
      case 'y1':
        this.y1 = n;
        return true;
      case 'x2':
        this.x2 = n;
        return true;
      case 'y2':
        this.y2 = n;
        return true;
      default:
        return false;
    }
  }

  getGeom(attr: string): string | undefined {
    switch (attr) {
      case 'x1':
        return String(this.x1);
      case 'y1':
        return String(this.y1);
      case 'x2':
        return String(this.x2);
      case 'y2':
        return String(this.y2);
      default:
        return undefined;
    }
  }

  toSvg(ind: number): string {
    return `${indent(ind)}<line id="${this.id}"${this.attrsToSvg()}/>`;
  }

  override anchor(): { x: number; y: number } {
    return { x: this.x1, y: this.y1 };
  }

  describe(): string {
    return `line#${this.id} (${this.x1},${this.y1}) -> (${this.x2},${this.y2})${this.stroke !== undefined ? ` stroke=${this.stroke}` : ''}`;
  }
}
