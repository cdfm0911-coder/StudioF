export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const cls =
    size === "lg" ? "h-28 w-auto max-w-[260px]" : size === "sm" ? "h-10 w-auto" : "h-14 w-auto";
  return (
    <span className="inline-flex items-center justify-center rounded-xl bg-white px-3 py-1.5 shadow-sm ring-1 ring-gray-200">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.jpg" alt="Studio Functional Fitness" className={`${cls} object-contain`} />
    </span>
  );
}
