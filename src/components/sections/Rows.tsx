export function Rows({ rows }: { rows: readonly { label: string; value: string }[] }) {
  return (
    <dl className="mt-5 border-t border-line md:mt-8" data-reveal>
      {rows.map((r) => (
        <div key={r.label} className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 md:py-4">
          <dt className="text-sm md:text-base">{r.label}</dt>
          <dd className="meta text-right text-[0.68rem] text-text-3 md:text-sm">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
