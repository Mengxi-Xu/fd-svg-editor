import { Command } from '../command/Command.js';

export class CommandHistory {
  private readonly undoStack: Command[] = [];
  private readonly redoStack: Command[] = [];
  private frozen = false;

  push(cmd: Command): void {
    this.undoStack.push(cmd);
    this.redoStack.length = 0;
    this.frozen = false;
  }

  onReset(): void {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
    this.frozen = true;
  }

  onIo(): void {
    this.frozen = true;
  }

  isFrozen(): boolean {
    return this.frozen;
  }

  canUndo(): boolean {
    return !this.frozen && this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return !this.frozen && this.redoStack.length > 0;
  }

  popForUndo(): Command | null {
    if (!this.canUndo()) return null;
    const cmd = this.undoStack.pop() as Command;
    this.redoStack.push(cmd);
    return cmd;
  }

  popForRedo(): Command | null {
    if (!this.canRedo()) return null;
    const cmd = this.redoStack.pop() as Command;
    this.undoStack.push(cmd);
    return cmd;
  }
}
