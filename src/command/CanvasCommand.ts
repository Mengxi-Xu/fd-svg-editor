import { Command, CommandCategory, CommandResult, fail, ok } from './Command.js';
import { SvgDocument } from '../document/SvgDocument.js';

export class CanvasCommand implements Command {
  readonly kind = 'canvas';
  readonly category: CommandCategory;

  constructor(
    private readonly doc: SvgDocument,
    private readonly args: string[],
  ) {
    this.category = this.args.length === 0 ? CommandCategory.Display : CommandCategory.Document;
  }

  execute(): CommandResult {
    if (!this.doc.isLoaded()) return fail("no document. use 'init' or 'read' first");
    if (this.args.length === 0) return ok(`canvas ${this.doc.getWidth()}x${this.doc.getHeight()}`);
    const w = Number(this.args[0]);
    const h = Number(this.args[1]);
    if (Number.isNaN(w) || Number.isNaN(h)) return fail('invalid canvas size');
    this.doc.setCanvas(w, h);
    return ok(`canvas set to ${w}x${h}`);
  }

  undo(): CommandResult {
    return fail('undo not allowed after io command');
  }

  redo(): CommandResult {
    return fail('redo not allowed after io command');
  }
}
