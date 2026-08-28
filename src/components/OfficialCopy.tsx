import { parseOfficialCopy } from "@/lib/official-copy";

export function OfficialCopy({ text }: { text: string }) {
  const blocks = parseOfficialCopy(text);
  return (
    <div className="editorial-body font-serif">
      {blocks.map((block, i) => {
        if (block.type === "h2") return <h2 key={i}>{block.text}</h2>;
        if (block.type === "h3") return <h3 key={i}>{block.text}</h3>;
        if (block.type === "h4") return <h4 key={i}>{block.text}</h4>;
        if (block.type === "ul") {
          return (
            <ul key={i}>
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        }
        if (block.type === "ol") {
          return (
            <ol key={i}>
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ol>
          );
        }
        return <p key={i}>{block.text}</p>;
      })}
    </div>
  );
}
