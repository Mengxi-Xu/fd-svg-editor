import { Command, CommandCategory, CommandResult, fail, ok } from './Command.js';
import { SvgDocument } from '../document/SvgDocument.js';
import { Shape } from '../shape/Shape.js';

export class AddToCommand implements Command {
  readonly kind = 'addto';
  readonly category = CommandCategory.Edit;

  private moved?: Shape;
  private container?: Shape;
  private oldParent?: Shape | null;
  private oldIndex?: number;

  constructor(
    private readonly doc: SvgDocument,
    private readonly args: string[],
  ) {}

  execute(): CommandResult {
    if (!this.doc.isLoaded()) return fail("no document. use 'init' or 'read' first");
    if (this.args.length < 2) return fail('addto requires <gid> <id>');
    const gid = this.args[0];
    const id = this.args[1];
    const container = this.doc.find(gid);
    if (!container) return fail(`no such shape: ${gid}`);
    if (!container.isContainer) return fail(`not a container: ${gid}`);
    const shape = this.doc.find(id);
    if (!shape) return fail(`no such shape: ${id}`);
    const parent = shape.parent;
    const index = parent !== null ? parent.indexOfChild(shape) : this.doc.rootIndex(shape);
    this.doc.detach(shape);
    container.addChild(shape);
    this.moved = shape;
    this.container = container;
    this.oldParent = parent;
    this.oldIndex = index;
    return ok(`${shape.tag}#${id} added to g#${gid}`);
  }

  undo(): CommandResult {
    if (this.moved === undefined || this.container === undefined || this.oldParent === undefined || this.oldIndex === undefined) return fail('nothing to undo');
    const shape = this.moved;
    this.container.removeChild(shape);
    if (this.oldParent !== null) this.oldParent.insertChildAt(shape, this.oldIndex);
    else this.doc.attachRootAt(shape, this.oldIndex);
    return ok(`${shape.tag}#${shape.id} removed from g#${this.container.id}`);
  }

  redo(): CommandResult {
    if (this.moved === undefined || this.container === undefined) return fail('nothing to redo');
    const shape = this.moved;
    this.doc.detach(shape);
    this.container.addChild(shape);
    return ok(`${shape.tag}#${shape.id} added to g#${this.container.id}`);
  }
}
