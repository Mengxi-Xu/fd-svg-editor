import { Command, CommandCategory, CommandResult, fail, ok } from './Command.js';
import { SvgDocument } from '../document/SvgDocument.js';
import { Shape } from '../shape/Shape.js';

export class DeleteCommand implements Command {
  readonly kind = 'delete';
  readonly category = CommandCategory.Edit;

  private deleted?: Shape;
  private oldParent?: Shape | null;
  private oldIndex?: number;

  constructor(
    private readonly doc: SvgDocument,
    private readonly args: string[],
  ) {}

  execute(): CommandResult {
    if (!this.doc.isLoaded()) return fail("no document. use 'init' or 'read' first");
    if (this.args.length < 1) return fail('delete requires <id>');
    const id = this.args[0];
    const shape = this.doc.find(id);
    if (!shape) return fail(`no such shape: ${id}`);
    const parent = shape.parent;
    const index = parent !== null ? parent.indexOfChild(shape) : this.doc.rootIndex(shape);
    if (parent !== null) {
      parent.removeChild(shape);
      this.doc.unregister(shape);
    } else {
      this.doc.removeRoot(shape);
    }
    this.deleted = shape;
    this.oldParent = parent;
    this.oldIndex = index;
    return ok(`${shape.tag}#${id} deleted`);
  }

  undo(): CommandResult {
    if (this.deleted === undefined || this.oldParent === undefined || this.oldIndex === undefined) return fail('nothing to undo');
    const shape = this.deleted;
    const parent = this.oldParent;
    if (parent !== null) {
      parent.insertChildAt(shape, this.oldIndex);
      this.doc.register(shape);
    } else {
      this.doc.insertRootAt(shape, this.oldIndex);
    }
    const where = parent !== null ? ` into ${parent.tag}#${parent.id}` : '';
    return ok(`${shape.tag}#${shape.id} restored${where}`);
  }

  redo(): CommandResult {
    if (this.deleted === undefined || this.oldParent === undefined) return fail('nothing to redo');
    const shape = this.deleted;
    const parent = this.oldParent;
    if (parent !== null) {
      parent.removeChild(shape);
      this.doc.unregister(shape);
    } else {
      this.doc.removeRoot(shape);
    }
    return ok(`${shape.tag}#${shape.id} deleted`);
  }
}
