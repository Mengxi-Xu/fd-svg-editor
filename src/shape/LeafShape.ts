import { AttrEntry, Shape } from './Shape.js';

export abstract class LeafShape extends Shape {
  fill?: string;
  stroke?: string;
  strokeWidth?: string;

  abstract get geomAttrs(): AttrEntry[];
  abstract moveGeom(dx: number, dy: number): void;
  abstract scaleGeom(factor: number): void;
  abstract setGeom(attr: string, value: string): boolean;
  abstract getGeom(attr: string): string | undefined;

  get isContainer(): boolean {
    return false;
  }

  move(dx: number, dy: number): void {
    this.moveGeom(dx, dy);
  }

  scale(factor: number): void {
    this.scaleGeom(factor);
  }

  setAttr(attr: string, value: string): boolean {
    switch (attr) {
      case 'fill':
        this.fill = value;
        return true;
      case 'stroke':
        this.stroke = value;
        return true;
      case 'stroke-width':
        this.strokeWidth = value;
        return true;
      default:
        return this.setGeom(attr, value);
    }
  }

  getAttr(attr: string): string | undefined {
    switch (attr) {
      case 'fill':
        return this.fill;
      case 'stroke':
        return this.stroke;
      case 'stroke-width':
        return this.strokeWidth;
      default:
        return this.getGeom(attr);
    }
  }

  attrs(): AttrEntry[] {
    const list: AttrEntry[] = [...this.geomAttrs];
    if (this.fill !== undefined) list.push({ name: 'fill', value: this.fill });
    if (this.stroke !== undefined) list.push({ name: 'stroke', value: this.stroke });
    if (this.strokeWidth !== undefined) list.push({ name: 'stroke-width', value: this.strokeWidth });
    return list;
  }

  detail(): string[] {
    const out: string[] = [];
    out.push('  ' + this.geomAttrs.map((a) => `${a.name}=${a.value}`).join(' '));
    if (this.fill !== undefined) out.push(`  fill=${this.fill}`);
    if (this.stroke !== undefined) out.push(`  stroke=${this.stroke}`);
    if (this.strokeWidth !== undefined) out.push(`  stroke-width=${this.strokeWidth}`);
    return out;
  }

  protected attrsToSvg(): string {
    return this.attrs().map((a) => ` ${a.name}="${a.value}"`).join('');
  }
}
