import * as readline from 'node:readline';
import { SvgDocument } from '../document/SvgDocument.js';
import { ShapeFactory } from '../shape/ShapeFactory.js';
import { SvgSerializer } from '../io/SvgSerializer.js';
import { SvgParser } from '../io/SvgParser.js';
import { CommandDispatcher } from './CommandDispatcher.js';

export class Repl {
  private readonly doc = new SvgDocument();
  private readonly factory = new ShapeFactory();
  private readonly serializer = new SvgSerializer();
  private readonly parser = new SvgParser();
  private readonly dispatcher = new CommandDispatcher(this.doc, this.factory, this.serializer, this.parser);

  async run(): Promise<void> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'svg> ',
    });

    console.log("svg-editor 0.1 — type 'help' for commands");
    rl.prompt();

    rl.on('line', (line: string) => {
      const trimmed = line.trim();
      if (trimmed === '' || trimmed.startsWith('#')) {
        rl.prompt();
        return;
      }
      const result = this.dispatcher.dispatch(trimmed);
      console.log(result.message);
      rl.prompt();
    });

    return new Promise<void>((resolve) => {
      rl.on('close', () => {
        resolve();
      });
    });
  }
}
