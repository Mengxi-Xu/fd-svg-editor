import { Shape } from '../shape/Shape.js';

export class SvgDocument {
  private width = 800;
  private height = 600;
  private root: Shape | null = null;
  private readonly ids = new Map<string, Shape>();
  private loaded = false;

  isLoaded(): boolean {
    return this.loaded;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  getRoot(): Shape | null {
    return this.root;
  }

  hasId(id: string): boolean {
    return this.ids.has(id);
  }

  markLoaded(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.loaded = true;
  }
}
