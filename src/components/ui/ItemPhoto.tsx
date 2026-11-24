import { useState } from "react";
import { Package } from "lucide-react";
import { itemPhotoUrl } from "@shared/pattersonPhotos";

function Inner({ src, size }: { src: string | null; size: number }) {
  const [failed, setFailed] = useState(false);
  const box = {
    width: size,
    height: size,
    borderRadius: Math.round(size * 0.2),
    flex: "none" as const,
    overflow: "hidden" as const,
  };
  if (!src || failed) {
    return (
      <span aria-hidden="true" className="flex items-center justify-center" style={{ ...box, background: "rgba(104,98,163,0.09)", color: "#8A85A3" }}>
        <Package size={Math.round(size * 0.42)} />
      </span>
    );
  }
  return (
    <span className="flex items-center justify-center" style={{ ...box, background: "#fff", border: "1px solid rgba(42,37,67,0.10)" }}>
      <img
        src={src}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    </span>
  );
}

/** Product photo for a catalog item: its own photo, else Patterson's photo for its item number, else a placeholder. */
export function ItemPhoto({ sku, photoUrl, size = 52 }: { sku: string; photoUrl?: string | null; size?: number }) {
  const src = itemPhotoUrl(sku, photoUrl, "MediumSquare");
  return <Inner key={src ?? "none"} src={src} size={size} />;
}
