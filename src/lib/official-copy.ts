export type OfficialBlock =
  | { type: "h2" | "h3" | "h4"; text: string }
  | { type: "p"; text: string }
  | { type: "ul" | "ol"; items: string[] };

const HEADING = /^(#{1,6})\s+(.*)$/;
const UL = /^\s*[-*•■]\s+(.*)$/;
const OL = /^\s*\d+\.\s+(.*)$/;

/**
 * Parse official listing copy into headings, paragraphs, and lists.
 * Does not drop sentences. Only recognises markdown the packs already use.
 */
export function parseOfficialCopy(text: string): OfficialBlock[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: OfficialBlock[] = [];
  let para: string[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushPara = () => {
    const joined = para.join("\n").trim();
    if (joined) blocks.push({ type: "p", text: joined });
    para = [];
  };
  const flushList = () => {
    if (list && list.items.length) blocks.push(list);
    list = null;
  };

  for (const line of lines) {
    const heading = line.match(HEADING);
    if (heading) {
      flushPara();
      flushList();
      const n = heading[1].length;
      const tag = n <= 2 ? "h2" : n === 3 ? "h3" : "h4";
      blocks.push({ type: tag, text: heading[2].trim() });
      continue;
    }
    const ul = line.match(UL);
    if (ul) {
      flushPara();
      if (!list || list.type !== "ul") {
        flushList();
        list = { type: "ul", items: [] };
      }
      list.items.push(ul[1]);
      continue;
    }
    const ol = line.match(OL);
    if (ol) {
      flushPara();
      if (!list || list.type !== "ol") {
        flushList();
        list = { type: "ol", items: [] };
      }
      list.items.push(ol[1]);
      continue;
    }
    if (!line.trim()) {
      flushPara();
      flushList();
      continue;
    }
    flushList();
    para.push(line);
  }
  flushPara();
  flushList();
  return blocks;
}

/** Flatten parsed blocks back to plain text for equality checks. */
export function officialCopyPlainText(blocks: OfficialBlock[]): string {
  return blocks
    .map((b) => {
      if (b.type === "ul" || b.type === "ol") return b.items.join("\n");
      return b.text;
    })
    .join("\n")
    .replace(/\s+/g, " ")
    .trim();
}
