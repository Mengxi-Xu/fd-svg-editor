import { SvgDocument } from '../document/SvgDocument.js';

export class SvgSerializer {
  serialize(doc: SvgDocument): string {
    const w = doc.getWidth();
    const h = doc.getHeight();
    const roots = doc.getRoots();
    const header = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"`;
    if (roots.length === 0) return `${header}/>`;
    const body = roots.map((r) => r.toSvg(1)).join('\n');
    return `${header}>\n${body}\n</svg>`;
  }
}
