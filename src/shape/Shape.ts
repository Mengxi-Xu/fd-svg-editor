export interface AttrEntry {
  name: string;
  value: string;
}

export function indent(n: number): string {
  return '  '.repeat(n);
}

export abstract class Shape {
  parent: Shape | null = null;

  constructor(readonly id: string) {}

  abstract get tag(): string;
  abstract get isContainer(): boolean;

  abstract move(dx: number, dy: number): void;
  abstract scale(factor: number): void;
  abstract setAttr(attr: string, value: string): boolean;
  abstract getAttr(attr: string): string | undefined;
  abstract attrs(): AttrEntry[];
  abstract detail(): string[];
  abstract toSvg(indent: number): string;
  abstract describe(): string;
  abstract anchor(): { x: number; y: number } | null;
  abstract clearAttr(attr: string): boolean;

  getChildren(): readonly Shape[] {
    return [];
  }

  addChild(child: Shape): void {
    void child;
    throw new Error(`not a container: ${this.id}`);
  }

  removeChild(child: Shape): void {
    void child;
    throw new Error(`not a container: ${this.id}`);
  }

  indexOfChild(child: Shape): number {
    void child;
    throw new Error(`not a container: ${this.id}`);
  }

  insertChildAt(child: Shape, index: number): void {
    void child;
    void index;
    throw new Error(`not a container: ${this.id}`);
  }
}
