import { useState, useMemo, useRef } from "react";
import { Minus, Plus, Search, Package, AlertTriangle, ChevronDown, ChevronUp, X, Camera, Truck, Hash } from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  reorderThreshold: number;
  supplier?: string | null;
  itemNumber?: string | null;
  photo?: string | null;
}

export interface CustomInventoryItem {
  name: string;
  category: string;
  quantity: number;
  reorderThreshold: number;
  supplier: string;
  itemNumber: string;
  photo: string | null;
}

interface DigitalInventoryProps {
  inventory: InventoryItem[];
  onUseItem: (itemId: string) => void;
  onRestockItem: (itemId: string) => void;
  onAddCustomItem: (item: CustomInventoryItem) => void;
  darkMode: boolean;
}

const BRAND_LIGHT = {
  primary: "#897BB9",
  ink: "#1D1D1F",
  paper: "#F5F5F7",
  surface: "rgba(255,255,255,0.72)",
  surfaceSolid: "#FFFFFF",
  muted: "#86868B",
  border: "rgba(0,0,0,0.08)",
  danger: "#FF3B30",
  dangerBg: "rgba(255,59,48,0.08)",
  success: "#34C759",
  successBg: "rgba(52,199,89,0.08)",
  warning: "#FF9500",
  warningBg: "rgba(255,149,0,0.1)",
  glass: "rgba(255,255,255,0.6)",
  glassBorder: "rgba(255,255,255,0.3)",
  cardShadow: "0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
  isDark: false,
};

const BRAND_DARK = {
  primary: "#A99BD4",
  ink: "#F5F5F7",
  paper: "#000000",
  surface: "rgba(28,28,30,0.72)",
  surfaceSolid: "#1C1C1E",
  muted: "#98989D",
  border: "rgba(255,255,255,0.08)",
  danger: "#FF453A",
  dangerBg: "rgba(255,69,58,0.12)",
  success: "#30D158",
  successBg: "rgba(48,209,88,0.12)",
  warning: "#FF9F0A",
  warningBg: "rgba(255,159,10,0.12)",
  glass: "rgba(28,28,30,0.6)",
  glassBorder: "rgba(255,255,255,0.06)",
  cardShadow: "0 2px 8px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.3)",
  isDark: true,
};

function getStockStatus(item: InventoryItem) {
  if (item.quantity === 0) return "out";
  if (item.quantity <= item.reorderThreshold) return "low";
  if (item.quantity <= item.reorderThreshold * 2) return "medium";
  return "good";
}

export default function DigitalInventory({ inventory, onUseItem, onRestockItem, onAddCustomItem, darkMode }: DigitalInventoryProps) {
  const BRAND = darkMode ? BRAND_DARK : BRAND_LIGHT;
  const [search, setSearch] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "low">("all");
  const [showAddCustom, setShowAddCustom] = useState(false);

  const existingCategories = useMemo(() => {
    const set = new Set<string>();
    for (const it of inventory) if (it.category) set.add(it.category);
    return Array.from(set).sort();
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    let items = inventory;
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((it) => it.name.toLowerCase().includes(q) || it.category.toLowerCase().includes(q));
    }
    if (filterMode === "low") {
      items = items.filter((it) => it.quantity <= it.reorderThreshold);
    }
    return items;
  }, [inventory, search, filterMode]);

  const filteredCategories = useMemo(() => {
    const cats = new Map<string, InventoryItem[]>();
    for (const item of filteredInventory) {
      const cat = item.category || "Uncategorized";
      if (!cats.has(cat)) cats.set(cat, []);
      cats.get(cat)!.push(item);
    }
    return cats;
  }, [filteredInventory]);

  const stats = useMemo(() => {
    const total = inventory.length;
    const lowStock = inventory.filter((it) => it.quantity <= it.reorderThreshold && it.quantity > 0).length;
    const outOfStock = inventory.filter((it) => it.quantity === 0).length;
    return { total, lowStock, outOfStock };
  }, [inventory]);

  const statusColor = (status: string) => {
    switch (status) {
      case "out": return BRAND.danger;
      case "low": return BRAND.warning;
      case "medium": return BRAND.primary;
      default: return BRAND.success;
    }
  };

  const statusBg = (status: string) => {
    switch (status) {
      case "out": return BRAND.dangerBg;
      case "low": return BRAND.warningBg;
      case "medium": return `${BRAND.primary}12`;
      default: return BRAND.successBg;
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ fontFamily: "'Manrope', -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.isDark ? '#BDB1DE' : '#6B5E9E'})`, boxShadow: `0 4px 12px ${BRAND.primary}30` }}>
            <Package size={20} color="#fff" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold tracking-tight" style={{ color: BRAND.ink, letterSpacing: "-0.02em" }}>Digital Inventory</h2>
            <p className="text-[11px]" style={{ color: BRAND.muted }}>Live stock tracking</p>
          </div>
          <button
            onClick={() => setShowAddCustom(true)}
            className="h-9 px-3.5 rounded-full flex items-center gap-1.5 text-sm font-semibold transition-apple hover-scale active:scale-95"
            style={{ background: BRAND.primary, color: "#fff", boxShadow: `0 4px 12px ${BRAND.primary}30` }}
            aria-label="Add custom item"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span className="hidden sm:inline">Add Item</span>
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-xl p-3 text-center" style={{ background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${BRAND.glassBorder}`, boxShadow: BRAND.cardShadow }}>
            <div className="text-xl font-bold tabular-nums" style={{ color: BRAND.ink }}>{stats.total}</div>
            <div className="text-[9px] uppercase tracking-[0.15em] font-semibold" style={{ color: BRAND.muted }}>Total Items</div>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: BRAND.warningBg, border: `1px solid ${BRAND.warning}20` }}>
            <div className="text-xl font-bold tabular-nums" style={{ color: BRAND.warning }}>{stats.lowStock}</div>
            <div className="text-[9px] uppercase tracking-[0.15em] font-semibold" style={{ color: BRAND.warning }}>Low Stock</div>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: BRAND.dangerBg, border: `1px solid ${BRAND.danger}20` }}>
            <div className="text-xl font-bold tabular-nums" style={{ color: BRAND.danger }}>{stats.outOfStock}</div>
            <div className="text-[9px] uppercase tracking-[0.15em] font-semibold" style={{ color: BRAND.danger }}>Out of Stock</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: BRAND.muted }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inventory…"
            className="w-full h-10 pl-9 pr-4 rounded-xl text-sm outline-none transition-apple"
            style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }}
          />
        </div>

        {/* Filter toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterMode("all")}
            className="flex-1 h-8 rounded-lg text-xs font-semibold transition-apple"
            style={{
              background: filterMode === "all" ? BRAND.primary : "transparent",
              color: filterMode === "all" ? "#fff" : BRAND.muted,
              border: `1px solid ${filterMode === "all" ? BRAND.primary : BRAND.border}`,
            }}
          >
            All Items
          </button>
          <button
            onClick={() => setFilterMode("low")}
            className="flex-1 h-8 rounded-lg text-xs font-semibold transition-apple flex items-center justify-center gap-1"
            style={{
              background: filterMode === "low" ? BRAND.warning : "transparent",
              color: filterMode === "low" ? "#fff" : BRAND.muted,
              border: `1px solid ${filterMode === "low" ? BRAND.warning : BRAND.border}`,
            }}
          >
            <AlertTriangle size={11} /> Low Stock
          </button>
        </div>
      </div>

      {/* Item list */}
      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-3" style={{ scrollbarWidth: "none" }}>
        {Array.from(filteredCategories.entries()).map(([cat, items]) => {
          const isExpanded = expandedCategory === cat || search.trim().length > 0 || filterMode === "low";
          const lowCount = items.filter((it) => it.quantity <= it.reorderThreshold).length;

          return (
            <div key={cat} className="rounded-2xl overflow-hidden" style={{ background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${BRAND.glassBorder}`, boxShadow: BRAND.cardShadow }}>
              <button
                onClick={() => setExpandedCategory(isExpanded && !search.trim() && filterMode !== "low" ? null : cat)}
                className="w-full px-4 py-3 flex items-center justify-between transition-apple"
                style={{ color: BRAND.ink }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{cat}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold tabular-nums" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", color: BRAND.muted }}>{items.length}</span>
                  {lowCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold" style={{ background: BRAND.warningBg, color: BRAND.warning }}>{lowCount} low</span>
                  )}
                </div>
                {isExpanded ? <ChevronUp size={16} style={{ color: BRAND.muted }} /> : <ChevronDown size={16} style={{ color: BRAND.muted }} />}
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-1.5">
                  {items.map((item) => {
                    const status = getStockStatus(item);
                    return (
                      <div
                        key={item.id}
                        className="rounded-xl p-3 flex items-center gap-3 transition-apple"
                        style={{
                          background: BRAND.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
                          border: `1px solid ${status === "out" || status === "low" ? statusColor(status) + "30" : BRAND.border}`,
                        }}
                      >
                        {/* Stock indicator */}
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: statusColor(status), boxShadow: `0 0 6px ${statusColor(status)}40` }} />

                        {/* Photo thumbnail */}
                        {item.photo && (
                          <img
                            src={item.photo}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            style={{ border: `1px solid ${BRAND.border}` }}
                          />
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold leading-snug truncate" style={{ color: BRAND.ink }}>{item.name}</div>
                          {(item.supplier || item.itemNumber) && (
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {item.supplier && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-semibold" style={{ color: BRAND.muted }}>
                                  <Truck size={9} strokeWidth={2.5} /> {item.supplier}
                                </span>
                              )}
                              {item.itemNumber && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold tabular-nums" style={{ color: BRAND.muted }}>
                                  <Hash size={9} strokeWidth={2.5} />{item.itemNumber}
                                </span>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-md" style={{ background: statusBg(status), color: statusColor(status) }}>
                              {item.quantity} in stock
                            </span>
                            {status === "low" && <span className="text-[9px] font-semibold" style={{ color: BRAND.warning }}>Below threshold</span>}
                            {status === "out" && <span className="text-[9px] font-semibold" style={{ color: BRAND.danger }}>Reorder needed</span>}
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => onUseItem(item.id)}
                            disabled={item.quantity === 0}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-apple active:scale-90 disabled:opacity-30"
                            style={{ background: BRAND.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", color: BRAND.ink }}
                            aria-label="Use item"
                          >
                            <Minus size={14} strokeWidth={2.5} />
                          </button>
                          <div className="w-8 text-center text-sm font-bold tabular-nums" style={{ color: BRAND.ink }}>
                            {item.quantity}
                          </div>
                          <button
                            onClick={() => onRestockItem(item.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-apple active:scale-90"
                            style={{ background: `${BRAND.primary}15`, color: BRAND.primary }}
                            aria-label="Restock item"
                          >
                            <Plus size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filteredInventory.length === 0 && (
          <div className="text-center py-12">
            <Package size={32} style={{ color: BRAND.muted }} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm font-semibold" style={{ color: BRAND.muted }}>
              {inventory.length === 0
                ? "No items in inventory yet"
                : filterMode === "low"
                  ? "No low-stock items"
                  : "No items match your search"}
            </p>
            {inventory.length === 0 && (
              <>
                <p className="text-xs mt-1" style={{ color: BRAND.muted }}>
                  Items will appear here as orders are placed
                </p>
                <button
                  onClick={() => setShowAddCustom(true)}
                  className="mt-4 h-10 px-5 rounded-2xl text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-apple hover-scale active:scale-95"
                  style={{ background: BRAND.primary, color: "#fff", boxShadow: `0 4px 12px ${BRAND.primary}30` }}
                >
                  <Plus size={15} strokeWidth={2.5} /> Add Custom Item
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {showAddCustom && (
        <AddCustomItemModal
          BRAND={BRAND}
          existingCategories={existingCategories}
          onClose={() => setShowAddCustom(false)}
          onSave={(item) => {
            onAddCustomItem(item);
            setShowAddCustom(false);
          }}
        />
      )}
    </div>
  );
}

interface AddCustomItemModalProps {
  BRAND: typeof BRAND_LIGHT;
  existingCategories: string[];
  onClose: () => void;
  onSave: (item: CustomInventoryItem) => void;
}

function AddCustomItemModal({ BRAND, existingCategories, onClose, onSave }: AddCustomItemModalProps) {
  const [name, setName] = useState("");
  const [supplier, setSupplier] = useState("");
  const [itemNumber, setItemNumber] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reorderThreshold, setReorderThreshold] = useState(1);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image (JPG, PNG, etc.)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 800;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.drawImage(img, 0, 0, w, h);
        setPhoto(canvas.toDataURL("image/jpeg", 0.78));
        setPhotoName(file.name);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!name.trim()) return setError("Item name is required");
    if (!supplier.trim()) return setError("Supplier is required");
    if (!itemNumber.trim()) return setError("Item number is required");
    if (!photo) return setError("A photo of the item is required");
    onSave({
      name: name.trim(),
      category: category.trim() || "Custom",
      quantity: Math.max(0, quantity),
      reorderThreshold: Math.max(1, reorderThreshold),
      supplier: supplier.trim(),
      itemNumber: itemNumber.trim(),
      photo,
    });
  };

  const inputStyle = {
    background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    border: `1px solid ${BRAND.border}`,
    color: BRAND.ink,
  } as const;

  const labelCls = "text-[10px] uppercase tracking-[0.15em] font-bold mb-1.5 block";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
        style={{ background: BRAND.surfaceSolid, boxShadow: BRAND.cardShadow, scrollbarWidth: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-5 pt-5 pb-3 flex items-center justify-between" style={{ background: BRAND.surfaceSolid, borderBottom: `1px solid ${BRAND.border}` }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${BRAND.primary}15` }}>
              <Plus size={18} style={{ color: BRAND.primary }} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight" style={{ color: BRAND.ink }}>Add Custom Item</h3>
              <p className="text-[11px]" style={{ color: BRAND.muted }}>Not in the catalog</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center transition-apple" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", color: BRAND.muted }} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Photo uploader */}
          <div>
            <label className={labelCls} style={{ color: BRAND.muted }}>Item Photo *</label>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handlePhoto(e.target.files?.[0])} />
            {photo ? (
              <div className="relative rounded-2xl overflow-hidden" style={{ border: `1px solid ${BRAND.border}` }}>
                <img src={photo} alt="Item preview" className="w-full h-44 object-cover" />
                <div className="absolute bottom-0 inset-x-0 px-3 py-2 flex items-center justify-between" style={{ background: "rgba(0,0,0,0.45)" }}>
                  <span className="text-[11px] font-medium text-white truncate">{photoName}</span>
                  <button onClick={() => { setPhoto(null); setPhotoName(""); }} className="text-[11px] font-bold text-white/90 hover:text-white">Remove</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 rounded-2xl flex flex-col items-center justify-center gap-2 transition-apple"
                style={{ border: `1.5px dashed ${BRAND.primary}50`, background: `${BRAND.primary}08`, color: BRAND.primary }}
              >
                <Camera size={24} strokeWidth={2} />
                <span className="text-xs font-semibold">Take or upload a photo</span>
              </button>
            )}
          </div>

          {/* Name */}
          <div>
            <label className={labelCls} style={{ color: BRAND.muted }}>Item Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Disposable Prophy Angles" className="w-full h-11 px-3.5 rounded-xl text-sm outline-none" style={inputStyle} />
          </div>

          {/* Supplier + Item number */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} style={{ color: BRAND.muted }}>Supplier *</label>
              <input type="text" value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="e.g. Patterson" className="w-full h-11 px-3.5 rounded-xl text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <label className={labelCls} style={{ color: BRAND.muted }}>Item Number *</label>
              <input type="text" value={itemNumber} onChange={(e) => setItemNumber(e.target.value)} placeholder="e.g. 70838649" className="w-full h-11 px-3.5 rounded-xl text-sm outline-none tabular-nums" style={inputStyle} />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className={labelCls} style={{ color: BRAND.muted }}>Category</label>
            <input type="text" list="custom-item-categories" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Custom" className="w-full h-11 px-3.5 rounded-xl text-sm outline-none" style={inputStyle} />
            <datalist id="custom-item-categories">
              {existingCategories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          {/* Quantity + Threshold */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} style={{ color: BRAND.muted }}>Quantity in Stock</label>
              <div className="flex items-center gap-1.5 h-11 px-2 rounded-xl" style={inputStyle}>
                <button onClick={() => setQuantity((q) => Math.max(0, q - 1))} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", color: BRAND.ink }} aria-label="Decrease quantity"><Minus size={14} strokeWidth={2.5} /></button>
                <div className="flex-1 text-center text-sm font-bold tabular-nums" style={{ color: BRAND.ink }}>{quantity}</div>
                <button onClick={() => setQuantity((q) => q + 1)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${BRAND.primary}15`, color: BRAND.primary }} aria-label="Increase quantity"><Plus size={14} strokeWidth={2.5} /></button>
              </div>
            </div>
            <div>
              <label className={labelCls} style={{ color: BRAND.muted }}>Reorder At</label>
              <div className="flex items-center gap-1.5 h-11 px-2 rounded-xl" style={inputStyle}>
                <button onClick={() => setReorderThreshold((q) => Math.max(1, q - 1))} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", color: BRAND.ink }} aria-label="Decrease threshold"><Minus size={14} strokeWidth={2.5} /></button>
                <div className="flex-1 text-center text-sm font-bold tabular-nums" style={{ color: BRAND.ink }}>{reorderThreshold}</div>
                <button onClick={() => setReorderThreshold((q) => q + 1)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${BRAND.primary}15`, color: BRAND.primary }} aria-label="Increase threshold"><Plus size={14} strokeWidth={2.5} /></button>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold" style={{ background: BRAND.dangerBg, color: BRAND.danger }}>
              <AlertTriangle size={14} strokeWidth={2.5} /> {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-5 py-4 flex gap-3" style={{ background: BRAND.surfaceSolid, borderTop: `1px solid ${BRAND.border}` }}>
          <button onClick={onClose} className="flex-1 h-12 rounded-2xl text-sm font-semibold transition-apple" style={{ border: `1px solid ${BRAND.border}`, color: BRAND.muted }}>Cancel</button>
          <button onClick={handleSubmit} className="flex-[2] h-12 rounded-2xl text-sm font-bold transition-apple hover-scale active:scale-95 flex items-center justify-center gap-1.5" style={{ background: BRAND.primary, color: "#fff", boxShadow: `0 4px 12px ${BRAND.primary}30` }}>
            <Plus size={16} strokeWidth={2.5} /> Add to Inventory
          </button>
        </div>
      </div>
    </div>
  );
}
