import { AttrEntry, indent } from './Shape.js';
import { LeafShape } from './LeafShape.js';

export class Circle extends LeafShape {
  constructor(
    id: string,
    public cx: number,
    public cy: number,
    public r: number,
    fill?: string,
  ) {
    super(id);
    this.fill = fill;
  }

  get tag(): string {
    return 'circle';
  }

  get geomAttrs(): AttrEntry[] {
    return [
      { name: 'cx', value: String(this.cx) },
      { name: 'cy', value: String(this.cy) },
      { name: 'r', value: String(this.r) },
    ];
  }

  moveGeom(dx: number, dy: number): void {
    this.cx += dx;
    this.cy += dy;
  }

  scaleGeom(f: number): void {
    this.cx *= f;
    this.cy *= f;
    this.r *= f;
  }

  setGeom(attr: string, value: string): boolean {
    const n = Number(value);
    if (Number.isNaN(n)) return false;
    switch (attr) {
      case 'cx':
        this.cx = n;
        return true;
      case 'cy':
        this.cy = n;
        return true;
      case 'r':
        this.r = n;
        return true;
      default:
        return false;
    }
  }

  getGeom(attr: string): string | undefined {
    switch (attr) {
      case 'cx':
        return String(this.cx);
      case 'cy':
        return String(this.cy);
      case 'r':
        return String(this.r);
      default:
        return undefined;
    }
  }

  toSvg(ind: number): string {
    return `${indent(ind)}<circle id="${this.id}"${this.attrsToSvg()}/>`;
  }

  describe(): string {
    return `circle#${this.id} cx=${this.cx} cy=${this.cy} r=${this.r}${this.fill !== undefined ? ` fill=${this.fill}` : ''}`;
  }
}
