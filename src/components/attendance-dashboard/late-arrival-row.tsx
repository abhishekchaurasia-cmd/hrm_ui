export interface LateArrivalItem {
  name: string;
  role: string;
  checkIn: string;
  avatarBg: string;
  initials: string;
  level: number;
}

function AlertBars({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 7 }).map((_, idx) => (
        <span
          key={idx}
          className="h-5 w-0.5 rounded-full"
          style={{
            backgroundColor:
              idx < level
                ? 'rgba(249, 115, 22, 0.9)'
                : 'rgba(148, 163, 184, 0.2)',
          }}
        />
      ))}
    </div>
  );
}

export function LateArrivalRow({
  name,
  role,
  checkIn,
  avatarBg,
  initials,
  level,
}: LateArrivalItem) {
  return (
    <div className="border-border/30 bg-background/40 flex items-center justify-between rounded-md border px-3 py-3">
      <div className="flex items-center gap-3">
        <span
          className="inline-flex size-8 items-center justify-center rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: avatarBg }}
        >
          {initials}
        </span>
        <div>
          <p className="text-sm font-semibold">{name}</p>
          <p className="text-muted-foreground text-xs">{role}</p>
        </div>
      </div>

      <p className="text-sm">
        Check-in: <span className="font-semibold">{checkIn}</span>
      </p>

      <AlertBars level={level} />
    </div>
  );
}
