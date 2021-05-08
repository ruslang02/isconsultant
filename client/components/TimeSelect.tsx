import { TimeSlot } from "@common/models/time-slot.entity";
import { useEffect } from "react";
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
    .filter(s => x.free ? x.free.some(z => s >= z.start && s < z.end) : s >= x.min && s <= x.max)
    .map((t) => ({ key: t, text: t, value: t }));
  useEffect(() => {
    if (!options.find(s => s.key !== x.value)) {
      x.onChange(undefined, { ...x, value: options[0]?.key })
    }
  }, [x.value])
  return (
    <Dropdown
      selection
      options={options}
      placeholder={options.length === 0 && "No slots available." }
      {...x}
      style={{ minWidth: 0, ...x.style }}
    />
  );
};

TimeSelect.defaultProps = {
  min: "00:00",
  max: "23:30"
}