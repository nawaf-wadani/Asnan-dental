import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { ChevronRight, ChevronLeft, Plus, Minus, Search, Check, Trash2, FileText, Download, Stethoscope, Layers, Activity, Syringe, Scissors, Beaker, Sparkles, ShoppingCart, AlertCircle, X, Camera, Image as ImageIcon, Star, Clock, Moon, Sun, RotateCcw, Settings, Users, Package, TrendingUp, Mail, Copy, BarChart3, Bell, CircleDot, Send, Lock } from "lucide-react";

const APP_PASSWORD = "dental2026";

// ============= BRAND (Apple-style palette) =============
const BRAND_LIGHT = {
  primary: "#897BB9",
  primaryDark: "#6B5E9E",
  primaryDeep: "#564B82",
  ink: "#1D1D1F",
  paper: "#F5F5F7",
  surface: "rgba(255,255,255,0.72)",
  surfaceSolid: "#FFFFFF",
  muted: "#86868B",
  border: "rgba(0,0,0,0.08)",
  borderSolid: "#E5E5EA",
  danger: "#FF3B30",
  dangerBg: "rgba(255,59,48,0.08)",
  success: "#34C759",
  warning: "#FF9500",
  warningBg: "rgba(255,149,0,0.1)",
  glass: "rgba(255,255,255,0.6)",
  glassBorder: "rgba(255,255,255,0.3)",
  cardShadow: "0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
  isDark: false,
};

const BRAND_DARK = {
  primary: "#A99BD4",
  primaryDark: "#BDB1DE",
  primaryDeep: "#D1C8E8",
  ink: "#F5F5F7",
  paper: "#000000",
  surface: "rgba(28,28,30,0.72)",
  surfaceSolid: "#1C1C1E",
  muted: "#98989D",
  border: "rgba(255,255,255,0.08)",
  borderSolid: "#38383A",
  danger: "#FF453A",
  dangerBg: "rgba(255,69,58,0.12)",
  success: "#30D158",
  warning: "#FF9F0A",
  warningBg: "rgba(255,159,10,0.12)",
  glass: "rgba(28,28,30,0.6)",
  glassBorder: "rgba(255,255,255,0.06)",
  cardShadow: "0 2px 8px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.3)",
  isDark: true,
};

// ============= LOGO =============
function AsnanLogo({ size = 36 }) {
  return (
    <img src="/logo.jpeg" alt="Asnan Dental" width={size * 1.5} height={size} style={{ objectFit: "contain" }} />
  );
}

// ============= CATALOG (with default supplier) =============
const CATALOG = {
  diagnostics: {
    label: "Diagnostics & Hygiene",
    icon: Stethoscope,
    items: [
      { id: "70838649", name: "Articulating Paper – Thin, 63 Microns, Red/Blue", pkg: "12/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "75895248", name: "Articulating Paper – Plastic Dispenser, Red", pkg: "50 Sheets", mfr: "Bausch", supplier: "Patterson" },
      { id: "70838748", name: "Articulating Paper Forceps – Standard", pkg: "1 ea", mfr: "Patterson", supplier: "Patterson" },
      { id: "70406306", name: "Premium Mouth Mirrors – Size 4, Cone Socket", pkg: "12/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "70358341", name: "Crystal HD Mouth Mirrors – Soft Grip", pkg: "12/Pkg", mfr: "Zirc", supplier: "Patterson" },
      { id: "73680394", name: "Explorer DG16 Endodontic, Double End", pkg: "1 ea", mfr: "Hu-Friedy", supplier: "Patterson" },
      { id: "73724564", name: "Qulix Color-Coded Probe – Williams", pkg: "1 ea", mfr: "Hu-Friedy", supplier: "Patterson" },
      { id: "70887687", name: "Cotton Pliers – 317 Standard", pkg: "1 ea", mfr: "Patterson", supplier: "Patterson" },
      { id: "76675557", name: "PurCotton Nonwoven Sponges 2x2", pkg: "4000/Pkg", mfr: "Aurelia", supplier: "Patterson" },
      { id: "70850073", name: "Nonsterile Cotton Rolls", pkg: "2000/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "76050108", name: "Cotton Pellets – Size 1", pkg: "2000/Pkg", mfr: "Richmond", supplier: "Patterson" },
      { id: "76050132", name: "Cotton Pellets – Size 2", pkg: "2550/Pkg", mfr: "Richmond", supplier: "Patterson" },
      { id: "76051114", name: "Cotton Pellets – Size 4", pkg: "3000/Pkg", mfr: "Richmond", supplier: "Patterson" },
      { id: "71464411", name: "Dri-Angle Cotton Roll Alt – Small", pkg: "400/Pkg", mfr: "Dental Health", supplier: "Patterson" },
      { id: "71464429", name: "Dri-Angle Cotton Roll Alt – Large", pkg: "320/Pkg", mfr: "Dental Health", supplier: "Patterson" },
      { id: "71422633", name: "Chair Cover Sleeves – Half, Clear", pkg: "225/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "71423672", name: "Syringe Cover Sleeves with Opening", pkg: "500/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "75491741", name: "Air/Water Syringe Protectors", pkg: "500/Pkg", mfr: "Palmero", supplier: "Patterson" },
      { id: "71423771", name: "Instrument Tray Cover Sleeves", pkg: "500/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "72356475", name: "Barrier Film With Finger Lift – Blue", pkg: "1200/Roll", mfr: "Crosstex", supplier: "Patterson" },
      { id: "76046205", name: "TIDIShield Digital X-ray Sensor Sheaths Sz 2", pkg: "100/Pkg", mfr: "TIDI", supplier: "Patterson" },
      { id: "76070916", name: "Universal Digital Sensor Barriers", pkg: "500/Box", mfr: "Dentsply", supplier: "Patterson" },
      { id: "70501924", name: "Aurelia HVE Tips", pkg: "100/Pkg", mfr: "Aurelia", supplier: "Patterson" },
      { id: "71073964", name: "Saliva Ejectors – Clear/Blue Tip", pkg: "100/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "71446426", name: "Braval Saliva Ejectors – Clear/Blue", pkg: "100/Pkg", mfr: "Braval", supplier: "Patterson" },
      { id: "70894329", name: "Surgical Aspirator Tips – Large Green", pkg: "25/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "77294382", name: "Pumice Preppies Paste Cups", pkg: "100/Pkg", mfr: "Whip-Mix", supplier: "Patterson" },
      { id: "71456771", name: "Duraflor Ultra 5% NaF Varnish – Strawberry", pkg: "30/Pkg", mfr: "Medicom", supplier: "Patterson" },
      { id: "71456748", name: "Duraflor Ultra 5% NaF Varnish – Mint", pkg: "30/Pkg", mfr: "Medicom", supplier: "Patterson" },
      { id: "76220636", name: "BeautiSealant Pit & Fissure Sealant System", pkg: "Kit", mfr: "Shofu", supplier: "Patterson" },
      { id: "73269024", name: "Oro-Clense 0.12% Chlorhexidine", pkg: "4 L Bottle", mfr: "Germiphene", supplier: "Patterson" },
      { id: "70926311", name: "Patterson Curettes – 11/12 Gracey", pkg: "1 ea", mfr: "Patterson", supplier: "Patterson" },
      { id: "71263649", name: "Scaler – Nevi Posterior, Harmony Handle", pkg: "1 ea", mfr: "Hu-Friedy", supplier: "Patterson" },
    ],
  },
  restorative: {
    label: "Restorative (Fillings)",
    icon: Layers,
    items: [
      { id: "75216445", name: "Bond Force Bonding Agent – 5 ml", pkg: "Bottle Refill", mfr: "Tokuyama", supplier: "Patterson" },
      { id: "71394782", name: "Dia-X Bond Universal Bonding Agent", pkg: "5 ml Bottle", mfr: "Diadent", supplier: "Patterson" },
      { id: "77176019", name: "ExciTE F Light Curing Total Etch", pkg: "5 g Bottle", mfr: "Ivoclar", supplier: "Patterson" },
      { id: "75896592", name: "Etch-Rite Etching Gel Jumbo Refill", pkg: "2/Pkg", mfr: "Pulpdent", supplier: "Patterson" },
      { id: "75901913", name: "Porcelain Etch Gel", pkg: "3 ml Syringe", mfr: "Pulpdent", supplier: "Patterson" },
      { id: "71262070", name: "everX Flow Composite – Bulk Shade", pkg: "3.7 g", mfr: "GC America", supplier: "Patterson" },
      { id: "71262088", name: "everX Flow Composite – Dentin Shade", pkg: "3.7 g", mfr: "GC America", supplier: "Patterson" },
      { id: "71413731", name: "Omnichroma Flow BULK Composite", pkg: "3 g Syringe", mfr: "Tokuyama", supplier: "Patterson" },
      { id: "71451848", name: "Tetric EvoFlow – A1 Cavifil", pkg: "20/Pkg", mfr: "Ivoclar", supplier: "Patterson" },
      { id: "71451855", name: "Tetric EvoFlow – A2 Cavifil", pkg: "20/Pkg", mfr: "Ivoclar", supplier: "Patterson" },
      { id: "70617639", name: "Filtek One Bulk Fill – A1 Capsule", pkg: "0.2 g", mfr: "Solventum", supplier: "Patterson" },
      { id: "70617647", name: "Filtek One Bulk Fill – A2 Capsule", pkg: "0.2 g", mfr: "Solventum", supplier: "Patterson" },
      { id: "71077809", name: "Omnichroma Universal Composite Tips", pkg: "20/Pkg", mfr: "Tokuyama", supplier: "Patterson" },
      { id: "71455955", name: "Tetric EvoCeram – A1 Cavifil", pkg: "20/Pkg", mfr: "Ivoclar", supplier: "Patterson" },
      { id: "71455963", name: "Tetric EvoCeram – A2 Cavifil", pkg: "20/Pkg", mfr: "Ivoclar", supplier: "Patterson" },
      { id: "71455971", name: "Tetric EvoCeram – A3 Cavifil", pkg: "20/Pkg", mfr: "Ivoclar", supplier: "Patterson" },
      { id: "75022603", name: "Filtek Supreme Ultra – A1D Capsule", pkg: "10/Pkg", mfr: "Solventum", supplier: "Patterson" },
      { id: "75022611", name: "Filtek Supreme Ultra – A2D Capsule", pkg: "10/Pkg", mfr: "Solventum", supplier: "Patterson" },
      { id: "75022678", name: "Filtek Supreme Ultra – A1E Capsule", pkg: "10/Pkg", mfr: "Solventum", supplier: "Patterson" },
      { id: "75022686", name: "Filtek Supreme Ultra – A2E Capsule", pkg: "10/Pkg", mfr: "Solventum", supplier: "Patterson" },
      { id: "75022785", name: "Filtek Supreme Ultra – Amber Translucent", pkg: "10/Pkg", mfr: "Solventum", supplier: "Patterson" },
      { id: "75187612", name: "Estelite Sigma Quick PLT – A1", pkg: "20/Pkg", mfr: "Tokuyama", supplier: "Patterson" },
      { id: "75187620", name: "Estelite Sigma Quick PLT – A2", pkg: "20/Pkg", mfr: "Tokuyama", supplier: "Patterson" },
      { id: "76220487", name: "Beautifil II Restorative Tips – A1", pkg: "20/Pkg", mfr: "Shofu", supplier: "Patterson" },
      { id: "76220495", name: "Beautifil II Restorative Tips – A2", pkg: "20/Pkg", mfr: "Shofu", supplier: "Patterson" },
      { id: "76220503", name: "Beautifil II Restorative Tips – A3", pkg: "20/Pkg", mfr: "Shofu", supplier: "Patterson" },
      { id: "71162825", name: "EQUIA Forte HT Glass Ionomer – A2", pkg: "48/Pkg", mfr: "GC America", supplier: "Patterson" },
      { id: "76207823", name: "Riva Light Cure HV Glass Ionomer – A2", pkg: "50/Pkg", mfr: "SDI", supplier: "Patterson" },
      { id: "70823500", name: "Composi-Tight 3D Fusion Ring – Tall, Orange", pkg: "2/Pkg", mfr: "Garrison", supplier: "Patterson" },
      { id: "70823518", name: "Composi-Tight 3D Fusion Ring – Wide Prep, Green", pkg: "2/Pkg", mfr: "Garrison", supplier: "Patterson" },
      { id: "71449594", name: "Strata-G Small Molar Matrices – Purple", pkg: "100/Pkg", mfr: "Garrison", supplier: "Patterson" },
      { id: "73266079", name: "Composi-Tight B-Series Matrix Bands – Molar", pkg: "100/Pkg", mfr: "Garrison", supplier: "Patterson" },
      { id: "70897165", name: "Patterson Matrix Strips", pkg: "500/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "70388587", name: "A+ Wedge Refills – Small, Blue", pkg: "100/Pkg", mfr: "Garrison", supplier: "Patterson" },
      { id: "70451484", name: "Composi-Tight 3D Fusion Wedges – XS Yellow", pkg: "100/Pkg", mfr: "Garrison", supplier: "Patterson" },
      { id: "71449354", name: "Strata-G Wedge Refills – XS Yellow", pkg: "100/Pkg", mfr: "Garrison", supplier: "Patterson" },
      { id: "75897038", name: "Rainbow Wedges – Blue 12mm", pkg: "100/Pkg", mfr: "Pulpdent", supplier: "Patterson" },
      { id: "75897046", name: "Rainbow Wedges – Green 13mm", pkg: "100/Pkg", mfr: "Pulpdent", supplier: "Patterson" },
      { id: "75801592", name: "Knit-Pak Retraction Cord – #000 Green", pkg: "100\"", mfr: "Premier", supplier: "Patterson" },
      { id: "75801600", name: "Knit-Pak Retraction Cord – #00 Brown", pkg: "100\"", mfr: "Premier", supplier: "Patterson" },
      { id: "75801618", name: "Knit-Pak Retraction Cord – #0 Purple", pkg: "100\"", mfr: "Premier", supplier: "Patterson" },
      { id: "75801626", name: "Knit-Pak Retraction Cord – #1 Blue", pkg: "100\"", mfr: "Premier", supplier: "Patterson" },
      { id: "70902213", name: "Temporary Crown & Bridge Kit – A1", pkg: "Kit", mfr: "Patterson", supplier: "Patterson" },
      { id: "70902221", name: "Temporary Crown & Bridge Kit – A2", pkg: "Kit", mfr: "Patterson", supplier: "Patterson" },
      { id: "75752134", name: "Cavit G Temporary Filling – 28g", pkg: "Jar", mfr: "Solventum", supplier: "Patterson" },
      { id: "70970673", name: "U-Sharp Carbide Burs FG #170L", pkg: "10/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "71043967", name: "KaVo Carbide Burs FGSS #330", pkg: "10/Pkg", mfr: "Beavers", supplier: "Patterson" },
      { id: "71056688", name: "KaVo Carbide Burs FGSS #2 Round", pkg: "10/Pkg", mfr: "Beavers", supplier: "Patterson" },
      { id: "75455456", name: "NTI Diamond Burs F859 Needle", pkg: "5/Pkg", mfr: "Axis NTI", supplier: "Patterson" },
      { id: "76349948", name: "Hybrid Points Diamond – Football #7404", pkg: "1 ea", mfr: "Shofu", supplier: "Patterson" },
      { id: "76349971", name: "Hybrid Points Diamond – Needle #7901", pkg: "1 ea", mfr: "Shofu", supplier: "Patterson" },
      { id: "76349989", name: "Hybrid Points Diamond – Needle #7903", pkg: "1 ea", mfr: "Shofu", supplier: "Patterson" },
      { id: "75037619", name: "Sof-Lex Extra-Thin Polishing Discs Kit", pkg: "Kit", mfr: "Solventum", supplier: "Patterson" },
      { id: "75037635", name: "Sof-Lex Polishing Discs – Coarse 3/8\"", pkg: "85/Pkg", mfr: "Solventum", supplier: "Patterson" },
      { id: "75037676", name: "Sof-Lex Polishing Discs – Coarse 1/2\"", pkg: "85/Pkg", mfr: "Solventum", supplier: "Patterson" },
      { id: "75030226", name: "Sof-Lex Mandrels – RA", pkg: "3/Pkg", mfr: "Solventum", supplier: "Patterson" },
      { id: "76362842", name: "OneGloss Cup Mini-Point", pkg: "1 ea", mfr: "Shofu", supplier: "Patterson" },
      { id: "76365373", name: "Super-Snap Polystrips Coarse/Med", pkg: "100/Pkg", mfr: "Shofu", supplier: "Patterson" },
      { id: "76365381", name: "Super-Snap Polystrips Fine/Superfine", pkg: "100/Pkg", mfr: "Shofu", supplier: "Patterson" },
      { id: "71267251", name: "RelyX Universal Resin Cement – Translucent", pkg: "Refill", mfr: "Solventum", supplier: "Patterson" },
      { id: "75036421", name: "RelyX Unicem 2 Self-Adhesive – A2", pkg: "Refill Kit", mfr: "Solventum", supplier: "Patterson" },
      { id: "73261583", name: "GC Fuji I Glass Ionomer Luting Kit", pkg: "Complete", mfr: "GC America", supplier: "Patterson" },
      { id: "75037338", name: "RelyX Luting Plus Automix Trial Kit", pkg: "Trial", mfr: "Solventum", supplier: "Patterson" },
      { id: "75823034", name: "RelyX Temp NE Non-Eugenol Cement", pkg: "1 ea", mfr: "Solventum", supplier: "Patterson" },
    ],
  },
  endodontics: {
    label: "Endodontics (Root Canal)",
    icon: Activity,
    items: [
      { id: "70876110", name: "Barbed Broaches XXX-Fine White #25", pkg: "10/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "70876128", name: "Barbed Broaches XX-Fine Yellow #30", pkg: "10/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "70876136", name: "Barbed Broaches X-Fine Red #35", pkg: "10/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "70876151", name: "Barbed Broaches Medium Green #50", pkg: "10/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "70876169", name: "Barbed Broaches Coarse Black #60", pkg: "10/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "70876458", name: "Gates Glidden Drills Size 2", pkg: "6/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "70876466", name: "Gates Glidden Drills Size 3", pkg: "6/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "70876474", name: "Gates Glidden Drills Size 4", pkg: "6/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "70871558", name: "Single Use K-Files 25mm Size 08 Gray", pkg: "6/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "70871566", name: "Single Use K-Files 25mm Size 10 Purple", pkg: "6/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "70872085", name: "Single Use K-Files 25mm Size 15 White", pkg: "6/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "71428846", name: "VaryFlex H-Files 21mm Size 10", pkg: "6/Pkg", mfr: "Endoperfection", supplier: "Patterson" },
      { id: "71428853", name: "VaryFlex H-Files 21mm Size 15", pkg: "6/Pkg", mfr: "Endoperfection", supplier: "Patterson" },
      { id: "71428861", name: "VaryFlex H-Files 21mm Size 20", pkg: "6/Pkg", mfr: "Endoperfection", supplier: "Patterson" },
      { id: "71429018", name: "VaryFlex H-Files 25mm Size 10", pkg: "6/Pkg", mfr: "Endoperfection", supplier: "Patterson" },
      { id: "71429026", name: "VaryFlex H-Files 25mm Size 15", pkg: "6/Pkg", mfr: "Endoperfection", supplier: "Patterson" },
      { id: "71429034", name: "VaryFlex H-Files 25mm Size 20", pkg: "6/Pkg", mfr: "Endoperfection", supplier: "Patterson" },
      { id: "71429059", name: "VaryFlex H-Files 25mm Size 30", pkg: "6/Pkg", mfr: "Endoperfection", supplier: "Patterson" },
      { id: "71719715", name: "K-Files 21mm Size 08 Gray", pkg: "6/Pkg", mfr: "Dentsply", supplier: "Patterson" },
      { id: "71719723", name: "K-Files 21mm Size 10 Purple", pkg: "6/Pkg", mfr: "Dentsply", supplier: "Patterson" },
      { id: "71719731", name: "K-Files 21mm Size 15 White", pkg: "6/Pkg", mfr: "Dentsply", supplier: "Patterson" },
      { id: "71719749", name: "K-Files 21mm Size 20 Yellow", pkg: "6/Pkg", mfr: "Dentsply", supplier: "Patterson" },
      { id: "71719806", name: "K-Files 25mm Size 08 Gray", pkg: "6/Pkg", mfr: "Dentsply", supplier: "Patterson" },
      { id: "71719814", name: "K-Files 25mm Size 10 Purple", pkg: "6/Pkg", mfr: "Dentsply", supplier: "Patterson" },
      { id: "71719822", name: "K-Files 25mm Size 15 White", pkg: "6/Pkg", mfr: "Dentsply", supplier: "Patterson" },
      { id: "71719830", name: "K-Files 25mm Size 20 Yellow", pkg: "6/Pkg", mfr: "Dentsply", supplier: "Patterson" },
      { id: "71719905", name: "K-Files 31mm Size 10 Purple", pkg: "6/Pkg", mfr: "Dentsply", supplier: "Patterson" },
      { id: "71719913", name: "K-Files 31mm Size 15 White", pkg: "6/Pkg", mfr: "Dentsply", supplier: "Patterson" },
      { id: "71611557", name: "K3 NiTi Files 21mm Tip 30 .04", pkg: "6/Pkg", mfr: "Kerr", supplier: "Patterson" },
      { id: "71611565", name: "K3 NiTi Files 21mm Tip 35 .04", pkg: "6/Pkg", mfr: "Kerr", supplier: "Patterson" },
      { id: "71611649", name: "K3 NiTi Files 25mm Tip 20 .04", pkg: "6/Pkg", mfr: "Kerr", supplier: "Patterson" },
      { id: "71611656", name: "K3 NiTi Files 25mm Tip 25 .04", pkg: "6/Pkg", mfr: "Kerr", supplier: "Patterson" },
      { id: "71611664", name: "K3 NiTi Files 25mm Tip 30 .04", pkg: "6/Pkg", mfr: "Kerr", supplier: "Patterson" },
      { id: "71611672", name: "K3 NiTi Files 25mm Tip 35 .04", pkg: "6/Pkg", mfr: "Kerr", supplier: "Patterson" },
      { id: "72798940", name: "Absorbent Paper Points Size 25", pkg: "200/Box", mfr: "Diadent", supplier: "Patterson" },
      { id: "72798957", name: "Absorbent Paper Points Size 30", pkg: "200/Box", mfr: "Diadent", supplier: "Patterson" },
      { id: "72798973", name: "Absorbent Paper Points Size 40", pkg: "200/Box", mfr: "Diadent", supplier: "Patterson" },
      { id: "71378900", name: "ZenFlex Gutta Percha Size 0.20 .04", pkg: "50/Pkg", mfr: "Kerr", supplier: "Patterson" },
      { id: "71602937", name: "K3 Gutta Percha Size 25 .04", pkg: "50/Pkg", mfr: "Kerr", supplier: "Patterson" },
      { id: "71602945", name: "K3 Gutta Percha Size 30 .04", pkg: "50/Pkg", mfr: "Kerr", supplier: "Patterson" },
      { id: "71153428", name: "Dia-ProSeal Root Canal Sealer Kit", pkg: "Intro Kit", mfr: "Diadent", supplier: "Patterson" },
      { id: "71362250", name: "BioRoot Flow Bioactive Sealer", pkg: "2 g", mfr: "Septodont", supplier: "Patterson" },
      { id: "70352302", name: "MTA Cement Capsules", pkg: "2/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "71013143", name: "Dia-Prep Plus 17% EDTA Cream", pkg: "Bottle", mfr: "Diadent", supplier: "Patterson" },
      { id: "75896501", name: "EDTA Solution 17%", pkg: "120 ml", mfr: "Pulpdent", supplier: "Patterson" },
      { id: "75834742", name: "RC-Prep Chemo-Mechanical Prep", pkg: "18 g Jar", mfr: "Premier", supplier: "Patterson" },
      { id: "71264464", name: "DiaPex Plus Calcium Hydroxide w/ Iodoform", pkg: "Complete Kit", mfr: "Diadent", supplier: "Patterson" },
      { id: "71225267", name: "CanalPro Endo-Ice Refrigerant Spray", pkg: "6 oz", mfr: "Coltene", supplier: "Patterson" },
      { id: "71452572", name: "Monoject 471 Endo Irrigation Needles 27ga", pkg: "25/Pkg", mfr: "Medtronic", supplier: "Patterson" },
      { id: "71020809", name: "Sterilized Irrigation Tips 30ga Yellow", pkg: "50/Pkg", mfr: "Diadent", supplier: "Patterson" },
      { id: "76311468", name: "Biodentine Dentin Substitute Capsules", pkg: "5 caps", mfr: "Septodont", supplier: "Patterson" },
      { id: "76312425", name: "Alveogyl Haemostatic Surgical Dressing", pkg: "10 g Jar", mfr: "Septodont", supplier: "Patterson" },
    ],
  },
  anesthesia: {
    label: "Anesthesia",
    icon: Syringe,
    items: [
      { id: "70485466", name: "Orabloc 4% Articaine 1:100,000 Epi", pkg: "50/Pkg", mfr: "Pierrel", supplier: "Patterson" },
      { id: "71452119", name: "Scandonest 3% Plain Mepivacaine", pkg: "50/Pkg", mfr: "Septodont", supplier: "Patterson" },
      { id: "73100310", name: "Cook-Waite Lidocaine 2% w/ 1:100,000 Epi", pkg: "50/Pkg", mfr: "Septodont", supplier: "Patterson" },
      { id: "76314827", name: "Septanest SP Articaine 4% 1:100,000 Epi", pkg: "50/Pkg", mfr: "Septodont", supplier: "Patterson" },
      { id: "71298157", name: "Hurricaine 20% Benzocaine Gel – Watermelon", pkg: "1 oz", mfr: "Beutlich", supplier: "Patterson" },
      { id: "71298272", name: "Hurricaine 20% Benzocaine Gel – Wild Cherry", pkg: "1 oz", mfr: "Beutlich", supplier: "Patterson" },
      { id: "71298504", name: "Hurricaine Topical Spray – Wild Cherry", pkg: "2 oz", mfr: "Beutlich", supplier: "Patterson" },
      { id: "71451186", name: "Oraqix Topical Anesthetic – Gel Cartridges", pkg: "20/Pkg", mfr: "Dentsply", supplier: "Patterson" },
      { id: "71199538", name: "Accuject Disposable Needles 30ga XS", pkg: "100/Box", mfr: "Dentsply", supplier: "Patterson" },
      { id: "75186010", name: "Disposable Needles 27ga Short", pkg: "100/Box", mfr: "J Morita", supplier: "Patterson" },
      { id: "75186028", name: "Disposable Needles 27ga Long", pkg: "100/Box", mfr: "J Morita", supplier: "Patterson" },
      { id: "76313423", name: "Septoject XL Needles 27ga Short", pkg: "100/Pkg", mfr: "Septodont", supplier: "Patterson" },
      { id: "71452747", name: "Monoject 3ml Syringe Lock Tip", pkg: "100/Pkg", mfr: "Medtronic", supplier: "Patterson" },
      { id: "75001961", name: "Aspirating Syringes – Type CW Standard", pkg: "1 ea", mfr: "Miltex", supplier: "Patterson" },
      { id: "75001979", name: "Aspirating Syringes – A Type", pkg: "1 ea", mfr: "Miltex", supplier: "Patterson" },
      { id: "71451756", name: "Paroject Intraligamental Syringe", pkg: "1 ea", mfr: "Septodont", supplier: "Patterson" },
    ],
  },
  surgical: {
    label: "Surgical & Extraction",
    icon: Scissors,
    items: [
      { id: "73713948", name: "Perma Sharp Chromic Gut Sutures C-6 3-0", pkg: "12/Pkg", mfr: "Hu-Friedy", supplier: "Patterson" },
      { id: "76676167", name: "LOOK Chromic Gut Sutures C6 3-0", pkg: "12/Pkg", mfr: "Surgical Spec.", supplier: "Patterson" },
      { id: "73714078", name: "Perma Sharp Silk Black Sutures C-6 3-0", pkg: "Box", mfr: "Hu-Friedy", supplier: "Patterson" },
      { id: "70894501", name: "Surgical Scalpel Handle Metal #3", pkg: "1 ea", mfr: "Patterson", supplier: "Patterson" },
      { id: "70894519", name: "Surgical Scalpel Handle Metal #4", pkg: "1 ea", mfr: "Patterson", supplier: "Patterson" },
      { id: "71286038", name: "Surgical Blade Handle Size 3", pkg: "1 ea", mfr: "BD", supplier: "Patterson" },
      { id: "70893743", name: "Surgical Scissors – Iris Straight", pkg: "1 ea", mfr: "Patterson", supplier: "Patterson" },
      { id: "70893750", name: "Surgical Scissors – Iris Curved", pkg: "1 ea", mfr: "Patterson", supplier: "Patterson" },
      { id: "74075016", name: "Spongostan Hemostat 1cm cubes", pkg: "24/Pkg", mfr: "J&J Medical", supplier: "Patterson" },
      { id: "74088837", name: "Surgicel Original Absorbable Hemostat", pkg: "12/Pkg", mfr: "J&J Medical", supplier: "Patterson" },
      { id: "70862110", name: "Surgical Elevator #8 Crane Pick", pkg: "1 ea", mfr: "Patterson", supplier: "Patterson" },
      { id: "70862243", name: "Surgical Elevator #44 Cryer", pkg: "1 ea", mfr: "Patterson", supplier: "Patterson" },
      { id: "70862250", name: "Surgical Elevator #45 Cryer", pkg: "1 ea", mfr: "Patterson", supplier: "Patterson" },
      { id: "70862284", name: "Surgical Elevator #71 Miller Apexo", pkg: "1 ea", mfr: "Patterson", supplier: "Patterson" },
      { id: "70862292", name: "Surgical Elevator #72 Miller Apexo", pkg: "1 ea", mfr: "Patterson", supplier: "Patterson" },
      { id: "71269463", name: "Periosteal Elevator #9 Molt", pkg: "1 ea", mfr: "Patterson", supplier: "Patterson" },
      { id: "71269406", name: "Rongeur #45D Blumenthal", pkg: "1 ea", mfr: "Patterson", supplier: "Patterson" },
      { id: "71269943", name: "Surgical Curette #87 Lucas", pkg: "1 ea", mfr: "Patterson", supplier: "Patterson" },
      { id: "73681137", name: "Bone Chisel #2 Gardner", pkg: "1 ea", mfr: "Hu-Friedy", supplier: "Patterson" },
      { id: "73706918", name: "Luxator Straight 2mm", pkg: "1 ea", mfr: "Hu-Friedy", supplier: "Patterson" },
      { id: "73706926", name: "Luxator Straight 4mm", pkg: "1 ea", mfr: "Hu-Friedy", supplier: "Patterson" },
      { id: "73711934", name: "Luxator Straight 3mm", pkg: "1 ea", mfr: "Hu-Friedy", supplier: "Patterson" },
      { id: "73813730", name: "Hygenic Brinker Clamp Molars B1", pkg: "1 ea", mfr: "Coltene", supplier: "Patterson" },
      { id: "73813797", name: "Hygenic Brinker Clamp Molars B3", pkg: "1 ea", mfr: "Coltene", supplier: "Patterson" },
      { id: "73813821", name: "Hygenic Brinker Clamp Bicuspid B4", pkg: "1 ea", mfr: "Coltene", supplier: "Patterson" },
      { id: "71127208", name: "Isodam Latex-Free Dental Dam Medium", pkg: "15/Pkg", mfr: "Four D Rubber", supplier: "Patterson" },
      { id: "71258847", name: "Isodam Latex-Free Heavy 6x6", pkg: "75/Pkg", mfr: "Four D Rubber", supplier: "Patterson" },
      { id: "71258854", name: "Isodam Latex-Free Heavy 5x5", pkg: "100/Pkg", mfr: "Four D Rubber", supplier: "Patterson" },
      { id: "77659675", name: "Hygenic Flexi Dam Nonlatex – Purple", pkg: "30/Pkg", mfr: "Coltene", supplier: "Patterson" },
    ],
  },
  impression: {
    label: "Impression & Labs",
    icon: Beaker,
    items: [
      { id: "70461376", name: "Cavex Cream Alginate", pkg: "500 g Bag", mfr: "Cavex", supplier: "Patterson" },
      { id: "70843995", name: "Rigid Bite Registration Fast Set – Berry", pkg: "2/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "71812908", name: "Regisil 2X VPS Bite Registration", pkg: "Refill Pack", mfr: "Dentsply", supplier: "Patterson" },
      { id: "70494427", name: "Aquasil Ultra+ Medium Body Reg Set", pkg: "Refill", mfr: "Dentsply", supplier: "Patterson" },
      { id: "70854463", name: "Reflection VPS Medium Body Fast Set", pkg: "2/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "70854471", name: "Reflection VPS Heavy Body Fast Set", pkg: "2/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "70854729", name: "Reflection VPS Putty – Firm Blue", pkg: "1 ea", mfr: "Patterson", supplier: "Patterson" },
      { id: "71705714", name: "Aquasil Ultra Monophase Reg Set", pkg: "4 Pack", mfr: "Dentsply", supplier: "Patterson" },
      { id: "71705771", name: "Aquasil Ultra Light Viscosity Reg Set", pkg: "4 Pack", mfr: "Dentsply", supplier: "Patterson" },
      { id: "70886572", name: "High Performance Mixing Tips Blue/Orange", pkg: "25/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "72106805", name: "COE Spacer Tray – Upper 1D Large", pkg: "12/Bag", mfr: "GC America", supplier: "Patterson" },
      { id: "72106813", name: "COE Spacer Tray – Upper 4D Medium", pkg: "12/Bag", mfr: "GC America", supplier: "Patterson" },
      { id: "72106821", name: "COE Spacer Tray – Upper 7D Small", pkg: "12/Bag", mfr: "GC America", supplier: "Patterson" },
      { id: "72106839", name: "COE Spacer Tray – Lower 20D Large", pkg: "12/Bag", mfr: "GC America", supplier: "Patterson" },
      { id: "72106847", name: "COE Spacer Tray – Lower 21D Medium", pkg: "12/Bag", mfr: "GC America", supplier: "Patterson" },
      { id: "72106854", name: "COE Spacer Tray – Lower 22D Small", pkg: "12/Bag", mfr: "GC America", supplier: "Patterson" },
      { id: "72106862", name: "COE Spacer Tray – Partial UL/LR 30D", pkg: "12/Bag", mfr: "GC America", supplier: "Patterson" },
      { id: "72106870", name: "COE Spacer Tray – Partial UR/LL 31D", pkg: "12/Bag", mfr: "GC America", supplier: "Patterson" },
      { id: "73295847", name: "Fastone Type III Base Stone Buff", pkg: "50 lb", mfr: "Garreco", supplier: "Patterson" },
      { id: "72795508", name: "Pro-form Niteguard Laminates 0.120\"", pkg: "12/Pkg", mfr: "Keystone", supplier: "Patterson" },
    ],
  },
  infection: {
    label: "Infection Control & PPE",
    icon: Sparkles,
    items: [
      { id: "76648471", name: "FlashTips Disposable A/W Syringe Tips", pkg: "1200/Pkg", mfr: "Livingston", supplier: "Patterson" },
      { id: "70367680", name: "Attest Super Rapid Bio Indicators – Vacuum", pkg: "50/Pkg", mfr: "Solventum", supplier: "Patterson" },
      { id: "75007307", name: "Attest Steam Chemical Integrator 1243A", pkg: "500/Pkg", mfr: "Solventum", supplier: "Patterson" },
      { id: "75008156", name: "Attest Rapid Readout Bio Indicators – Brown", pkg: "50/Pkg", mfr: "Solventum", supplier: "Patterson" },
      { id: "76613004", name: "Bowie-Dick Test Card Green S/T", pkg: "30/Pkg", mfr: "Getinge", supplier: "Patterson" },
      { id: "77644008", name: "ENSURE 24-Hour Bio Indicators", pkg: "100/Pkg", mfr: "Scican", supplier: "Patterson" },
      { id: "71309418", name: "Aurelia Surgical Earloop Mask Lvl 3 Blue", pkg: "50/Pkg", mfr: "Aurelia", supplier: "Patterson" },
      { id: "70374223", name: "Aurelia Blush Nitrile Gloves Pink Small", pkg: "200/Pkg", mfr: "Aurelia", supplier: "Patterson" },
      { id: "70420950", name: "Aurelia Transform Latex-Free Small", pkg: "100/Box", mfr: "Aurelia", supplier: "Patterson" },
      { id: "70420968", name: "Aurelia Transform Latex-Free Medium", pkg: "100/Box", mfr: "Aurelia", supplier: "Patterson" },
      { id: "76675672", name: "Aurelia Perform Nitrile Teal Small", pkg: "200/Box", mfr: "Aurelia", supplier: "Patterson" },
      { id: "76675680", name: "Aurelia Perform Nitrile Teal Medium", pkg: "200/Box", mfr: "Aurelia", supplier: "Patterson" },
      { id: "71150341", name: "Medicom Isolation Gowns Yellow Reg", pkg: "10/Pkg", mfr: "Medicom", supplier: "Patterson" },
      { id: "71044916", name: "Aurelia Shoe Covers Blue XL Nonskid", pkg: "100/Pkg", mfr: "Aurelia", supplier: "Patterson" },
      { id: "71044924", name: "Aurelia Shoe Covers Blue Large Nonskid", pkg: "100/Pkg", mfr: "Aurelia", supplier: "Patterson" },
      { id: "70909655", name: "Ultrasonic Cleaner Solution General Purpose", pkg: "1 Gallon", mfr: "Patterson", supplier: "Patterson" },
      { id: "70909713", name: "Ultrasonic Cleaner Tartar/Stain Remover", pkg: "1 Gallon", mfr: "Patterson", supplier: "Patterson" },
      { id: "75709332", name: "Brite Shield Instrument Cleaner", pkg: "800 g Jar", mfr: "Premier", supplier: "Patterson" },
      { id: "77644149", name: "HIP Hydrim Cleaning Solution", pkg: "8/Pkg", mfr: "Scican", supplier: "Patterson" },
      { id: "70373860", name: "Cidex OPA Disinfectant", pkg: "1 Gallon", mfr: "J&J Medical", supplier: "Patterson" },
      { id: "71159664", name: "MicroSure Shock Waterline Treatment", pkg: "1 L Conc.", mfr: "CHS", supplier: "Patterson" },
      { id: "72263499", name: "BluTab Waterline Tablets 2L", pkg: "50 tabs", mfr: "ProEdge", supplier: "Patterson" },
      { id: "70639088", name: "Double Bend Applicator Brush White Long", pkg: "100/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "73834058", name: "Microbrush Tube Series Fine Pink", pkg: "100/Pkg", mfr: "Microbrush", supplier: "Patterson" },
      { id: "73834066", name: "Microbrush Tube Series Fine Yellow", pkg: "100/Pkg", mfr: "Microbrush", supplier: "Patterson" },
      { id: "73834074", name: "Microbrush Tube Series Super Fine White", pkg: "100/Pkg", mfr: "Microbrush", supplier: "Patterson" },
      { id: "73834330", name: "Microbrush Tube Series Regular Blue", pkg: "100/Pkg", mfr: "Microbrush", supplier: "Patterson" },
      { id: "73834348", name: "Microbrush Tube Series Regular Purple", pkg: "100/Pkg", mfr: "Microbrush", supplier: "Patterson" },
      { id: "71074020", name: "Cotton-Tipped Applicators 6\"", pkg: "100/Bag", mfr: "Patterson", supplier: "Patterson" },
      { id: "70852335", name: "Prebent Dispensing Tips 20ga Black", pkg: "125/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "70852343", name: "Prebent Dispensing Tips 22ga Black", pkg: "125/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "70852350", name: "Prebent Dispensing Tips 25ga Blue", pkg: "125/Pkg", mfr: "Patterson", supplier: "Patterson" },
      { id: "70852715", name: "K-Spray Handpiece Lubricant", pkg: "500 ml", mfr: "Patterson", supplier: "Patterson" },
    ],
  },
};

const RECOMMENDED_ADDITIONS = [
  { name: "Self-Sealing Sterilization Pouches (2.25\"×4\", 3.5\"×9\", 5.25\"×10\", 7.5\"×13\")", reason: "No autoclave pouches in catalog — essential daily consumable" },
  { name: "Class 5 Integrator Strips", reason: "Best practice for every load monitoring" },
  { name: "Sterilization Indicator Tape", reason: "Process indicator on every wrapped pack" },
  { name: "Disposable Prophy Angles (soft / firm cup)", reason: "High-volume hygiene consumable" },
  { name: "Prophy Paste Cups – Coarse / Medium / Fine (multi-flavor)", reason: "Flavored prophy paste typically used daily" },
  { name: "ZOE Temporary Cement (Eugenol-based, e.g., TempBond)", reason: "Catalog has non-eugenol only" },
  { name: "Lidocaine 2% w/ 1:50,000 Epinephrine (hemostatic)", reason: "Useful for surgical hemostasis" },
  { name: "Patient Bibs / Bib Chains", reason: "Standard chairside disposable" },
  { name: "2x2 Sterile Gauze (individually packaged)", reason: "Surgical gauze in addition to nonsterile sponges" },
  { name: "Bone Graft / Collagen Plugs", reason: "Surgical extraction socket management" },
  { name: "Alcohol Prep Pads (sterile, individually wrapped)", reason: "Pre-injection skin prep" },
];

// Smart pairings — items often ordered together
const PAIRINGS = {
  "70374223": ["71309418", "70420950"], // pink gloves -> masks, latex-free small
  "70420950": ["71309418", "76675672"], // latex-free small -> masks, perform teal small
  "70420968": ["71309418", "76675680"], // latex-free med -> masks, perform teal med
  "76675672": ["71309418", "70374223"], // perform small -> masks, pink gloves
  "76675680": ["71309418", "70420968"], // perform med -> masks, latex-free med
  "73713948": ["70894501", "70893743"], // sutures -> scalpel handle, scissors
  "73714078": ["70894501", "70893743"], // silk sutures -> scalpel handle, scissors
  "70485466": ["75186010", "76313423"], // articaine -> needles short, septoject
  "73100310": ["75186010", "75001961"], // lidocaine -> needles, syringe
  "70871558": ["72798940", "71378900"], // K-files -> paper points, gutta percha
  "70871566": ["72798940", "71378900"],
  "70872085": ["72798957", "71602937"],
  "71262070": ["77176019", "75216445"], // composite -> etch, bond
  "71262088": ["77176019", "75216445"],
  "71413731": ["77176019", "71394782"],
};

const PROCEDURES = Object.entries(CATALOG).map(([key, v]) => ({ key, ...v }));
const DEFAULT_ASSISTANTS = ["Yuva", "Safa", "Rahmya", "Shahad", "Nadia", "Soundos", "Meraim"];

const todayIso = () => new Date().toISOString().slice(0, 10);

const isHistoryEditable = (record) => {
  const confirmedAt = new Date(record.createdAt || record.orderDate).getTime();
  if (Number.isNaN(confirmedAt)) return false;
  return Date.now() - confirmedAt <= 24 * 60 * 60 * 1000;
};

// ============= STORAGE HELPERS =============
const STORAGE_KEYS = {
  draft: "asnan:current-draft",
  history: "asnan:order-history",
  favorites: "asnan:favorites",
  assistants: "asnan:saved-assistants",
  itemFreq: "asnan:item-frequency",
  settings: "asnan:settings",
};

function safeGet(key: string, defaultVal: any = null) {
  try {
    if (typeof window === "undefined") return defaultVal;
    const r = localStorage.getItem(key);
    return r ? JSON.parse(r) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function safeSet(key: string, value: any) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function safeDelete(key: string) {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  } catch {}
}

// ============= SHARED DATABASE API HELPERS =============
async function fetchOrderHistory(): Promise<any[]> {
  try {
    const res = await fetch("/api/order-history");
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function saveOrderToDb(order: {
  assistantName: string;
  orderDate: string;
  quantities: Record<string, number>;
  specialRequests: any[];
  orderNotes: string;
  itemCount: number;
}): Promise<any> {
  try {
    const res = await fetch("/api/order-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...order, clientId: "shared" }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function clearOrderHistoryDb(): Promise<void> {
  try {
    const hist = await fetchOrderHistory();
    await Promise.all(
      hist.map((o: any) =>
        fetch(`/api/order-history?id=${o.id}`, { method: "DELETE" })
      )
    );
  } catch {}
}

async function fetchInventoryDb(): Promise<any[]> {
  try {
    const res = await fetch("/api/inventory");
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function saveInventoryDb(items: any[]): Promise<any[]> {
  try {
    const res = await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function fetchItemFrequencyDb(): Promise<Record<string, number>> {
  try {
    const res = await fetch("/api/item-frequency");
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

async function incrementItemFrequencyDb(increments: Record<string, number>): Promise<Record<string, number>> {
  try {
    const res = await fetch("/api/item-frequency", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(increments),
    });
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

async function clearItemFrequencyDb(): Promise<void> {
  try {
    await fetch("/api/item-frequency", { method: "DELETE" });
  } catch {}
}

// ============= APP =============
interface CartItem {
  id: string;
  name: string;
  orderQty: number;
}

interface AsnanDentalProps {
  globalCart?: CartItem[];
  setGlobalCart?: (cart: CartItem[] | ((prev: CartItem[]) => CartItem[])) => void;
  onCheckout?: (items: CartItem[]) => void;
  onInventoryUpdated?: () => void;
}

export default function AsnanDental({ globalCart, setGlobalCart, onCheckout, onInventoryUpdated }: AsnanDentalProps = {}) {
  const isLifted = !!setGlobalCart;
  const [step, setStep] = useState("intro");
  const [activeCat, setActiveCat] = useState(null);
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [assistantName, setAssistantName] = useState("");
  const [orderDate, setOrderDate] = useState(() => todayIso());
  const [localQuantities, setLocalQuantities] = useState({});

  // When lifted, derive quantities from globalCart; otherwise use local state
  const quantities = useMemo(() => {
    if (!isLifted || !globalCart) return localQuantities;
    const q: Record<string, number> = {};
    for (const item of globalCart) {
      q[item.id] = item.orderQty;
    }
    return q;
  }, [isLifted, globalCart, localQuantities]);

  const setQuantities = useCallback((updater: any) => {
    if (isLifted && setGlobalCart) {
      // Sync quantities back to globalCart
      const allItemsLocal = PROCEDURES.flatMap((p: any) => p.items);
      if (typeof updater === "function") {
        setGlobalCart((prevCart: CartItem[]) => {
          const prevQ: Record<string, number> = {};
          for (const c of prevCart) prevQ[c.id] = c.orderQty;
          const newQ = updater(prevQ);
          const newCart: CartItem[] = [];
          for (const [id, qty] of Object.entries(newQ)) {
            if ((qty as number) > 0) {
              const existing = prevCart.find((c) => c.id === id);
              const catalogItem = allItemsLocal.find((it: any) => it.id === id);
              newCart.push({
                id,
                name: existing?.name || catalogItem?.name || id,
                orderQty: qty as number,
              });
            }
          }
          return newCart;
        });
      } else {
        const newCart: CartItem[] = [];
        for (const [id, qty] of Object.entries(updater)) {
          if ((qty as number) > 0) {
            const catalogItem = allItemsLocal.find((it: any) => it.id === id);
            newCart.push({
              id,
              name: catalogItem?.name || id,
              orderQty: qty as number,
            });
          }
        }
        setGlobalCart(newCart);
      }
    } else {
      setLocalQuantities(updater);
    }
  }, [isLifted, setGlobalCart]);
  const [globalSearch, setGlobalSearch] = useState("");
  const [catSearch, setCatSearch] = useState("");
  const [specialRequests, setSpecialRequests] = useState([{ id: 1, text: "", photo: null, photoName: "" }]);
  const [orderNotes, setOrderNotes] = useState("");
  const [showRecommended, setShowRecommended] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [savedAssistants, setSavedAssistants] = useState([]);
  const [itemFrequency, setItemFrequency] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState(null); // { msg, action?, undo? }
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(null); // item id that triggered
  const [showStats, setShowStats] = useState(false);
  const [showAddToInventory, setShowAddToInventory] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      if (typeof window === "undefined") return false;
      const session = localStorage.getItem("asnan:auth-session");
      if (!session) return false;
      const ts = JSON.parse(session);
      return Date.now() - ts < 10 * 60 * 1000;
    } catch {
      return false;
    }
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [reorderAlerts, setReorderAlerts] = useState<Record<string, string>>({});
  const undoStackRef = useRef([]);

  const BRAND = darkMode ? BRAND_DARK : BRAND_LIGHT;

  // ============= HYDRATE FROM STORAGE =============
  useEffect(() => {
    (async () => {
      const draft = safeGet(STORAGE_KEYS.draft);
      const favs = safeGet(STORAGE_KEYS.favorites, []);
      const assts = safeGet(STORAGE_KEYS.assistants, []);
      const settings = safeGet(STORAGE_KEYS.settings, { darkMode: false });

      if (favs) setFavorites(favs);

      const mergedAssistants = Array.from(new Set([...DEFAULT_ASSISTANTS, ...(Array.isArray(assts) ? assts : [])]));
      setSavedAssistants(mergedAssistants);
      safeSet(STORAGE_KEYS.assistants, mergedAssistants);

      if (settings) setDarkMode(!!settings.darkMode);

      // Load shared data from database
      const [hist, freq] = await Promise.all([
        fetchOrderHistory(),
        fetchItemFrequencyDb(),
      ]);
      if (hist && hist.length > 0) setHistory(hist);
      if (freq && Object.keys(freq).length > 0) setItemFrequency(freq);

      // Restore draft only if the user was actively working on an order (past intro screen)
      if (draft && !isLifted && draft.step && draft.step !== "intro" && (Object.keys(draft.quantities || {}).length > 0 || (draft.specialRequests || []).some((s) => s.text))) {
        setAssistantName(draft.assistantName || "");
        setOrderDate(draft.orderDate && draft.orderDate >= todayIso() ? draft.orderDate : todayIso());
        setLocalQuantities(draft.quantities || {});
        setSpecialRequests(draft.specialRequests && draft.specialRequests.length ? draft.specialRequests : [{ id: 1, text: "", photo: null, photoName: "" }]);
        setOrderNotes(draft.orderNotes || "");
        setStep(draft.step);
        showToast("Draft restored from last session", null);
      }
      setHydrated(true);
    })();
  }, []);

  // ============= AUTO-REFILL LOW STOCK =============
  useEffect(() => {
    if (!hydrated) return;
    (async () => {
      const inv = await fetchInventoryDb();
      if (inv.length === 0) return;
      const lowItems = inv.filter((item) => item.quantity > 0 && item.quantity <= (item.reorderThreshold || 1));
      if (lowItems.length === 0) return;
      const currentQ: Record<string, number> = isLifted && globalCart ? Object.fromEntries(globalCart.map((c) => [c.id, c.orderQty])) : (localQuantities as Record<string, number>);
      const toAdd: Record<string, number> = {};
      for (const item of lowItems) {
        if (!currentQ[item.id]) toAdd[item.id] = 1;
      }
      if (Object.keys(toAdd).length === 0) return;
      setQuantities((prev: Record<string, number>) => ({ ...prev, ...toAdd }));
      const count = Object.keys(toAdd).length;
      setToast({ msg: `${count} low-stock item${count > 1 ? "s" : ""} auto-added to cart`, undo: null, id: Date.now() } as any);
      setTimeout(() => setToast((t: any) => (t && t.msg?.includes("auto-added") ? null : t)), 4500);
    })();
  }, [hydrated]);

  // ============= AUTOSAVE DRAFT =============
  useEffect(() => {
    if (!hydrated || step === "intro" || step === "done") return;
    const t = setTimeout(() => {
      safeSet(STORAGE_KEYS.draft, { assistantName, orderDate, quantities, specialRequests, orderNotes, step });
    }, 400);
    return () => clearTimeout(t);
  }, [assistantName, orderDate, quantities, specialRequests, orderNotes, hydrated, step]);

  // Save settings when toggled
  useEffect(() => {
    if (!hydrated) return;
    safeSet(STORAGE_KEYS.settings, { darkMode });
  }, [darkMode, hydrated]);

  // ============= REORDER DETECTION =============
  useEffect(() => {
    if (!hydrated || history.length === 0) return;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const alerts: Record<string, string> = {};
    for (const order of history) {
      const orderTime = new Date(order.createdAt || order.orderDate);
      if (orderTime >= thirtyDaysAgo) {
        for (const itemId of Object.keys(order.quantities || {})) {
          if (!alerts[itemId]) {
            alerts[itemId] = order.orderDate;
          }
        }
      }
    }
    setReorderAlerts(alerts);
  }, [history, hydrated]);

  // ============= HELPERS =============
  const showToast = useCallback((msg, undo = null) => {
    setToast({ msg, undo, id: Date.now() });
    setTimeout(() => setToast((t) => (t && t.msg === msg ? null : t)), 4500);
  }, []);

  const setQty = (id, q, source = null) => {
    const prev = quantities[id] || 0;
    if (q === prev) return;

    // Quantity validation: warn on huge increases (>50x)
    if (q > 0 && prev > 0 && q > prev * 50 && q > 99) {
      if (!window.confirm(`That's a big jump — set quantity to ${q}? (Tap Cancel if it was a typo.)`)) return;
    }

    setQuantities((p) => {
      const next = { ...p };
      if (q <= 0) delete next[id];
      else next[id] = q;
      return next;
    });

    // Track undo
    if (q === 0 && prev > 0) {
      undoStackRef.current.push({ id, prevQty: prev });
      const item = allItems.find((x) => x.id === id);
      showToast(`Removed ${item ? item.name.slice(0, 32) + (item.name.length > 32 ? "…" : "") : "item"}`, () => {
        setQuantities((p) => ({ ...p, [id]: prev }));
      });
    }

    // Show suggestions on first add
    if (prev === 0 && q > 0 && PAIRINGS[id] && source !== "suggestion") {
      setTimeout(() => setShowSuggestions(id), 250);
    }
  };

  const allItems = useMemo(() => {
    const flat = [];
    PROCEDURES.forEach((p) => p.items.forEach((it) => flat.push({ ...it, cat: p.key, catLabel: p.label, catIcon: p.icon })));
    return flat;
  }, []);

  const totals = useMemo(() => {
    let count = 0;
    Object.entries(quantities).forEach(([id, q]) => {
      if (allItems.find((x) => x.id === id)) count += q;
    });
    return { count };
  }, [quantities, allItems]);

  // Frequently ordered (top 12 by frequency)
  const frequentItems = useMemo(() => {
    return Object.entries(itemFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 12)
      .map(([id]) => allItems.find((x) => x.id === id))
      .filter(Boolean);
  }, [itemFrequency, allItems]);

  const favoriteItems = useMemo(() => favorites.map((id) => allItems.find((x) => x.id === id)).filter(Boolean), [favorites, allItems]);

  // Fuzzy + standard search
  const fuzzyMatch = (text, query) => {
    const t = text.toLowerCase();
    const q = query.toLowerCase().trim();
    if (!q) return false;
    if (t.includes(q)) return true;
    // Simple typo-tolerant: check if all letters of query appear in order
    let i = 0;
    for (const c of t) {
      if (c === q[i]) i++;
      if (i === q.length) return true;
    }
    return false;
  };

  const globalResults = useMemo(() => {
    if (!globalSearch.trim()) return [];
    return allItems
      .filter((it) => fuzzyMatch(it.name, globalSearch) || fuzzyMatch(it.mfr || "", globalSearch))
      .slice(0, 50);
  }, [globalSearch, allItems]);

  const filteredCatItems = useMemo(() => {
    if (!activeCat || activeCat === "special") return [];
    const items = CATALOG[activeCat].items;
    if (!catSearch.trim()) return items;
    return items.filter((it) => fuzzyMatch(it.name, catSearch) || fuzzyMatch(it.mfr || "", catSearch));
  }, [activeCat, catSearch]);

  const canProceed = assistantName.trim().length > 0 && orderDate && orderDate >= todayIso();
  const validSpecials = specialRequests.filter((s) => s.text.trim().length > 0);
  const specialsWithoutPhoto = validSpecials.filter((s) => !s.photo);

  // ============= PHOTO =============
  const handlePhotoUpload = (id, file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please upload an image (JPG, PNG, etc.)");
      setTimeout(() => setPhotoError(""), 3000);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image must be under 5 MB");
      setTimeout(() => setPhotoError(""), 3000);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      // Compress / scale image to keep storage manageable
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
        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL("image/jpeg", 0.78);
        setSpecialRequests((p) => p.map((x) => (x.id === id ? { ...x, photo: compressed, photoName: file.name } : x)));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // ============= FAVORITES =============
  const toggleFavorite = (id) => {
    setFavorites((p) => {
      const next = p.includes(id) ? p.filter((x) => x !== id) : [...p, id];
      safeSet(STORAGE_KEYS.favorites, next);
      showToast(p.includes(id) ? `Removed from favorites` : `★ Added to favorites`);
      return next;
    });
  };

  // ============= ASSISTANT NAMES =============
  const saveAssistantName = (name) => {
    if (!name || !name.trim()) return;
    setSavedAssistants((p) => {
      const trimmed = name.trim();
      if (p.includes(trimmed)) return p;
      const next = [...p, trimmed];
      safeSet(STORAGE_KEYS.assistants, next);
      return next;
    });
  };

  const registerEmployee = () => {
    const trimmed = newEmployeeName.trim();
    if (!trimmed) {
      showToast("Enter an employee name first");
      return;
    }
    saveAssistantName(trimmed);
    setAssistantName(trimmed);
    setNewEmployeeName("");
    showToast("Employee added");
  };

  // ============= ORDER COMPLETION =============
  const finalizeOrder = async () => {
    saveAssistantName(assistantName);

    // Increment item frequency in database
    const increments: Record<string, number> = {};
    Object.keys(quantities).forEach((id) => {
      increments[id] = 1;
    });
    const newFreq = await incrementItemFrequencyDb(increments);
    if (newFreq && Object.keys(newFreq).length > 0) {
      setItemFrequency(newFreq);
    }

    // Save to database (shared across all users)
    const orderRecord = {
      assistantName,
      orderDate,
      quantities: { ...quantities },
      specialRequests: validSpecials.map((s) => ({ ...s, photo: null })),
      orderNotes,
      itemCount: totals.count + validSpecials.length,
    };
    await saveOrderToDb(orderRecord);

    // Refresh history from database
    const updatedHistory = await fetchOrderHistory();
    setHistory(updatedHistory);

    // Trigger delivery loop if lifted
    if (isLifted && onCheckout) {
      const cartItems = Object.entries(quantities).map(([id, qty]) => {
        const item = allItems.find((x) => x.id === id);
        return { id, name: item?.name || id, orderQty: qty as number };
      }).filter((c) => c.orderQty > 0);
      onCheckout(cartItems);
    }

    // Clear draft
    safeDelete(STORAGE_KEYS.draft);
  };

  const reorderFromHistory = (record) => {
    if (!isHistoryEditable(record)) {
      showToast("Orders are locked 24 hours after confirmation");
      return;
    }
    setQuantities(record.quantities || {});
    setSpecialRequests(
      record.specialRequests && record.specialRequests.length
        ? record.specialRequests.map((s, i) => ({ ...s, id: Date.now() + i, photo: null, photoName: "" }))
        : [{ id: 1, text: "", photo: null, photoName: "" }]
    );
    setOrderNotes(record.orderNotes || "");
    setShowHistory(false);
    setStep("category");
    showToast(`Loaded ${record.itemCount} items from order on ${record.orderDate}`);
  };

  const startNewOrder = () => {
    setQuantities({});
    setSpecialRequests([{ id: 1, text: "", photo: null, photoName: "" }]);
    setOrderNotes("");
    setStep("intro");
    setAssistantName("");
    setGlobalSearch("");
    setOrderDate(todayIso());
    safeDelete(STORAGE_KEYS.draft);
  };

  // ============= PDF =============
  const getReorderItemsForPdf = () => {
    const reordered: { name: string; lastDate: string }[] = [];
    Object.entries(quantities).forEach(([id, q]) => {
      if (reorderAlerts[id]) {
        const it = allItems.find((x) => x.id === id);
        if (it) reordered.push({ name: it.name, lastDate: reorderAlerts[id] });
      }
    });
    return reordered;
  };

  const handleSavePDF = () => {
    const grouped = {};
    Object.entries(quantities).forEach(([id, q]) => {
      const it = allItems.find((x) => x.id === id);
      if (!it) return;
      if (!grouped[it.cat]) grouped[it.cat] = [];
      grouped[it.cat].push({ ...it, qty: q });
    });

    const bySupplier = {};
    Object.entries(quantities).forEach(([id, q]) => {
      const it = allItems.find((x) => x.id === id);
      if (!it) return;
      const sup = it.supplier || "Other";
      if (!bySupplier[sup]) bySupplier[sup] = [];
      bySupplier[sup].push({ ...it, qty: q });
    });

    const reorderedItems = getReorderItemsForPdf();

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Asnan Dental — Order ${orderDate}</title>
<style>
  @page { size: A4; margin: 16mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Manrope', -apple-system, system-ui, sans-serif; color: ${BRAND_LIGHT.ink}; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .header { background: ${BRAND_LIGHT.primary}; color: white; padding: 24px 28px; border-radius: 16px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; }
  .header-left { display: flex; align-items: center; gap: 16px; }
  .logo-img { width: 60px; height: 60px; object-fit: contain; border-radius: 8px; }
  .logo-text { line-height: 1; }
  .logo-text .l1, .logo-text .l2 { display: block; font-weight: 800; letter-spacing: 0.18em; font-size: 14px; }
  .logo-text .l2 { margin-top: 4px; }
  .doc-title { text-align: right; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.85; }
  .doc-title strong { display: block; font-size: 22px; letter-spacing: -0.01em; text-transform: none; margin-top: 4px; font-weight: 700; }
  .meta { display: flex; gap: 32px; padding: 16px 0 24px; border-bottom: 2px solid ${BRAND_LIGHT.borderSolid}; margin-bottom: 24px; flex-wrap: wrap; }
  .meta-item { font-size: 11px; }
  .meta-label { color: ${BRAND_LIGHT.muted}; text-transform: uppercase; letter-spacing: 0.18em; font-weight: 600; font-size: 9px; margin-bottom: 4px; }
  .meta-value { font-size: 16px; font-weight: 600; color: ${BRAND_LIGHT.ink}; }
  .notes-block { background: ${BRAND_LIGHT.warningBg}; border-left: 3px solid ${BRAND_LIGHT.warning}; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 12px; line-height: 1.5; }
  .notes-block strong { display: block; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #92400E; margin-bottom: 4px; }
  .reorder-block { background: rgba(255,59,48,0.06); border-left: 3px solid ${BRAND_LIGHT.danger}; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 12px; line-height: 1.5; }
  .reorder-block strong { display: block; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: ${BRAND_LIGHT.danger}; margin-bottom: 4px; }
  .reorder-block ul { margin: 4px 0 0 16px; padding: 0; }
  .reorder-block li { margin-bottom: 2px; }
  h2.cat { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: ${BRAND_LIGHT.primaryDeep}; margin: 22px 0 10px; padding-bottom: 6px; border-bottom: 1.5px solid ${BRAND_LIGHT.primary}; font-weight: 700; }
  h2.supplier { font-size: 13px; color: ${BRAND_LIGHT.ink}; background: ${BRAND_LIGHT.paper}; padding: 10px 14px; border-radius: 8px; margin: 24px 0 12px; font-weight: 700; display: flex; align-items: center; justify-content: space-between; }
  h2.supplier .badge { font-size: 9px; letter-spacing: 0.15em; background: ${BRAND_LIGHT.primary}; color: white; padding: 4px 8px; border-radius: 999px; font-weight: 700; text-transform: uppercase; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 11px; }
  th { text-align: left; padding: 8px 10px; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: ${BRAND_LIGHT.muted}; border-bottom: 1px solid ${BRAND_LIGHT.borderSolid}; font-weight: 600; }
  td { padding: 9px 10px; border-bottom: 1px solid #F0F0F2; vertical-align: top; }
  td.qty { text-align: right; font-weight: 700; font-size: 14px; color: ${BRAND_LIGHT.primaryDeep}; width: 60px; }
  td.name { font-weight: 600; }
  td.detail { color: ${BRAND_LIGHT.muted}; font-size: 10px; }
  .reorder-tag { display: inline-block; background: rgba(255,59,48,0.06); color: ${BRAND_LIGHT.danger}; font-size: 8px; font-weight: 700; padding: 1px 6px; border-radius: 4px; margin-left: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
  .summary { margin-top: 24px; padding: 16px 20px; background: ${BRAND_LIGHT.paper}; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; border: 1px solid ${BRAND_LIGHT.borderSolid}; }
  .summary-label { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: ${BRAND_LIGHT.muted}; font-weight: 600; }
  .summary-count { font-size: 28px; font-weight: 700; color: ${BRAND_LIGHT.ink}; letter-spacing: -0.02em; }
  .special { background: ${BRAND_LIGHT.paper}; padding: 14px 16px; border-radius: 10px; margin-bottom: 10px; border-left: 3px solid ${BRAND_LIGHT.primary}; page-break-inside: avoid; display: flex; gap: 14px; align-items: flex-start; }
  .special-num { font-size: 9px; letter-spacing: 0.18em; color: ${BRAND_LIGHT.muted}; font-weight: 700; min-width: 28px; padding-top: 4px; }
  .special-content { flex: 1; }
  .special-text { font-size: 12px; line-height: 1.55; }
  .special-img { width: 110px; height: 110px; object-fit: cover; border-radius: 8px; border: 1px solid ${BRAND_LIGHT.borderSolid}; flex-shrink: 0; }
  .footer { margin-top: 36px; padding-top: 14px; border-top: 1px solid ${BRAND_LIGHT.borderSolid}; font-size: 9px; color: ${BRAND_LIGHT.muted}; text-align: center; letter-spacing: 0.15em; text-transform: uppercase; }
  @media screen { body { background: #F0F0F5; padding: 32px; } .doc { background: white; max-width: 800px; margin: 0 auto; padding: 32px; box-shadow: 0 20px 60px rgba(0,0,0,0.08); border-radius: 12px; } }
  @media print { body { background: white; padding: 0; } .doc { box-shadow: none; padding: 0; max-width: none; } }
</style>
</head>
<body>
  <div class="doc">
    <div class="header">
      <div class="header-left">
        <img class="logo-img" src="/logo.jpeg" alt="Asnan Dental" />
        <div class="logo-text">
          <span class="l1">ASNAN</span>
          <span class="l2">DENTAL</span>
        </div>
      </div>
      <div class="doc-title">
        Inventory Order
        <strong>${orderDate}</strong>
      </div>
    </div>

    <div class="meta">
      <div class="meta-item">
        <div class="meta-label">Assistant</div>
        <div class="meta-value">${escapeHtml(assistantName)}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Date of Order</div>
        <div class="meta-value">${orderDate}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Total Lines</div>
        <div class="meta-value">${Object.keys(quantities).length + validSpecials.length}</div>
      </div>
    </div>

    ${orderNotes.trim() ? `<div class="notes-block"><strong>Order Notes</strong>${escapeHtml(orderNotes)}</div>` : ""}

    ${reorderedItems.length > 0 ? `<div class="reorder-block"><strong>Re-Order Alert — Items ordered within the last 30 days</strong><ul>${reorderedItems.map((r) => `<li>${escapeHtml(r.name)} (last ordered: ${r.lastDate})</li>`).join("")}</ul></div>` : ""}

    ${
      Object.keys(bySupplier).length > 0
        ? Object.entries(bySupplier)
            .map(
              ([sup, items]) => `
              <h2 class="supplier">${escapeHtml(sup)}<span class="badge">${items.length} item${items.length > 1 ? "s" : ""}</span></h2>
              ${PROCEDURES.filter((p) => items.some((it) => it.cat === p.key))
                .map((p) => {
                  const itemsInCat = items.filter((it) => it.cat === p.key);
                  return `
                    <h2 class="cat">${p.label}</h2>
                    <table>
                      <thead><tr><th>Item</th><th style="text-align:right;">Qty</th></tr></thead>
                      <tbody>
                        ${itemsInCat
                          .map(
                            (it) => `
                          <tr>
                            <td>
                              <div class="name">${escapeHtml(it.name)}${reorderAlerts[it.id] ? `<span class="reorder-tag">Re-order</span>` : ""}</div>
                              <div class="detail">${escapeHtml(it.mfr || "")} · ${escapeHtml(it.pkg || "")}</div>
                            </td>
                            <td class="qty">${it.qty}</td>
                          </tr>`
                          )
                          .join("")}
                      </tbody>
                    </table>`;
                })
                .join("")}`
            )
            .join("")
        : ""
    }

    ${
      validSpecials.length > 0
        ? `<h2 class="cat">Special Requests</h2>
        ${validSpecials
          .map(
            (s, i) => `
          <div class="special">
            <div class="special-num">${String(i + 1).padStart(2, "0")}</div>
            <div class="special-content">
              <div class="special-text">${escapeHtml(s.text)}</div>
            </div>
            ${s.photo ? `<img class="special-img" src="${s.photo}" alt="product" />` : ""}
          </div>`
          )
          .join("")}`
        : ""
    }

    <div class="summary">
      <div><div class="summary-label">Items in Order</div></div>
      <div class="summary-count">${totals.count + validSpecials.length}</div>
    </div>

    <div class="footer">Asnan Dental · Generated ${new Date().toLocaleString()}</div>
  </div>
</body>
</html>`;

    try {
      window.__asnanLastHtml = html;
      downloadHtmlFallback(html, `Asnan-Order-${orderDate}.html`);
    } catch {
      downloadHtmlFallback(html, `Asnan-Order-${orderDate}.html`);
    }
  };

  const downloadHtmlFallback = (html, filename) => {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // ============= EMAIL =============
  const handleEmail = () => {
    const subject = `Asnan Dental Order — ${orderDate}`;
    const body = buildPlainTextOrder();
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleSendToConfirm = () => {
    handleSavePDF();
    const subject = `Order Confirmation — Asnan Dental — ${orderDate}`;
    const body = buildPlainTextOrder() + "\n\n---\nPlease find the order document attached to this email.";
    setTimeout(() => {
      window.location.href = `mailto:Nawaf@asnandental.ca?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }, 500);
  };

  const handleCopyText = async () => {
    const text = buildPlainTextOrder();
    try {
      await navigator.clipboard.writeText(text);
      showToast("Order copied to clipboard");
    } catch {
      showToast("Could not copy — try another browser");
    }
  };

  const buildPlainTextOrder = () => {
    let out = `ASNAN DENTAL — INVENTORY ORDER\n`;
    out += `Date: ${orderDate}\nAssistant: ${assistantName}\n`;
    out += `Total Lines: ${totals.count + validSpecials.length}\n`;
    if (orderNotes.trim()) out += `\nNOTES: ${orderNotes}\n`;
    out += `\n${"=".repeat(50)}\n`;
    PROCEDURES.forEach((p) => {
      const items = Object.entries(quantities)
        .map(([id, q]) => ({ ...allItems.find((x) => x.id === id), qty: q }))
        .filter((it) => it && it.cat === p.key);
      if (items.length === 0) return;
      out += `\n${p.label.toUpperCase()}\n${"-".repeat(p.label.length)}\n`;
      items.forEach((it) => {
        out += `  ${it.qty}× ${it.name} (${it.mfr}, ${it.pkg})\n`;
      });
    });
    if (validSpecials.length > 0) {
      out += `\nSPECIAL REQUESTS\n${"-".repeat(16)}\n`;
      validSpecials.forEach((s, i) => {
        out += `  ${i + 1}. ${s.text}${s.photo ? "  [photo attached]" : ""}\n`;
      });
    }
    return out;
  };

  // ============= HEADER =============
  const Header = ({ title, sub, onBack, showCart = true, rightSlot = null }) => (
    <header className="sticky top-0 z-30 border-b" style={{ background: BRAND.glass, backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)", borderColor: BRAND.glassBorder }}>
      <div className="px-4 pt-3 pb-3 flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="w-9 h-9 -ml-1 flex items-center justify-center rounded-full hover-scale transition-apple" style={{ color: BRAND.ink }} aria-label="Back">
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
        )}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <AsnanLogo size={26} />
          <div className="flex flex-col leading-none ml-0.5">
            <span className="text-[11px] font-bold tracking-[0.18em]" style={{ color: BRAND.ink }}>ASNAN</span>
            <span className="text-[11px] font-bold tracking-[0.18em] mt-0.5" style={{ color: BRAND.ink }}>DENTAL</span>
          </div>
        </div>
        {rightSlot}
        {showCart && step !== "intro" && step !== "done" && totals.count > 0 && (
          <button onClick={() => setStep("review")} className="relative flex items-center gap-1.5 px-3.5 h-9 rounded-full text-white text-xs font-semibold hover-scale transition-apple" style={{ background: BRAND.primary, boxShadow: `0 4px 12px ${BRAND.primary}40` }}>
            <ShoppingCart size={14} strokeWidth={2.5} />
            <span className="tabular-nums">{totals.count}</span>
          </button>
        )}
      </div>
      {title && (
        <div className="px-4 pb-2 text-[11px] tracking-wide" style={{ color: BRAND.muted }}>
          {title}{sub && <span style={{ color: BRAND.primary }}> · {sub}</span>}
        </div>
      )}
    </header>
  );

  const ToastBar = () => {
    if (!toast) return null;
    return (
      <div className="fixed bottom-24 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
        <div className="animate-slide-up rounded-2xl px-5 py-3.5 text-xs font-semibold flex items-center gap-3 pointer-events-auto" style={{ background: BRAND.glass, backdropFilter: "blur(40px) saturate(200%)", WebkitBackdropFilter: "blur(40px) saturate(200%)", color: BRAND.ink, border: `1px solid ${BRAND.glassBorder}`, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
          <span>{toast.msg}</span>
          {toast.undo && (
            <button
              onClick={() => {
                toast.undo();
                setToast(null);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider hover-scale transition-apple"
              style={{ background: BRAND.primary, color: "white" }}
            >
              <RotateCcw size={11} strokeWidth={3} /> Undo
            </button>
          )}
        </div>
      </div>
    );
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === APP_PASSWORD) {
      setIsLoggedIn(true);
      setPasswordInput("");
      setPasswordError("");
      try { localStorage.setItem("asnan:auth-session", JSON.stringify(Date.now())); } catch {}
      return;
    }
    setPasswordError("Incorrect password");
  };

  // ============= PASSWORD GATE =============
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: BRAND.paper, color: BRAND.ink, fontFamily: "'Manrope', system-ui, sans-serif" }}>
        <FontLink />
        <form onSubmit={handlePasswordSubmit} className="w-full max-w-sm rounded-3xl p-6 animate-slide-up" style={{ background: BRAND.glass, backdropFilter: "blur(40px) saturate(200%)", WebkitBackdropFilter: "blur(40px) saturate(200%)", border: `1px solid ${BRAND.glassBorder}`, boxShadow: "0 8px 24px rgba(0,0,0,0.06), 0 24px 60px rgba(0,0,0,0.12)" }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})`, boxShadow: `0 4px 12px ${BRAND.primary}30` }}>
              <Lock size={22} color="#fff" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em] font-bold" style={{ color: BRAND.muted }}>Asnan Dental</div>
              <h1 className="text-2xl font-bold leading-tight mt-0.5">Supply Ordering</h1>
            </div>
          </div>
          <label className="block text-[10px] uppercase tracking-[0.2em] font-bold mt-7 mb-2" style={{ color: BRAND.muted }}>
            Password
          </label>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              setPasswordError("");
            }}
            autoFocus
            className="w-full h-12 px-4 rounded-2xl outline-none text-base transition-apple"
            style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1.5px solid ${passwordError ? BRAND.danger : BRAND.border}`, color: BRAND.ink }}
          />
          {passwordError && <div className="mt-2 text-xs font-semibold" style={{ color: BRAND.danger }}>{passwordError}</div>}
          <button type="submit" className="mt-5 w-full h-12 rounded-2xl text-white text-sm font-semibold transition-apple hover-scale active:scale-[0.98]" style={{ background: BRAND.primary, boxShadow: `0 4px 16px ${BRAND.primary}30` }}>
            Log In
          </button>
        </form>
      </div>
    );
  }

  // ============= INTRO =============
  if (step === "intro") {
    return (
      <div className="min-h-screen" style={{ background: BRAND.paper, color: BRAND.ink, fontFamily: "'Manrope', system-ui, sans-serif" }}>
        <FontLink />
        <div className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-80 pointer-events-none" style={{ background: `linear-gradient(180deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 50%, ${BRAND.paper} 100%)` }} />
          <div className="absolute top-10 right-[-60px] w-64 h-64 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.12)", filter: "blur(80px)" }} />
          <div className="absolute top-28 left-[-50px] w-48 h-48 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.08)", filter: "blur(60px)" }} />

          <div className="absolute top-4 right-4 z-10 flex gap-1.5">
            <a href="/inventory" target="_blank" rel="noopener noreferrer" className="h-10 px-3.5 rounded-full flex items-center gap-1.5 text-white hover-scale transition-apple" style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }} aria-label="Digital Inventory">
              <Package size={14} />
              <span className="text-[11px] font-semibold">Inventory</span>
            </a>
            <button onClick={() => setDarkMode((d) => !d)} className="w-10 h-10 rounded-full flex items-center justify-center text-white hover-scale transition-apple" style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }} aria-label="Toggle dark mode">
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={() => setShowSettings(true)} className="w-10 h-10 rounded-full flex items-center justify-center text-white hover-scale transition-apple" style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }} aria-label="Settings">
              <Settings size={16} />
            </button>
          </div>

          <div className="relative px-6 pt-20 pb-10 flex flex-col items-center text-center">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/80 font-semibold">Inventory Ordering</span>
              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
            </div>
            <h1 className="text-white leading-[0.95] mt-3 font-bold" style={{ fontSize: "2.5rem", letterSpacing: "-0.02em" }}>
              Stock the<br />operatory.
            </h1>
            <p className="text-white/85 text-sm mt-3 max-w-xs leading-relaxed">
              Tell us who's ordering today and we'll walk through it together.
            </p>
          </div>
        </div>

        <div className="px-6 pb-8 -mt-2">
          <div className="rounded-3xl p-6" style={{ background: BRAND.glass, backdropFilter: "blur(40px) saturate(200%)", WebkitBackdropFilter: "blur(40px) saturate(200%)", border: `1px solid ${BRAND.glassBorder}`, boxShadow: BRAND.cardShadow }}>
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold mb-2" style={{ color: BRAND.muted }}>
                  Assistant's Name <span style={{ color: BRAND.primary }}>*</span>
                </label>
                <select
                  value={assistantName}
                  onChange={(e) => setAssistantName(e.target.value)}
                  className="w-full px-0 py-2 text-lg border-0 border-b-2 outline-none bg-transparent transition-apple"
                  style={{ borderColor: BRAND.borderSolid, color: BRAND.ink }}
                  onFocus={(e) => (e.target.style.borderColor = BRAND.primary)}
                  onBlur={(e) => (e.target.style.borderColor = BRAND.borderSolid)}
                >
                  <option value="">Select staff member</option>
                  {savedAssistants.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                  <input
                    type="text"
                    value={newEmployeeName}
                    onChange={(e) => setNewEmployeeName(e.target.value)}
                    placeholder="Register new employee"
                    className="min-w-0 h-11 px-3 rounded-xl text-sm outline-none transition-apple"
                    style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }}
                  />
                  <button
                    type="button"
                    onClick={registerEmployee}
                    className="h-11 px-4 rounded-xl text-xs font-bold text-white uppercase tracking-wide hover-scale transition-apple"
                    style={{ background: BRAND.primary, boxShadow: `0 2px 8px ${BRAND.primary}30` }}
                  >
                    Add
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold mb-2" style={{ color: BRAND.muted }}>
                  Date of Order <span style={{ color: BRAND.primary }}>*</span>
                </label>
                <input
                  type="date"
                  value={orderDate}
                  min={todayIso()}
                  onChange={(e) => setOrderDate(e.target.value < todayIso() ? todayIso() : e.target.value)}
                  className="w-full px-0 py-2 text-lg border-0 border-b-2 outline-none bg-transparent transition-apple"
                  style={{ borderColor: BRAND.borderSolid, color: BRAND.ink, colorScheme: darkMode ? "dark" : "light" }}
                  onFocus={(e) => (e.target.style.borderColor = BRAND.primary)}
                  onBlur={(e) => (e.target.style.borderColor = BRAND.borderSolid)}
                />
                <div className="text-[10px] mt-2" style={{ color: BRAND.muted }}>Defaults to today. Past dates are not allowed.</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => canProceed && setStep("category")}
            disabled={!canProceed}
            className="mt-5 w-full h-14 rounded-2xl text-white font-semibold tracking-wide flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-apple hover-scale active:scale-[0.98]"
            style={{ background: BRAND.primary, boxShadow: canProceed ? `0 4px 16px ${BRAND.primary}30` : "none" }}
          >
            <span>Begin Order</span>
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => setShowHistory(true)} className="h-12 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 hover-lift transition-apple" style={{ border: `1px solid ${BRAND.border}`, color: BRAND.muted, background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
              <Clock size={15} />
              History
              {history.length > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: BRAND.primary, color: "white" }}>{history.length}</span>}
            </button>
            <button onClick={() => setShowFavorites(true)} className="h-12 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 hover-lift transition-apple" style={{ border: `1px solid ${BRAND.border}`, color: BRAND.muted, background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
              <Star size={15} />
              Favorites
              {favorites.length > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: BRAND.primary, color: "white" }}>{favorites.length}</span>}
            </button>
            <button onClick={() => setShowStats(true)} className="h-12 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 hover-lift transition-apple" style={{ border: `1px solid ${BRAND.border}`, color: BRAND.muted, background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
              <BarChart3 size={15} />
              Statistics
            </button>
            <a href="/rct" target="_blank" rel="noopener noreferrer" className="h-12 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 hover-lift transition-apple" style={{ border: `1px solid ${BRAND.border}`, color: BRAND.muted, background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", textDecoration: "none" }}>
              <CircleDot size={15} />
              RCT Files
            </a>
          </div>

          <button onClick={() => setShowAddToInventory(true)} className="mt-2 w-full h-12 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 hover-lift transition-apple" style={{ border: `1px solid ${BRAND.primary}30`, color: BRAND.primary, background: `${BRAND.primary}08`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
            <Package size={15} />
            Add to Inventory
          </button>

          <button onClick={() => setShowRecommended(true)} className="mt-2 w-full h-11 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-apple hover-scale" style={{ color: BRAND.muted }}>
            <AlertCircle size={13} />
            View Catalog Gap Analysis
          </button>
        </div>

        <ToastBar />
        {showRecommended && <RecommendedModal onClose={() => setShowRecommended(false)} BRAND={BRAND} />}
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} BRAND={BRAND} darkMode={darkMode} setDarkMode={setDarkMode} savedAssistants={savedAssistants} history={history} setHistory={setHistory} favorites={favorites} setFavorites={setFavorites} itemFrequency={itemFrequency} setItemFrequency={setItemFrequency} showToast={showToast} />}
        {showHistory && <HistoryModal onClose={() => setShowHistory(false)} BRAND={BRAND} history={history} reorder={reorderFromHistory} allItems={allItems} />}
        {showFavorites && <FavoritesModal onClose={() => setShowFavorites(false)} BRAND={BRAND} favoriteItems={favoriteItems} quantities={quantities} setQty={setQty} toggleFavorite={toggleFavorite} onProceed={() => { setShowFavorites(false); if (!canProceed) return; setStep("category"); }} canProceed={canProceed} />}
        {showStats && <StatsModal onClose={() => setShowStats(false)} BRAND={BRAND} history={history} itemFrequency={itemFrequency} allItems={allItems} />}
        {showAddToInventory && <AddToInventoryModal onClose={() => setShowAddToInventory(false)} BRAND={BRAND} allItems={allItems} showToast={showToast} onInventoryUpdated={onInventoryUpdated} />}
      </div>
    );
  }

  // ============= CATEGORY (Main) =============
  if (step === "category") {
    return (
      <div className={`min-h-screen pb-32 ${BRAND.isDark ? 'mesh-gradient-dark' : 'mesh-gradient-light'}`} style={{ background: BRAND.paper, color: BRAND.ink, fontFamily: "'Manrope', system-ui, sans-serif" }}>
        <FontLink />
        <Header
          title={`Hello, ${assistantName.split(" ")[0]}`}
          sub={orderDate}
          onBack={() => setStep("intro")}
          rightSlot={
            <div className="flex items-center gap-1.5">
              <a href="/inventory" target="_blank" rel="noopener noreferrer" className="h-9 px-3 flex items-center gap-1.5 rounded-full hover-scale transition-apple" style={{ background: `${BRAND.primary}12`, color: BRAND.primary }} aria-label="Digital Inventory">
                <Package size={14} strokeWidth={2.5} />
                <span className="text-[11px] font-semibold hidden sm:inline">Inventory</span>
              </a>
              <button onClick={() => setDarkMode((d) => !d)} className="w-9 h-9 flex items-center justify-center rounded-full hover-scale transition-apple" style={{ color: BRAND.muted }} aria-label="Toggle dark">
                {darkMode ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            </div>
          }
        />

        <div className="px-5 pt-5">
          <h2 className="text-[28px] leading-[1.1] font-bold" style={{ letterSpacing: "-0.02em" }}>
            Search anything, or<br />
            <span style={{ color: BRAND.primary }}>browse by procedure.</span>
          </h2>
        </div>

        {/* GLOBAL SEARCH */}
        <div className="px-5 mt-5 sticky top-[88px] z-20 pb-2" style={{ background: BRAND.paper }}>
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: BRAND.primary }} />
            <input
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search all items, manufacturers…"
              className="w-full h-14 pl-12 pr-12 rounded-2xl text-sm font-medium outline-none transition-apple"
              style={{ background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `2px solid ${globalSearch ? BRAND.primary : BRAND.border}`, color: BRAND.ink, boxShadow: globalSearch ? `0 0 0 3px ${BRAND.primary}15` : BRAND.cardShadow }}
            />
            {globalSearch && (
              <button onClick={() => setGlobalSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover-scale transition-apple" style={{ color: BRAND.muted }}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {globalSearch.trim() && (
          <div className="px-5 mt-3">
            <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: BRAND.muted }}>
              {globalResults.length} result{globalResults.length !== 1 ? "s" : ""}
            </div>
            <div className="space-y-2">
              {globalResults.length === 0 && (
                <div className="text-center py-12 text-sm" style={{ color: BRAND.muted }}>
                  Nothing in the catalog matches "{globalSearch}". Try Special Requests instead.
                </div>
              )}
              {globalResults.map((it) => {
                const qty = quantities[it.id] || 0;
                const Icon = it.catIcon;
                const isFav = favorites.includes(it.id);
                return (
                  <div key={it.id} className="rounded-2xl p-3 transition-apple hover-lift" style={{ background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${qty > 0 ? BRAND.primary : BRAND.glassBorder}`, boxShadow: qty > 0 ? `inset 3px 0 0 ${BRAND.primary}, ${BRAND.cardShadow}` : BRAND.cardShadow }}>
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon size={11} style={{ color: BRAND.primary }} />
                          <span className="text-[9px] uppercase tracking-[0.18em] font-bold" style={{ color: BRAND.primary }}>{it.catLabel}</span>
                        </div>
                        <div className="text-sm font-semibold leading-snug" style={{ color: BRAND.ink }}>{it.name}</div>
                        <div className="text-[11px] mt-1" style={{ color: BRAND.muted }}>
                          {it.mfr} · {it.pkg}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <button onClick={() => toggleFavorite(it.id)} className="w-7 h-7 flex items-center justify-center hover-scale transition-apple" aria-label="Favorite">
                          <Star size={14} fill={isFav ? BRAND.primary : "none"} color={isFav ? BRAND.primary : BRAND.muted} strokeWidth={2} />
                        </button>
                        <QtyControl qty={qty} onChange={(q) => setQty(it.id, q)} BRAND={BRAND} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!globalSearch.trim() && (
          <>
            {/* Frequently ordered */}
            {frequentItems.length > 0 && (
              <div className="px-5 mt-5">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: BRAND.muted }}>
                  <TrendingUp size={11} /> Frequently Ordered
                </div>
                <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-5 px-5" style={{ scrollbarWidth: "none" }}>
                  {frequentItems.map((it) => {
                    const qty = quantities[it.id] || 0;
                    return (
                      <button
                        key={it.id}
                        onClick={() => setQty(it.id, qty + 1)}
                        className="flex-shrink-0 w-44 rounded-2xl p-3 text-left transition-apple hover-lift relative"
                        style={{ background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${qty > 0 ? BRAND.primary : BRAND.glassBorder}`, boxShadow: BRAND.cardShadow }}
                      >
                        <div className="text-[9px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: BRAND.primary }}>{it.catLabel}</div>
                        <div className="text-xs font-semibold leading-snug line-clamp-2" style={{ color: BRAND.ink, minHeight: "2.5em" }}>{it.name}</div>
                        <div className="text-[10px] mt-1" style={{ color: BRAND.muted }}>{it.mfr}</div>
                        {qty > 0 && (
                          <div className="absolute top-2 right-2 min-w-[24px] h-6 px-1.5 rounded-full text-white text-[11px] font-bold flex items-center justify-center" style={{ background: BRAND.primary, boxShadow: `0 2px 8px ${BRAND.primary}40` }}>
                            {qty}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="px-5 mt-5">
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: BRAND.muted }}>By Procedure</div>
            </div>
            <div className="px-5 mt-3 space-y-2.5">
              {PROCEDURES.map((p, i) => {
                const Icon = p.icon;
                const catCount = p.items.reduce((s, it) => s + (quantities[it.id] || 0), 0);
                return (
                  <button
                    key={p.key}
                    onClick={() => {
                      setActiveCat(p.key);
                      setCatSearch("");
                      setStep("items");
                    }}
                    className="group w-full rounded-2xl p-4 flex items-center gap-4 transition-apple hover-lift text-left"
                    style={{ background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${BRAND.glassBorder}`, boxShadow: BRAND.cardShadow }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-apple" style={{ background: `${BRAND.primary}12`, color: BRAND.primary }}>
                      <Icon size={22} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold tabular-nums" style={{ color: BRAND.muted }}>0{i + 1}</span>
                        {catCount > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: BRAND.primary }}>
                            {catCount} added
                          </span>
                        )}
                      </div>
                      <div className="text-base mt-0.5 leading-tight font-bold" style={{ color: BRAND.ink }}>{p.label}</div>
                      <div className="text-xs mt-0.5" style={{ color: BRAND.muted }}>{p.items.length} items</div>
                    </div>
                    <ChevronRight size={18} className="transition-apple" style={{ color: BRAND.muted }} strokeWidth={2.5} />
                  </button>
                );
              })}

              <button
                onClick={() => {
                  setActiveCat("special");
                  setStep("items");
                }}
                className="group w-full rounded-2xl p-4 flex items-center gap-4 transition-apple hover-lift text-left text-white"
                style={{ background: `linear-gradient(135deg, ${BRAND.ink} 0%, ${BRAND.isDark ? '#2C2C2E' : '#3A3A3C'} 100%)`, boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${BRAND.primary}30`, color: "white" }}>
                  <FileText size={22} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: BRAND.primary }}>Anything Else</div>
                  <div className="text-base mt-0.5 leading-tight font-bold">Special Requests</div>
                  <div className="text-xs mt-0.5 text-white/60">Items not in the catalog · photo required</div>
                </div>
                <ChevronRight size={18} className="text-white/60 transition-apple" strokeWidth={2.5} />
              </button>
            </div>
          </>
        )}

        {totals.count > 0 && (
          <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-4 pt-2" style={{ background: `linear-gradient(to top, ${BRAND.paper} 60%, transparent)` }}>
            <button onClick={() => setStep("review")} className="w-full h-14 rounded-2xl text-white font-semibold flex items-center justify-between px-5 transition-apple hover-scale active:scale-[0.98]" style={{ background: BRAND.primary, boxShadow: `0 8px 24px ${BRAND.primary}30` }}>
              <span className="flex items-center gap-2">
                <ShoppingCart size={16} strokeWidth={2.5} />
                <span>Review Order</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="tabular-nums text-white/80">{totals.count} items</span>
                <ChevronRight size={18} strokeWidth={2.5} />
              </span>
            </button>
          </div>
        )}

        <ToastBar />
        {showSuggestions && <SuggestionsModal sourceId={showSuggestions} pairs={PAIRINGS[showSuggestions] || []} allItems={allItems} quantities={quantities} setQty={(id, q) => setQty(id, q, "suggestion")} onClose={() => setShowSuggestions(null)} BRAND={BRAND} />}
      </div>
    );
  }

  // ============= ITEMS =============
  if (step === "items") {
    const isSpecial = activeCat === "special";
    const cat = isSpecial ? null : CATALOG[activeCat];

    return (
      <div className={`min-h-screen pb-32 ${BRAND.isDark ? 'mesh-gradient-dark' : 'mesh-gradient-light'}`} style={{ background: BRAND.paper, color: BRAND.ink, fontFamily: "'Manrope', system-ui, sans-serif" }}>
        <FontLink />
        <Header title={isSpecial ? "Special Requests" : cat.label} onBack={() => setStep("category")} />

        {!isSpecial && (
          <>
            <div className="px-5 pt-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-px flex-1" style={{ background: BRAND.primary, opacity: 0.25 }} />
                <span className="text-[10px] uppercase tracking-[0.25em] font-bold" style={{ color: BRAND.primary }}>{cat.items.length} items</span>
                <div className="h-px flex-1" style={{ background: BRAND.primary, opacity: 0.25 }} />
              </div>
              <h2 className="text-[26px] leading-tight font-bold" style={{ letterSpacing: "-0.02em" }}>{cat.label}</h2>
            </div>

            <div className="px-5 mt-4 sticky top-[88px] z-20 pb-2" style={{ background: BRAND.paper }}>
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: BRAND.muted }} />
                <input
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  placeholder="Search this category…"
                  className="w-full h-11 pl-11 pr-4 rounded-xl text-sm outline-none transition-apple"
                  style={{ background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }}
                />
                {catSearch && (
                  <button onClick={() => setCatSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover-scale transition-apple" style={{ color: BRAND.muted }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="px-5 mt-3 space-y-2">
              {filteredCatItems.length === 0 && <div className="text-center py-8 text-sm" style={{ color: BRAND.muted }}>No items match "{catSearch}"</div>}
              {filteredCatItems.map((it) => {
                const qty = quantities[it.id] || 0;
                const isFav = favorites.includes(it.id);
                return <ItemRow key={it.id} item={it} qty={qty} onChange={(q) => setQty(it.id, q)} isFav={isFav} onToggleFav={() => toggleFavorite(it.id)} BRAND={BRAND} reorderDate={reorderAlerts[it.id] || null} />;
              })}
            </div>
          </>
        )}

        {isSpecial && (
          <div className="px-5 pt-5">
            <h2 className="text-[26px] leading-tight font-bold" style={{ letterSpacing: "-0.02em" }}>Special Requests</h2>
            <p className="text-sm mt-2" style={{ color: BRAND.muted }}>
              Anything we don't already stock? Add it below. <strong style={{ color: BRAND.ink }}>A photo of the product is required</strong> so we can find the exact match.
            </p>

            {photoError && (
              <div className="mt-3 px-3 py-2 rounded-xl text-xs flex items-center gap-2" style={{ background: BRAND.dangerBg, color: BRAND.danger, backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>
                <AlertCircle size={14} /> {photoError}
              </div>
            )}

            <div className="mt-5 space-y-3">
              {specialRequests.map((sr, idx) => (
                <SpecialRequestCard
                  key={sr.id}
                  request={sr}
                  index={idx}
                  canDelete={specialRequests.length > 1}
                  onTextChange={(t) => setSpecialRequests((p) => p.map((x) => (x.id === sr.id ? { ...x, text: t } : x)))}
                  onPhotoUpload={(file) => handlePhotoUpload(sr.id, file)}
                  onPhotoRemove={() => setSpecialRequests((p) => p.map((x) => (x.id === sr.id ? { ...x, photo: null, photoName: "" } : x)))}
                  onDelete={() => setSpecialRequests((p) => p.filter((x) => x.id !== sr.id))}
                  BRAND={BRAND}
                />
              ))}

              <button
                onClick={() => setSpecialRequests((p) => [...p, { id: Date.now(), text: "", photo: null, photoName: "" }])}
                className="w-full h-12 rounded-2xl border-2 border-dashed text-sm font-semibold transition-apple hover-scale flex items-center justify-center gap-2"
                style={{ borderColor: BRAND.border, color: BRAND.muted }}
              >
                <Plus size={16} strokeWidth={2.5} />
                Add Another Item
              </button>
            </div>

            <button onClick={() => setShowRecommended(true)} className="mt-5 w-full h-11 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-apple hover-scale" style={{ background: `${BRAND.primary}08`, border: `1px solid ${BRAND.primary}20`, color: BRAND.primary }}>
              <Sparkles size={14} />
              View Recommended Additions
            </button>
          </div>
        )}

        <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-4 pt-2" style={{ background: `linear-gradient(to top, ${BRAND.paper} 60%, transparent)` }}>
          <div className="flex gap-2">
            <button onClick={() => setStep("category")} className="flex-1 h-14 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-apple hover-scale" style={{ background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${BRAND.glassBorder}`, color: BRAND.ink }}>
              <ChevronLeft size={18} strokeWidth={2.5} />
              Categories
            </button>
            {(totals.count > 0 || validSpecials.length > 0) ? (
              <button onClick={() => setStep("review")} className="flex-[1.5] h-14 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 transition-apple hover-scale active:scale-[0.98]" style={{ background: BRAND.primary, boxShadow: `0 4px 16px ${BRAND.primary}30` }}>
                <span>Review</span>
                <span className="tabular-nums text-white/80">{totals.count + validSpecials.length}</span>
              </button>
            ) : (
              <button className="flex-[1.5] h-14 rounded-2xl font-semibold" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", color: BRAND.muted }} disabled>
                Add items to continue
              </button>
            )}
          </div>
        </div>

        <ToastBar />
        {showRecommended && <RecommendedModal onClose={() => setShowRecommended(false)} BRAND={BRAND} />}
        {showSuggestions && <SuggestionsModal sourceId={showSuggestions} pairs={PAIRINGS[showSuggestions] || []} allItems={allItems} quantities={quantities} setQty={(id, q) => setQty(id, q, "suggestion")} onClose={() => setShowSuggestions(null)} BRAND={BRAND} />}
      </div>
    );
  }

  // ============= REVIEW =============
  if (step === "review") {
    const grouped = {};
    Object.entries(quantities).forEach(([id, q]) => {
      const it = allItems.find((x) => x.id === id);
      if (!it) return;
      if (!grouped[it.cat]) grouped[it.cat] = [];
      grouped[it.cat].push({ ...it, qty: q });
    });

    const blockedByPhoto = specialsWithoutPhoto.length > 0;

    return (
      <div className={`min-h-screen pb-32 ${BRAND.isDark ? 'mesh-gradient-dark' : 'mesh-gradient-light'}`} style={{ background: BRAND.paper, color: BRAND.ink, fontFamily: "'Manrope', system-ui, sans-serif" }}>
        <FontLink />
        <Header title="Review" onBack={() => setStep("category")} />

        <div className="px-5 pt-5">
          <div className="text-[10px] uppercase tracking-[0.25em] font-bold" style={{ color: BRAND.muted }}>Order Summary</div>
          <h2 className="text-[28px] leading-tight font-bold mt-1" style={{ letterSpacing: "-0.02em" }}>
            Almost there.
          </h2>

          {/* Re-order alerts */}
          {(() => {
            const reorderedCount = Object.keys(quantities).filter((id) => reorderAlerts[id]).length;
            if (reorderedCount === 0) return null;
            return (
              <div className="mt-3 rounded-2xl p-3 flex items-start gap-3" style={{ background: BRAND.dangerBg, border: `1px solid ${BRAND.danger}30`, backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>
                <Bell size={16} className="flex-shrink-0 mt-0.5" style={{ color: BRAND.danger }} />
                <div>
                  <div className="text-xs font-bold" style={{ color: BRAND.danger }}>{reorderedCount} item{reorderedCount > 1 ? "s" : ""} ordered again within 30 days</div>
                  <div className="text-[11px] mt-0.5" style={{ color: BRAND.danger, opacity: 0.8 }}>These items were included in a recent order. A note will be added to the PDF.</div>
                </div>
              </div>
            );
          })()}

          <div className="mt-4 rounded-2xl p-4 flex items-center justify-between" style={{ background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${BRAND.glassBorder}`, boxShadow: BRAND.cardShadow }}>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: BRAND.muted }}>Assistant</div>
              <div className="text-base font-bold mt-0.5">{assistantName}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: BRAND.muted }}>Date</div>
              <div className="text-base font-bold tabular-nums mt-0.5">{orderDate}</div>
            </div>
          </div>

          {/* Order notes */}
          <div className="mt-3 rounded-2xl p-3" style={{ background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${BRAND.glassBorder}`, boxShadow: BRAND.cardShadow }}>
            <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1.5" style={{ color: BRAND.muted }}>Order Notes <span style={{ color: BRAND.muted, opacity: 0.6 }}>(optional)</span></div>
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="e.g. Rush — needed by Friday. Leave at back door."
              rows={2}
              className="w-full bg-transparent border-0 resize-none text-sm leading-relaxed focus:outline-none placeholder:opacity-50"
              style={{ color: BRAND.ink }}
            />
          </div>
        </div>

        <div className="px-5 mt-5 space-y-5">
          {PROCEDURES.filter((p) => grouped[p.key]).map((p) => (
            <div key={p.key}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${BRAND.primary}15`, color: BRAND.primary }}>
                  <p.icon size={13} />
                </div>
                <span className="text-[11px] uppercase tracking-[0.2em] font-bold" style={{ color: BRAND.primary }}>{p.label}</span>
                <div className="h-px flex-1" style={{ background: `${BRAND.primary}30` }} />
              </div>
              <div className="rounded-2xl divide-y overflow-hidden" style={{ background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${BRAND.glassBorder}`, boxShadow: BRAND.cardShadow }}>
                {grouped[p.key].map((it) => (
                  <div key={it.id} className="p-3 flex items-start gap-3" style={{ borderColor: BRAND.border }}>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold leading-snug" style={{ color: BRAND.ink }}>{it.name}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: BRAND.muted }}>{it.mfr} · {it.pkg}</div>
                      {reorderAlerts[it.id] && (
                        <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide" style={{ background: BRAND.dangerBg, color: BRAND.danger }}>
                          <Bell size={9} /> Re-order
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <QtyControl qty={it.qty} onChange={(q) => setQty(it.id, q)} BRAND={BRAND} compact />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {validSpecials.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center text-white" style={{ background: BRAND.ink }}>
                  <FileText size={13} />
                </div>
                <span className="text-[11px] uppercase tracking-[0.2em] font-bold">Special Requests</span>
                <div className="h-px flex-1" style={{ background: BRAND.border }} />
              </div>
              <div className="rounded-2xl divide-y" style={{ background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${BRAND.glassBorder}`, boxShadow: BRAND.cardShadow }}>
                {validSpecials.map((s, i) => (
                  <div key={s.id} className="p-3 flex gap-3 items-start" style={{ borderColor: BRAND.border }}>
                    <div className="text-[10px] uppercase tracking-[0.2em] font-bold tabular-nums pt-1" style={{ color: BRAND.muted }}>{String(i + 1).padStart(2, "0")}</div>
                    <div className="flex-1 text-sm leading-relaxed" style={{ color: BRAND.ink }}>{s.text}</div>
                    {s.photo ? (
                      <img src={s.photo} alt="product" className="w-16 h-16 rounded-lg object-cover border" style={{ borderColor: BRAND.border }} />
                    ) : (
                      <div className="w-16 h-16 rounded-lg flex flex-col items-center justify-center border-2 border-dashed text-[9px] font-bold uppercase tracking-wide" style={{ borderColor: BRAND.danger, color: BRAND.danger, background: BRAND.dangerBg }}>
                        <Camera size={14} />
                        <span className="mt-0.5">Required</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {blockedByPhoto && (
                <div className="mt-2 px-3 py-2 rounded-lg text-xs flex items-center gap-2" style={{ background: BRAND.dangerBg, color: BRAND.danger }}>
                  <AlertCircle size={14} />
                  {specialsWithoutPhoto.length} request{specialsWithoutPhoto.length > 1 ? "s" : ""} need a product photo before saving.
                </div>
              )}
            </div>
          )}

          <div className="rounded-2xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${BRAND.ink} 0%, ${BRAND.isDark ? '#2C2C2E' : '#3A3A3C'} 100%)`, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: BRAND.primary }}>Catalog items</span>
              <span className="tabular-nums font-bold">{totals.count}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span style={{ color: BRAND.primary }}>Special requests</span>
              <span className="tabular-nums font-bold">{validSpecials.length}</span>
            </div>
            <div className="border-t my-3" style={{ borderColor: "rgba(255,255,255,0.1)" }} />
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-white/70">Total Lines</span>
              <span className="text-3xl font-bold tabular-nums">{totals.count + validSpecials.length}</span>
            </div>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-4 pt-2" style={{ background: `linear-gradient(to top, ${BRAND.paper} 60%, transparent)` }}>
          <button
            onClick={() => {
              if (blockedByPhoto) {
                setActiveCat("special");
                setStep("items");
                return;
              }
              finalizeOrder().then(() => {
                handleSavePDF();
                setStep("done");
              });
            }}
            disabled={totals.count === 0 && validSpecials.length === 0}
            className="w-full h-14 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 transition-apple hover-scale active:scale-[0.98] disabled:opacity-30"
            style={{ background: blockedByPhoto ? BRAND.danger : BRAND.primary, boxShadow: `0 8px 24px ${blockedByPhoto ? BRAND.danger : BRAND.primary}30` }}
          >
            {blockedByPhoto ? (
              <>
                <Camera size={16} strokeWidth={2.5} />
                Add Required Photos
              </>
            ) : (
              <>
                <Check size={16} strokeWidth={2.5} />
                Confirm Order
              </>
            )}
          </button>
        </div>

        <ToastBar />
      </div>
    );
  }

  // ============= DONE =============
  if (step === "done") {
    return (
      <div className={`min-h-screen flex flex-col ${BRAND.isDark ? 'mesh-gradient-dark' : 'mesh-gradient-light'}`} style={{ background: BRAND.paper, color: BRAND.ink, fontFamily: "'Manrope', system-ui, sans-serif" }}>
        <FontLink />
        <Header showCart={false} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 text-white animate-slide-up" style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})`, boxShadow: `0 8px 32px ${BRAND.primary}30` }}>
            <Check size={36} strokeWidth={2.5} />
          </div>
          <div className="text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: BRAND.muted }}>Order Saved</div>
          <h1 className="text-4xl mt-2 leading-tight font-bold" style={{ letterSpacing: "-0.02em" }}>
            All set, <span style={{ color: BRAND.primary }}>{assistantName.split(" ")[0]}.</span>
          </h1>
          <p className="text-sm mt-3 max-w-xs" style={{ color: BRAND.muted }}>
            Your order file has been downloaded. Use the buttons below to <strong style={{ color: BRAND.ink }}>send for confirmation</strong> or download again.
          </p>
          <div className="mt-8 flex flex-col gap-2 w-full max-w-xs">
            <button onClick={handleSendToConfirm} className="px-6 h-12 rounded-2xl text-white text-sm font-semibold transition-apple hover-scale flex items-center justify-center gap-2" style={{ background: BRAND.success, boxShadow: `0 4px 16px ${BRAND.success}30` }}>
              <Send size={15} strokeWidth={2.5} />
              Send to Confirm Order
            </button>
            <button onClick={handleSavePDF} className="px-6 h-12 rounded-2xl text-white text-sm font-semibold transition-apple hover-scale flex items-center justify-center gap-2" style={{ background: BRAND.primary, boxShadow: `0 4px 16px ${BRAND.primary}30` }}>
              <Download size={15} strokeWidth={2.5} />
              Download Order
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleEmail} className="h-11 rounded-2xl text-xs font-semibold transition-apple hover-lift flex items-center justify-center gap-1.5" style={{ border: `1px solid ${BRAND.glassBorder}`, color: BRAND.ink, background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: BRAND.cardShadow }}>
                <Mail size={13} />
                Email
              </button>
              <button onClick={handleCopyText} className="h-11 rounded-2xl text-xs font-semibold transition-apple hover-lift flex items-center justify-center gap-1.5" style={{ border: `1px solid ${BRAND.glassBorder}`, color: BRAND.ink, background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: BRAND.cardShadow }}>
                <Copy size={13} />
                Copy Text
              </button>
            </div>
            <button onClick={startNewOrder} className="mt-2 px-6 h-12 rounded-2xl text-sm font-semibold transition-apple hover-scale" style={{ color: BRAND.muted }}>
              Start a New Order
            </button>
          </div>
        </div>
        <ToastBar />
      </div>
    );
  }

  return null;
}

// ============= QTY CONTROL =============
function QtyControl({ qty, onChange, BRAND, compact = false }) {
  const size = compact ? "h-9" : "h-10";
  const btnSize = compact ? "w-9" : "w-10";
  if (qty === 0) {
    return (
      <button onClick={() => onChange(1)} className={`${btnSize} ${size} rounded-full text-white flex items-center justify-center transition-apple hover-scale active:scale-90`} style={{ background: BRAND.primary, boxShadow: `0 2px 8px ${BRAND.primary}30` }} aria-label="Add">
        <Plus size={compact ? 16 : 18} strokeWidth={2.5} />
      </button>
    );
  }
  return (
    <div className={`flex items-center rounded-full text-white ${size}`} style={{ background: `linear-gradient(135deg, ${BRAND.ink} 0%, ${BRAND.isDark ? '#2C2C2E' : '#3A3A3C'} 100%)`, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
      <button onClick={() => onChange(qty - 1)} className={`${btnSize} ${size} flex items-center justify-center rounded-l-full transition-apple active:scale-90`} aria-label="Decrease">
        <Minus size={14} strokeWidth={2.5} />
      </button>
      <div className="w-8 text-center text-sm font-bold tabular-nums">{qty}</div>
      <button onClick={() => onChange(qty + 1)} className={`${btnSize} ${size} flex items-center justify-center rounded-r-full transition-apple active:scale-90`} aria-label="Increase">
        <Plus size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ============= ITEM ROW =============
function ItemRow({ item, qty, onChange, isFav, onToggleFav, BRAND, reorderDate = null }) {
  return (
    <div className="rounded-2xl transition-apple hover-lift p-3" style={{ background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${qty > 0 ? BRAND.primary : BRAND.glassBorder}`, boxShadow: qty > 0 ? `inset 3px 0 0 ${BRAND.primary}, ${BRAND.cardShadow}` : BRAND.cardShadow }}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold leading-snug" style={{ color: BRAND.ink }}>{item.name}</div>
          <div className="text-[11px] mt-1 flex flex-wrap items-center gap-1.5" style={{ color: BRAND.muted }}>
            <span>{item.mfr}</span>
            <span style={{ color: BRAND.border }}>·</span>
            <span>{item.pkg}</span>
          </div>
          {reorderDate && (
            <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide" style={{ background: BRAND.dangerBg, color: BRAND.danger }}>
              <Bell size={9} /> Re-ordered · last {reorderDate}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <button onClick={onToggleFav} className="w-7 h-7 flex items-center justify-center" aria-label="Favorite">
            <Star size={14} fill={isFav ? BRAND.primary : "none"} color={isFav ? BRAND.primary : BRAND.muted} strokeWidth={2} />
          </button>
          <QtyControl qty={qty} onChange={onChange} BRAND={BRAND} />
        </div>
      </div>
    </div>
  );
}

// ============= SPECIAL REQUEST CARD =============
function SpecialRequestCard({ request, index, canDelete, onTextChange, onPhotoUpload, onPhotoRemove, onDelete, BRAND }) {
  const fileRef = useRef(null);
  const cameraRef = useRef(null);

  return (
    <div className="rounded-2xl p-3 transition-apple" style={{ background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${request.photo ? BRAND.primary : BRAND.glassBorder}`, boxShadow: BRAND.cardShadow }}>
      <div className="flex items-start gap-2">
        <div className="text-[10px] uppercase tracking-[0.2em] font-bold pt-3 pl-1 tabular-nums" style={{ color: BRAND.muted }}>{String(index + 1).padStart(2, "0")}</div>
        <textarea
          value={request.text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={index === 0 ? "e.g. Sterilization pouches 3.5×9, 200/box" : "Another item…"}
          rows={2}
          className="flex-1 bg-transparent border-0 resize-none text-sm leading-relaxed focus:outline-none py-2 placeholder:opacity-50"
          style={{ color: BRAND.ink }}
        />
        {canDelete && (
          <button onClick={onDelete} className="w-9 h-9 flex items-center justify-center rounded-full transition" style={{ color: BRAND.muted }} aria-label="Remove">
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <div className="mt-2 pt-3 border-t" style={{ borderColor: BRAND.border }}>
        <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-2 flex items-center gap-1.5" style={{ color: request.photo ? BRAND.primary : BRAND.danger }}>
          <Camera size={11} />
          Product Photo {request.photo ? "✓" : "(required)"}
        </div>

        {request.photo ? (
          <div className="flex items-start gap-3">
            <img src={request.photo} alt="product" className="w-24 h-24 rounded-xl object-cover border-2" style={{ borderColor: BRAND.primary }} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate" style={{ color: BRAND.ink }}>{request.photoName}</div>
              <div className="text-[10px] mt-0.5" style={{ color: BRAND.muted }}>Photo attached</div>
              <button onClick={onPhotoRemove} className="mt-2 text-[11px] font-semibold flex items-center gap-1" style={{ color: BRAND.danger }}>
                <X size={11} /> Remove photo
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onPhotoUpload(e.target.files?.[0])} />
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPhotoUpload(e.target.files?.[0])} />
            <button onClick={() => cameraRef.current?.click()} className="h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition" style={{ borderColor: BRAND.danger, background: BRAND.dangerBg, color: BRAND.danger }}>
              <Camera size={20} strokeWidth={2} />
              <span className="text-[11px] font-bold uppercase tracking-wide">Take photo</span>
            </button>
            <button onClick={() => fileRef.current?.click()} className="h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition" style={{ borderColor: BRAND.border, color: BRAND.muted }}>
              <ImageIcon size={20} strokeWidth={2} />
              <span className="text-[11px] font-bold uppercase tracking-wide">Choose file</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============= MODALS =============
function ModalShell({ children, onClose, BRAND, title, subtitle, icon: Icon }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }} onClick={onClose}>
      <div className="w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[88vh] overflow-hidden flex flex-col animate-slide-up" style={{ background: BRAND.glass, backdropFilter: "blur(40px) saturate(200%)", WebkitBackdropFilter: "blur(40px) saturate(200%)", border: `1px solid ${BRAND.glassBorder}`, boxShadow: "0 24px 60px rgba(0,0,0,0.15)" }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 pt-5 pb-3 border-b flex items-start gap-3" style={{ borderColor: BRAND.border }}>
          {Icon && (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${BRAND.primary}12`, color: BRAND.primary }}>
              <Icon size={18} />
            </div>
          )}
          <div className="flex-1">
            {subtitle && <div className="text-[10px] uppercase tracking-[0.25em] font-bold" style={{ color: BRAND.muted }}>{subtitle}</div>}
            <h3 className="text-xl leading-tight font-bold" style={{ color: BRAND.ink }}>{title}</h3>
          </div>
          <button onClick={onClose} className="w-9 h-9 -mr-1 -mt-1 rounded-full flex items-center justify-center hover-scale transition-apple" style={{ color: BRAND.muted }}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function RecommendedModal({ onClose, BRAND }) {
  return (
    <ModalShell onClose={onClose} BRAND={BRAND} title="Recommended Additions" subtitle="Gap Analysis" icon={Sparkles}>
      <div className="overflow-y-auto px-5 py-4">
        <p className="text-xs mb-4 leading-relaxed" style={{ color: BRAND.muted }}>
          Essential consumables not detected in your Patterson catalog. Add them through Special Requests or your supplier.
        </p>
        <ul className="space-y-3">
          {RECOMMENDED_ADDITIONS.map((r, i) => (
            <li key={i} className="flex gap-3">
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold tabular-nums pt-0.5 w-6 flex-shrink-0" style={{ color: BRAND.primary }}>{String(i + 1).padStart(2, "0")}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold leading-snug" style={{ color: BRAND.ink }}>{r.name}</div>
                <div className="text-[11px] mt-0.5 leading-relaxed italic" style={{ color: BRAND.muted }}>{r.reason}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="px-5 py-3 border-t" style={{ background: BRAND.surface, borderColor: BRAND.border }}>
        <button onClick={onClose} className="w-full h-11 rounded-xl text-white text-sm font-semibold transition-apple hover-scale" style={{ background: BRAND.primary, boxShadow: `0 2px 8px ${BRAND.primary}30` }}>
          Got it
        </button>
      </div>
    </ModalShell>
  );
}

function SuggestionsModal({ sourceId, pairs, allItems, quantities, setQty, onClose, BRAND }) {
  const sourceItem = allItems.find((x) => x.id === sourceId);
  const pairItems = pairs.map((id) => allItems.find((x) => x.id === id)).filter(Boolean);
  if (!sourceItem || pairItems.length === 0) return null;

  return (
    <ModalShell onClose={onClose} BRAND={BRAND} title="Often ordered together" subtitle="Smart Suggestions" icon={TrendingUp}>
      <div className="overflow-y-auto px-5 py-4">
        <p className="text-xs mb-4 leading-relaxed" style={{ color: BRAND.muted }}>
          You added <strong style={{ color: BRAND.ink }}>{sourceItem.name.slice(0, 40)}{sourceItem.name.length > 40 ? "…" : ""}</strong>. Want to add these too?
        </p>
        <div className="space-y-2">
          {pairItems.map((it) => {
            const qty = quantities[it.id] || 0;
            return (
              <div key={it.id} className="rounded-xl p-3 flex items-start gap-3 transition-apple" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)", border: `1px solid ${qty > 0 ? BRAND.primary : BRAND.border}` }}>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold leading-snug" style={{ color: BRAND.ink }}>{it.name}</div>
                  <div className="text-[11px] mt-1" style={{ color: BRAND.muted }}>{it.mfr} · {it.pkg}</div>
                </div>
                <QtyControl qty={qty} onChange={(q) => setQty(it.id, q)} BRAND={BRAND} compact />
              </div>
            );
          })}
        </div>
      </div>
      <div className="px-5 py-3 border-t" style={{ background: BRAND.surface, borderColor: BRAND.border }}>
        <button onClick={onClose} className="w-full h-11 rounded-xl text-white text-sm font-semibold transition-apple hover-scale" style={{ background: BRAND.primary, boxShadow: `0 2px 8px ${BRAND.primary}30` }}>
          Done
        </button>
      </div>
    </ModalShell>
  );
}

function HistoryModal({ onClose, BRAND, history, reorder, allItems }) {
  return (
    <ModalShell onClose={onClose} BRAND={BRAND} title="Order History" subtitle={`${history.length} past orders`} icon={Clock}>
      <div className="overflow-y-auto px-5 py-4">
        {history.length === 0 ? (
          <div className="text-center py-12 text-sm" style={{ color: BRAND.muted }}>
            No past orders yet. Once you save your first order, you'll be able to reorder from here in one tap.
          </div>
        ) : (
          <div className="space-y-2.5">
            {history.map((h) => {
              const top3 = Object.entries(h.quantities || {}).slice(0, 3).map(([id]) => allItems.find((x) => x.id === id)).filter(Boolean);
              const editable = isHistoryEditable(h);
              return (
                <button
                  key={h.id}
                  onClick={() => reorder(h)}
                  className="w-full text-left rounded-2xl p-4 transition-apple hover-lift disabled:cursor-not-allowed"
                  disabled={!editable}
                  style={{ background: BRAND.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)", border: `1px solid ${editable ? BRAND.border : `${BRAND.danger}30`}`, opacity: editable ? 1 : 0.7, boxShadow: editable ? BRAND.cardShadow : "none" }}
                >
                  <div className="flex items-baseline justify-between mb-1">
                    <div className="text-base font-bold tabular-nums" style={{ color: BRAND.ink }}>{h.orderDate}</div>
                    <div className="text-[10px] uppercase tracking-[0.18em] font-bold" style={{ color: BRAND.primary }}>{h.itemCount} items</div>
                  </div>
                  <div className="text-xs mb-2" style={{ color: BRAND.muted }}>by {h.assistantName}</div>
                  <div className="text-[11px] leading-relaxed" style={{ color: BRAND.muted }}>
                    {top3.map((it) => it.name.slice(0, 28) + (it.name.length > 28 ? "…" : "")).join(" · ")}
                    {Object.keys(h.quantities).length > 3 ? ` + ${Object.keys(h.quantities).length - 3} more` : ""}
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide" style={{ color: editable ? BRAND.primary : BRAND.danger }}>
                    {editable ? <RotateCcw size={11} strokeWidth={2.5} /> : <AlertCircle size={11} strokeWidth={2.5} />}
                    {editable ? "Tap to edit/reorder" : "Locked after 24 hours"}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function FavoritesModal({ onClose, BRAND, favoriteItems, quantities, setQty, toggleFavorite, onProceed, canProceed }) {
  return (
    <ModalShell onClose={onClose} BRAND={BRAND} title="My Favorites" subtitle={`${favoriteItems.length} starred items`} icon={Star}>
      <div className="overflow-y-auto px-5 py-4">
        {favoriteItems.length === 0 ? (
          <div className="text-center py-12 text-sm" style={{ color: BRAND.muted }}>
            No favorites yet. Tap the ★ next to any item to add it here for quick access.
          </div>
        ) : (
          <div className="space-y-2">
            {favoriteItems.map((it) => {
              const qty = quantities[it.id] || 0;
              return (
                <div key={it.id} className="rounded-xl p-3 flex items-start gap-3 transition-apple" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)", border: `1px solid ${qty > 0 ? BRAND.primary : BRAND.border}` }}>
                  <button onClick={() => toggleFavorite(it.id)} className="mt-0.5">
                    <Star size={14} fill={BRAND.primary} color={BRAND.primary} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold leading-snug" style={{ color: BRAND.ink }}>{it.name}</div>
                    <div className="text-[11px] mt-1" style={{ color: BRAND.muted }}>{it.catLabel} · {it.mfr}</div>
                  </div>
                  <QtyControl qty={qty} onChange={(q) => setQty(it.id, q)} BRAND={BRAND} compact />
                </div>
              );
            })}
          </div>
        )}
      </div>
      {favoriteItems.length > 0 && (
        <div className="px-5 py-3 border-t" style={{ background: BRAND.surface, borderColor: BRAND.border }}>
          <button onClick={onProceed} disabled={!canProceed} className="w-full h-11 rounded-xl text-white text-sm font-semibold transition-apple hover-scale disabled:opacity-30" style={{ background: BRAND.primary, boxShadow: `0 2px 8px ${BRAND.primary}30` }}>
            {canProceed ? "Continue to order" : "Add assistant name first"}
          </button>
        </div>
      )}
    </ModalShell>
  );
}

function SettingsModal({ onClose, BRAND, darkMode, setDarkMode, savedAssistants, history, setHistory, favorites, setFavorites, itemFrequency, setItemFrequency, showToast }) {
  const clearHistory = async () => {
    if (window.confirm("Delete all order history? This cannot be undone.")) {
      await clearOrderHistoryDb();
      setHistory([]);
      showToast("Order history cleared");
    }
  };
  const clearFavorites = () => {
    if (window.confirm("Remove all favorites?")) {
      setFavorites([]);
      safeSet(STORAGE_KEYS.favorites, []);
      showToast("Favorites cleared");
    }
  };
  const resetFrequency = async () => {
    if (window.confirm("Reset frequently-ordered tracking?")) {
      await clearItemFrequencyDb();
      setItemFrequency({});
      showToast("Frequency tracking reset");
    }
  };

  return (
    <ModalShell onClose={onClose} BRAND={BRAND} title="Settings" subtitle="Preferences & Data" icon={Settings}>
      <div className="overflow-y-auto px-5 py-4 space-y-5">
        <section>
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: BRAND.muted }}>Appearance</div>
          <button onClick={() => setDarkMode(!darkMode)} className="w-full p-3 rounded-xl flex items-center justify-between transition-apple" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)", border: `1px solid ${BRAND.border}` }}>
            <div className="flex items-center gap-3">
              {darkMode ? <Sun size={16} style={{ color: BRAND.primary }} /> : <Moon size={16} style={{ color: BRAND.primary }} />}
              <div>
                <div className="text-sm font-semibold" style={{ color: BRAND.ink }}>{darkMode ? "Dark mode" : "Light mode"}</div>
                <div className="text-[10px]" style={{ color: BRAND.muted }}>Tap to switch</div>
              </div>
            </div>
            <div className="w-10 h-6 rounded-full relative" style={{ background: darkMode ? BRAND.primary : BRAND.border }}>
              <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: darkMode ? "calc(100% - 22px)" : "2px" }} />
            </div>
          </button>
        </section>

        <section>
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: BRAND.muted }}>Saved Data</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)", border: `1px solid ${BRAND.border}` }}>
              <div className="flex items-center gap-3">
                <Users size={15} style={{ color: BRAND.muted }} />
                <span className="text-sm" style={{ color: BRAND.ink }}>Saved assistants</span>
              </div>
              <span className="text-sm font-bold tabular-nums" style={{ color: BRAND.primary }}>{savedAssistants.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)", border: `1px solid ${BRAND.border}` }}>
              <div className="flex items-center gap-3">
                <Clock size={15} style={{ color: BRAND.muted }} />
                <span className="text-sm" style={{ color: BRAND.ink }}>Order history</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tabular-nums" style={{ color: BRAND.primary }}>{history.length}</span>
                {history.length > 0 && (
                  <button onClick={clearHistory} className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded" style={{ color: BRAND.danger }}>Clear</button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)", border: `1px solid ${BRAND.border}` }}>
              <div className="flex items-center gap-3">
                <Star size={15} style={{ color: BRAND.muted }} />
                <span className="text-sm" style={{ color: BRAND.ink }}>Favorites</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tabular-nums" style={{ color: BRAND.primary }}>{favorites.length}</span>
                {favorites.length > 0 && (
                  <button onClick={clearFavorites} className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded" style={{ color: BRAND.danger }}>Clear</button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)", border: `1px solid ${BRAND.border}` }}>
              <div className="flex items-center gap-3">
                <TrendingUp size={15} style={{ color: BRAND.muted }} />
                <span className="text-sm" style={{ color: BRAND.ink }}>Frequency tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tabular-nums" style={{ color: BRAND.primary }}>{Object.keys(itemFrequency).length}</span>
                {Object.keys(itemFrequency).length > 0 && (
                  <button onClick={resetFrequency} className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded" style={{ color: BRAND.danger }}>Reset</button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="text-center text-[10px]" style={{ color: BRAND.muted }}>
          Asnan Dental Inventory · v2.0
        </section>
      </div>
    </ModalShell>
  );
}

// ============= STATISTICS MODAL =============
function StatsModal({ onClose, BRAND, history, itemFrequency, allItems }) {
  const totalOrders = history.length;
  const totalItemsOrdered = history.reduce((sum, h) => sum + (h.itemCount || 0), 0);

  const topItems = Object.entries(itemFrequency)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([id, count]) => {
      const item = allItems.find((x) => x.id === id);
      return item ? { ...item, count: count as number } : null;
    })
    .filter(Boolean);

  const categoryBreakdown = {};
  history.forEach((h) => {
    Object.keys(h.quantities || {}).forEach((id) => {
      const item = allItems.find((x) => x.id === id);
      if (item) {
        categoryBreakdown[item.catLabel || item.cat] = (categoryBreakdown[item.catLabel || item.cat] || 0) + (h.quantities[id] || 0);
      }
    });
  });
  const catEntries = Object.entries(categoryBreakdown).sort(([, a], [, b]) => (b as number) - (a as number));
  const maxCatCount = catEntries.length > 0 ? (catEntries[0][1] as number) : 1;

  const recentOrders = history.slice(0, 5);

  return (
    <ModalShell onClose={onClose} BRAND={BRAND} title="Statistics" subtitle="Order Analytics" icon={BarChart3}>
      <div className="overflow-y-auto px-5 py-4 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 text-center" style={{ background: `${BRAND.primary}10`, boxShadow: BRAND.cardShadow, borderRadius: "16px" }}>
            <div className="text-3xl font-bold tabular-nums" style={{ color: BRAND.primary }}>{totalOrders}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] font-bold mt-1" style={{ color: BRAND.muted }}>Total Orders</div>
          </div>
          <div className="rounded-2xl p-4 text-center" style={{ background: `${BRAND.primary}10`, boxShadow: BRAND.cardShadow, borderRadius: "16px" }}>
            <div className="text-3xl font-bold tabular-nums" style={{ color: BRAND.primary }}>{totalItemsOrdered}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] font-bold mt-1" style={{ color: BRAND.muted }}>Items Ordered</div>
          </div>
        </div>

        {topItems.length > 0 && (
          <section>
            <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: BRAND.muted }}>Most Ordered Items</div>
            <div className="space-y-2">
              {topItems.map((it, i) => (
                <div key={it.id} className="flex items-center gap-3 p-2 rounded-xl" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)" }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: `${BRAND.primary}20`, color: BRAND.primary }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate" style={{ color: BRAND.ink }}>{it.name}</div>
                    <div className="text-[10px]" style={{ color: BRAND.muted }}>{it.mfr}</div>
                  </div>
                  <div className="text-sm font-bold tabular-nums" style={{ color: BRAND.primary }}>{it.count}x</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {catEntries.length > 0 && (
          <section>
            <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: BRAND.muted }}>By Category</div>
            <div className="space-y-2">
              {catEntries.map(([cat, count]) => (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold" style={{ color: BRAND.ink }}>{cat}</span>
                    <span className="text-xs font-bold tabular-nums" style={{ color: BRAND.primary }}>{count as number}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: BRAND.border }}>
                    <div className="h-full rounded-full transition-all" style={{ background: BRAND.primary, width: `${((count as number) / maxCatCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {recentOrders.length > 0 && (
          <section>
            <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: BRAND.muted }}>Recent Orders</div>
            <div className="space-y-2">
              {recentOrders.map((h) => (
                <div key={h.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)", border: `1px solid ${BRAND.border}` }}>
                  <div>
                    <div className="text-sm font-bold tabular-nums" style={{ color: BRAND.ink }}>{h.orderDate}</div>
                    <div className="text-[10px]" style={{ color: BRAND.muted }}>by {h.assistantName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold tabular-nums" style={{ color: BRAND.primary }}>{h.itemCount}</div>
                    <div className="text-[10px]" style={{ color: BRAND.muted }}>items</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {totalOrders === 0 && (
          <div className="text-center py-12 text-sm" style={{ color: BRAND.muted }}>
            No order data yet. Statistics will appear after your first completed order.
          </div>
        )}
      </div>
      <div className="px-5 py-3 border-t" style={{ background: BRAND.surface, borderColor: BRAND.border }}>
        <button onClick={onClose} className="w-full h-11 rounded-xl text-white text-sm font-semibold transition-apple hover-scale" style={{ background: BRAND.primary, boxShadow: `0 2px 8px ${BRAND.primary}30` }}>
          Close
        </button>
      </div>
    </ModalShell>
  );
}

// ============= ADD TO INVENTORY MODAL =============
function AddToInventoryModal({ onClose, BRAND, allItems, showToast, onInventoryUpdated }) {
  const [search, setSearch] = useState("");
  const [existingQty, setExistingQty] = useState<Record<string, number>>({});
  const [existingItems, setExistingItems] = useState<Record<string, any>>({});
  const [newQty, setNewQty] = useState<Record<string, number>>({});
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  useEffect(() => {
    fetchInventoryDb().then((existing) => {
      const map: Record<string, number> = {};
      const fullMap: Record<string, any> = {};
      for (const item of existing) {
        map[item.id] = item.quantity;
        fullMap[item.id] = item;
      }
      setExistingQty(map);
      setExistingItems(fullMap);
    });
  }, []);

  const invQty = useMemo(() => {
    const merged = { ...existingQty };
    for (const [id, qty] of Object.entries(newQty)) merged[id] = qty;
    return merged;
  }, [existingQty, newQty]);

  const grouped = useMemo(() => {
    const cats = new Map<string, typeof allItems>();
    for (const item of allItems) {
      const label = item.catLabel;
      if (!cats.has(label)) cats.set(label, []);
      cats.get(label)!.push(item);
    }
    return cats;
  }, [allItems]);

  const filtered = useMemo(() => {
    if (!search.trim()) return grouped;
    const q = search.toLowerCase();
    const result = new Map<string, typeof allItems>();
    for (const [cat, items] of grouped) {
      const matching = items.filter((it) => it.name.toLowerCase().includes(q) || it.mfr.toLowerCase().includes(q));
      if (matching.length > 0) result.set(cat, matching);
    }
    return result;
  }, [grouped, search]);

  const newlyAddedCount = Object.entries(newQty).filter(([id, q]) => q > 0 && q !== (existingQty[id] || 0)).length;

  const handleSave = async () => {
    if (Object.keys(newQty).length === 0) {
      onClose();
      return;
    }
    const items = Object.entries(invQty).map(([id, qty]) => {
      const catalogItem = allItems.find((x) => x.id === id);
      const existing = existingItems[id];
      return {
        id,
        name: catalogItem?.name || existing?.name || id,
        category: catalogItem?.catLabel || existing?.category || "Other",
        quantity: qty,
        reorderThreshold: existing?.reorderThreshold || 1,
        supplier: existing?.supplier ?? null,
        itemNumber: existing?.itemNumber ?? null,
        photo: existing?.photo ?? null,
      };
    });

    await saveInventoryDb(items);
    if (onInventoryUpdated) onInventoryUpdated();
    const changedCount = Object.entries(newQty).filter(([id, q]) => q !== (existingQty[id] || 0)).length;
    showToast(`Inventory updated — ${changedCount} item${changedCount !== 1 ? "s" : ""} ${changedCount === 1 ? "was" : "were"} changed`);
    onClose();
  };

  const adjustQty = (id: string, delta: number) => {
    setNewQty((prev) => {
      const current = prev[id] ?? existingQty[id] ?? 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const setItemQty = (id: string, val: number) => {
    setNewQty((prev) => ({ ...prev, [id]: Math.max(0, val) }));
  };

  return (
    <ModalShell onClose={onClose} BRAND={BRAND} title="Add to Inventory" subtitle="Current Stock" icon={Package}>
      <div className="px-5 py-3 border-b" style={{ borderColor: BRAND.border }}>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: BRAND.muted }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items…"
            className="w-full h-10 pl-9 pr-4 rounded-xl text-sm outline-none transition-apple"
            style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }}
          />
        </div>
        {newlyAddedCount > 0 && (
          <div className="mt-2 text-[11px] font-semibold" style={{ color: BRAND.primary }}>
            {newlyAddedCount} new item{newlyAddedCount !== 1 ? "s" : ""} to add
          </div>
        )}
      </div>

      <div className="overflow-y-auto flex-1 px-5 py-3 space-y-2" style={{ maxHeight: "50vh" }}>
        {Array.from(filtered.entries()).map(([cat, items]) => {
          const isExpanded = expandedCat === cat || search.trim().length > 0;
          const catCount = items.filter((it) => it.id in newQty && newQty[it.id] !== (existingQty[it.id] || 0)).length;

          return (
            <div key={cat} className="rounded-2xl overflow-hidden" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)", border: `1px solid ${BRAND.border}` }}>
              <button
                onClick={() => setExpandedCat(isExpanded && !search.trim() ? null : cat)}
                className="w-full px-4 py-3 flex items-center justify-between text-left"
                style={{ color: BRAND.ink }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{cat}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", color: BRAND.muted }}>{items.length}</span>
                  {catCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold" style={{ background: `${BRAND.primary}15`, color: BRAND.primary }}>{catCount} new</span>
                  )}
                </div>
                {isExpanded ? <ChevronLeft size={14} style={{ color: BRAND.muted, transform: "rotate(-90deg)" }} /> : <ChevronRight size={14} style={{ color: BRAND.muted, transform: "rotate(90deg)" }} />}
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-1.5">
                  {items.map((item) => {
                    const qty = invQty[item.id] || 0;
                    const isNewOrChanged = item.id in newQty && newQty[item.id] !== (existingQty[item.id] || 0);
                    const alreadyInInventory = (existingQty[item.id] || 0) > 0 && !(item.id in newQty);
                    return (
                      <div key={item.id} className="rounded-xl p-2.5 flex items-center gap-2.5" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.7)", border: `1px solid ${isNewOrChanged ? BRAND.primary + "40" : BRAND.border}` }}>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold leading-snug truncate" style={{ color: BRAND.ink }}>{item.name}</div>
                          <div className="text-[10px] mt-0.5" style={{ color: BRAND.muted }}>
                            {item.mfr} · {item.pkg}
                            {alreadyInInventory && <span style={{ color: BRAND.primary }}> · In stock: {existingQty[item.id]}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {alreadyInInventory ? (
                            <span className="h-8 px-3 rounded-lg text-[11px] font-semibold flex items-center gap-1.5" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", color: BRAND.muted }}>
                              <Check size={12} strokeWidth={2.5} />
                              In Stock
                            </span>
                          ) : (item.id in newQty) ? (
                            <>
                              <button
                                onClick={() => adjustQty(item.id, -1)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-apple active:scale-90"
                                style={{ background: BRAND.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", color: BRAND.ink }}
                              >
                                <Minus size={13} strokeWidth={2.5} />
                              </button>
                              <input
                                type="number"
                                value={qty}
                                onChange={(e) => setItemQty(item.id, parseInt(e.target.value) || 0)}
                                className="w-10 text-center text-sm font-bold tabular-nums bg-transparent outline-none"
                                style={{ color: BRAND.ink }}
                                min={0}
                              />
                              <button
                                onClick={() => adjustQty(item.id, 1)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-apple active:scale-90"
                                style={{ background: `${BRAND.primary}15`, color: BRAND.primary }}
                              >
                                <Plus size={13} strokeWidth={2.5} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => adjustQty(item.id, 1)}
                              className="h-8 px-3 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-apple active:scale-95"
                              style={{ background: `${BRAND.primary}12`, color: BRAND.primary }}
                            >
                              <Plus size={12} strokeWidth={2.5} />
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filtered.size === 0 && (
          <div className="text-center py-8">
            <Package size={28} style={{ color: BRAND.muted }} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm" style={{ color: BRAND.muted }}>No items match your search</p>
          </div>
        )}
      </div>

      <div className="px-5 py-3 border-t" style={{ background: BRAND.surface, borderColor: BRAND.border }}>
        <button
          onClick={handleSave}
          className="w-full h-12 rounded-xl text-white text-sm font-semibold transition-apple hover-scale active:scale-[0.98] flex items-center justify-center gap-2"
          style={{ background: BRAND.primary, boxShadow: `0 4px 12px ${BRAND.primary}30` }}
        >
          <Check size={16} strokeWidth={2.5} />
          Save to Inventory
          {newlyAddedCount > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.25)" }}>{newlyAddedCount}</span>}
        </button>
      </div>
    </ModalShell>
  );
}

// ============= RCT ROTARY FILE SYSTEM =============
const RCT_FILE_TYPES = [
  "WaveOne Gold Small",
  "WaveOne Gold Primary",
  "WaveOne Gold Medium",
  "WaveOne Gold Large",
  "WaveOne Gold SX",
  "WaveOne (Original) Small",
  "WaveOne (Original) Primary",
  "WaveOne (Original) Large",
  "WaveOne Gold Glider",
];
const RCT_TAPERS = [
  ".02 / #15",
  ".02 / #20",
  ".04 / #25 (Primary)",
  ".06 / #25 (Primary+)",
  ".03 / #25 (Small)",
  ".05 / #35 (Medium)",
  ".08 / #45 (Large)",
  "Other",
];
const RCT_LENGTHS = ["21 mm", "25 mm", "31 mm"];
const RCT_DENTISTS = ["Dr. Lara", "Dr. Jasmine", "Dr. Dunya", "Dr. Sirwan"];

function RCTPage({ onClose, BRAND }) {
  const [dentist, setDentist] = useState("");
  const [otherDentist, setOtherDentist] = useState("");
  const [rctDate, setRctDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [urgency, setUrgency] = useState("Routine");
  const [fileRows, setFileRows] = useState([{ id: 1, type: "WaveOne Gold Primary", taper: ".04 / #25 (Primary)", length: "25 mm", qty: 1 }]);
  const [paperSize, setPaperSize] = useState("");
  const [paperQty, setPaperQty] = useState(0);
  const [obturaType, setObturaType] = useState("");
  const [obturaQty, setObturaQty] = useState(0);
  const [needleType, setNeedleType] = useState("");
  const [needleQty, setNeedleQty] = useState(0);
  const [notes, setNotes] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [nextId, setNextId] = useState(2);

  const getDentistName = () => dentist === "other" ? (otherDentist.trim() || "Other Provider") : dentist;

  const addFileRow = () => {
    setFileRows((p) => [...p, { id: nextId, type: RCT_FILE_TYPES[0], taper: RCT_TAPERS[0], length: RCT_LENGTHS[1], qty: 1 }]);
    setNextId((n) => n + 1);
  };

  const removeFileRow = (id) => setFileRows((p) => p.filter((r) => r.id !== id));

  const updateFileRow = (id, field, value) => {
    setFileRows((p) => p.map((r) => r.id === id ? { ...r, [field]: value } : r));
  };

  const accessories = [];
  if (paperSize && paperQty > 0) accessories.push(`Paper Points (${paperSize}) x${paperQty}`);
  if (obturaType && obturaQty > 0) accessories.push(`${obturaType} x${obturaQty}`);
  if (needleType && needleQty > 0) accessories.push(`Irrigation Needles (${needleType}) x${needleQty}`);

  const handleGenerate = () => {
    if (!dentist) { alert("Please select a dentist."); return; }
    if (fileRows.length === 0) { alert("Add at least one file."); return; }
    setShowSummary(true);
  };

  const buildRctPlainText = () => {
    const dateStr = rctDate ? new Date(rctDate + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";
    let out = `ASNAN DENTAL — WAVONE ENDO SUPPLY ORDER\n`;
    out += `${"=".repeat(50)}\n`;
    out += `Dentist: ${getDentistName()}\n`;
    out += `Date: ${dateStr}\n`;
    out += `Urgency: ${urgency}\n`;
    out += `\nFILES ORDERED\n${"-".repeat(16)}\n`;
    fileRows.forEach((r) => {
      out += `  ${r.qty}× ${r.type} — ${r.taper} — ${r.length}\n`;
    });
    if (accessories.length > 0) {
      out += `\nACCESSORIES\n${"-".repeat(16)}\n`;
      accessories.forEach((a) => { out += `  • ${a}\n`; });
    }
    if (notes.trim()) out += `\nNOTES: ${notes}\n`;
    out += `\n${"=".repeat(50)}\nGenerated ${new Date().toLocaleString()}\n`;
    return out;
  };

  const handleRctEmail = () => {
    const dateStr = rctDate ? new Date(rctDate + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";
    const subject = `Asnan Dental — WaveOne Order — ${getDentistName()} — ${dateStr}`;
    const body = buildRctPlainText();
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleRctCopyText = async () => {
    try {
      await navigator.clipboard.writeText(buildRctPlainText());
      alert("Order copied to clipboard");
    } catch { alert("Could not copy — try another browser"); }
  };

  const handleRctSendToConfirm = () => {
    handlePrint();
    const dateStr = rctDate ? new Date(rctDate + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";
    const subject = `Order Confirmation — WaveOne Endo — ${getDentistName()} — ${dateStr}`;
    const body = buildRctPlainText() + "\n\n---\nPlease find the order document attached to this email.";
    setTimeout(() => {
      window.location.href = `mailto:Nawaf@asnandental.ca?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }, 500);
  };

  const handlePrint = () => {
    const dateStr = rctDate ? new Date(rctDate + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const urgColors = { Routine: "#059669", Priority: "#F59E0B", Urgent: "#DC2626" };
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Asnan Dental — WaveOne Order</title>
<style>
  @page { size: A4; margin: 16mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Manrope', -apple-system, system-ui, sans-serif; color: ${BRAND_LIGHT.ink}; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .header { background: ${BRAND_LIGHT.primary}; color: white; padding: 24px 28px; border-radius: 16px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; }
  .header-left { display: flex; align-items: center; gap: 16px; }
  .logo-img { width: 60px; height: 60px; object-fit: contain; border-radius: 8px; }
  .logo-text { line-height: 1; }
  .logo-text .l1, .logo-text .l2 { display: block; font-weight: 800; letter-spacing: 0.18em; font-size: 14px; }
  .logo-text .l2 { margin-top: 4px; }
  .doc-title { text-align: right; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.85; }
  .doc-title strong { display: block; font-size: 20px; letter-spacing: -0.01em; text-transform: none; margin-top: 4px; font-weight: 700; }
  .meta { display: flex; gap: 32px; padding: 16px 0 24px; border-bottom: 2px solid ${BRAND_LIGHT.borderSolid}; margin-bottom: 24px; flex-wrap: wrap; }
  .meta-item .meta-label { color: ${BRAND_LIGHT.muted}; text-transform: uppercase; letter-spacing: 0.18em; font-weight: 600; font-size: 9px; margin-bottom: 4px; }
  .meta-item .meta-value { font-size: 16px; font-weight: 600; color: ${BRAND_LIGHT.ink}; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11px; }
  th { text-align: left; padding: 8px 10px; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: ${BRAND_LIGHT.muted}; border-bottom: 1px solid ${BRAND_LIGHT.borderSolid}; font-weight: 600; }
  td { padding: 9px 10px; border-bottom: 1px solid #F0F0F2; }
  td.qty { text-align: right; font-weight: 700; font-size: 14px; color: ${BRAND_LIGHT.primaryDeep}; width: 60px; }
  h2.section { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: ${BRAND_LIGHT.primaryDeep}; margin: 22px 0 10px; padding-bottom: 6px; border-bottom: 1.5px solid ${BRAND_LIGHT.primary}; font-weight: 700; }
  .notes-block { background: ${BRAND_LIGHT.warningBg}; border-left: 3px solid ${BRAND_LIGHT.warning}; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 12px; line-height: 1.5; }
  .notes-block strong { display: block; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #92400E; margin-bottom: 4px; }
  .footer { margin-top: 36px; padding-top: 14px; border-top: 1px solid ${BRAND_LIGHT.borderSolid}; font-size: 9px; color: ${BRAND_LIGHT.muted}; text-align: center; letter-spacing: 0.15em; text-transform: uppercase; }
  @media screen { body { background: #F0F0F5; padding: 32px; } .doc { background: white; max-width: 800px; margin: 0 auto; padding: 32px; box-shadow: 0 20px 60px rgba(0,0,0,0.08); border-radius: 12px; } }
  @media print { body { background: white; padding: 0; } .doc { box-shadow: none; padding: 0; max-width: none; } }
</style></head><body><div class="doc">
  <div class="header">
    <div class="header-left">
      <img class="logo-img" src="/logo.jpeg" alt="Asnan Dental" />
      <div class="logo-text"><span class="l1">ASNAN</span><span class="l2">DENTAL</span></div>
    </div>
    <div class="doc-title">WaveOne Endo Supply Order<strong>${dateStr}</strong></div>
  </div>
  <div class="meta">
    <div class="meta-item"><div class="meta-label">Dentist</div><div class="meta-value">${escapeHtml(getDentistName())}</div></div>
    <div class="meta-item"><div class="meta-label">Date</div><div class="meta-value">${dateStr}</div></div>
    <div class="meta-item"><div class="meta-label">Urgency</div><div class="meta-value" style="color:${urgColors[urgency]};font-weight:700;">${urgency}</div></div>
  </div>
  <h2 class="section">Files Ordered</h2>
  <table><thead><tr><th>File Type</th><th>Taper / Size</th><th>Length</th><th style="text-align:right;">Qty</th></tr></thead>
  <tbody>${fileRows.map((r) => `<tr><td>${escapeHtml(r.type)}</td><td>${escapeHtml(r.taper)}</td><td>${escapeHtml(r.length)}</td><td class="qty">${r.qty}</td></tr>`).join("")}</tbody></table>
  ${accessories.length > 0 ? `<h2 class="section">Accessories</h2>${accessories.map((a) => `<p style="font-size:12px;margin:6px 0 6px 8px;">• ${escapeHtml(a)}</p>`).join("")}` : ""}
  ${notes.trim() ? `<div class="notes-block"><strong>Notes</strong>${escapeHtml(notes)}</div>` : ""}
  <div class="footer">Asnan Dental · WaveOne Order · Generated ${new Date().toLocaleString()}</div>
</div></body></html>`;

    const dateFilename = rctDate || todayIso();
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Asnan-WaveOne-Order-${dateFilename}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const urgColors = { Routine: BRAND.success, Priority: BRAND.warning, Urgent: BRAND.danger };

  if (showSummary) {
    const dateStr = rctDate ? new Date(rctDate + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";
    return (
      <div className="min-h-screen pb-32" style={{ background: BRAND.paper, color: BRAND.ink, fontFamily: "'Manrope', system-ui, sans-serif" }}>
        <FontLink />
        <header className="sticky top-0 z-30 border-b" style={{ background: BRAND.glass, backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)", borderColor: BRAND.glassBorder }}>
          <div className="px-4 pt-3 pb-3 flex items-center gap-3">
            <button onClick={() => setShowSummary(false)} className="w-9 h-9 -ml-1 flex items-center justify-center rounded-full transition-apple hover-scale" style={{ color: BRAND.ink }}><ChevronLeft size={20} strokeWidth={2.5} /></button>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <AsnanLogo size={26} />
              <div className="flex flex-col leading-none ml-0.5">
                <span className="text-[11px] font-bold tracking-[0.18em]" style={{ color: BRAND.ink }}>ASNAN</span>
                <span className="text-[11px] font-bold tracking-[0.18em] mt-0.5" style={{ color: BRAND.ink }}>DENTAL</span>
              </div>
            </div>
          </div>
          <div className="px-4 pb-2 text-[11px] tracking-wide" style={{ color: BRAND.muted }}>WaveOne Order Summary</div>
        </header>

        <div className="px-5 pt-5">
          <div className="text-[10px] uppercase tracking-[0.25em] font-bold" style={{ color: BRAND.muted }}>WaveOne Order</div>
          <h2 className="text-[28px] leading-tight font-bold mt-1" style={{ letterSpacing: "-0.02em" }}>Order Summary</h2>

          <div className="mt-4 rounded-2xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${BRAND.ink} 0%, ${BRAND.isDark ? '#2C2C2E' : '#3A3A3C'} 100%)`, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div><div className="text-[10px] uppercase tracking-[0.15em]" style={{ color: BRAND.primary }}>Dentist</div><div className="text-sm font-bold mt-1">{getDentistName()}</div></div>
              <div><div className="text-[10px] uppercase tracking-[0.15em]" style={{ color: BRAND.primary }}>Date</div><div className="text-sm font-bold mt-1 tabular-nums">{dateStr}</div></div>
              <div><div className="text-[10px] uppercase tracking-[0.15em]" style={{ color: BRAND.primary }}>Urgency</div><div className="text-sm font-bold mt-1" style={{ color: urgColors[urgency] }}>{urgency}</div></div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <CircleDot size={13} style={{ color: BRAND.primary }} />
              <span className="text-[11px] uppercase tracking-[0.2em] font-bold" style={{ color: BRAND.primary }}>Files Ordered</span>
              <div className="h-px flex-1" style={{ background: `${BRAND.primary}30` }} />
            </div>
            <div className="rounded-2xl divide-y overflow-hidden" style={{ background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${BRAND.glassBorder}`, boxShadow: BRAND.cardShadow }}>
              {fileRows.map((r) => (
                <div key={r.id} className="p-3 flex items-center justify-between" style={{ borderColor: BRAND.border }}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold" style={{ color: BRAND.ink }}>{r.type}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: BRAND.muted }}>{r.taper} · {r.length}</div>
                  </div>
                  <div className="min-w-[32px] h-7 px-2 rounded-lg text-white text-xs font-bold flex items-center justify-center" style={{ background: BRAND.primary }}>{r.qty}</div>
                </div>
              ))}
            </div>
          </div>

          {accessories.length > 0 && (
            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-[0.2em] font-bold mb-2" style={{ color: BRAND.muted }}>Accessories</div>
              {accessories.map((a, i) => (
                <div key={i} className="text-sm py-1" style={{ color: BRAND.ink }}>• {a}</div>
              ))}
            </div>
          )}

          {notes.trim() && (
            <div className="mt-4 rounded-2xl p-3 border" style={{ background: `${BRAND.warning}10`, borderColor: `${BRAND.warning}30` }}>
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1" style={{ color: BRAND.warning }}>Notes</div>
              <div className="text-sm" style={{ color: BRAND.ink }}>{notes}</div>
            </div>
          )}
        </div>

        <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-4 pt-2" style={{ background: `linear-gradient(to top, ${BRAND.paper} 60%, transparent)` }}>
          <div className="flex flex-col gap-2 max-w-md mx-auto">
            <button onClick={handleRctSendToConfirm} className="w-full h-14 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 transition-apple hover-scale active:scale-[0.98]" style={{ background: BRAND.success, boxShadow: `0 4px 16px ${BRAND.success}30` }}>
              <Send size={16} strokeWidth={2.5} /> Send to Confirm Order
            </button>
            <button onClick={handlePrint} className="w-full h-14 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 transition-apple hover-scale active:scale-[0.98]" style={{ background: BRAND.primary, boxShadow: `0 4px 16px ${BRAND.primary}30` }}>
              <Download size={16} strokeWidth={2.5} /> Download Order
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleRctEmail} className="h-11 rounded-2xl text-xs font-semibold transition-apple hover-lift flex items-center justify-center gap-1.5" style={{ border: `1px solid ${BRAND.glassBorder}`, color: BRAND.ink, background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: BRAND.cardShadow }}>
                <Mail size={13} /> Email
              </button>
              <button onClick={handleRctCopyText} className="h-11 rounded-2xl text-xs font-semibold transition-apple hover-lift flex items-center justify-center gap-1.5" style={{ border: `1px solid ${BRAND.glassBorder}`, color: BRAND.ink, background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: BRAND.cardShadow }}>
                <Copy size={13} /> Copy Text
              </button>
            </div>
            <button onClick={() => setShowSummary(false)} className="h-11 rounded-2xl text-xs font-semibold transition-apple hover-scale flex items-center justify-center gap-1.5" style={{ color: BRAND.muted }}>
              <ChevronLeft size={14} strokeWidth={2.5} /> Edit Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-32 ${BRAND.isDark ? 'mesh-gradient-dark' : 'mesh-gradient-light'}`} style={{ background: BRAND.paper, color: BRAND.ink, fontFamily: "'Manrope', system-ui, sans-serif" }}>
      <FontLink />
      <header className="sticky top-0 z-30 border-b" style={{ background: BRAND.glass, backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)", borderColor: BRAND.glassBorder }}>
        <div className="px-4 pt-3 pb-3 flex items-center gap-3">
          <button onClick={onClose} className="w-9 h-9 -ml-1 flex items-center justify-center rounded-full transition-apple hover-scale" style={{ color: BRAND.ink }}><ChevronLeft size={20} strokeWidth={2.5} /></button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <AsnanLogo size={26} />
            <div className="flex flex-col leading-none ml-0.5">
              <span className="text-[11px] font-bold tracking-[0.18em]" style={{ color: BRAND.ink }}>ASNAN</span>
              <span className="text-[11px] font-bold tracking-[0.18em] mt-0.5" style={{ color: BRAND.ink }}>DENTAL</span>
            </div>
          </div>
        </div>
        <div className="px-4 pb-2 text-[11px] tracking-wide" style={{ color: BRAND.muted }}>RCT Rotary File System</div>
      </header>

      <div className="px-5 pt-5">
        <h2 className="text-[28px] leading-tight font-bold" style={{ letterSpacing: "-0.02em" }}>
          WaveOne<br /><span style={{ color: BRAND.primary }}>Endodontic Order</span>
        </h2>

        {/* Dentist & Date */}
        <div className="mt-5">
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3 flex items-center gap-2" style={{ color: BRAND.muted }}>
            Dentist & Order Info
            <div className="h-px flex-1" style={{ background: BRAND.border }} />
          </div>
          <div className="rounded-2xl p-4" style={{ background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${BRAND.glassBorder}`, boxShadow: BRAND.cardShadow }}>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold mb-2" style={{ color: BRAND.muted }}>
                  Dentist <span style={{ color: BRAND.danger }}>*</span>
                </label>
                <select value={dentist} onChange={(e) => { setDentist(e.target.value); if (e.target.value !== "other") setOtherDentist(""); }} className="w-full h-11 px-3 rounded-xl text-sm outline-none transition-apple" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }}>
                  <option value="">— Select dentist —</option>
                  {RCT_DENTISTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  <option value="other">Other Provider</option>
                </select>
                {dentist === "other" && (
                  <input type="text" value={otherDentist} onChange={(e) => setOtherDentist(e.target.value)} placeholder="Enter provider name…" className="mt-2 w-full h-11 px-3 rounded-xl text-sm outline-none transition-apple" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }} />
                )}
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold mb-2" style={{ color: BRAND.muted }}>Order Date</label>
                <input type="date" value={rctDate} min={todayIso()} onChange={(e) => setRctDate(e.target.value < todayIso() ? todayIso() : e.target.value)} className="w-full h-11 px-3 rounded-xl text-sm outline-none transition-apple" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${BRAND.border}`, color: BRAND.ink, colorScheme: BRAND === BRAND_DARK ? "dark" : "light" }} />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold mb-2" style={{ color: BRAND.muted }}>Urgency</label>
                <div className="flex gap-2">
                  {(["Routine", "Priority", "Urgent"] as const).map((u) => (
                    <button key={u} onClick={() => setUrgency(u)} className="flex-1 h-10 rounded-xl text-xs font-semibold transition-apple hover-scale" style={{ background: urgency === u ? (u === "Urgent" ? BRAND.danger : BRAND.primary) : "transparent", color: urgency === u ? "white" : BRAND.muted, border: `1px solid ${urgency === u ? (u === "Urgent" ? BRAND.danger : BRAND.primary) : BRAND.border}`, boxShadow: urgency === u ? `0 2px 8px ${u === "Urgent" ? BRAND.danger : BRAND.primary}30` : "none" }}>
                      {u === "Routine" ? "Routine" : u === "Priority" ? "Priority" : "Urgent"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* File rows */}
        <div className="mt-5">
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3 flex items-center gap-2" style={{ color: BRAND.muted }}>
            WaveOne File Order
            <div className="h-px flex-1" style={{ background: BRAND.border }} />
          </div>

          <div className="space-y-3">
            {fileRows.map((row) => (
              <div key={row.id} className="rounded-2xl p-3" style={{ background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${BRAND.glassBorder}`, boxShadow: BRAND.cardShadow }}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[9px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: BRAND.muted }}>File Type</label>
                    <select value={row.type} onChange={(e) => updateFileRow(row.id, "type", e.target.value)} className="w-full h-10 px-2 rounded-lg text-xs outline-none" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }}>
                      {RCT_FILE_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: BRAND.muted }}>Taper / Size</label>
                    <select value={row.taper} onChange={(e) => updateFileRow(row.id, "taper", e.target.value)} className="w-full h-10 px-2 rounded-lg text-xs outline-none" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }}>
                      {RCT_TAPERS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-[9px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: BRAND.muted }}>Length</label>
                      <select value={row.length} onChange={(e) => updateFileRow(row.id, "length", e.target.value)} className="w-full h-10 px-2 rounded-lg text-xs outline-none" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }}>
                        {RCT_LENGTHS.map((l) => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                    <div className="w-16">
                      <label className="block text-[9px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: BRAND.muted }}>Qty</label>
                      <input type="number" min={1} max={99} value={row.qty} onChange={(e) => updateFileRow(row.id, "qty", Math.max(1, parseInt(e.target.value) || 1))} className="w-full h-10 px-2 rounded-lg text-xs border outline-none text-center font-bold" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }} />
                    </div>
                  </div>
                </div>
                {fileRows.length > 1 && (
                  <button onClick={() => removeFileRow(row.id)} className="mt-2 text-[10px] font-semibold flex items-center gap-1" style={{ color: BRAND.danger }}>
                    <Trash2 size={11} /> Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addFileRow} className="mt-2 w-full h-12 rounded-2xl border-2 border-dashed text-sm font-semibold flex items-center justify-center gap-2 transition-apple hover-scale" style={{ borderColor: BRAND.border, color: BRAND.muted }}>
            <Plus size={16} strokeWidth={2.5} /> Add File
          </button>
        </div>

        {/* Accessories */}
        <div className="mt-5">
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3 flex items-center gap-2" style={{ color: BRAND.muted }}>
            Accessories & Consumables
            <div className="h-px flex-1" style={{ background: BRAND.border }} />
          </div>
          <div className="rounded-2xl p-4 space-y-3" style={{ background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${BRAND.glassBorder}`, boxShadow: BRAND.cardShadow }}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: BRAND.muted }}>Paper Points</label>
                <select value={paperSize} onChange={(e) => setPaperSize(e.target.value)} className="w-full h-10 px-2 rounded-lg text-xs outline-none" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }}>
                  <option value="">— None —</option>
                  <option>Small (15-20)</option><option>Medium (25-30)</option><option>Large (35-40)</option><option>Assorted</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: BRAND.muted }}>Paper Pts Qty</label>
                <input type="number" min={0} value={paperQty} onChange={(e) => setPaperQty(Math.max(0, parseInt(e.target.value) || 0))} className="w-full h-10 px-2 rounded-lg text-xs border outline-none text-center" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: BRAND.muted }}>Obturation Tips</label>
                <select value={obturaType} onChange={(e) => setObturaType(e.target.value)} className="w-full h-10 px-2 rounded-lg text-xs outline-none" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }}>
                  <option value="">— None —</option>
                  <option>WaveOne Small Tips</option><option>WaveOne Primary Tips</option><option>WaveOne Large Tips</option><option>WaveOne Gold Glider Tips</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: BRAND.muted }}>Obtura Qty</label>
                <input type="number" min={0} value={obturaQty} onChange={(e) => setObturaQty(Math.max(0, parseInt(e.target.value) || 0))} className="w-full h-10 px-2 rounded-lg text-xs border outline-none text-center" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: BRAND.muted }}>Irrigation Needles</label>
                <select value={needleType} onChange={(e) => setNeedleType(e.target.value)} className="w-full h-10 px-2 rounded-lg text-xs outline-none" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }}>
                  <option value="">— None —</option>
                  <option>27G (1.5")</option><option>30G (1")</option><option>NaviTip 30G</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: BRAND.muted }}>Needle Qty</label>
                <input type="number" min={0} value={needleQty} onChange={(e) => setNeedleQty(Math.max(0, parseInt(e.target.value) || 0))} className="w-full h-10 px-2 rounded-lg text-xs border outline-none text-center" style={{ background: BRAND.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${BRAND.border}`, color: BRAND.ink }} />
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-5">
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3 flex items-center gap-2" style={{ color: BRAND.muted }}>
            Additional Notes
            <div className="h-px flex-1" style={{ background: BRAND.border }} />
          </div>
          <div className="rounded-2xl p-3" style={{ background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${BRAND.glassBorder}`, boxShadow: BRAND.cardShadow }}>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special instructions or requests…" rows={3} className="w-full bg-transparent border-0 resize-none text-sm leading-relaxed focus:outline-none placeholder:opacity-50" style={{ color: BRAND.ink }} />
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-4 pt-2" style={{ background: `linear-gradient(to top, ${BRAND.paper} 60%, transparent)` }}>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 h-14 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-apple hover-scale" style={{ background: BRAND.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${BRAND.glassBorder}`, color: BRAND.ink }}>
            <ChevronLeft size={18} strokeWidth={2.5} /> Back
          </button>
          <button onClick={handleGenerate} className="flex-[1.5] h-14 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 transition-apple hover-scale active:scale-[0.98]" style={{ background: BRAND.primary, boxShadow: `0 4px 16px ${BRAND.primary}30` }}>
            Generate Summary <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============= UTILITIES =============
function escapeHtml(s) {
  if (s == null) return "";
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function FontLink() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
      input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
      body { font-family: 'Manrope', system-ui, sans-serif; }
      .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      ::-webkit-scrollbar { width: 0; height: 0; }
    `}</style>
  );
}
  
