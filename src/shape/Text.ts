import { AttrEntry, indent } from './Shape.js';
import { LeafShape } from './LeafShape.js';

export class Text extends LeafShape {
  content: string;

  constructor(
    id: string,
    public x: number,
    public y: number,
    content: string,
  ) {
    super(id);
    this.content = content;
  }

  get tag(): string {
    return 'text';
  }

  get geomAttrs(): AttrEntry[] {
    return [
      { name: 'x', value: String(this.x) },
      { name: 'y', value: String(this.y) },
    ];
  }

  moveGeom(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }

  scaleGeom(f: number): void {
    this.x *= f;
    this.y *= f;
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
      default:
        return undefined;
    }
  }

  override setAttr(attr: string, value: string): boolean {
    if (attr === 'text') {
      this.content = value;
      return true;
    }
    return super.setAttr(attr, value);
  }

  override getAttr(attr: string): string | undefined {
    if (attr === 'text') return this.content;
    return super.getAttr(attr);
  }

  override detail(): string[] {
    const out = super.detail();
    out.push(`  text="${this.content}"`);
    return out;
  }

  toSvg(ind: number): string {
    return `${indent(ind)}<text id="${this.id}"${this.attrsToSvg()}>${this.content}</text>`;
  }

  override anchor(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  describe(): string {
    return `text#${this.id} (${this.x},${this.y}) "${this.content}"`;
  }
}
