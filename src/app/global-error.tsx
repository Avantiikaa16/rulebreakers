"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0b1020",
          color: "#f2f5ff",
          fontFamily: "ui-rounded, 'Segoe UI', system-ui, sans-serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div>
          <p style={{ fontSize: "2.5rem" }}>🛠️</p>
          <h1>Clue needs a moment</h1>
          <p style={{ opacity: 0.7 }}>Something went wobbly. Let&rsquo;s try again.</p>
          <button
            onClick={reset}
            style={{
              marginTop: "1rem",
              padding: "0.8rem 1.6rem",
              borderRadius: "9999px",
              border: "none",
              background: "#38cfd9",
              color: "#0b1020",
              fontWeight: 600,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
