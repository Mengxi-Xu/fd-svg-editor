import { Command, CommandCategory, CommandResult, fail, ok } from './Command.js';
import { SvgDocument } from '../document/SvgDocument.js';

export class InitCommand implements Command {
  readonly kind = 'init';
  readonly category = CommandCategory.Document;

  constructor(
    private readonly doc: SvgDocument,
    private readonly args: string[],
  ) {}

  execute(): CommandResult {
    const w = this.args[0] !== undefined ? Number(this.args[0]) : 800;
    const h = this.args[1] !== undefined ? Number(this.args[1]) : 600;
    if (Number.isNaN(w) || Number.isNaN(h)) return fail('invalid canvas size');
    this.doc.init(w, h);
    return ok(`canvas ${w}x${h} created`);
  }

  undo(): CommandResult {
    return fail('undo not allowed after io command');
  }

  redo(): CommandResult {
    return fail('redo not allowed after io command');
  }
}
