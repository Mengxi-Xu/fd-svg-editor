import { Command, CommandCategory, CommandResult, fail, ok } from './Command.js';
import { SvgDocument } from '../document/SvgDocument.js';
import { ShapeFactory } from '../shape/ShapeFactory.js';
import { Shape } from '../shape/Shape.js';

export class CreateCommand implements Command {
  readonly kind = 'create';
  readonly category = CommandCategory.Edit;

  private created?: Shape;
  private containerId?: string | null;

  constructor(
    private readonly doc: SvgDocument,
    private readonly factory: ShapeFactory,
    private readonly args: string[],
  ) {}

  execute(): CommandResult {
    if (!this.doc.isLoaded()) return fail("no document. use 'init' or 'read' first");
    const raw = this.args;
    const inIdx = raw.indexOf('in');
    let type: string;
    let id: string;
    let params: string[];
    let containerId: string | null;
    if (inIdx >= 0) {
      type = raw[0];
      id = raw[1];
      params = raw.slice(2, inIdx);
      containerId = raw[inIdx + 1] ?? null;
    } else {
      type = raw[0];
      id = raw[1];
      params = raw.slice(2);
      containerId = null;
    }
    if (!type) return fail('create requires a shape type');
    if (!id) return fail('create requires an id');
    if (this.doc.hasId(id)) return fail(`id already exists: ${id}`);
    let shape: Shape;
    try {
      shape = this.factory.create(type, id, params);
    } catch (e) {
      return fail((e as Error).message);
    }
    if (containerId !== null) {
      const container = this.doc.find(containerId);
      if (!container) return fail(`no such container: ${containerId}`);
      if (!container.isContainer) return fail(`not a container: ${containerId}`);
      container.addChild(shape);
      this.doc.register(shape);
    } else {
      this.doc.addRoot(shape);
    }
    this.created = shape;
    this.containerId = containerId;
    const inMsg = containerId !== null ? ` in g#${containerId}` : '';
    return ok(`${shape.tag}#${id} created${inMsg}`);
  }

  undo(): CommandResult {
    if (!this.created || this.containerId === undefined) return fail('nothing to undo');
    const shape = this.created;
    if (this.containerId !== null) {
      const container = this.doc.find(this.containerId);
      if (container) container.removeChild(shape);
      this.doc.unregister(shape);
    } else {
      this.doc.removeRoot(shape);
    }
    return ok(`${shape.tag}#${shape.id} removed`);
  }

  redo(): CommandResult {
    if (!this.created || this.containerId === undefined) return fail('nothing to redo');
    const shape = this.created;
    if (this.containerId !== null) {
      const container = this.doc.find(this.containerId);
      if (container) container.addChild(shape);
      this.doc.register(shape);
    } else {
      this.doc.addRoot(shape);
    }
    return ok(`${shape.tag}#${shape.id} restored`);
  }
}
