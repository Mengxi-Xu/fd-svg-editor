import { Repl } from './cli/Repl.js';

async function main(): Promise<void> {
  const repl = new Repl();
  await repl.run();
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
