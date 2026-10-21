import * as fs from 'node:fs';
import { Command, CommandCategory, CommandResult, fail, ok } from './Command.js';
import { SvgDocument } from '../document/SvgDocument.js';
import { SvgParser } from '../io/SvgParser.js';

export class ReadCommand implements Command {
  readonly kind = 'read';
  readonly category = CommandCategory.Document;

  constructor(
    private readonly doc: SvgDocument,
    private readonly args: string[],
    private readonly parser: SvgParser,
  ) {}

  execute(): CommandResult {
    if (this.args.length < 1) return fail('read requires a file path');
    const path = this.args[0];
    let content: string;
    try {
      content = fs.readFileSync(path, 'utf-8');
    } catch {
      return fail(`cannot read file: ${path}`);
    }
    try {
      const parsed = this.parser.parse(content);
      this.doc.loadParsed(parsed.width, parsed.height, parsed.roots, path);
      for (const w of parsed.warnings) console.log(w);
      return ok(`read ${path} (${this.doc.elementCount()} elements)`);
    } catch {
      return fail(`cannot read file: ${path}`);
    }
  }

  undo(): CommandResult {
    return fail('undo not allowed after io command');
  }

  redo(): CommandResult {
    return fail('redo not allowed after io command');
  }
}
