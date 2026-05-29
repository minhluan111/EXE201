function getAllowedSeat(table, num_of_people) {
  return num_of_people <= 2 ? table.max_seats === 2 : table.max_seats === 4;
}

export default function TableItem({ table, num_of_people, onSelect }) {
  const available = table.status === "available";
  const allowed = getAllowedSeat(table, num_of_people);
  const disabled = !available || !allowed;

  const cls = disabled
    ? available
      ? "table-item table-item--disabled"
      : "table-item table-item--occupied"
    : "table-item table-item--available";

  const size = table.max_seats === 4 ? 64 : 52;
  const x = table.coordinate_x;
  const y = table.coordinate_y;

  return (
    <button
      type="button"
      className={cls}
      style={{ left: x, top: y, width: size, height: size }}
      disabled={disabled}
      onClick={() => onSelect(table)}
      aria-label={table.name}
    >
      <div className="table-item__id">{table.name.replace("Bàn ", "")}</div>
      <div className="table-item__seats">{table.max_seats}</div>
    </button>
  );
}
