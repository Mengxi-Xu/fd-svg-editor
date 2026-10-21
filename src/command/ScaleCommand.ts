import { Command, CommandCategory, CommandResult, fail, ok } from './Command.js';
import { SvgDocument } from '../document/SvgDocument.js';

export class ScaleCommand implements Command {
  readonly kind = 'scale';
  readonly category = CommandCategory.Edit;

  private targetId?: string;
  private factor?: number;

  constructor(
    private readonly doc: SvgDocument,
    private readonly args: string[],
  ) {}

  execute(): CommandResult {
    if (!this.doc.isLoaded()) return fail("no document. use 'init' or 'read' first");
    if (this.args.length < 2) return fail('scale requires <id> <factor>');
    const id = this.args[0];
    const f = Number(this.args[1]);
    if (Number.isNaN(f)) return fail('invalid scale factor');
    if (f <= 0) return fail('scale factor must be positive');
    const shape = this.doc.find(id);
    if (!shape) return fail(`no such shape: ${id}`);
    shape.scale(f);
    this.targetId = id;
    this.factor = f;
    return ok(`${shape.tag}#${id} scaled by ${f}`);
  }

  undo(): CommandResult {
    if (this.targetId === undefined || this.factor === undefined) return fail('nothing to undo');
    const shape = this.doc.find(this.targetId);
    if (!shape) return fail(`no such shape: ${this.targetId}`);
    const inv = 1 / this.factor;
    shape.scale(inv);
    return ok(`${shape.tag}#${this.targetId} scaled back by ${inv}`);
  }

  redo(): CommandResult {
    if (this.targetId === undefined || this.factor === undefined) return fail('nothing to redo');
    const shape = this.doc.find(this.targetId);
    if (!shape) return fail(`no such shape: ${this.targetId}`);
    shape.scale(this.factor);
    return ok(`${shape.tag}#${this.targetId} scaled by ${this.factor}`);
  }
}
