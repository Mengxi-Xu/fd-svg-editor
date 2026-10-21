import { AttrEntry, indent } from './Shape.js';
import { LeafShape } from './LeafShape.js';

export class Rect extends LeafShape {
  constructor(
    id: string,
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    fill?: string,
  ) {
    super(id);
    this.fill = fill;
  }

  get tag(): string {
    return 'rect';
  }

  get geomAttrs(): AttrEntry[] {
    return [
      { name: 'x', value: String(this.x) },
      { name: 'y', value: String(this.y) },
      { name: 'width', value: String(this.width) },
      { name: 'height', value: String(this.height) },
    ];
  }

  moveGeom(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }

  scaleGeom(f: number): void {
    this.x *= f;
    this.y *= f;
    this.width *= f;
    this.height *= f;
  }

  setGeom(attr: string, value: string): boolean {
    const n = Number(value);
    if (Number.isNaN(n)) return false;
    switch (attr) {
      case 'x':
        this.x = n;
        return true;
      case 'y':
        this.y = n;
        return true;
      case 'width':
        this.width = n;
        return true;
      case 'height':
        this.height = n;
        return true;
      default:
        return false;
    }
  }

  getGeom(attr: string): string | undefined {
    switch (attr) {
      case 'x':
        return String(this.x);
      case 'y':
        return String(this.y);
      case 'width':
        return String(this.width);
      case 'height':
        return String(this.height);
      default:
        return undefined;
    }
  }

  toSvg(ind: number): string {
    return `${indent(ind)}<rect id="${this.id}"${this.attrsToSvg()}/>`;
  }

  override anchor(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  describe(): string {
    return `rect#${this.id} x=${this.x} y=${this.y} w=${this.width} h=${this.height}${this.fill !== undefined ? ` fill=${this.fill}` : ''}`;
  }
}
