import { Command, CommandCategory, CommandResult, fail, ok } from './Command.js';
import { SvgDocument } from '../document/SvgDocument.js';
import { Shape } from '../shape/Shape.js';
import { Group } from '../shape/Group.js';

interface Entry {
  shape: Shape;
  parent: Shape | null;
  index: number;
}

export class GroupCommand implements Command {
  readonly kind = 'group';
  readonly category = CommandCategory.Edit;

  private newGroup?: Group;
  private entries?: Entry[];

  constructor(
    private readonly doc: SvgDocument,
    private readonly args: string[],
  ) {}

  execute(): CommandResult {
    if (!this.doc.isLoaded()) return fail("no document. use 'init' or 'read' first");
    if (this.args.length < 2) return fail('group requires <newGid> <id1> [id2 ...]');
    const newGid = this.args[0];
    const ids = this.args.slice(1);
    if (this.doc.hasId(newGid)) return fail(`id already exists: ${newGid}`);
    const shapes: Shape[] = [];
    for (const id of ids) {
      const s = this.doc.find(id);
      if (!s) return fail(`no such shape: ${id}`);
      shapes.push(s);
    }
    for (const s of shapes) {
      let p = s.parent;
      while (p !== null) {
        if (shapes.includes(p)) return fail(`cannot group a container into its own descendant: ${p.id}`);
        p = p.parent;
      }
    }
    const entries: Entry[] = shapes.map((s) => {
      const parent = s.parent;
      const index = parent !== null ? parent.indexOfChild(s) : this.doc.rootIndex(s);
      return { shape: s, parent, index };
    });
    for (const s of shapes) this.doc.detach(s);
    const g = new Group(newGid);
    for (const s of shapes) g.addChild(s);
    this.doc.attachRoot(g);
    this.doc.registerId(g);
    this.newGroup = g;
    this.entries = entries;
    return ok(`g#${newGid} created with ${shapes.length} children`);
  }

  undo(): CommandResult {
    if (this.newGroup === undefined || this.entries === undefined) return fail('nothing to undo');
    const g = this.newGroup;
    this.doc.detach(g);
    this.doc.unregisterId(g);
    const sorted = [...this.entries].sort((a, b) => a.index - b.index);
    for (const e of sorted) {
      g.removeChild(e.shape);
      if (e.parent !== null) e.parent.insertChildAt(e.shape, e.index);
      else this.doc.attachRootAt(e.shape, e.index);
    }
    return ok(`g#${g.id} removed, ${sorted.length} children restored`);
  }

  redo(): CommandResult {
    if (this.newGroup === undefined || this.entries === undefined) return fail('nothing to redo');
    const g = this.newGroup;
    for (const e of this.entries) this.doc.detach(e.shape);
    for (const e of this.entries) g.addChild(e.shape);
    this.doc.attachRoot(g);
    this.doc.registerId(g);
    return ok(`g#${g.id} created with ${this.entries.length} children`);
  }
}
