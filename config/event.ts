export const eventConfig = {
  eventId: "DJNIGHT2026",
  eventName: "Open Mic & DJ night",
  tagline: "SLIIT Choir presents",
  date: "2026-11-16T17:30:00+05:30",
  venueName: "New Building",
  venueAddress: "14th floor",
  mapLink: "https://maps.app.goo.gl/XfWL192RCFhARMyA9",
  ticketPrice: 500,
  currency: "LKR",
  maxTicketsPerOrder: 5,
  totalCapacity: undefined as number | undefined,
  salesOpen: true,
  bank: {
    accountName: "Dumindu Mendis",
    bankName: "People's Bank",
    accountNumber: "081200210025946",
    branch: "Ruwanwella",
    paymentInstructions:
      "Transfer and upload recipt put reference as DJ-ITXXXXXXXX",
  },
  contact: {
    supportEmail: "sliitchoir@gmail.com",
    supportPhone: "0714211115",
    supportContacts: [
      { name: "Dumindu", phone: "071 4211115" },
      { name: "Pishon", phone: "071 572 9549" },
    ],
  },
  theme: {
    primary: "#c026ff",
    accent: "#ff2bd6",
    background: "#0b0810",
    surface: "#17111f",
    foreground: "#f8f4ff",
    muted: "#b9abc7",
    logoPath: "",
    heroImagePath: "",
  },
  ticketPrefix: "DJ-",
  emailSubject: "Your Tickets have been approved",
  emailFooterNote:
    "Use these to gain access for the DJ night on 16th November at 14th floor new building",
} as const;

export type EventConfig = typeof eventConfig;

export const {
  eventId,
  eventName,
  tagline,
  date,
  venueName,
  venueAddress,
  mapLink,
  ticketPrice,
  currency,
  maxTicketsPerOrder,
  totalCapacity,
  salesOpen,
  ticketPrefix,
  emailSubject,
  emailFooterNote,
} = eventConfig;
