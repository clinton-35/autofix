export default function Banner({
  type,
  msg,
}: {
  type?: string;
  msg?: string;
}) {
  if (!msg || msg.length > 250 || (type !== "ok" && type !== "error")) {
    return null;
  }
  return (
    <p
      role="status"
      className={`mt-5 border-l-4 bg-white p-4 text-sm font-medium ${
        type === "ok"
          ? "border-green-600 text-green-700"
          : "border-brand text-brand"
      }`}
    >
      {msg}
    </p>
  );
}