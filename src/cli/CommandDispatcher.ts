import { Command, CommandCategory, CommandResult, fail } from '../command/Command.js';
import { SvgDocument } from '../document/SvgDocument.js';
import { ShapeFactory } from '../shape/ShapeFactory.js';
import { SvgSerializer } from '../io/SvgSerializer.js';
import { SvgParser } from '../io/SvgParser.js';
import { CommandHistory } from '../history/CommandHistory.js';
import { HelpCommand } from './HelpCommand.js';
import { InitCommand } from '../command/InitCommand.js';
import { CanvasCommand } from '../command/CanvasCommand.js';
import { ReadCommand } from '../command/ReadCommand.js';
import { SaveCommand } from '../command/SaveCommand.js';
import { CreateCommand } from '../command/CreateCommand.js';
import { TreeCommand } from '../command/TreeCommand.js';
import { ShowCommand } from '../command/ShowCommand.js';
import { MoveCommand } from '../command/MoveCommand.js';
import { ScaleCommand } from '../command/ScaleCommand.js';
import { SetCommand } from '../command/SetCommand.js';
import { DeleteCommand } from '../command/DeleteCommand.js';
import { GroupCommand } from '../command/GroupCommand.js';
import { UngroupCommand } from '../command/UngroupCommand.js';
import { AddToCommand } from '../command/AddToCommand.js';
import { FrontCommand } from '../command/FrontCommand.js';
import { BackCommand } from '../command/BackCommand.js';
import { UndoCommand } from '../command/UndoCommand.js';
import { RedoCommand } from '../command/RedoCommand.js';

export class CommandDispatcher {
  constructor(
    private readonly doc: SvgDocument,
    private readonly factory: ShapeFactory,
    private readonly serializer: SvgSerializer,
    private readonly parser: SvgParser,
    private readonly history: CommandHistory,
  ) {}

  dispatch(line: string): CommandResult {
    const parts = this.tokenize(line);
    if (parts.length === 0) return fail('empty command');
    const name = parts[0];
    const args = parts.slice(1);
    if (name === 'undo') return new UndoCommand(this.doc, this.history).execute();
    if (name === 'redo') return new RedoCommand(this.doc, this.history).execute();
    const cmd = this.build(name, args);
    if (cmd === null) return fail(`unknown command: ${name}`);
    const result = cmd.execute();
    if (!result.ok) return result;
    switch (cmd.category) {
      case CommandCategory.Edit:
        this.history.push(cmd);
        break;
      case CommandCategory.Document:
        if (cmd.kind === 'init' || cmd.kind === 'read') this.history.onReset();
        else this.history.onIo();
        break;
      case CommandCategory.Display:
        break;
    }
    return result;
  }

  private build(name: string, args: string[]): Command | null {
    switch (name) {
      case 'help':
        return new HelpCommand();
      case 'init':
        return new InitCommand(this.doc, args);
      case 'canvas':
        return new CanvasCommand(this.doc, args);
      case 'read':
        return new ReadCommand(this.doc, args, this.parser);
      case 'save':
        return new SaveCommand(this.doc, args, this.serializer);
      case 'create':
        return new CreateCommand(this.doc, this.factory, args);
      case 'tree':
        return new TreeCommand(this.doc, args);
      case 'show':
        return new ShowCommand(this.doc, args);
      case 'move':
        return new MoveCommand(this.doc, args);
      case 'scale':
        return new ScaleCommand(this.doc, args);
      case 'set':
        return new SetCommand(this.doc, args);
      case 'delete':
        return new DeleteCommand(this.doc, args);
      case 'group':
        return new GroupCommand(this.doc, args);
      case 'ungroup':
        return new UngroupCommand(this.doc, args);
      case 'addto':
        return new AddToCommand(this.doc, args);
      case 'front':
        return new FrontCommand(this.doc, args);
      case 'back':
        return new BackCommand(this.doc, args);
      default:
        return null;
    }
  }

  private tokenize(line: string): string[] {
    const out: string[] = [];
    let i = 0;
    while (i < line.length) {
      while (i <line.length && /\s/.test(line[i])) i++;
      if (i >= line.length) break;
      if (line[i] === '"') {
        const end = line.indexOf('"', i + 1);
        if (end < 0) {
          out.push(line.slice(i + 1));
          break;
        }
        out.push(line.slice(i + 1, end));
        i = end + 1;
      } else {
        let j = i;
        while (j < line.length && !/\s/.test(line[j])) j++;
        out.push(line.slice(i, j));
        i = j;
      }
    }
    return out;
  }
}
