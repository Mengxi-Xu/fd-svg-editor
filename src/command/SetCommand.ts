import { Command, CommandCategory, CommandResult, fail, ok } from './Command.js';
import { SvgDocument } from '../document/SvgDocument.js';

function fmtVal(attr: string, value: string): string {
  return attr === 'text' ? `"${value}"` : value;
}

export class SetCommand implements Command {
  readonly kind = 'set';
  readonly category = CommandCategory.Edit;

  private targetId?: string;
  private attr?: string;
  private newValue?: string;
  private oldValue?: string;

  constructor(
    private readonly doc: SvgDocument,
    private readonly args: string[],
  ) {}

  execute(): CommandResult {
    if (!this.doc.isLoaded()) return fail("no document. use 'init' or 'read' first");
    if (this.args.length < 3) return fail('set requires <id> <attr> <value>');
    const id = this.args[0];
    const attr = this.args[1];
    const value = this.args[2];
    const shape = this.doc.find(id);
    if (!shape) return fail(`no such shape: ${id}`);
    const old = shape.getAttr(attr);
    if (!shape.setAttr(attr, value)) return fail(`unknown attribute: ${attr}`);
    this.targetId = id;
    this.attr = attr;
    this.newValue = value;
    this.oldValue = old;
    return ok(`${shape.tag}#${id} updated: ${attr}=${fmtVal(attr, value)}`);
  }

  undo(): CommandResult {
    if (this.targetId === undefined || this.attr === undefined || this.oldValue === undefined || this.newValue === undefined) return fail('nothing to undo');
    const shape = this.doc.find(this.targetId);
    if (!shape) return fail(`no such shape: ${this.targetId}`);
    if (this.oldValue === undefined) {
      shape.clearAttr(this.attr);
    } else {
      shape.setAttr(this.attr, this.oldValue);
    }
    const shown = this.oldValue !== undefined ? fmtVal(this.attr, this.oldValue) : '(removed)';
    return ok(`${shape.tag}#${this.targetId} updated: ${this.attr}=${shown}`);
  }

  redo(): CommandResult {
    if (this.targetId === undefined || this.attr === undefined || this.newValue === undefined) return fail('nothing to redo');
    const shape = this.doc.find(this.targetId);
    if (!shape) return fail(`no such shape: ${this.targetId}`);
    shape.setAttr(this.attr, this.newValue);
    return ok(`${shape.tag}#${this.targetId} updated: ${this.attr}=${fmtVal(this.attr, this.newValue)}`);
  }
}
