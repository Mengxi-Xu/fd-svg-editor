import { AttrEntry, Shape, indent } from './Shape.js';

export class Group extends Shape {
  private readonly kids: Shape[] = [];
  fill?: string;
  stroke?: string;
  strokeWidth?: string;
  kind?: string;

  constructor(id: string) {
    super(id);
  }

  get tag(): string {
    return 'g';
  }

  get isContainer(): boolean {
    return true;
  }

  override getChildren(): readonly Shape[] {
    return this.kids;
  }

  override addChild(child: Shape): void {
    child.parent = this;
    this.kids.push(child);
  }

  override removeChild(child: Shape): void {
    const i = this.kids.indexOf(child);
    if (i >= 0) {
      this.kids.splice(i, 1);
      child.parent = null;
    }
  }

  indexOfChild(child: Shape): number {
    return this.kids.indexOf(child);
  }

  insertChildAt(child: Shape, index: number): void {
    child.parent = this;
    this.kids.splice(index, 0, child);
  }

  move(dx: number, dy: number): void {
    for (const c of this.kids) c.move(dx, dy);
  }

  scale(factor: number): void {
    for (const c of this.kids) c.scale(factor);
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
        return false;
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
        return undefined;
    }
  }

  attrs(): AttrEntry[] {
    const list: AttrEntry[] = [];
    if (this.fill !== undefined) list.push({ name: 'fill', value: this.fill });
    if (this.stroke !== undefined) list.push({ name: 'stroke', value: this.stroke });
    if (this.strokeWidth !== undefined) list.push({ name: 'stroke-width', value: this.strokeWidth });
    return list;
  }

  detail(): string[] {
    const out: string[] = [];
    if (this.fill !== undefined) out.push(`  fill=${this.fill}`);
    if (this.stroke !== undefined) out.push(`  stroke=${this.stroke}`);
    if (this.strokeWidth !== undefined) out.push(`  stroke-width=${this.strokeWidth}`);
    return out;
  }

  toSvg(ind: number): string {
    const pad = indent(ind);
    const attrStr = this.attrs().map((a) => ` ${a.name}="${a.value}"`).join('');
    const kindAttr = this.kind !== undefined ? ` data-kind="${this.kind}"` : '';
    if (this.kids.length === 0) return `${pad}<g id="${this.id}"${kindAttr}${attrStr}/>`;
    const inner = this.kids.map((c) => c.toSvg(ind + 1)).join('\n');
    return `${pad}<g id="${this.id}"${kindAttr}${attrStr}>\n${inner}\n${pad}</g>`;
  }

  describe(): string {
    return `g#${this.id}`;
  }
}
