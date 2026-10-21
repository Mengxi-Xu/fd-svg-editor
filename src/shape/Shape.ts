export abstract class Shape {
  constructor(readonly id: string) {}

  abstract get tag(): string;

  abstract toSvg(indent: number): string;

  abstract describe(): string;
}
