import { TimeSlot } from "@common/models/time-slot.entity";
import { Dropdown, DropdownProps } from "semantic-ui-react";


interface TimeSelectProps extends DropdownProps {
  min?: string;
  max?: string;
  free?: TimeSlot[];
}

export const TimeSelect: React.FC<TimeSelectProps> = (x) => {
  const options = new Array(48)
    .fill(0)
    .map((z, i) => `${Math.floor(i / 2) < 10 ? "0" : ""}${Math.floor(i / 2)}:${i % 2 ? "30" : "00"}`)
    .filter(s => x.free && x.free.length ? x.free.some(z => s >= z.start && s < z.end) : s >= x.min && s <= x.max)
    .map((t) => ({ key: t, text: t, value: t }));
  return (
    <Dropdown
      placeholder="00:00"
      selection
      options={options}
      {...x}
      style={{ minWidth: 0, ...x.style }}
    />
  );
};

TimeSelect.defaultProps = {
  min: "00:00",
  max: "23:30"
}