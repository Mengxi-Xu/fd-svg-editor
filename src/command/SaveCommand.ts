import * as fs from 'node:fs';
import { Command, CommandCategory, CommandResult, fail, ok } from './Command.js';
import { SvgDocument } from '../document/SvgDocument.js';
import { SvgSerializer } from '../io/SvgSerializer.js';

export class SaveCommand implements Command {
  readonly kind = 'save';
  readonly category = CommandCategory.Document;

  constructor(
    private readonly doc: SvgDocument,
    private readonly args: string[],
    private readonly serializer: SvgSerializer,
  ) {}

  execute(): CommandResult {
    if (!this.doc.isLoaded()) return fail("no document. use 'init' or 'read' first");
    const path = this.args[0] ?? this.doc.getSourcePath();
    if (!path) return fail('save requires a file path');
    const svg = this.serializer.serialize(this.doc);
    try {
      fs.writeFileSync(path, svg);
    } catch {
      return fail(`cannot write file: ${path}`);
    }
    this.doc.setSourcePath(path);
    return ok(`saved to ${path} (${this.doc.elementCount()} elements)`);
  }

  undo(): CommandResult {
    return fail('undo not allowed after io command');
  }

  redo(): CommandResult {
    return fail('redo not allowed after io command');
  }
}
