import { Link } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { Heart, Share2, Plus, Trash2, ExternalLink, Copy } from "lucide-react";

export default function MyShortlists() {
  const { isAuthenticated, loading } = useAuth();
  const { data: lists = [], refetch: refetchLists } = trpc.shortlists.listMine.useQuery(
    undefined,
    { enabled: isAuthenticated },
  );

  const [newTitle, setNewTitle] = useState("");
  const createList = trpc.shortlists.create.useMutation({
    onSuccess: () => {
      setNewTitle("");
      refetchLists();
      toast.success("Shortlist created.");
    },
  });
  const deleteList = trpc.shortlists.delete.useMutation({
    onSuccess: () => {
      refetchLists();
    },
  });
  const [openListId, setOpenListId] = useState<number | null>(null);

  const shareUrl = (shareToken: string | null) =>
    shareToken ? `${window.location.origin}/s/${shareToken}` : "";

  const copyShare = async (token: string | null) => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(shareUrl(token));
      toast.success("Share link copied.");
    } catch {
      toast.error("Couldn't copy link.");
    }
  };

  if (loading) {
    return (
      <div className="container pt-40 pb-24 text-center">
        <div className="eyebrow">One moment</div>
        <h2 className="serif-headline text-3xl mt-3">Loading…</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container pt-40 pb-24 text-center max-w-2xl">
        <div className="eyebrow">Account</div>
        <h1 className="serif-headline text-5xl mt-4">Your private shortlists.</h1>
        <p className="mt-5 font-serif text-lg text-muted-foreground leading-relaxed">
          Sign in to assemble curated shortlists of residences and share them — internally or with
          candidates — via a single, elegant link.
        </p>
        <div className="rule-gold mt-10 max-w-xs mx-auto" />
        <a href={getLoginUrl()} className="mt-10 inline-flex btn-brass">
          Sign in to continue
        </a>
      </div>
    );
  }

  const listsArr = lists as any[];

  return (
    <div className="pb-24">
      {/* Masthead */}
      <div className="pt-32 pb-10 hairline-bottom bg-ivory-warm">
        <div className="container">
          <div className="eyebrow">Account</div>
          <h1 className="serif-headline text-5xl lg:text-6xl mt-3 leading-[1.05]">
            Your Shortlists.
          </h1>
          <p className="mt-4 font-serif text-lg text-muted-foreground max-w-2xl">
            Curate private collections. Share any list with a colleague or approver via a simple
            link — no login required on their end.
          </p>
        </div>
      </div>

      {/* Create new */}
      <div className="container mt-12">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newTitle.trim()) return;
            createList.mutate({ title: newTitle.trim() });
          }}
          className="flex flex-col sm:flex-row gap-3 max-w-2xl"
        >
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. London Executive Assignments — Q2"
            className="flex-1 border border-border bg-background px-4 py-3 font-serif focus:outline-none focus:border-brass"
          />
          <button type="submit" className="btn-brass justify-center">
            <Plus className="w-4 h-4" /> Create shortlist
          </button>
        </form>
      </div>

      {/* Lists */}
      <div className="container mt-14">
        {listsArr.length === 0 ? (
          <div className="py-20 text-center">
            <Heart className="w-8 h-8 text-brass mx-auto" />
            <h3 className="serif-headline text-3xl mt-4">No shortlists yet.</h3>
            <p className="mt-3 font-serif text-muted-foreground">
              Start a new list above, then add residences from any property page.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {listsArr.map((list: any) => (
              <ListCard
                key={list.id}
                list={list}
                expanded={openListId === list.id}
                onToggle={() => setOpenListId(openListId === list.id ? null : list.id)}
                onDelete={() => deleteList.mutate({ id: list.id })}
                onShare={() => copyShare(list.shareToken)}
                shareUrl={shareUrl(list.shareToken)}
                onItemsChanged={refetchLists}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ListCard({
  list,
  expanded,
  onToggle,
  onDelete,
  onShare,
  shareUrl,
  onItemsChanged,
}: {
  list: any;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onShare: () => void;
  shareUrl: string;
  onItemsChanged: () => void;
}) {
  const { data: items = [], refetch } = trpc.shortlists.itemsForUserShortlist.useQuery(
    { id: list.id },
    { enabled: expanded },
  );
  const removeItem = trpc.shortlists.removeItem.useMutation({
    onSuccess: () => {
      refetch();
      onItemsChanged();
      toast.success("Removed.");
    },
  });

  return (
    <div className="border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
        <button onClick={onToggle} className="text-left flex-1">
          <div className="eyebrow">
            Shortlist · {list.itemCount ?? 0} {list.itemCount === 1 ? "residence" : "residences"}
          </div>
          <h3 className="serif-headline text-2xl mt-1 group-hover:text-brass-deep">
            {list.title}
          </h3>
        </button>
        <div className="flex items-center gap-2">
          <button onClick={onShare} className="btn-outline text-xs">
            <Share2 className="w-3.5 h-3.5" /> Share link
          </button>
          <button
            onClick={() => {
              if (confirm("Delete this shortlist?")) onDelete();
            }}
            className="p-2 text-muted-foreground hover:text-charcoal"
            aria-label="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {shareUrl && (
        <div className="px-6 pb-4 flex items-center gap-2 text-xs">
          <code className="flex-1 bg-ivory-warm px-3 py-2 text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">
            {shareUrl}
          </code>
          <button onClick={onShare} className="text-muted-foreground hover:text-charcoal">
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {expanded && (
        <div className="border-t border-border p-6 bg-ivory-warm/40">
          {(items as any[]).length === 0 ? (
            <div className="text-sm text-muted-foreground italic">
              No residences saved yet. Add some from any property page.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(items as any[]).map((it: any) => {
                const p = it.property;
                if (!p) return null;
                return (
                  <div key={it.id} className="bg-background border border-border">
                    <div className="aspect-[4/3] overflow-hidden bg-ivory-warm">
                      {p.heroImageUrl && (
                        <img
                          src={p.heroImageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="eyebrow">{p.category}</div>
                      <h4 className="serif-headline text-lg mt-1 leading-tight">{p.name}</h4>
                      <div className="text-xs text-muted-foreground">{p.neighborhood}</div>
                      <div className="mt-3 flex items-center gap-2">
                        <Link href={`/properties/${p.slug}`} className="text-xs text-brass-deep font-medium hover:underline inline-flex items-center gap-1">
                          View <ExternalLink className="w-3 h-3" />
                        </Link>
                        <button
                          onClick={() =>
                            removeItem.mutate({ shortlistId: list.id, propertyId: p.id })
                          }
                          className="text-xs text-muted-foreground hover:text-charcoal ml-auto"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
