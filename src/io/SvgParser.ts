import { Shape } from '../shape/Shape.js';
import { Rect } from '../shape/Rect.js';
import { Circle } from '../shape/Circle.js';
import { Ellipse } from '../shape/Ellipse.js';
import { Line } from '../shape/Line.js';
import { Text } from '../shape/Text.js';
import { Group } from '../shape/Group.js';

export interface ParsedSvg {
  width: number;
  height: number;
  roots: Shape[];
  warnings: string[];
}

export class SvgParser {
  parse(content: string): ParsedSvg {
    const svgMatch = content.match(/<svg\b([^>]*)>([\s\S]*?)<\/svg>/);
    if (!svgMatch) throw new Error('invalid svg: no <svg> root');
    const rootAttrs = svgMatch[1];
    const inner = svgMatch[2];
    const width = this.numAttr(rootAttrs, 'width', 800);
    const height = this.numAttr(rootAttrs, 'height', 600);
    const warnings: string[] = [];
    const counters = new Map<string, number>();
    const roots = this.parseChildren(inner, warnings, counters);
    return { width, height, roots, warnings };
  }

  private numAttr(attrs: string, name: string, def: number): number {
    const m = attrs.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`));
    if (!m) return def;
    const n = Number(m[1]);
    return Number.isNaN(n) ? def : n;
  }

  private parseChildren(xml: string, warnings: string[], counters: Map<string, number>): Shape[] {
    const result: Shape[] = [];
    let i = 0;
    while (i < xml.length) {
      const lt = xml.indexOf('<', i);
      if (lt < 0) break;
      if (xml.startsWith('<!--', lt)) {
        const end = xml.indexOf('-->', lt + 4);
        i = end < 0 ? xml.length : end + 3;
        continue;
      }
      if (xml.startsWith('</', lt) || xml.startsWith('<?', lt)) {
        const gt = xml.indexOf('>', lt);
        i = gt < 0 ? xml.length : gt + 1;
        continue;
      }
      const gt = xml.indexOf('>', lt);
      if (gt < 0) break;
      let tagContent = xml.slice(lt + 1, gt).trim();
      const selfClosed = tagContent.endsWith('/');
      if (selfClosed) tagContent = tagContent.slice(0, -1).trim();
      const { tag, attrs } = this.parseTag(tagContent);
      let children: Shape[] = [];
      let textContent = '';
      if (!selfClosed) {
        const close = this.findCloseTag(xml, gt + 1, tag);
        if (close.open < 0) {
          i = gt + 1;
          continue;
        }
        const body = xml.slice(gt + 1, close.open);
        if (tag === 'text') {
          textContent = body.trim();
        } else {
          children = this.parseChildren(body, warnings, counters);
        }
        i = close.after;
      } else {
        i = gt + 1;
      }
      const shape = this.buildShape(tag, attrs, children, textContent, warnings, counters);
      if (shape) result.push(shape);
    }
    return result;
  }

  private parseTag(s: string): { tag: string; attrs: Map<string, string> } {
    const attrs = new Map<string, string>();
    const m = s.match(/^([\w:-]+)/);
    if (!m) return { tag: '', attrs };
    const tag = m[1];
    const rest = s.slice(tag.length);
    const re = /([\w:-]+)\s*=\s*"([^"]*)"/g;
    let am: RegExpExecArray | null;
    while ((am = re.exec(rest)) !== null) attrs.set(am[1], am[2]);
    return { tag, attrs };
  }

  private findCloseTag(xml: string, from: number, tag: string): { open: number; after: number } {
    const openTag = `<${tag}`;
    const closeTag = `</${tag}>`;
    let depth = 1;
    let i = from;
    while (i < xml.length) {
      const nextOpen = xml.indexOf(openTag, i);
      const nextClose = xml.indexOf(closeTag, i);
      if (nextClose < 0) return { open: -1, after: -1 };
      if (nextOpen >= 0 && nextOpen < nextClose) {
        const gt = xml.indexOf('>', nextOpen);
        if (gt >= 0 && xml[gt - 1] === '/') {
          i = gt + 1;
        } else {
          depth++;
          i = nextOpen + openTag.length;
        }
      } else {
        depth--;
        if (depth === 0) return { open: nextClose, after: nextClose + closeTag.length };
        i = nextClose + closeTag.length;
      }
    }
    return { open: -1, after: -1 };
  }

  private buildShape(
    tag: string,
    attrs: Map<string, string>,
    children: Shape[],
    textContent: string,
    warnings: string[],
    counters: Map<string, number>,
  ): Shape | null {
    let realId = attrs.get('id');
    if (!realId) {
      const count = (counters.get(tag) ?? 0) + 1;
      counters.set(tag, count);
      realId = `${tag}${count}`;
      warnings.push(`warning: assigned id ${realId} to unnamed <${tag}>`);
    }
    switch (tag) {
      case 'rect': {
        const r = new Rect(realId, this.num(attrs, 'x', 0), this.num(attrs, 'y', 0), this.num(attrs, 'width', 0), this.num(attrs, 'height', 0), attrs.get('fill'));
        if (attrs.has('stroke')) r.stroke = attrs.get('stroke');
        if (attrs.has('stroke-width')) r.strokeWidth = attrs.get('stroke-width');
        return r;
      }
      case 'circle': {
        const c = new Circle(realId, this.num(attrs, 'cx', 0), this.num(attrs, 'cy', 0), this.num(attrs, 'r', 0), attrs.get('fill'));
        if (attrs.has('stroke')) c.stroke = attrs.get('stroke');
        if (attrs.has('stroke-width')) c.strokeWidth = attrs.get('stroke-width');
        return c;
      }
      case 'ellipse': {
        const e = new Ellipse(realId, this.num(attrs, 'cx', 0), this.num(attrs, 'cy', 0), this.num(attrs, 'rx', 0), this.num(attrs, 'ry', 0), attrs.get('fill'));
        if (attrs.has('stroke')) e.stroke = attrs.get('stroke');
        if (attrs.has('stroke-width')) e.strokeWidth = attrs.get('stroke-width');
        return e;
      }
      case 'line': {
        const l = new Line(realId, this.num(attrs, 'x1', 0), this.num(attrs, 'y1', 0), this.num(attrs, 'x2', 0), this.num(attrs, 'y2', 0), attrs.get('stroke'));
        if (attrs.has('fill')) l.fill = attrs.get('fill');
        if (attrs.has('stroke-width')) l.strokeWidth = attrs.get('stroke-width');
        return l;
      }
      case 'text': {
        const t = new Text(realId, this.num(attrs, 'x', 0), this.num(attrs, 'y', 0), textContent);
        if (attrs.has('fill')) t.fill = attrs.get('fill');
        if (attrs.has('stroke')) t.stroke = attrs.get('stroke');
        return t;
      }
      case 'g': {
        const g = new Group(realId);
        if (attrs.has('fill')) g.fill = attrs.get('fill');
        if (attrs.has('stroke')) g.stroke = attrs.get('stroke');
        if (attrs.has('stroke-width')) g.strokeWidth = attrs.get('stroke-width');
        if (attrs.has('data-kind')) g.kind = attrs.get('data-kind');
        for (const c of children) g.addChild(c);
        return g;
      }
      default:
        return null;
    }
  }

  private num(attrs: Map<string, string>, name: string, def: number): number {
    const v = attrs.get(name);
    if (v === undefined) return def;
    const n = Number(v);
    return Number.isNaN(n) ? def : n;
  }
}
