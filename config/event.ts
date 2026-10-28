export const eventConfig = {
  eventId: "DJNIGHT2026",
  eventName: "DJ Night & Open mic",
  tagline: "join the rave",
  date: "2026-12-31T22:00:00+05:30",
  doorsOpenTime: "5.30PM",
  venueName: "New Building",
  venueAddress: "14th floor",
  mapLink: "https://maps.google.com/?q=REPLACE_ME",
  ticketPrice: 500,
  currency: "LKR",
  maxTicketsPerOrder: 5,
  totalCapacity: undefined as number | undefined,
  salesOpen: true,
  bank: {
    accountName: "Malintha Perera",
    bankName: "Test Bank",
    accountNumber: "120192018989",
    branch: "Malabe",
    paymentInstructions: "Transfer and upload recipt"
  },
  contact: {
    supportEmail: "sliitchoir@gmail.com",
    supportPhone: "0714266663"
  },
  theme: {
    primary: "#d8ff3e",
    accent: "#ff3cac",
    logoPath: "",
    heroImagePath: ""
  },
  ticketPrefix: "DJ-",
  emailSubject: "Your Tickets have been approved",
  emailFooterNote: "Use these to gain access for the DJ night on 16th November at 14th floor new building"
} as const;

export type EventConfig = typeof eventConfig;

export const {
  eventId,
  eventName,
  tagline,
  date,
  doorsOpenTime,
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
  emailFooterNote
} = eventConfig;
