import { useRef, useState } from "react";
import { Camera, ImageIcon, Plus, Trash2, X, AlertCircle } from "lucide-react";
import type { BrandPalette } from "@/lib/brand";
import { compressImage } from "@/lib/photo";
import { GlassCard } from "@/components/ui/primitives";

export interface SpecialRequestDraft {
  id: number;
  text: string;
  photo: string | null;
  photoName: string;
}

export function newSpecialRequest(): SpecialRequestDraft {
  return { id: Date.now() + Math.floor(Math.random() * 1000), text: "", photo: null, photoName: "" };
}

export function SpecialRequestsEditor({
  BRAND,
  requests,
  onChange,
}: {
  BRAND: BrandPalette;
  requests: SpecialRequestDraft[];
  onChange: (next: SpecialRequestDraft[]) => void;
}) {
  const [error, setError] = useState("");

  const update = (id: number, patch: Partial<SpecialRequestDraft>) =>
    onChange(requests.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const handlePhoto = async (id: number, file: File | undefined) => {
    if (!file) return;
    try {
      const dataUrl = await compressImage(file);
      update(id, { photo: dataUrl, photoName: file.name });
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not process image");
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm" style={{ color: BRAND.muted }}>
        Anything not in the catalog? Add it here. A <strong style={{ color: BRAND.ink }}>product photo is required</strong> so
        the order can be matched exactly.
      </p>
      {error && (
        <div className="px-3 py-2 rounded-xl text-xs flex items-center gap-2" style={{ background: BRAND.dangerBg, color: BRAND.danger }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {requests.map((r, idx) => (
        <SpecialRequestCard
          key={r.id}
          BRAND={BRAND}
          request={r}
          index={idx}
          canDelete={requests.length > 1}
          onText={(text) => update(r.id, { text })}
          onPhoto={(file) => handlePhoto(r.id, file)}
          onPhotoRemove={() => update(r.id, { photo: null, photoName: "" })}
          onDelete={() => onChange(requests.filter((x) => x.id !== r.id))}
        />
      ))}

      <button
        onClick={() => onChange([...requests, newSpecialRequest()])}
        className="w-full h-12 rounded-2xl border-2 border-dashed text-sm font-semibold flex items-center justify-center gap-2 transition-apple hover-scale"
        style={{ borderColor: BRAND.border, color: BRAND.muted }}
      >
        <Plus size={16} strokeWidth={2.5} /> Add another item
      </button>
    </div>
  );
}

function SpecialRequestCard({
  BRAND,
  request,
  index,
  canDelete,
  onText,
  onPhoto,
  onPhotoRemove,
  onDelete,
}: {
  BRAND: BrandPalette;
  request: SpecialRequestDraft;
  index: number;
  canDelete: boolean;
  onText: (t: string) => void;
  onPhoto: (f: File | undefined) => void;
  onPhotoRemove: () => void;
  onDelete: () => void;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <GlassCard BRAND={BRAND} className="p-3" style={{ border: `1px solid ${request.photo ? BRAND.primary : BRAND.glassBorder}` }}>
      <div className="flex items-start gap-2">
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold pt-3 pl-1" style={{ color: BRAND.muted }}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <textarea
          value={request.text}
          onChange={(e) => onText(e.target.value)}
          placeholder={index === 0 ? "e.g. Sterilization pouches 3.5×9, 200/box" : "Another item…"}
          rows={2}
          className="flex-1 bg-transparent border-0 resize-none text-sm leading-relaxed focus:outline-none py-2"
          style={{ color: BRAND.ink }}
        />
        {canDelete && (
          <button onClick={onDelete} className="w-9 h-9 flex items-center justify-center rounded-full" style={{ color: BRAND.muted }} aria-label="Remove">
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <div className="mt-2 pt-3 border-t" style={{ borderColor: BRAND.border }}>
        <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-2 flex items-center gap-1.5" style={{ color: request.photo ? BRAND.primary : BRAND.danger }}>
          <Camera size={11} /> Product photo {request.photo ? "✓" : "(required)"}
        </div>
        {request.photo ? (
          <div className="flex items-start gap-3">
            <img src={request.photo} alt="product" className="w-24 h-24 rounded-xl object-cover" style={{ border: `2px solid ${BRAND.primary}` }} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate" style={{ color: BRAND.ink }}>
                {request.photoName}
              </div>
              <button onClick={onPhotoRemove} className="mt-2 text-[11px] font-semibold flex items-center gap-1" style={{ color: BRAND.danger }}>
                <X size={11} /> Remove photo
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} />
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} />
            <button onClick={() => cameraRef.current?.click()} className="h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1" style={{ borderColor: BRAND.danger, background: BRAND.dangerBg, color: BRAND.danger }}>
              <Camera size={20} /> <span className="text-[11px] font-bold uppercase tracking-wide">Take photo</span>
            </button>
            <button onClick={() => fileRef.current?.click()} className="h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1" style={{ borderColor: BRAND.border, color: BRAND.muted }}>
              <ImageIcon size={20} /> <span className="text-[11px] font-bold uppercase tracking-wide">Choose file</span>
            </button>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
