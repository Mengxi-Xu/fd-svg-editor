import { Command, CommandCategory, CommandResult, fail } from './Command.js';
import { SvgDocument } from '../document/SvgDocument.js';
import { CommandHistory } from '../history/CommandHistory.js';

export class RedoCommand implements Command {
  readonly kind = 'redo';
  readonly category = CommandCategory.Display;

  constructor(
    private readonly doc: SvgDocument,
    private readonly history: CommandHistory,
  ) {}

  execute(): CommandResult {
    if (!this.doc.isLoaded()) return fail("no document. use 'init' or 'read' first");
    if (this.history.isFrozen()) return fail('redo not allowed after io command');
    const cmd = this.history.popForRedo();
    if (cmd === null) return fail('nothing to redo');
    return cmd.redo();
  }

  undo(): CommandResult {
    return fail('redo: nothing to undo');
  }

  redo(): CommandResult {
    return fail('redo: nothing to redo');
  }
}
