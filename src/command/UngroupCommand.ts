import { Command, CommandCategory, CommandResult, fail, ok } from './Command.js';
import { SvgDocument } from '../document/SvgDocument.js';
import { Shape } from '../shape/Shape.js';
import { Group } from '../shape/Group.js';

export class UngroupCommand implements Command {
  readonly kind = 'ungroup';
  readonly category = CommandCategory.Edit;

  private target?: Group;
  private oldParent?: Shape;
  private oldIndex?: number;
  private kids?: Shape[];

  constructor(
    private readonly doc: SvgDocument,
    private readonly args: string[],
  ) {}

  execute(): CommandResult {
    if (!this.doc.isLoaded()) return fail("no document. use 'init' or 'read' first");
    if (this.args.length < 1) return fail('ungroup requires <gid>');
    const id = this.args[0];
    const shape = this.doc.find(id);
    if (!shape) return fail(`no such shape: ${id}`);
    if (!shape.isContainer) return fail(`not a container: ${id}`);
    if (shape.parent === null) return fail(`cannot ungroup top-level container: ${id}`);
    if (shape instanceof Group && shape.kind !== undefined) return fail(`cannot ungroup composite shape: ${id}`);
    const g = shape as Group;
    const parent = g.parent as Shape;
    const index = parent.indexOfChild(g);
    const children = [...g.getChildren()];
    parent.removeChild(g);
    for (const c of children) g.removeChild(c);
    this.doc.unregisterId(g);
    children.forEach((c, i) => parent.insertChildAt(c, index + i));
    this.target = g;
    this.oldParent = parent;
    this.oldIndex = index;
    this.kids = children;
    return ok(`g#${id} ungrouped (${children.length} children promoted)`);
  }

  undo(): CommandResult {
    if (this.target === undefined || this.oldParent === undefined || this.oldIndex === undefined || this.kids === undefined) return fail('nothing to undo');
    const g = this.target;
    const parent = this.oldParent;
    for (const c of this.kids) parent.removeChild(c);
    parent.insertChildAt(g, this.oldIndex);
    for (const c of this.kids) g.addChild(c);
    this.doc.registerId(g);
    return ok(`g#${g.id} restored with ${this.kids.length} children`);
  }

  redo(): CommandResult {
    if (this.target === undefined || this.oldParent === undefined || this.oldIndex === undefined || this.kids === undefined) return fail('nothing to redo');
    const g = this.target;
    const parent = this.oldParent;
    const children = this.kids;
    const index = this.oldIndex;
    parent.removeChild(g);
    for (const c of children) g.removeChild(c);
    this.doc.unregisterId(g);
    children.forEach((c, i) => parent.insertChildAt(c, index + i));
    return ok(`g#${g.id} ungrouped (${children.length} children promoted)`);
  }
}
