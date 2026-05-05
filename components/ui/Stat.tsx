type Props = {
  n: number | string;
  label: string;
};

export function Stat({ n, label }: Props) {
  return (
    <div>
      <div className="font-display text-[32px] text-burgundy font-medium leading-none tracking-tight">
        {n}
      </div>
      <div className="text-[11px] text-warm-500 tracking-widest uppercase font-semibold mt-1.5">
        {label}
      </div>
    </div>
  );
}
