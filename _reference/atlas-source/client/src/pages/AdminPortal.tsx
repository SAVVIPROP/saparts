import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import {
  ArrowLeft, Check, ChevronDown, Download, FileSpreadsheet, ImagePlus, Images,
  LayoutDashboard, Loader2, LockKeyhole, Plus, RefreshCw, Save, Search, Sparkles,
  UploadCloud, X,
} from "lucide-react";
import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";

type PropertyForm = {
  name: string;
  brand: string;
  category: "Serviced Apartment" | "Aparthotel" | "Residence" | "Penthouse";
  tagline: string;
  description: string;
  neighborhood: string;
  address: string;
  officialUrl: string;
  virtualTourUrl: string;
  amenities: string;
  unitTypes: string;
  minStayNights: string;
  published: boolean;
  featured: boolean;
};

const asForm = (property: any): PropertyForm => ({
  name: property?.name ?? "",
  brand: property?.brand ?? "",
  category: property?.category ?? "Serviced Apartment",
  tagline: property?.tagline ?? "",
  description: property?.description ?? "",
  neighborhood: property?.neighborhood ?? "",
  address: property?.address ?? "",
  officialUrl: property?.officialUrl ?? "",
  virtualTourUrl: property?.virtualTourUrl ?? "",
  amenities: Array.isArray(property?.amenities) ? property.amenities.join(", ") : "",
  unitTypes: Array.isArray(property?.unitTypes) ? property.unitTypes.join(", ") : "",
  minStayNights: property?.minStayNights ? String(property.minStayNights) : "",
  published: Boolean(property?.published),
  featured: Boolean(property?.featured),
});

const splitList = (value: string) => value.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean);
const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(new Error("Could not read file"));
  reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
  reader.readAsDataURL(file);
});
const downloadWorkbook = (base64: string) => {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `saparts-listings-${new Date().toISOString().slice(0, 10)}.xlsx`;
  anchor.click();
  URL.revokeObjectURL(url);
};

function PortalNotice({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">{children}</div>;
}

export default function AdminPortal() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [selectedId, setSelectedId] = useState<number | undefined>();
  const [query, setQuery] = useState("");
  const [cityId, setCityId] = useState<number | undefined>();
  const [form, setForm] = useState<PropertyForm>(asForm(null));
  const [sourceText, setSourceText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceTitle, setSourceTitle] = useState("");
  const [importBase64, setImportBase64] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [draggedImageId, setDraggedImageId] = useState<number | null>(null);
  const [newListingName, setNewListingName] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const workbookInputRef = useRef<HTMLInputElement>(null);

  const cities = trpc.cities.list.useQuery();
  const listings = trpc.admin.listProperties.useQuery({ q: query || undefined, cityId, limit: 300 }, { enabled: Boolean(user?.role === "admin") });
  const detail = trpc.admin.property.useQuery({ propertyId: selectedId! }, { enabled: Boolean(selectedId && user?.role === "admin") });
  const exportWorkbook = trpc.admin.exportWorkbook.useQuery(cityId ? { cityId } : undefined, { enabled: false });
  const updateProperty = trpc.admin.updateProperty.useMutation({ onSuccess: async (record) => {
    await Promise.all([utils.admin.listProperties.invalidate(), utils.admin.property.invalidate({ propertyId: record?.property.id })]);
  }});
  const createProperty = trpc.admin.createProperty.useMutation({ onSuccess: async (record) => {
    await utils.admin.listProperties.invalidate();
    if (record?.property?.id) setSelectedId(record.property.id);
    setNewListingName("");
  }});
  const uploadImage = trpc.admin.uploadImage.useMutation({ onSuccess: () => detail.refetch() });
  const reorderImages = trpc.admin.reorderImages.useMutation({ onSuccess: () => detail.refetch() });
  const removeImage = trpc.admin.removeImage.useMutation({ onSuccess: () => detail.refetch() });
  const extractSource = trpc.admin.extractSource.useMutation({ onSuccess: () => detail.refetch() });
  const approveDraft = trpc.admin.approveDraft.useMutation({ onSuccess: () => detail.refetch() });
  const rejectDraft = trpc.admin.rejectDraft.useMutation({ onSuccess: () => detail.refetch() });
  const previewWorkbook = trpc.admin.previewWorkbook.useMutation();
  const applyWorkbook = trpc.admin.applyWorkbook.useMutation({ onSuccess: async () => {
    await utils.admin.listProperties.invalidate();
    setImportBase64(null);
  }});

  const adminMenu: DashboardMenuItem[] = useMemo(() => [
    { icon: LayoutDashboard, label: "Listings", path: "/admin" },
    { icon: FileSpreadsheet, label: "Excel workspace", path: "/admin#excel" },
  ], []);

  useEffect(() => {
    if (detail.data?.property) setForm(asForm(detail.data.property));
  }, [detail.data?.property?.id, detail.data?.property?.updatedAt]);

  useEffect(() => {
    if (!selectedId && listings.data?.[0]?.property.id) setSelectedId(listings.data[0].property.id);
  }, [listings.data, selectedId]);

  if (loading) return <div className="grid min-h-screen place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!user) {
    return <div className="grid min-h-screen place-items-center bg-stone-50 p-6"><div className="max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm"><LockKeyhole className="mx-auto h-8 w-8 text-stone-700" /><h1 className="mt-5 font-serif text-3xl">Sign in to manage SAparts</h1><p className="mt-3 text-sm leading-6 text-stone-600">The listing workspace is available only to authorised administrators.</p><button className="mt-6 rounded-md bg-stone-950 px-5 py-3 text-sm font-medium text-white" onClick={() => window.location.href = getLoginUrl()}>Sign in</button></div></div>;
  }
  if (user.role !== "admin") return <div className="grid min-h-screen place-items-center bg-stone-50 p-6"><div className="max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm"><LockKeyhole className="mx-auto h-8 w-8 text-stone-700" /><h1 className="mt-5 font-serif text-3xl">Administrator access required</h1><p className="mt-3 text-sm leading-6 text-stone-600">Your account is signed in but does not have directory-editor permissions.</p><Link href="/" className="mt-6 inline-block text-sm font-medium underline">Return to the directory</Link></div></div>;

  const selected = detail.data;
  const save = async () => {
    if (!selectedId) return;
    await updateProperty.mutateAsync({ propertyId: selectedId, patch: {
      ...form,
      brand: form.brand || null, tagline: form.tagline || null, neighborhood: form.neighborhood || null,
      address: form.address || null, officialUrl: form.officialUrl || null, virtualTourUrl: form.virtualTourUrl || null,
      amenities: splitList(form.amenities), unitTypes: splitList(form.unitTypes), minStayNights: form.minStayNights ? Number(form.minStayNights) : null,
    }});
  };
  const handleImages = async (files: FileList | File[]) => {
    if (!selectedId) return;
    for (const file of Array.from(files).filter((candidate) => candidate.type.startsWith("image/"))) {
      await uploadImage.mutateAsync({ propertyId: selectedId, filename: file.name, contentType: file.type, dataBase64: await toBase64(file), alt: `${form.name} — property image` });
    }
  };
  const onImageDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault(); setDragOver(false); await handleImages(event.dataTransfer.files);
  };
  const reorder = async (targetId: number) => {
    if (!selected || !draggedImageId || draggedImageId === targetId) return;
    const ids = selected.images.map((image) => image.id);
    const from = ids.indexOf(draggedImageId); const to = ids.indexOf(targetId);
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    await reorderImages.mutateAsync({ propertyId: selected.property.id, imageIds: ids });
    setDraggedImageId(null);
  };
  const loadWorkbook = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    const encoded = await toBase64(file); setImportBase64(encoded);
    await previewWorkbook.mutateAsync({ dataBase64: encoded }); setPreviewOpen(true);
  };

  return <DashboardLayout menuItems={adminMenu} title="SAparts Admin">
    <div className="mx-auto max-w-[1700px] space-y-5 pb-12">
      <header className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-5 md:flex-row md:items-end">
        <div><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Operations workspace</p><h1 className="mt-2 font-serif text-4xl tracking-tight text-stone-950">Directory control room</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">Edit only source-backed facts. Drafts, Excel changes, and image updates remain reviewable before a listing is published.</p></div>
        <div className="flex items-center gap-3"><Link href="/" className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-3 py-2 text-sm font-medium"><ArrowLeft className="h-4 w-4" />Directory</Link><button onClick={() => exportWorkbook.refetch().then((result) => result.data && downloadWorkbook(result.data))} className="inline-flex items-center gap-2 rounded-md bg-stone-950 px-3 py-2 text-sm font-medium text-white"><Download className="h-4 w-4" />Export Excel</button></div>
      </header>
      <PortalNotice><strong>Publication safeguard.</strong> A listing cannot be published without an official website, factual description of at least 80 characters, a hero image, and ten total mirrored images. Pasted material is converted to a draft and never published automatically.</PortalNotice>
      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm xl:sticky xl:top-5 xl:h-[calc(100vh-7rem)] xl:overflow-y-auto">
          <div className="flex gap-2"><label className="flex flex-1 items-center gap-2 rounded-md border border-stone-300 px-3 py-2"><Search className="h-4 w-4 text-stone-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search listings" className="w-full bg-transparent text-sm outline-none" /></label><button onClick={() => listings.refetch()} className="rounded-md border border-stone-300 p-2" aria-label="Refresh listings"><RefreshCw className="h-4 w-4" /></button></div>
          <select value={cityId ?? ""} onChange={(e) => setCityId(e.target.value ? Number(e.target.value) : undefined)} className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"><option value="">All cities</option>{cities.data?.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}</select>
          <div className="mt-3 rounded-lg border border-dashed border-stone-300 bg-stone-50 p-3"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">New draft listing</p><input value={newListingName} onChange={(event) => setNewListingName(event.target.value)} className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm" placeholder="Property name" /><button disabled={!cityId || newListingName.trim().length < 2 || createProperty.isPending} onClick={() => cityId && createProperty.mutate({ cityId, name: newListingName.trim() })} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md border border-stone-950 bg-stone-950 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"><Plus className="h-3.5 w-3.5" />{createProperty.isPending ? "Creating…" : cityId ? "Create draft" : "Select a city first"}</button>{createProperty.error && <p className="mt-2 text-xs text-red-700">{createProperty.error.message}</p>}</div>
          <div className="mt-3 space-y-1">{listings.isLoading ? <div className="grid place-items-center py-12"><Loader2 className="h-5 w-5 animate-spin" /></div> : listings.data?.map(({ property, city, imageCount }) => <button key={property.id} onClick={() => setSelectedId(property.id)} className={`w-full rounded-lg px-3 py-3 text-left transition ${selectedId === property.id ? "bg-stone-950 text-white" : "hover:bg-stone-100"}`}><div className="flex items-start justify-between gap-2"><span className="text-sm font-semibold leading-5">{property.name}</span><span className={`rounded px-1.5 py-0.5 text-[10px] ${property.published ? (selectedId === property.id ? "bg-emerald-800" : "bg-emerald-100 text-emerald-800") : (selectedId === property.id ? "bg-stone-700" : "bg-stone-200 text-stone-600")}`}>{property.published ? "Live" : "Draft"}</span></div><p className={`mt-1 text-xs ${selectedId === property.id ? "text-stone-300" : "text-stone-500"}`}>{city.name} · {Number(imageCount)} images</p></button>)}</div>
        </aside>
        <main className="min-w-0">{detail.isLoading ? <div className="grid min-h-[50vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div> : !selected ? <div className="rounded-xl border border-dashed border-stone-300 p-12 text-center text-stone-500">Select a listing to start editing.</div> : <div className="space-y-5">
          <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">{selected.city.name} · {selected.property.slug}</p><h2 className="mt-1 font-serif text-3xl">{selected.property.name}</h2></div><button onClick={save} disabled={updateProperty.isPending} className="inline-flex items-center gap-2 rounded-md bg-stone-950 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"><Save className="h-4 w-4" />{updateProperty.isPending ? "Saving…" : "Save factual changes"}</button></div>
            {updateProperty.error && <p className="mt-3 rounded bg-red-50 p-3 text-sm text-red-700">{updateProperty.error.message}</p>}
            <div className="mt-5 grid gap-4 md:grid-cols-2"><Field label="Listing name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field><Field label="Brand / operator"><input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></Field><Field label="Category"><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as PropertyForm["category"] })}>{["Serviced Apartment", "Aparthotel", "Residence", "Penthouse"].map((category) => <option key={category}>{category}</option>)}</select></Field><Field label="District / neighbourhood"><input value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} /></Field><Field label="Official website"><input type="url" value={form.officialUrl} onChange={(e) => setForm({ ...form, officialUrl: e.target.value })} placeholder="https://" /></Field><Field label="Virtual tour"><input type="url" value={form.virtualTourUrl} onChange={(e) => setForm({ ...form, virtualTourUrl: e.target.value })} placeholder="https://" /></Field><Field label="Amenities"><input value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} placeholder="Gym, pool, laundry" /></Field><Field label="Residence types"><input value={form.unitTypes} onChange={(e) => setForm({ ...form, unitTypes: e.target.value })} placeholder="Studio, 1-bedroom" /></Field><Field label="Minimum stay nights"><input type="number" min="1" value={form.minStayNights} onChange={(e) => setForm({ ...form, minStayNights: e.target.value })} /></Field><Field label="Address"><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field></div>
            <Field label="Factual description" extra="Do not paste marketing claims unless explicitly supported by a source."><textarea rows={8} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <div className="mt-4 flex flex-wrap gap-5"><Toggle label="Published" checked={form.published} onChange={(checked) => setForm({ ...form, published: checked })} /><Toggle label="Featured" checked={form.featured} onChange={(checked) => setForm({ ...form, featured: checked })} /></div>
          </section>
          <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-serif text-2xl">Property images</h3><p className="mt-1 text-sm text-stone-600">Drag images into the upload area; drag cards to reorder. The selected hero is used across the directory.</p></div><button onClick={() => imageInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-3 py-2 text-sm font-medium"><ImagePlus className="h-4 w-4" />Add images</button><input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handleImages(e.target.files)} /></div>
            <div onDrop={onImageDrop} onDragOver={(event) => { event.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} className={`mt-4 rounded-xl border-2 border-dashed p-4 transition ${dragOver ? "border-stone-900 bg-stone-100" : "border-stone-200 bg-stone-50"}`}>{uploadImage.isPending ? <div className="flex items-center gap-2 py-6 text-sm text-stone-600"><Loader2 className="h-4 w-4 animate-spin" />Uploading and mirroring image…</div> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{selected.images.map((image, index) => <article key={image.id} draggable onDragStart={() => setDraggedImageId(image.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => reorder(image.id)} className="group relative overflow-hidden rounded-lg border border-stone-200 bg-white"><img src={image.url} alt={image.alt || form.name} className="aspect-[4/3] w-full object-cover" /><div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-3 text-xs text-white"><span>{index === 0 || selected.property.heroImageUrl === image.url ? "Hero image" : `Image ${index + 1}`}</span><div className="flex gap-2"><button onClick={() => reorderImages.mutate({ propertyId: selected.property.id, imageIds: selected.images.map((item) => item.id), heroImageId: image.id })} className="rounded bg-white/20 px-2 py-1">Set hero</button><button onClick={() => removeImage.mutate({ propertyId: selected.property.id, imageId: image.id })} className="rounded bg-white/20 p-1" aria-label="Remove image"><X className="h-3.5 w-3.5" /></button></div></div></article>)}</div>}</div>
          </section>
          <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"><div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Knowledge capture</p><h3 className="mt-1 font-serif text-2xl">Paste verified source material</h3><p className="mt-1 text-sm text-stone-600">The extractor only proposes facts supported by your material. Review evidence and approve the draft to apply it.</p></div><div className="mt-4 grid gap-3 md:grid-cols-2"><Field label="Source URL"><input type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://official-site.example" /></Field><Field label="Source title"><input value={sourceTitle} onChange={(e) => setSourceTitle(e.target.value)} placeholder="e.g. official residence page" /></Field></div><textarea className="mt-3 min-h-48 w-full rounded-md border border-stone-300 bg-white p-3 text-sm leading-6 outline-none focus:border-stone-700" value={sourceText} onChange={(e) => setSourceText(e.target.value)} placeholder="Paste official page text, brochure extracts, operator notes, or a verified email here…" /><button disabled={sourceText.trim().length < 80 || extractSource.isPending} onClick={() => extractSource.mutate({ propertyId: selected.property.id, sourceText, sourceUrl: sourceUrl || undefined, sourceTitle: sourceTitle || undefined }, { onSuccess: () => { setSourceText(""); setSourceUrl(""); setSourceTitle(""); }})} className="mt-3 inline-flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-semibold text-stone-950 disabled:opacity-50"><Sparkles className="h-4 w-4" />{extractSource.isPending ? "Extracting factual draft…" : "Create factual draft"}</button>{extractSource.error && <p className="mt-3 text-sm text-red-700">{extractSource.error.message}</p>}
            {!!selected.drafts.length && <div className="mt-5 space-y-3">{selected.drafts.map((draft) => { const source = selected.sources.find((item) => item.id === draft.sourceId); return <div key={draft.id} className="rounded-lg border border-stone-200 bg-stone-50 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-semibold">Draft #{draft.id}</span><span className="rounded bg-white px-2 py-1 text-xs capitalize">{draft.status}</span></div>{source && <div className="mt-3 rounded border border-stone-200 bg-white p-3 text-xs text-stone-700"><p className="font-semibold">Source evidence</p>{source.sourceUrl ? <a href={source.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 block break-all text-stone-900 underline underline-offset-2">{source.sourceTitle || source.sourceUrl}</a> : <p className="mt-1 text-stone-500">Pasted source material</p>}<p className="mt-2 line-clamp-3 whitespace-pre-wrap leading-5 text-stone-600">{source.sourceText}</p></div>}<pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded bg-white p-3 text-xs leading-5 text-stone-700">{JSON.stringify(draft.proposedFields, null, 2)}</pre><details className="mt-3 rounded border border-stone-200 bg-white p-3 text-xs text-stone-700"><summary className="cursor-pointer font-semibold">Field-level evidence</summary><pre className="mt-2 max-h-36 overflow-auto whitespace-pre-wrap leading-5">{JSON.stringify(draft.evidence, null, 2)}</pre></details>{draft.status === "draft" && <div className="mt-3 flex gap-2"><button onClick={() => approveDraft.mutate({ draftId: draft.id })} className="inline-flex items-center gap-1 rounded bg-stone-950 px-3 py-2 text-xs font-semibold text-white"><Check className="h-3.5 w-3.5" />Approve and apply</button><button onClick={() => rejectDraft.mutate({ draftId: draft.id })} className="rounded border border-stone-300 px-3 py-2 text-xs font-semibold">Reject</button></div>}</div>; })}</div>}
          </section>
          <section id="excel" className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Spreadsheet workflow</p><h3 className="mt-1 font-serif text-2xl">Export, enrich, validate, approve</h3><p className="mt-1 max-w-2xl text-sm leading-6 text-stone-600">Download the current database, enrich it offline, then drop the workbook here. The portal previews every change and reports invalid rows before any record updates.</p></div><div className="flex flex-wrap gap-2"><button onClick={() => exportWorkbook.refetch().then((result) => result.data && downloadWorkbook(result.data))} className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-3 py-2 text-sm font-medium"><Download className="h-4 w-4" />Export workbook</button><button onClick={() => workbookInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-md bg-stone-950 px-3 py-2 text-sm font-medium text-white"><UploadCloud className="h-4 w-4" />Import workbook</button></div><input ref={workbookInputRef} type="file" accept=".xlsx" className="hidden" onChange={loadWorkbook} /></div>
            {previewOpen && <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-4"><div className="flex items-center justify-between"><div><h4 className="font-semibold">Import preview</h4><p className="text-sm text-stone-600">No data has been changed yet.</p></div><button onClick={() => { setPreviewOpen(false); setImportBase64(null); }} className="rounded p-2 hover:bg-stone-200"><X className="h-4 w-4" /></button></div>{previewWorkbook.isPending ? <div className="mt-4 flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" />Validating workbook…</div> : <><div className="mt-4 grid gap-3 sm:grid-cols-3"><Metric label="Rows read" value={previewWorkbook.data?.length ?? 0} /><Metric label="Ready to apply" value={previewWorkbook.data?.filter((row) => !row.errors.length && Object.keys(row.changes ?? {}).length).length ?? 0} /><Metric label="Blocked rows" value={previewWorkbook.data?.filter((row) => row.errors.length).length ?? 0} /></div><div className="mt-4 max-h-64 overflow-auto rounded border border-stone-200 bg-white">{previewWorkbook.data?.map((row) => <div key={row.row} className="border-b border-stone-100 p-3 text-xs last:border-0"><span className="font-semibold">Row {row.row} · {row.name || "Unmatched listing"}</span><p className={row.errors.length ? "mt-1 text-red-700" : "mt-1 text-stone-600"}>{row.errors.length ? row.errors.join(" · ") : `${Object.keys(row.changes ?? {}).length} proposed field change(s)`}</p></div>)}</div><button disabled={!importBase64 || Boolean(previewWorkbook.data?.some((row) => row.errors.length)) || applyWorkbook.isPending} onClick={() => importBase64 && applyWorkbook.mutate({ dataBase64: importBase64 })} className="mt-4 inline-flex items-center gap-2 rounded-md bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"><Check className="h-4 w-4" />{applyWorkbook.isPending ? "Applying approved changes…" : "Apply validated workbook"}</button></>}</div>}
          </section>
        </div>}</main>
      </div>
    </div>
  </DashboardLayout>;
}

function Field({ label, extra, children }: { label: string; extra?: string; children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-stone-700"><span>{label}</span>{extra && <span className="ml-2 text-xs font-normal text-stone-500">{extra}</span>}<div className="mt-1 [&_input]:w-full [&_input]:rounded-md [&_input]:border [&_input]:border-stone-300 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm [&_input]:outline-none [&_input]:focus:border-stone-700 [&_select]:w-full [&_select]:rounded-md [&_select]:border [&_select]:border-stone-300 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-sm [&_textarea]:w-full [&_textarea]:rounded-md [&_textarea]:border [&_textarea]:border-stone-300 [&_textarea]:bg-white [&_textarea]:p-3 [&_textarea]:text-sm [&_textarea]:outline-none [&_textarea]:focus:border-stone-700">{children}</div></label>;
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <label className="flex cursor-pointer items-center gap-3 text-sm font-medium"><button type="button" onClick={() => onChange(!checked)} className={`h-6 w-11 rounded-full p-1 transition ${checked ? "bg-emerald-600" : "bg-stone-300"}`}><span className={`block h-4 w-4 rounded-full bg-white transition ${checked ? "translate-x-5" : "translate-x-0"}`} /></button>{label}</label>; }
function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-lg border border-stone-200 bg-white p-3"><p className="text-xs text-stone-500">{label}</p><p className="mt-1 font-serif text-2xl">{value}</p></div>; }
