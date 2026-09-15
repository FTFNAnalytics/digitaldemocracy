import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const NAVY = "#0a192f";
const ACCENT = "#a2ff00";

const NODES = [
  { x: 868, y: 132, r: 6 },
  { x: 972, y: 188, r: 11 },
  { x: 1086, y: 148, r: 7 },
  { x: 938, y: 292, r: 9 },
  { x: 1074, y: 286, r: 7 },
  { x: 1012, y: 414, r: 10 },
  { x: 876, y: 396, r: 6 },
  { x: 1138, y: 372, r: 8 },
  { x: 1168, y: 236, r: 5 },
  { x: 848, y: 246, r: 5 },
  { x: 1110, y: 500, r: 6 },
];

function titleFontSize(title: string): number {
  if (title.length > 72) return 34;
  if (title.length > 54) return 42;
  if (title.length > 36) return 50;
  return 60;
}

export function brandedOgImage(input: {
  title: string;
  subtitle?: string;
  kicker?: string;
  badge?: string;
}) {
  const kicker = input.kicker ?? "CENTER FOR DIGITAL DEMOCRACY";
  const titleSize = titleFontSize(input.title);

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          backgroundColor: NAVY,
          color: "white",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 6,
            backgroundColor: ACCENT,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -60,
            top: 70,
            width: 460,
            height: 460,
            borderRadius: 999,
            border: "2px solid rgba(162,255,0,0.18)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 12,
            top: 138,
            width: 324,
            height: 324,
            borderRadius: 999,
            border: "2px solid rgba(162,255,0,0.32)",
            display: "flex",
          }}
        />
        {NODES.map((node) => (
          <div
            key={`${node.x}-${node.y}`}
            style={{
              position: "absolute",
              left: node.x,
              top: node.y,
              width: node.r * 2,
              height: node.r * 2,
              borderRadius: 999,
              backgroundColor: ACCENT,
              display: "flex",
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            top: 52,
            left: 64,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: `2px solid ${ACCENT}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 18,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                backgroundColor: ACCENT,
                display: "flex",
              }}
            />
          </div>
          <div
            style={{
              color: ACCENT,
              fontSize: 15,
              letterSpacing: 3.2,
              fontWeight: 700,
              display: "flex",
            }}
          >
            {kicker}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 64,
            top: 150,
            width: 740,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {input.badge ? (
            <div
              style={{
                display: "flex",
                backgroundColor: ACCENT,
                color: "#142200",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 2,
                padding: "8px 16px",
                borderRadius: 999,
                marginBottom: 20,
                alignSelf: "flex-start",
              }}
            >
              {input.badge}
            </div>
          ) : null}
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: -1.2,
              display: "flex",
            }}
          >
            {input.title}
          </div>
          {input.subtitle ? (
            <div
              style={{
                marginTop: 20,
                fontSize: 24,
                color: "rgba(255,255,255,0.72)",
                lineHeight: 1.35,
                display: "flex",
              }}
            >
              {input.subtitle}
            </div>
          ) : null}
        </div>
        <div
          style={{
            position: "absolute",
            left: 64,
            bottom: 46,
            color: ACCENT,
            fontSize: 18,
            letterSpacing: 0.6,
            display: "flex",
          }}
        >
          center4digitaldemocracy.com
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
