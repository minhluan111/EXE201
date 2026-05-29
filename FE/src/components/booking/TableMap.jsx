import { useMemo } from "react";
import TableItem from "./TableItem.jsx";

export default function TableMap({ tables, num_of_people, onSelect }) {
  const filtered = useMemo(() => tables || [], [tables]);

  return (
    <div className="floor-wrap">
      <div className="floor">
        {filtered.map((t) => (
          <TableItem
            key={t.id}
            table={t}
            num_of_people={num_of_people}
            onSelect={onSelect}
          />
        ))}

        <div className="floor-label">Sơ đồ khu vực (demo)</div>
      </div>
    </div>
  );
}
