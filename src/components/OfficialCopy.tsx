import { parseOfficialCopy } from "@/lib/official-copy";

export function OfficialCopy({ text }: { text: string }) {
  const blocks = parseOfficialCopy(text);
  return (
    <div className="editorial-body font-serif">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return <h2 key={i}>{block.text}</h2>;
          case "h3":
            return <h3 key={i}>{block.text}</h3>;
          case "h4":
            return <h4 key={i}>{block.text}</h4>;
          case "ul":
            return (
              <ul key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ol>
            );
          case "p":
            return <p key={i}>{block.text}</p>;
        }
      })}
    </div>
  );
}
