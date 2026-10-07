export type ChatBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: number; text: string }
  | { type: 'list'; ordered: boolean; start: number; items: string[] }
  | { type: 'code'; text: string };

/** A small text-only Markdown subset. HTML and links remain ordinary text. */
export function formatChatBlocks(content: string): ChatBlock[] {
  const blocks: ChatBlock[] = [];
  let paragraph: string[] = [];
  let list: Extract<ChatBlock, { type: 'list' }> | null = null;
  let code: string[] | null = null;

  const flush = () => {
    if (paragraph.length) blocks.push({ type: 'paragraph', text: paragraph.join('\n') });
    if (list) blocks.push(list);
    paragraph = [];
    list = null;
  };

  for (const line of content.replace(/\r\n?/g, '\n').split('\n')) {
    if (/^\s*```/.test(line)) {
      flush();
      if (code) {
        blocks.push({ type: 'code', text: code.join('\n') });
        code = null;
      } else {
        code = [];
      }
      continue;
    }
    if (code) { code.push(line); continue; }
    if (!line.trim()) { flush(); continue; }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flush();
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2] });
      continue;
    }

    const bullet = line.match(/^\s*[-*+]\s+(.+)$/);
    const numbered = line.match(/^\s*(\d+)[.)]\s+(.+)$/);
    if (bullet || numbered) {
      const ordered = Boolean(numbered);
      if (!list || list.ordered !== ordered) {
        flush();
        list = { type: 'list', ordered, start: numbered ? Number(numbered[1]) : 1, items: [] };
      }
      list.items.push(bullet ? bullet[1] : numbered![2]);
    } else if (list && /^\s{2,}\S/.test(line)) {
      list.items[list.items.length - 1] += `\n${line.trim()}`;
    } else {
      if (list) flush();
      paragraph.push(line);
    }
  }
  if (code) blocks.push({ type: 'code', text: code.join('\n') });
  flush();
  return blocks;
}

export function formatInlineText(text: string) {
  return text.split(/(\*\*[^*\n]+\*\*|`[^`\n]+`|\*[^*\n]+\*)/g).filter(Boolean).map((part) => {
    if (/^\*\*[^*\n]+\*\*$/.test(part)) return { type: 'bold' as const, text: part.slice(2, -2) };
    if (/^`[^`\n]+`$/.test(part)) return { type: 'code' as const, text: part.slice(1, -1) };
    if (/^\*[^*\n]+\*$/.test(part)) return { type: 'italic' as const, text: part.slice(1, -1) };
    return { type: 'text' as const, text: part };
  });
}
