export default function ProgressBar({ value, color = "#2D6A4F" }) {
  return (
    <div style={{ background: "#E5E0D5", borderRadius: 99, height: 8, overflow: "hidden" }}>
      <div
        style={{
          width: `${value}%`,
          height: "100%",
          background: color,
          borderRadius: 99,
          transition: "width 1s ease",
        }}
      />
    </div>
  );
}