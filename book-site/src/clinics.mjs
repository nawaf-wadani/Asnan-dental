// Clinic and page data for book.asnandental.ca.
//
// Each clinic gets its own landing page, service pages, thank-you page, form and
// Google Ads tag. Nothing here is shared between clinics except the Meta Pixel.
//
// Content rules (dental advertising): no prices or promotions unless the clinic
// confirms them in writing, no testimonials or reviews, no "best"/"#1" or other
// comparisons, no guarantees, no "painless", and no phone number until the clinic
// confirms the right one for each location. build.mjs checks the output for these.
//
// Facts below (addresses, languages, hours, CDCP) are as published on
// newpatients.asnandental.ca and its privacy policy.

export const META_PIXEL_ID = "4672127656389507";

export const PRIVACY_URL = "https://newpatients.asnandental.ca/privacy/";

export const HOURS = "Mon to Sat, 9 a.m. to 5 p.m.";

export const clinics = [
  {
    slug: "hazeldean",
    name: "Hazeldean",
    fullName: "Asnan Dental Hazeldean",
    area: "Stittsville",
    shortAddress: "5597 Hazeldean Rd, Unit 2, Stittsville",
    street: "5597 Hazeldean Rd, Unit 2",
    locality: "Stittsville, ON K2S 0P5",
    languages: "English, Arabic",
    variant: "hazel", // mint card, as on newpatients
    mapsQuery: "Asnan Dental, 5597 Hazeldean Rd, Unit 2, Stittsville, ON K2S 0P5",
    formName: "book-hazeldean",
    services: ["invisalign"],
    googleAdsId: "AW-18489860703",
    // Pasted exactly as supplied.
    googleTag: `<!-- Google tag (gtag.js) - Asnan Dental Hazeldean -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18489860703"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-18489860703');
</script>`,
    conversionComment: "<!-- Event snippet for HZ - Appointment request conversion page -->",
    conversionSendTo: "AW-18489860703/wBCrCKmcir4dEN_E0_BE",
  },
  {
    slug: "bank-street",
    name: "Bank Street",
    fullName: "Asnan Dental Bank Street",
    area: "Ottawa",
    shortAddress: "Blue Heron Mall, 1500 Bank St, Suite 204, Ottawa",
    street: "1500 Bank St, Suite 204 (Blue Heron Mall, 2nd floor)",
    locality: "Ottawa, ON K1H 7Z2",
    languages: "English, Arabic, Kurdish",
    variant: "bank", // purple card, as on newpatients
    mapsQuery: "Asnan Dental, 1500 Bank St, Suite 204, Ottawa, ON K1H 7Z2",
    formName: "book-bank-street",
    services: ["invisalign"],
    googleAdsId: "AW-18554348744",
    googleTag: `<!-- Google tag (gtag.js) - Asnan Dental Bank Street -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18554348744"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-18554348744');
</script>`,
    conversionComment: "<!-- Event snippet for BS – Appointment request conversion page -->",
    conversionSendTo: "AW-18554348744/Kib8CMeakL4dEMjJs49F",
  },
];

// Same choices and values as the newpatients form.
export const reasons = [
  { value: "Check-up and cleaning", label: "Check-up" },
  { value: "Pain or a concern", label: "Pain" },
  { value: "Invisalign", label: "Invisalign" },
  { value: "Something else", label: "Other" },
];
export const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const times = ["Any time", "Morning", "Afternoon"];

// The clinic's main new-patient page.
export const landing = {
  requestType: "New patient request",
  title: "New patients | {clinic}, {area}",
  description:
    "New to Asnan Dental? Leave your details and our {name} team in {area} will call you to book your first visit.",
  eyebrow: "Now welcoming new patients",
  headline: ["New to Asnan?", "We'd love to meet you."],
  support: "Leave your details and our {name} team will call you to book.",
  heroNote: "Canadian Dental Care Plan accepted",
  formTitle: "Request your first visit",
  button: "Request my visit",
  reason: "Check-up and cleaning",
  about: null,
};

// Optional service pages: /<clinic>/<slug>/. Add a slug to a clinic's
// `services` list to publish it for that clinic.
export const services = {
  invisalign: {
    requestType: "Invisalign consultation request",
    title: "Invisalign consultation | {clinic}, {area}",
    description:
      "Thinking about Invisalign? Leave your details and our {name} team in {area} will call you to book a consultation.",
    eyebrow: "Invisalign consultations",
    headline: ["Thinking about Invisalign?", "Let's talk it through."],
    support: "Leave your details and our {name} team will call you to book a consultation with the dentist.",
    heroNote: "",
    formTitle: "Request a consultation",
    button: "Request my consultation",
    reason: "Invisalign",
    about: {
      heading: "What Invisalign is",
      paragraphs: [
        "Invisalign treatment uses a series of clear, removable aligners to move teeth gradually.",
        "At your consultation, the dentist examines your teeth and bite, asks what you would like to change, and explains whether aligners suit you and what treatment would involve.",
      ],
      footnote: "Invisalign is a trademark of Align Technology, Inc.",
    },
  },
};
