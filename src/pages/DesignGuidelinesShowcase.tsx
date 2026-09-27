import { useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link2,
  List,
  ListOrdered,
  Plus,
  AtSign,
  Smile,
  Sparkles,
  Mic,
  MoreHorizontal,
  ChevronDown,
  Check,
  Loader2,
  X,
  AlertCircle,
  Info,
  CheckCircle2,
  Search,
  ExternalLink,
  SlidersHorizontal,
  Share2,
  Trash2,
  ArrowRight,
  Copy,
  Layers,
} from "lucide-react";
import "./DesignGuidelinesShowcase.css";

const paletteGroups = [
  {
    title: "Surfaces & Canvas",
    description: "Light workspace background, pure white sheets, inset wells, and hover washes.",
    swatches: [
      { name: "Canvas", hex: "#F3F4F6", role: "Page & workspace background (warm off-white)", border: true },
      { name: "Surface", hex: "#FFFFFF", role: "Primary card & editor sheet", border: true },
      { name: "Surface Muted", hex: "#F8F9FA", role: "Inset wells & table headers", border: true },
      { name: "Surface Hover", hex: "#F1F2F4", role: "Interactive hover wash", border: true },
      { name: "Surface Active", hex: "#EBECEF", role: "Pressed / tactile toggle base", border: true },
      { name: "Overlay Scrim", hex: "#0F1115", role: "Modal background (28%–45% blur)", dark: true },
    ],
  },
  {
    title: "Ink & Typography",
    description: "Refined typographic contrast hierarchy from deep obsidian ink to subtle placeholders.",
    swatches: [
      { name: "Ink Primary", hex: "#1A1C1F", role: "Primary headings & body prose", dark: true },
      { name: "Ink Secondary", hex: "#5C6068", role: "Secondary copy & toolbar idle icons", dark: true },
      { name: "Ink Tertiary", hex: "#8B909A", role: "Placeholders & metadata captions", dark: false },
      { name: "Ink Inverse", hex: "#F7F8FA", role: "Text & active icons on dark dock", border: true },
      { name: "Inverse Muted", hex: "#C4C7CE", role: "Idle icon glyphs on dark dock", border: true },
    ],
  },
  {
    title: "Dark Dock Anchor",
    description: "Floating obsidian dock tokens providing bottom contrast anchor in dual-tone architecture.",
    swatches: [
      { name: "Dock Base", hex: "#2A2D34", role: "Dock gradient top / active switch", dark: true },
      { name: "Dock Deep", hex: "#1E2025", role: "Dock gradient bottom & tooltip fill", dark: true },
      { name: "Button Well", hex: "#25282F", role: "Circular plus button recessed well", dark: true },
      { name: "Button Glow", hex: "#3A3E48", role: "Subtle highlight on elevated plus", dark: true },
    ],
  },
  {
    title: "Borders & Dividers",
    description: "Hairline micro-boundaries for crisp definition without heavy outlines.",
    swatches: [
      { name: "Hairline Border", hex: "#E5E7EB", role: "Standard 1px card & input border", border: true },
      { name: "Subtle Divider", hex: "#EEF0F3", role: "Toolbar & table row separators", border: true },
      { name: "Strong Border", hex: "#D1D5DB", role: "Emphasized & input hover borders", border: true },
    ],
  },
  {
    title: "Status & Semantic Accents",
    description: "Restrained accents for badges, chips, focus outlines, and notifications.",
    swatches: [
      { name: "Success Green", hex: "#22C55E", role: "Success badge & verified indicators", dark: true },
      { name: "Warning Amber", hex: "#F59E0B", role: "Warning tags & slow sync alerts", dark: true },
      { name: "Error Red", hex: "#EF4444", role: "Upload failure & destructive actions", dark: true },
      { name: "Focus Blue", hex: "#3B82F6", role: "Restrained focus ring & info state", dark: true },
      { name: "Neutral Mention", hex: "#ECEEF1", role: "@mention chip fill background", border: true },
      { name: "Mention Text", hex: "#2C2F36", role: "@mention label typography", dark: true },
    ],
  },
];

export function DesignGuidelinesShowcase() {
  // Component State toggles
  const [activeFormat, setActiveFormat] = useState<string>("bold");
  const [selectedFont, setSelectedFont] = useState<string>("Source Serif 4");
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [activeSegment, setActiveSegment] = useState<string>("editor");
  const [switchOn, setSwitchOn] = useState(true);
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [textInputValue, setTextInputValue] = useState("Here are the files you needed");
  const [pillInputValue, setPillInputValue] = useState("search.documents('Quarterly Plan')");

  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const fontOptions = ["Source Serif 4", "Playfair Display", "System Sans", "Monospace"];

  const handleCopyHex = (hex: string) => {
    void navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => {
      setCopiedHex(null);
    }, 1800);
  };

  return (
    <div className="design-system-showcase-root min-h-screen px-4 py-8 md:px-12 md:py-12">
      {/* Top Banner Navigation / Header */}
      <header className="mx-auto mb-12 max-w-6xl">
        <div className="flex flex-col gap-4 border-b border-[#E5E7EB] pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECEEF1] px-3 py-1 font-body text-xs font-semibold text-[#2C2F36]">
                <Sparkles className="size-3 text-[#3B82F6]" />
                Neo-Tactile Precision Design System
              </span>
              <span className="rounded-full bg-[#DCFCE7] px-2.5 py-0.5 font-body text-[11px] font-semibold text-[#15803D]">
                v1.0.0
              </span>
            </div>
            <h1 className="mt-3 font-display text-4xl text-[#1A1C1F] md:text-5xl">
              Design Guidelines Component Spec
            </h1>
            <p className="mt-2 font-body text-sm text-[#5C6068] md:text-base">
              Extracted directly from the screenshot reference. Self-contained styling showcasing every UI component described in{" "}
              <code className="rounded bg-[#ECEEF1] px-1.5 py-0.5 text-xs text-[#1A1C1F]">planning/design-guidelines.json</code>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/"
              className="btn-3d-secondary px-4 py-2 font-body text-xs font-semibold"
            >
              Back to App
            </a>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="btn-3d-obsidian px-4 py-2 font-body text-xs font-semibold"
            >
              <span>Preview Modal</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Showcase */}
      <main className="mx-auto flex max-w-6xl flex-col gap-16">
        {/* SECTION 1: HERO SCREENSHOT REFERENCE RECREATION */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-[#1A1C1F]">
              1. The Reference UI (Direct Recreation)
            </h2>
            <span className="font-body text-xs text-[#8B909A]">
              Live interactive composite
            </span>
          </div>

          {/* Floating Workspace Canvas */}
          <div className="relative overflow-hidden rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_40px_rgba(15,17,21,0.06),0_2px_8px_rgba(15,17,21,0.03)] md:p-10">
            {/* 1A. Formatting Toolbar */}
            <div className="flex flex-wrap items-center gap-2 border-b border-[#EEF0F3] pb-4">
              {/* Font Selector Dropdown Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setFontMenuOpen(!fontMenuOpen)}
                  className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3.5 py-1.5 font-body text-xs font-medium text-[#1A1C1F] shadow-sm transition hover:bg-[#F8F9FA] active:bg-[#F1F2F4]"
                >
                  <span>{selectedFont}</span>
                  <ChevronDown className="size-3.5 text-[#8B909A]" />
                </button>

                {fontMenuOpen && (
                  <div className="absolute top-full left-0 z-50 mt-2 min-w-[170px] rounded-2xl border border-[#E5E7EB] bg-white p-1.5 shadow-[0_12px_40px_rgba(15,17,21,0.12),0_2px_8px_rgba(15,17,21,0.06)]">
                    {fontOptions.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => {
                          setSelectedFont(f);
                          setFontMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-body text-xs transition ${
                          selectedFont === f
                            ? "bg-[#EBECEF] font-semibold text-[#1A1C1F]"
                            : "text-[#1A1C1F] hover:bg-[#F1F2F4]"
                        }`}
                      >
                        {f}
                        {selectedFont === f && <Check className="size-3.5 text-[#1A1C1F]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Toolbar Vertical Divider */}
              <div className="mx-1 h-5 w-[1px] bg-[#EEF0F3]" />

              {/* Formatting Actions */}
              <div className="flex items-center gap-1">
                {/* Bold - Embossed Tactile Toggle (Active as in screenshot) */}
                <button
                  type="button"
                  aria-label="Bold"
                  onClick={() => setActiveFormat(activeFormat === "bold" ? "" : "bold")}
                  className={`flex size-8 items-center justify-center rounded-[10px] font-body text-sm transition ${
                    activeFormat === "bold"
                      ? "tactile-embossed-active font-bold text-[#1A1C1F]"
                      : "text-[#5C6068] hover:bg-[#F1F2F4]"
                  }`}
                >
                  <Bold className="size-4" />
                </button>

                {/* Italic */}
                <button
                  type="button"
                  aria-label="Italic"
                  onClick={() => setActiveFormat(activeFormat === "italic" ? "" : "italic")}
                  className={`flex size-8 items-center justify-center rounded-[10px] font-body text-sm transition ${
                    activeFormat === "italic"
                      ? "tactile-embossed-active font-bold text-[#1A1C1F]"
                      : "text-[#5C6068] hover:bg-[#F1F2F4]"
                  }`}
                >
                  <Italic className="size-4" />
                </button>

                {/* Strikethrough */}
                <button
                  type="button"
                  aria-label="Strikethrough"
                  onClick={() => setActiveFormat(activeFormat === "strike" ? "" : "strike")}
                  className={`flex size-8 items-center justify-center rounded-[10px] font-body text-sm transition ${
                    activeFormat === "strike"
                      ? "tactile-embossed-active font-bold text-[#1A1C1F]"
                      : "text-[#5C6068] hover:bg-[#F1F2F4]"
                  }`}
                >
                  <Strikethrough className="size-4" />
                </button>

                {/* Underline */}
                <button
                  type="button"
                  aria-label="Underline"
                  onClick={() => setActiveFormat(activeFormat === "underline" ? "" : "underline")}
                  className={`flex size-8 items-center justify-center rounded-[10px] font-body text-sm transition ${
                    activeFormat === "underline"
                      ? "tactile-embossed-active font-bold text-[#1A1C1F]"
                      : "text-[#5C6068] hover:bg-[#F1F2F4]"
                  }`}
                >
                  <Underline className="size-4" />
                </button>

                {/* Link */}
                <button
                  type="button"
                  aria-label="Link"
                  className="flex size-8 items-center justify-center rounded-[10px] font-body text-sm text-[#5C6068] transition hover:bg-[#F1F2F4]"
                >
                  <Link2 className="size-4" />
                </button>
              </div>

              {/* Toolbar Vertical Divider */}
              <div className="mx-1 h-5 w-[1px] bg-[#EEF0F3]" />

              {/* List Actions */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Bulleted List"
                  className="flex size-8 items-center justify-center rounded-[10px] font-body text-sm text-[#5C6068] transition hover:bg-[#F1F2F4]"
                >
                  <List className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Numbered List"
                  className="flex size-8 items-center justify-center rounded-[10px] font-body text-sm text-[#5C6068] transition hover:bg-[#F1F2F4]"
                >
                  <ListOrdered className="size-4" />
                </button>
              </div>
            </div>

            {/* 1B. Editor Body with Inline @mention and Emoji */}
            <div className="py-8">
              <div className="flex flex-wrap items-center gap-2 font-serif text-xl font-normal text-[#1A1C1F] md:text-2xl">
                <span>Here are the files you needed</span>
                {/* Inline @mention chip */}
                <span className="inline-flex items-center rounded-lg bg-[#ECEEF1] px-2.5 py-0.5 font-sans text-lg font-medium text-[#2C2F36] transition hover:bg-[#E2E5EA]">
                  @masum
                </span>
                <span className="inline-flex items-center text-xl">📁 🏀</span>
              </div>
            </div>

            {/* 1C. Media / Attachment Cards with Corner Badges */}
            <div className="flex flex-wrap items-center gap-4 pb-12">
              {/* Card 1: Completed / Success Status */}
              <div className="relative size-[76px] overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-[#F8F9FA] shadow-[0_1px_3px_rgba(15,17,21,0.06)] transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex h-full w-full flex-col justify-between p-2">
                  <div className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-[#D1D5DB]" />
                    <span className="size-2 rounded-full bg-[#D1D5DB]" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-1.5 w-8 rounded-full bg-[#D1D5DB]" />
                    <div className="h-1.5 w-10 rounded-full bg-[#E5E7EB]" />
                  </div>
                </div>
                {/* Corner Status Badge: Success */}
                <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full border border-white bg-[#22C55E] shadow-sm">
                  <Check className="size-2.5 stroke-[3] text-white" />
                </span>
              </div>

              {/* Card 2: Loading / Syncing Status */}
              <div className="relative size-[76px] overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-[#F8F9FA] shadow-[0_1px_3px_rgba(15,17,21,0.06)] transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex h-full w-full flex-col justify-between p-2">
                  <div className="h-2 w-7 rounded-sm bg-[#E5E7EB]" />
                  <div className="space-y-1">
                    <div className="h-1.5 w-10 rounded-full bg-[#D1D5DB]" />
                    <div className="h-1.5 w-8 rounded-full bg-[#E5E7EB]" />
                  </div>
                </div>
                {/* Corner Status Badge: Loading Spinner */}
                <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full border border-white bg-white shadow-sm">
                  <Loader2 className="ds-spinner size-2.5 text-[#6B7280]" />
                </span>
              </div>

              {/* Card 3: In Progress Status */}
              <div className="relative size-[76px] overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-[#F8F9FA] shadow-[0_1px_3px_rgba(15,17,21,0.06)] transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex h-full w-full items-center justify-center">
                  <div className="size-8 rounded-lg bg-[#E5E7EB]" />
                </div>
                {/* Corner Status Badge: Loading Spinner */}
                <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full border border-white bg-white shadow-sm">
                  <Loader2 className="ds-spinner size-2.5 text-[#6B7280]" />
                </span>
              </div>
            </div>

            {/* 1D. Floating Action Dock / Command Bar (Dual-Tone Obsidian Anchor with Pseudo 3-D Volumetric Lighting) */}
            <div className="floating-action-dock mx-auto flex max-w-xl items-center justify-between rounded-full px-3 py-2 text-[#C4C7CE]">
              {/* Primary Elevated Add (+) Button */}
              <button
                type="button"
                aria-label="Add item"
                className="dock-plus-btn flex size-10 items-center justify-center font-body text-white"
              >
                <Plus className="size-5 stroke-[2.5]" />
              </button>

              {/* Action Icons with Pseudo 3-D Tactile Hover Backplates */}
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  aria-label="Mention"
                  className="dock-action-btn flex size-9 items-center justify-center"
                >
                  <AtSign className="size-4" />
                </button>

                <button
                  type="button"
                  aria-label="Emoji"
                  className="dock-action-btn flex size-9 items-center justify-center"
                >
                  <Smile className="size-4" />
                </button>

                <button
                  type="button"
                  aria-label="AI Sparkle"
                  className="dock-action-btn flex size-9 items-center justify-center"
                >
                  <Sparkles className="size-4" />
                </button>

                <button
                  type="button"
                  aria-label="Microphone Audio"
                  className="dock-action-btn flex size-9 items-center justify-center"
                >
                  <Mic className="size-4" />
                </button>

                {/* Dock Divider */}
                <div className="mx-1 h-5 w-[1px] bg-white/15" />

                {/* More / Overflow */}
                <button
                  type="button"
                  aria-label="More actions"
                  onClick={() => setActionMenuOpen(!actionMenuOpen)}
                  className="dock-action-btn flex size-9 items-center justify-center"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: COLOR SYSTEM PALETTE */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1 border-b border-[#E5E7EB] pb-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-2xl text-[#1A1C1F]">2. Color System Palette</h2>
              <p className="font-body text-xs text-[#5C6068]">
                Tokens from <code className="rounded bg-[#ECEEF1] px-1 py-0.5 text-xs text-[#1A1C1F]">planning/design-guidelines.json</code>: surfaces, ink, obsidian dock, and semantic status accents.
              </p>
            </div>
            {copiedHex && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#15803D]">
                <Check className="size-3.5 stroke-[3]" /> Copied {copiedHex}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-8">
            {paletteGroups.map((group) => (
              <div key={group.title} className="flex flex-col gap-3">
                <div>
                  <h3 className="font-body text-sm font-semibold text-[#1A1C1F]">
                    {group.title}
                  </h3>
                  <p className="font-body text-xs text-[#8B909A]">
                    {group.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {group.swatches.map((swatch) => (
                    <button
                      key={swatch.name}
                      type="button"
                      onClick={() => handleCopyHex(swatch.hex)}
                      className="group flex flex-col overflow-hidden rounded-[16px] border border-[#E5E7EB] bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      {/* Swatch Color Preview Block */}
                      <div
                        className="relative flex h-20 w-full items-end justify-end p-2"
                        style={{
                          backgroundColor: swatch.hex,
                          borderBottom: swatch.border ? "1px solid #EEF0F3" : undefined,
                        }}
                      >
                        <span
                          className={`rounded-md p-1 opacity-0 transition group-hover:opacity-100 ${
                            swatch.dark ? "bg-white/20 text-white" : "bg-black/10 text-[#1A1C1F]"
                          }`}
                        >
                          <Copy className="size-3" />
                        </span>
                      </div>

                      {/* Swatch Metadata */}
                      <div className="flex flex-1 flex-col justify-between p-2.5 font-body">
                        <div>
                          <div className="text-xs font-semibold text-[#1A1C1F]">
                            {swatch.name}
                          </div>
                          <div className="mt-0.5 font-mono text-[11px] text-[#5C6068]">
                            {swatch.hex}
                          </div>
                        </div>
                        <div className="mt-2 text-[10px] leading-tight text-[#8B909A]">
                          {swatch.role}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: REUSABLE SHADOW DEPTHS (SM, MD, LG) */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1 border-b border-[#E5E7EB] pb-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="size-5 text-[#3B82F6]" />
                <h2 className="font-display text-2xl text-[#1A1C1F]">
                  3. Reusable Shadow Depths
                </h2>
              </div>
              <p className="font-body text-xs text-[#5C6068]">
                Three reusable shadow depths (Small, Medium, Large) designed for consistent physical elevation across inputs, cards, popovers, and floating toolbars.
              </p>
            </div>
            {copiedHex && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#15803D]">
                <Check className="size-3.5 stroke-[3]" /> Copied {copiedHex}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Small Shadow Depth */}
            <div className="ds-shadow-sm flex flex-col justify-between rounded-[20px] border border-[#E5E7EB] bg-white p-6 transition hover:-translate-y-0.5">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-[#ECEEF1] px-2.5 py-0.5 font-body text-[11px] font-semibold text-[#1A1C1F]">
                    Depth 1 • Small
                  </span>
                  <code className="font-mono text-[11px] text-[#8B909A]">
                    .ds-shadow-sm
                  </code>
                </div>
                <h3 className="mt-4 font-body text-base font-semibold text-[#1A1C1F]">
                  Subtle Resting Elevation
                </h3>
                <p className="mt-1 font-body text-xs leading-relaxed text-[#5C6068]">
                  Used for micro-components requiring minimal lift off canvas: inputs, chips, dropdown triggers, and resting attachment thumbnails.
                </p>

                <div className="mt-5 rounded-xl border border-[#EEF0F3] bg-[#F8F9FA] p-3">
                  <div className="text-[11px] font-semibold text-[#8B909A] uppercase tracking-wide">
                    CSS Value
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyHex("0 1px 2px rgba(15, 17, 21, 0.05), 0 1px 3px rgba(15, 17, 21, 0.04)")}
                    className="group mt-1 flex w-full items-center justify-between font-mono text-[11px] text-[#1A1C1F] hover:text-[#3B82F6]"
                  >
                    <span className="truncate text-left">0 1px 2px ..., 0 1px 3px ...</span>
                    <Copy className="size-3 shrink-0 opacity-60 group-hover:opacity-100" />
                  </button>
                </div>
              </div>

              <div className="mt-6 border-t border-[#EEF0F3] pt-4">
                <span className="font-body text-[11px] font-medium text-[#8B909A]">
                  Example UI usage:
                </span>
                <div className="mt-2 flex items-center gap-2">
                  <span className="ds-shadow-sm inline-flex items-center rounded-full border border-[#E5E7EB] bg-white px-3 py-1 font-body text-xs font-medium text-[#1A1C1F]">
                    Dropdown Trigger
                  </span>
                  <span className="ds-shadow-sm inline-flex size-7 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#5C6068]">
                    <Search className="size-3.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* Medium Shadow Depth */}
            <div className="ds-shadow-md flex flex-col justify-between rounded-[20px] border border-[#E5E7EB] bg-white p-6 transition hover:-translate-y-0.5">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-[#DBEAFE] px-2.5 py-0.5 font-body text-[11px] font-semibold text-[#1E3A8A]">
                    Depth 2 • Medium
                  </span>
                  <code className="font-mono text-[11px] text-[#8B909A]">
                    .ds-shadow-md
                  </code>
                </div>
                <h3 className="mt-4 font-body text-base font-semibold text-[#1A1C1F]">
                  Card & Content Elevation
                </h3>
                <p className="mt-1 font-body text-xs leading-relaxed text-[#5C6068]">
                  Standard floating container elevation: floating editor sheets, hover card states, toast notifications, and compact callout blocks.
                </p>

                <div className="mt-5 rounded-xl border border-[#EEF0F3] bg-[#F8F9FA] p-3">
                  <div className="text-[11px] font-semibold text-[#8B909A] uppercase tracking-wide">
                    CSS Value
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyHex("0 4px 16px rgba(15, 17, 21, 0.06), 0 1px 3px rgba(15, 17, 21, 0.04)")}
                    className="group mt-1 flex w-full items-center justify-between font-mono text-[11px] text-[#1A1C1F] hover:text-[#3B82F6]"
                  >
                    <span className="truncate text-left">0 4px 16px ..., 0 1px 3px ...</span>
                    <Copy className="size-3 shrink-0 opacity-60 group-hover:opacity-100" />
                  </button>
                </div>
              </div>

              <div className="mt-6 border-t border-[#EEF0F3] pt-4">
                <span className="font-body text-[11px] font-medium text-[#8B909A]">
                  Example UI usage:
                </span>
                <div className="mt-2">
                  <div className="ds-shadow-md flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#1A1C1F]">
                    <span>Notification Banner</span>
                    <span className="text-[10px] text-[#15803D]">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Large Shadow Depth */}
            <div className="ds-shadow-lg flex flex-col justify-between rounded-[20px] border border-[#E5E7EB] bg-white p-6 transition hover:-translate-y-0.5">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-[#FEF3C7] px-2.5 py-0.5 font-body text-[11px] font-semibold text-[#B45309]">
                    Depth 3 • Large
                  </span>
                  <code className="font-mono text-[11px] text-[#8B909A]">
                    .ds-shadow-lg
                  </code>
                </div>
                <h3 className="mt-4 font-body text-base font-semibold text-[#1A1C1F]">
                  Modal & Popover Elevation
                </h3>
                <p className="mt-1 font-body text-xs leading-relaxed text-[#5C6068]">
                  High ambient dispersion for foreground overlays: modals, floating action docks, context popovers, and flyout drawer menus.
                </p>

                <div className="mt-5 rounded-xl border border-[#EEF0F3] bg-[#F8F9FA] p-3">
                  <div className="text-[11px] font-semibold text-[#8B909A] uppercase tracking-wide">
                    CSS Value
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyHex("0 16px 48px rgba(15, 17, 21, 0.1), 0 4px 12px rgba(15, 17, 21, 0.05)")}
                    className="group mt-1 flex w-full items-center justify-between font-mono text-[11px] text-[#1A1C1F] hover:text-[#3B82F6]"
                  >
                    <span className="truncate text-left">0 16px 48px ..., 0 4px 12px ...</span>
                    <Copy className="size-3 shrink-0 opacity-60 group-hover:opacity-100" />
                  </button>
                </div>
              </div>

              <div className="mt-6 border-t border-[#EEF0F3] pt-4">
                <span className="font-body text-[11px] font-medium text-[#8B909A]">
                  Example UI usage:
                </span>
                <div className="mt-2">
                  <div className="ds-shadow-lg flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#1A1C1F]">
                    <span>Modal / Action Dock</span>
                    <ArrowRight className="size-3.5 text-[#8B909A]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: TYPOGRAPHY HIERARCHY */}
        <section className="flex flex-col gap-6">
          <div className="border-b border-[#E5E7EB] pb-3">
            <h2 className="font-display text-2xl text-[#1A1C1F]">4. Typography Hierarchy</h2>
            <p className="font-body text-xs text-[#5C6068]">
              Playfair Display for editorial display titles; Source Serif 4 for prose and reading; Clean UI Sans for chrome and captions.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <span className="font-body text-xs font-semibold tracking-wider text-[#8B909A] uppercase">
                Display & Headings (Playfair Display)
              </span>
              <div className="mt-4 space-y-4">
                <div>
                  <span className="font-body text-xs text-[#8B909A]">Display / 48px</span>
                  <div className="font-display text-4xl text-[#1A1C1F]">
                    Tactile Precision in Modern Interfaces
                  </div>
                </div>
                <div>
                  <span className="font-body text-xs text-[#8B909A]">H1 / 32px</span>
                  <div className="font-display text-2xl text-[#1A1C1F]">
                    Calm, high-contrast editorial elegance
                  </div>
                </div>
                <div>
                  <span className="font-body text-xs text-[#8B909A]">H2 / 24px (Italic Expression)</span>
                  <div className="font-display text-xl italic text-[#1A1C1F]">
                    “Physical controls should feel touchable without unnecessary decoration.”
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <span className="font-body text-xs font-semibold tracking-wider text-[#8B909A] uppercase">
                Prose & Body Scale (Source Serif 4)
              </span>
              <div className="mt-4 space-y-3 font-serif">
                <div>
                  <span className="font-body text-xs text-[#8B909A]">Body Large / 18px</span>
                  <p className="text-lg leading-relaxed text-[#1A1C1F]">
                    Warm, literary typography brings timeless bookish focus to document writing.
                  </p>
                </div>
                <div>
                  <span className="font-body text-xs text-[#8B909A]">Body Regular / 15px</span>
                  <p className="text-[15px] leading-relaxed text-[#5C6068]">
                    Standard prose and messaging copy ensures sharp, comfortable reading contrast across off-white surfaces.
                  </p>
                </div>
                <div>
                  <span className="font-body text-xs text-[#8B909A]">Caption & Micro / 12px & 11px (Sans)</span>
                  <div className="flex items-center gap-3 font-body text-xs text-[#8B909A]">
                    <span>Last edited 2 mins ago</span>
                    <span>•</span>
                    <span className="font-semibold text-[#1A1C1F]">DOC-4892</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: BUTTONS & INTERACTIVE CONTROLS */}
        <section className="flex flex-col gap-6">
          <div className="border-b border-[#E5E7EB] pb-3">
            <h2 className="font-display text-2xl text-[#1A1C1F]">5. Buttons & Action Styles</h2>
            <p className="font-body text-xs text-[#5C6068]">
              Pseudo 3-D volumetric obsidian pill (matching reference), ceramic secondary pill, ghost actions, icon buttons, and tactile toggles.
            </p>
          </div>

          <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              {/* Pseudo 3-D Hero Pill Button (Matching Reference Screenshot) */}
              <button
                type="button"
                className="btn-3d-obsidian px-6 py-3 font-body text-base font-semibold"
              >
                <span>Get in Touch</span>
              </button>

              {/* Pseudo 3-D Primary Compact */}
              <button
                type="button"
                className="btn-3d-obsidian px-5 py-2.5 font-body text-sm font-semibold"
              >
                <span>Save Changes</span>
                <ArrowRight className="size-4" />
              </button>

              {/* Pseudo 3-D Secondary Ceramic */}
              <button
                type="button"
                className="btn-3d-secondary px-5 py-2.5 font-body text-sm font-semibold"
              >
                <span>Cancel</span>
              </button>

              {/* Ghost */}
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-body text-sm font-medium text-[#5C6068] transition hover:bg-[#F1F2F4] hover:text-[#1A1C1F]"
              >
                <Share2 className="size-4" />
                <span>Share</span>
              </button>

              {/* Destructive Ghost */}
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-body text-sm font-medium text-[#EF4444] transition hover:bg-red-50"
              >
                <Trash2 className="size-4" />
                <span>Delete</span>
              </button>

              {/* Icon Button with Tactile Press */}
              <button
                type="button"
                aria-label="Filter"
                className="tactile-press flex size-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#5C6068] shadow-sm transition hover:bg-[#F8F9FA] hover:text-[#1A1C1F]"
              >
                <SlidersHorizontal className="size-4" />
              </button>

              {/* Tactile Format Toggles */}
              <div className="flex items-center gap-1 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] p-1">
                <button
                  type="button"
                  className="tactile-embossed-active flex size-7 items-center justify-center rounded-lg font-body text-xs font-bold text-[#1A1C1F]"
                >
                  B
                </button>
                <button
                  type="button"
                  className="flex size-7 items-center justify-center rounded-lg font-body text-xs font-medium text-[#5C6068] hover:text-[#1A1C1F]"
                >
                  I
                </button>
                <button
                  type="button"
                  className="flex size-7 items-center justify-center rounded-lg font-body text-xs font-medium text-[#5C6068] hover:text-[#1A1C1F]"
                >
                  U
                </button>
              </div>

              {/* Disabled State */}
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center rounded-full bg-[#1E2025]/40 px-5 py-2.5 font-body text-sm font-semibold text-white/60"
              >
                Disabled Action
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 6: FORM INPUTS, TEXTAREAS & SELECTS */}
        <section className="flex flex-col gap-6">
          <div className="border-b border-[#E5E7EB] pb-3">
            <h2 className="font-display text-2xl text-[#1A1C1F]">6. Form Inputs & Selectors</h2>
            <p className="font-body text-xs text-[#5C6068]">
              Standard rounded inputs, pill search bars, select triggers, and inline prompt textareas.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Standard Input & Pill Input */}
            <div className="flex flex-col gap-4 rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <label className="flex flex-col gap-1.5">
                <span className="font-body text-xs font-semibold text-[#5C6068]">Standard Input (14px radius)</span>
                <input
                  type="text"
                  value={textInputValue}
                  onChange={(e) => setTextInputValue(e.target.value)}
                  placeholder="Enter a title..."
                  className="h-11 w-full rounded-[14px] border border-[#E5E7EB] bg-white px-3.5 font-body text-sm text-[#1A1C1F] placeholder:text-[#8B909A] focus:border-[#93C5FD] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.3)] focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-body text-xs font-semibold text-[#5C6068]">Search Pill Input (Pill radius)</span>
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 size-4 text-[#8B909A]" />
                  <input
                    type="text"
                    value={pillInputValue}
                    onChange={(e) => setPillInputValue(e.target.value)}
                    placeholder="Search documents..."
                    className="h-11 w-full rounded-full border border-[#E5E7EB] bg-white pr-4 pl-10 font-body text-sm text-[#1A1C1F] placeholder:text-[#8B909A] focus:border-[#93C5FD] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.3)] focus:outline-none"
                  />
                </div>
              </label>
            </div>

            {/* Inline Prompt Textarea */}
            <div className="flex flex-col gap-2 rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <span className="font-body text-xs font-semibold text-[#5C6068]">
                Editorial Document Textarea
              </span>
              <div className="rounded-xl border border-[#EEF0F3] bg-[#F8F9FA] p-3.5">
                <textarea
                  rows={3}
                  defaultValue="Convey intent through physical tactile depth rather than saturated flat color blocks."
                  className="w-full resize-none border-none bg-transparent font-serif text-sm leading-relaxed text-[#1A1C1F] placeholder:text-[#8B909A] focus:outline-none"
                />
                <div className="mt-2 flex items-center justify-between border-t border-[#E5E7EB] pt-2 text-xs text-[#8B909A]">
                  <span>Markdown & mention syntax supported</span>
                  <span className="font-medium text-[#1A1C1F]">78 chars</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: TABS, SEGMENTED CONTROLS & TOGGLES */}
        <section className="flex flex-col gap-6">
          <div className="border-b border-[#E5E7EB] pb-3">
            <h2 className="font-display text-2xl text-[#1A1C1F]">7. Segmented Controls & Toggles</h2>
            <p className="font-body text-xs text-[#5C6068]">
              Subtle neutral tracks with embossed active tabs and physical switches.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Segmented Control */}
            <div className="flex flex-col gap-4 rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <span className="font-body text-xs font-semibold text-[#5C6068]">Segmented Navigation Tab</span>
              <div className="inline-flex w-fit items-center rounded-full border border-[#EEF0F3] bg-[#F1F2F4] p-1 font-body text-xs">
                {["overview", "components", "tokens"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-4 py-1.5 font-medium transition ${
                      activeTab === tab
                        ? "tactile-embossed-active font-semibold text-[#1A1C1F]"
                        : "text-[#5C6068] hover:text-[#1A1C1F]"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="inline-flex w-fit items-center rounded-xl border border-[#EEF0F3] bg-[#F1F2F4] p-1 font-body text-xs">
                {["editor", "preview", "split"].map((seg) => (
                  <button
                    key={seg}
                    type="button"
                    onClick={() => setActiveSegment(seg)}
                    className={`rounded-lg px-3 py-1 font-medium transition ${
                      activeSegment === seg
                        ? "tactile-embossed-active font-semibold text-[#1A1C1F]"
                        : "text-[#5C6068] hover:text-[#1A1C1F]"
                    }`}
                  >
                    {seg.charAt(0).toUpperCase() + seg.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Switches and Checkboxes */}
            <div className="flex flex-col justify-center gap-4 rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <span className="font-body text-xs font-semibold text-[#5C6068]">Physical Switches & Checkboxes</span>

              {/* Tactile Switch */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-body text-sm font-medium text-[#1A1C1F]">Real-time Collaboration</div>
                  <div className="font-body text-xs text-[#8B909A]">Sync keystrokes across editors</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={switchOn}
                  onClick={() => setSwitchOn(!switchOn)}
                  className={`relative h-[26px] w-[44px] rounded-full transition-colors duration-200 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.3)] focus:outline-none ${
                    switchOn ? "bg-[#2A2D34]" : "bg-[#E5E7EB]"
                  }`}
                >
                  <span
                    className={`absolute top-[2px] block size-[22px] rounded-full bg-white shadow-[0_1px_3px_rgba(15,17,21,0.18)] transition-transform duration-200 ${
                      switchOn ? "translate-x-[20px]" : "translate-x-[2px]"
                    }`}
                  />
                </button>
              </div>

              {/* Custom Checkbox */}
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={checkboxChecked}
                  onChange={(e) => setCheckboxChecked(e.target.checked)}
                  className="sr-only"
                />
                <span
                  className={`flex size-5 items-center justify-center rounded-md border transition ${
                    checkboxChecked
                      ? "border-[#1E2025] bg-[#1E2025] text-white"
                      : "border-[#D1D5DB] bg-white"
                  }`}
                >
                  {checkboxChecked && <Check className="size-3.5 stroke-[3]" />}
                </span>
                <span className="font-body text-sm font-medium text-[#1A1C1F]">
                  Auto-publish changes on commit
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* SECTION 8: CHIPS, MENTIONS, BADGES & TOOLTIPS */}
        <section className="flex flex-col gap-6">
          <div className="border-b border-[#E5E7EB] pb-3">
            <h2 className="font-display text-2xl text-[#1A1C1F]">8. Chips, Badges & Tooltips</h2>
            <p className="font-body text-xs text-[#5C6068]">
              Inline entity pills, micro status tags, and dark obsidian tooltips.
            </p>
          </div>

          <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              {/* Mentions */}
              <div className="flex items-center gap-2">
                <span className="font-body text-xs text-[#8B909A]">Mentions:</span>
                <span className="inline-flex items-center rounded-full bg-[#ECEEF1] px-2.5 py-0.5 font-body text-xs font-semibold text-[#2C2F36]">
                  @masum
                </span>
                <span className="inline-flex items-center rounded-full bg-[#DBEAFE] px-2.5 py-0.5 font-body text-xs font-semibold text-[#1E3A8A]">
                  @rakesh (Active)
                </span>
              </div>

              <div className="h-4 w-[1px] bg-[#E5E7EB]" />

              {/* Status Tags */}
              <div className="flex items-center gap-2">
                <span className="font-body text-xs text-[#8B909A]">Tags:</span>
                <span className="inline-flex items-center rounded-full bg-[#ECEEF1] px-2.5 py-0.5 font-body text-[11px] font-semibold text-[#5C6068]">
                  Draft
                </span>
                <span className="inline-flex items-center rounded-full bg-[rgba(34,197,94,0.12)] px-2.5 py-0.5 font-body text-[11px] font-semibold text-[#15803D]">
                  Published
                </span>
                <span className="inline-flex items-center rounded-full bg-[rgba(245,158,11,0.14)] px-2.5 py-0.5 font-body text-[11px] font-semibold text-[#B45309]">
                  Reviewing
                </span>
                <span className="inline-flex items-center rounded-full bg-[rgba(239,68,68,0.12)] px-2.5 py-0.5 font-body text-[11px] font-semibold text-[#B91C1C]">
                  Blocked
                </span>
              </div>

              <div className="h-4 w-[1px] bg-[#E5E7EB]" />

              {/* Tooltip Sample */}
              <div className="flex items-center gap-2">
                <span className="font-body text-xs text-[#8B909A]">Tooltip:</span>
                <div className="relative inline-flex items-center rounded-lg bg-[#1E2025] px-2.5 py-1 font-body text-xs font-medium text-[#F7F8FA] shadow-md">
                  <span>Mention someone</span>
                  {/* Arrow */}
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1E2025]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 9: TOAST NOTIFICATIONS & STATUS CARDS */}
        <section className="flex flex-col gap-6">
          <div className="border-b border-[#E5E7EB] pb-3">
            <h2 className="font-display text-2xl text-[#1A1C1F]">9. Toast Notifications & Callouts</h2>
            <p className="font-body text-xs text-[#5C6068]">
              High-contrast elevated cards with clean status accents.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Success Toast */}
            <div className="flex items-start gap-3 rounded-[14px] border border-[#E5E7EB] bg-white p-3.5 shadow-[0_12px_40px_rgba(15,17,21,0.06),0_2px_8px_rgba(15,17,21,0.04)]">
              <CheckCircle2 className="mt-0.5 size-4 text-[#22C55E]" />
              <div className="flex flex-col">
                <span className="font-body text-xs font-semibold text-[#1A1C1F]">File uploaded</span>
                <span className="font-body text-[11px] text-[#5C6068]">Assets synced to workspace</span>
              </div>
            </div>

            {/* Warning Toast */}
            <div className="flex items-start gap-3 rounded-[14px] border border-[#E5E7EB] bg-white p-3.5 shadow-[0_12px_40px_rgba(15,17,21,0.06),0_2px_8px_rgba(15,17,21,0.04)]">
              <AlertCircle className="mt-0.5 size-4 text-[#F59E0B]" />
              <div className="flex flex-col">
                <span className="font-body text-xs font-semibold text-[#1A1C1F]">Connection slow</span>
                <span className="font-body text-[11px] text-[#5C6068]">Retrying socket sync...</span>
              </div>
            </div>

            {/* Error Toast */}
            <div className="flex items-start gap-3 rounded-[14px] border border-[#E5E7EB] bg-white p-3.5 shadow-[0_12px_40px_rgba(15,17,21,0.06),0_2px_8px_rgba(15,17,21,0.04)]">
              <X className="mt-0.5 size-4 text-[#EF4444]" />
              <div className="flex flex-col">
                <span className="font-body text-xs font-semibold text-[#1A1C1F]">Upload failed</span>
                <span className="font-body text-[11px] text-[#5C6068]">File exceeds 25MB limit</span>
              </div>
            </div>

            {/* Info Toast */}
            <div className="flex items-start gap-3 rounded-[14px] border border-[#E5E7EB] bg-white p-3.5 shadow-[0_12px_40px_rgba(15,17,21,0.06),0_2px_8px_rgba(15,17,21,0.04)]">
              <Info className="mt-0.5 size-4 text-[#3B82F6]" />
              <div className="flex flex-col">
                <span className="font-body text-xs font-semibold text-[#1A1C1F]">New version</span>
                <span className="font-body text-[11px] text-[#5C6068]">Version 1.2 is ready</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 10: TABLE & DATA LIST VIEW */}
        <section className="flex flex-col gap-6">
          <div className="border-b border-[#E5E7EB] pb-3">
            <h2 className="font-display text-2xl text-[#1A1C1F]">10. Data Table & List View</h2>
            <p className="font-body text-xs text-[#5C6068]">
              Hairline separators, soft hover states, and restrained typography.
            </p>
          </div>

          <div className="overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white shadow-sm">
            <table className="w-full border-collapse text-left font-body text-xs">
              <thead>
                <tr className="border-b border-[#EEF0F3] bg-[#F8F9FA] text-[#5C6068]">
                  <th className="px-4 py-3 font-semibold">Document Name</th>
                  <th className="px-4 py-3 font-semibold">Author</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0F3] text-[#1A1C1F]">
                <tr className="transition hover:bg-[#F8F9FA]">
                  <td className="px-4 py-3.5 font-medium">Design System Proposal.docx</td>
                  <td className="px-4 py-3.5 text-[#5C6068]">@masum</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[11px] font-semibold text-[#15803D]">
                      Approved
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 font-medium text-[#3B82F6] hover:underline"
                    >
                      <span>Open</span>
                      <ExternalLink className="size-3" />
                    </button>
                  </td>
                </tr>
                <tr className="transition hover:bg-[#F8F9FA]">
                  <td className="px-4 py-3.5 font-medium">Sprint 24 Architectural Plan.md</td>
                  <td className="px-4 py-3.5 text-[#5C6068]">@rakesh</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-semibold text-[#B45309]">
                      In Review
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 font-medium text-[#3B82F6] hover:underline"
                    >
                      <span>Open</span>
                      <ExternalLink className="size-3" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* MODAL DIALOG PREVIEW */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1115]/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[24px] border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_40px_rgba(15,17,21,0.12),0_2px_8px_rgba(15,17,21,0.06)]">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-body text-lg font-semibold text-[#1A1C1F]">
                  Publish Document
                </h3>
                <p className="mt-1 font-body text-xs text-[#5C6068]">
                  Are you ready to share this document with your workspace team members?
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex size-7 items-center justify-center rounded-lg text-[#8B909A] hover:bg-[#F1F2F4] hover:text-[#1A1C1F]"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn-3d-secondary px-4 py-2 font-body text-xs font-semibold"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn-3d-obsidian px-4 py-2 font-body text-xs font-semibold"
              >
                <span>Confirm & Publish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
