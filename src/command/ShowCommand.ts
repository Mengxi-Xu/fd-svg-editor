import { Command, CommandCategory, CommandResult, fail, ok } from './Command.js';
import { SvgDocument } from '../document/SvgDocument.js';

export class ShowCommand implements Command {
  readonly kind = 'show';
  readonly category = CommandCategory.Display;

  constructor(
    private readonly doc: SvgDocument,
    private readonly args: string[],
  ) {}

  execute(): CommandResult {
    if (!this.doc.isLoaded()) return fail("no document. use 'init' or 'read' first");
    const id = this.args[0];
    if (!id) return fail('show requires an id');
    const shape = this.doc.find(id);
    if (!shape) return fail(`no such shape: ${id}`);
    const lines: string[] = [];
    const parent = shape.parent;
    lines.push(`${shape.tag}#${id}${parent ? `  parent=${parent.tag}#${parent.id}` : ''}`);
    for (const d of shape.detail()) lines.push(d);
    return ok(lines.join('\n'));
  }

  undo(): CommandResult {
    return ok('show: nothing to undo');
  }

  redo(): CommandResult {
    return ok('show: nothing to redo');
  }
}
