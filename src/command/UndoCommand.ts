import { Command, CommandCategory, CommandResult, fail } from './Command.js';
import { SvgDocument } from '../document/SvgDocument.js';
import { CommandHistory } from '../history/CommandHistory.js';

export class UndoCommand implements Command {
  readonly kind = 'undo';
  readonly category = CommandCategory.Display;

  constructor(
    private readonly doc: SvgDocument,
    private readonly history: CommandHistory,
  ) {}

  execute(): CommandResult {
    if (!this.doc.isLoaded()) return fail("no document. use 'init' or 'read' first");
    if (this.history.isFrozen()) return fail('undo not allowed after io command');
    const cmd = this.history.popForUndo();
    if (cmd === null) return fail('nothing to undo');
    return cmd.undo();
  }

  undo(): CommandResult {
    return fail('undo: nothing to undo');
  }

  redo(): CommandResult {
    return fail('undo: nothing to redo');
  }
}
