import { Shape } from '../shape/Shape.js';

export class SvgDocument {
  private width = 800;
  private height = 600;
  private readonly roots: Shape[] = [];
  private readonly ids = new Map<string, Shape>();
  private loaded = false;
  private sourcePath: string | null = null;

  isLoaded(): boolean {
    return this.loaded;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  getRoots(): readonly Shape[] {
    return this.roots;
  }

  getSourcePath(): string | null {
    return this.sourcePath;
  }

  setSourcePath(path: string): void {
    this.sourcePath = path;
  }

  init(w: number, h: number): void {
    this.roots.length = 0;
    this.ids.clear();
    this.width = w;
    this.height = h;
    this.loaded = true;
    this.sourcePath = null;
  }

  setCanvas(w: number, h: number): void {
    this.width = w;
    this.height = h;
  }

  loadParsed(w: number, h: number, roots: Shape[], path: string | null): void {
    this.roots.length = 0;
    this.ids.clear();
    this.width = w;
    this.height = h;
    this.loaded = true;
    this.sourcePath = path;
    for (const r of roots) this.addRoot(r);
  }

  hasId(id: string): boolean {
    return this.ids.has(id);
  }

  find(id: string): Shape | null {
    return this.ids.get(id) ?? null;
  }

  register(shape: Shape): void {
    this.ids.set(shape.id, shape);
    for (const c of shape.getChildren()) this.register(c);
  }

  unregister(shape: Shape): void {
    this.ids.delete(shape.id);
    for (const c of shape.getChildren()) this.unregister(c);
  }

  addRoot(shape: Shape): void {
    shape.parent = null;
    this.roots.push(shape);
    this.register(shape);
  }

  removeRoot(shape: Shape): void {
    const i = this.roots.indexOf(shape);
    if (i >= 0) this.roots.splice(i, 1);
    this.unregister(shape);
  }

  rootIndex(shape: Shape): number {
    return this.roots.indexOf(shape);
  }

  insertRootAt(shape: Shape, index: number): void {
    shape.parent = null;
    this.roots.splice(index, 0, shape);
    this.register(shape);
  }

  detach(shape: Shape): void {
    if (shape.parent !== null) shape.parent.removeChild(shape);
    else {
      const i = this.roots.indexOf(shape);
      if (i >= 0) this.roots.splice(i, 1);
    }
  }

  attachRoot(shape: Shape): void {
    shape.parent = null;
    this.roots.push(shape);
  }

  attachRootAt(shape: Shape, index: number): void {
    shape.parent = null;
    this.roots.splice(index, 0, shape);
  }

  registerId(shape: Shape): void {
    this.ids.set(shape.id, shape);
  }

  unregisterId(shape: Shape): void {
    this.ids.delete(shape.id);
  }

  allShapes(): Shape[] {
    const out: Shape[] = [];
    const walk = (s: Shape): void => {
      out.push(s);
      for (const c of s.getChildren()) walk(c);
    };
    for (const r of this.roots) walk(r);
    return out;
  }

  elementCount(): number {
    return this.allShapes().length;
  }
}
