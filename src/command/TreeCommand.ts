import { Command, CommandCategory, CommandResult, fail, ok } from './Command.js';
import { SvgDocument } from '../document/SvgDocument.js';
import { Shape } from '../shape/Shape.js';

export class TreeCommand implements Command {
  readonly kind = 'tree';
  readonly category = CommandCategory.Display;

  constructor(
    private readonly doc: SvgDocument,
    private readonly args: string[],
  ) {}

  execute(): CommandResult {
    if (!this.doc.isLoaded()) return fail("no document. use 'init' or 'read' first");
    const lines: string[] = [];
    const id = this.args[0];
    if (id) {
      const shape = this.doc.find(id);
      if (!shape) return fail(`no such shape: ${id}`);
      this.render(shape, '', true, lines, true);
      return ok(lines.join('\n'));
    }
    lines.push(`svg (${this.doc.getWidth()}x${this.doc.getHeight()})`);
    const roots = this.doc.getRoots();
    roots.forEach((r, i) => this.render(r, '', i === roots.length - 1, lines, false));
    return ok(lines.join('\n'));
  }

  undo(): CommandResult {
    return ok('tree: nothing to undo');
  }

  redo(): CommandResult {
    return ok('tree: nothing to redo');
  }

  private render(shape: Shape, prefix: string, isLast: boolean, lines: string[], asRoot: boolean): void {
    if (asRoot) {
      lines.push(shape.describe());
    } else {
      lines.push(prefix + (isLast ? '└── ' : '├── ') + shape.describe());
    }
    const kids = shape.getChildren();
    const childPrefix = asRoot ? '' : prefix + (isLast ? '    ' : '│   ');
    kids.forEach((k, i) => this.render(k, childPrefix, i === kids.length - 1, lines, false));
  }
}
