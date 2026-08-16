import { useEffect } from "react";

/**
 * Sets document.title and the <meta name="description"> tag for the current page.
 * Falls back gracefully if the meta tag doesn't exist.
 */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title;

    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevDesc = metaDesc?.content ?? "";

    if (description) {
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = description;
    }

    return () => {
      document.title = prev;
      if (metaDesc && prevDesc) metaDesc.content = prevDesc;
    };
  }, [title, description]);
}
