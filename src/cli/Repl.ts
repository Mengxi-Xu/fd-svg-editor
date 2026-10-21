import * as readline from 'node:readline';
import { HelpCommand } from './HelpCommand.js';

export class Repl {
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
      this.handleLine(trimmed);
      rl.prompt();
    });

    return new Promise<void>((resolve) => {
      rl.on('close', () => {
        resolve();
      });
    });
  }

  private handleLine(line: string): void {
    const name = line.split(/\s+/)[0];
    if (name === 'help') {
      const result = new HelpCommand().execute();
      console.log(result.message);
      return;
    }
    console.log(`error: unknown command: ${name}`);
  }
}
