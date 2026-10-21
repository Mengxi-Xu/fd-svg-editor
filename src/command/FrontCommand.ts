import { Command, CommandCategory, CommandResult, fail, ok } from './Command.js';
import { SvgDocument } from '../document/SvgDocument.js';
import { Shape } from '../shape/Shape.js';

export class FrontCommand implements Command {
  readonly kind = 'front';
  readonly category = CommandCategory.Edit;

  private target?: Shape;
  private oldParent?: Shape | null;
  private oldIndex?: number;

  constructor(
    private readonly doc: SvgDocument,
    private readonly args: string[],
  ) {}

  execute(): CommandResult {
    if (!this.doc.isLoaded()) return fail("no document. use 'init' or 'read' first");
    if (this.args.length < 1) return fail('front requires <id>');
    const id = this.args[0];
    const shape = this.doc.find(id);
    if (!shape) return fail(`no such shape: ${id}`);
    const parent = shape.parent;
    const index = parent !== null ? parent.indexOfChild(shape) : this.doc.rootIndex(shape);
    this.doc.detach(shape);
    if (parent !== null) parent.addChild(shape);
    else this.doc.attachRoot(shape);
    this.target = shape;
    this.oldParent = parent;
    this.oldIndex = index;
    return ok(`${shape.tag}#${id} moved to front`);
  }

  undo(): CommandResult {
    if (this.target === undefined || this.oldParent === undefined || this.oldIndex === undefined) return fail('nothing to undo');
    const shape = this.target;
    this.doc.detach(shape);
    if (this.oldParent !== null) this.oldParent.insertChildAt(shape, this.oldIndex);
    else this.doc.attachRootAt(shape, this.oldIndex);
    return ok(`${shape.tag}#${shape.id} z-order restored`);
  }

  redo(): CommandResult {
    if (this.target === undefined || this.oldParent === undefined) return fail('nothing to redo');
    const shape = this.target;
    this.doc.detach(shape);
    if (this.oldParent !== null) this.oldParent.addChild(shape);
    else this.doc.attachRoot(shape);
    return ok(`${shape.tag}#${shape.id} moved to front`);
  }
}
