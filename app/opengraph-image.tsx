import { ImageResponse } from "next/og";
import { eventConfig } from "@/config/event";

export const alt = `${eventConfig.eventName} - ${eventConfig.tagline}`;
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#0b0810",
        color: "#f8f4ff",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: "72px 84px",
        width: "100%"
      }}
    >
      <div style={{ color: "#ff2bd6", display: "flex", fontSize: 28, fontWeight: 700 }}>
        {eventConfig.tagline}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            background: "linear-gradient(90deg, #c026ff, #ff2bd6)",
            height: 8,
            width: 150
          }}
        />
        <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05 }}>
          {eventConfig.eventName}
        </div>
        <div style={{ color: "#b9abc7", display: "flex", fontSize: 30 }}>
          16 November 2026 · {eventConfig.doorsOpenTime} · {eventConfig.venueName}, {eventConfig.venueAddress}
        </div>
      </div>
      <div style={{ color: "#c026ff", display: "flex", fontSize: 24, fontWeight: 700 }}>
        Tickets available now
      </div>
    </div>,
    size
  );
}
