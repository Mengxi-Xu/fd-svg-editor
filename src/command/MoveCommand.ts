import { Command, CommandCategory, CommandResult, fail, ok } from './Command.js';
import { SvgDocument } from '../document/SvgDocument.js';

export class MoveCommand implements Command {
  readonly kind = 'move';
  readonly category = CommandCategory.Edit;

  private targetId?: string;
  private dx?: number;
  private dy?: number;

  constructor(
    private readonly doc: SvgDocument,
    private readonly args: string[],
  ) {}

  execute(): CommandResult {
    if (!this.doc.isLoaded()) return fail("no document. use 'init' or 'read' first");
    if (this.args.length < 3) return fail('move requires <id> <dx> <dy>');
    const id = this.args[0];
    const dx = Number(this.args[1]);
    const dy = Number(this.args[2]);
    if (Number.isNaN(dx) || Number.isNaN(dy)) return fail('invalid move offset');
    const shape = this.doc.find(id);
    if (!shape) return fail(`no such shape: ${id}`);
    shape.move(dx, dy);
    this.targetId = id;
    this.dx = dx;
    this.dy = dy;
    return ok(this.fmt(shape, dx, dy, 'moved to', 'moved by'));
  }

  undo(): CommandResult {
    if (this.targetId === undefined || this.dx === undefined || this.dy === undefined) return fail('nothing to undo');
    const shape = this.doc.find(this.targetId);
    if (!shape) return fail(`no such shape: ${this.targetId}`);
    shape.move(-this.dx, -this.dy);
    return ok(this.fmt(shape, -this.dx, -this.dy, 'moved back to', 'moved back by'));
  }

  redo(): CommandResult {
    if (this.targetId === undefined || this.dx === undefined || this.dy === undefined) return fail('nothing to redo');
    const shape = this.doc.find(this.targetId);
    if (!shape) return fail(`no such shape: ${this.targetId}`);
    shape.move(this.dx, this.dy);
    return ok(this.fmt(shape, this.dx, this.dy, 'moved to', 'moved by'));
  }

  private fmt(shape: { tag: string; id: string; anchor(): { x: number; y: number } | null }, dx: number, dy: number, leafVerb: string, contVerb: string): string {
    const a = shape.anchor();
    if (a) return `${shape.tag}#${shape.id} ${leafVerb} (${a.x},${a.y})`;
    return `${shape.tag}#${shape.id} ${contVerb} (${dx},${dy})`;
  }
}
