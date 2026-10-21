import { Shape } from './Shape.js';
import { Rect } from './Rect.js';
import { Circle } from './Circle.js';
import { Ellipse } from './Ellipse.js';
import { Line } from './Line.js';
import { Text } from './Text.js';
import { Group } from './Group.js';

function num(s: string, name: string): number {
  const n = Number(s);
  if (Number.isNaN(n)) throw new Error(`invalid ${name}: ${s}`);
  return n;
}

export class ShapeFactory {
  private readonly types = new Set<string>(['rect', 'circle', 'ellipse', 'line', 'text', 'g']);

  knownTypes(): string[] {
    return [...this.types];
  }

  isKnown(type: string): boolean {
    return this.types.has(type);
  }

  create(type: string, id: string, params: string[]): Shape {
    switch (type) {
      case 'rect': {
        if (params.length < 4) throw new Error('rect requires x y width height');
        return new Rect(id, num(params[0], 'x'), num(params[1], 'y'), num(params[2], 'width'), num(params[3], 'height'), params[4]);
      }
      case 'circle': {
        if (params.length < 3) throw new Error('circle requires cx cy r');
        return new Circle(id, num(params[0], 'cx'), num(params[1], 'cy'), num(params[2], 'r'), params[3]);
      }
      case 'ellipse': {
        if (params.length < 4) throw new Error('ellipse requires cx cy rx ry');
        return new Ellipse(id, num(params[0], 'cx'), num(params[1], 'cy'), num(params[2], 'rx'), num(params[3], 'ry'), params[4]);
      }
      case 'line': {
        if (params.length < 4) throw new Error('line requires x1 y1 x2 y2');
        return new Line(id, num(params[0], 'x1'), num(params[1], 'y1'), num(params[2], 'x2'), num(params[3], 'y2'), params[4]);
      }
      case 'text': {
        if (params.length < 3) throw new Error('text requires x y "content"');
        return new Text(id, num(params[0], 'x'), num(params[1], 'y'), params[2]);
      }
      case 'g': {
        if (params.length > 0) throw new Error('g takes no params');
        return new Group(id);
      }
      default:
        throw new Error(`unknown shape type: ${type} (is the plugin loaded?)`);
    }
  }
}
