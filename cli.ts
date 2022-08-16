import { parse, traverse, transformFromAstSync } from "@babel/core"
import { z } from "zod";
import { asNumberString, parse as parseArgs } from "zodiarg";
import fetch from "isomorphic-fetch";

const p = parseArgs(
  {
    options: {
      position: asNumberString,
      arround: asNumberString,
    },
    flags: {
      raw: z.boolean().default(false),
    },
    args: [
      z.string().describe("input your first name"),
    ],
    alias: {
      p: 'position',
      a: 'arround',
    }
  },
  process.argv.slice(2),
);

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

async function main() {
  const at = p.options.position;
  const text = await fetch(p.args[0]).then(t => t.text());

  const parsed = parse(text, {});
  let hit: any = null;
  let maxRange = Infinity
  let errorStart: any = null;
  let errorEnd: any = null;

  const lineBuffer = p.options.arround;

  // just walk
  traverse(parsed, {
    enter(path) {
      const start = path.node.start!;
      const end = path.node.end!;
      if (start <= at && at <= end) {
        if (maxRange >= end - start) {
          errorStart = start;
          errorEnd = end;
          maxRange = end - start;
          hit = path.node;
        }
      }
    },
  });
  // 2. replace
  traverse(parsed, {
    enter(path) {
      if (path.node === hit) {
        path.addComment('leading', `====== ERROR_HERE: ${errorStart}-${errorEnd} ======`);
      }
    },
  });

  const reprint = transformFromAstSync(parsed!, text, {})!.code!;
  const lines = reprint.split('\n');
  const errorLine = lines.findIndex(e => {
    return e.includes('====== ERROR_HERE');
  });
  const linesArroundError = lines.slice(errorLine - lineBuffer, errorLine + lineBuffer + 1);
  console.log(linesArroundError.join('\n'));
}
