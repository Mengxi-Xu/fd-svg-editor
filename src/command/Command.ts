export enum CommandCategory {
  Edit = 'edit',
  Display = 'display',
  Document = 'document',
}

export interface CommandResult {
  readonly ok: boolean;
  readonly message: string;
}

export function ok(message: string): CommandResult {
  return { ok: true, message };
}

export function fail(message: string): CommandResult {
  return { ok: false, message: `error: ${message}` };
}

export interface Command {
  readonly kind: string;
  readonly category: CommandCategory;
  execute(): CommandResult;
  undo(): CommandResult;
  redo(): CommandResult;
}
