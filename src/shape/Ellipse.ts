import { AttrEntry, indent } from './Shape.js';
import { LeafShape } from './LeafShape.js';

export class Ellipse extends LeafShape {
  constructor(
    id: string,
    public cx: number,
    public cy: number,
    public rx: number,
    public ry: number,
    fill?: string,
  ) {
    super(id);
    this.fill = fill;
  }

  get tag(): string {
    return 'ellipse';
  }

  get geomAttrs(): AttrEntry[] {
    return [
      { name: 'cx', value: String(this.cx) },
      { name: 'cy', value: String(this.cy) },
      { name: 'rx', value: String(this.rx) },
      { name: 'ry', value: String(this.ry) },
    ];
  }

  moveGeom(dx: number, dy: number): void {
    this.cx += dx;
    this.cy += dy;
  }

  scaleGeom(f: number): void {
    this.cx *= f;
    this.cy *= f;
    this.rx *= f;
    this.ry *= f;
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
      case 'rx':
        this.rx = n;
        return true;
      case 'ry':
        this.ry = n;
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
      case 'rx':
        return String(this.rx);
      case 'ry':
        return String(this.ry);
      default:
        return undefined;
    }
  }

  toSvg(ind: number): string {
    return `${indent(ind)}<ellipse id="${this.id}"${this.attrsToSvg()}/>`;
  }

  describe(): string {
    return `ellipse#${this.id} cx=${this.cx} cy=${this.cy} rx=${this.rx} ry=${this.ry}${this.fill !== undefined ? ` fill=${this.fill}` : ''}`;
  }
}
