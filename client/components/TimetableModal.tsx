import { GetUserDto } from "@common/dto/get-user.dto";
import { TimeSlot } from "@common/models/time-slot.entity";
import React, { useEffect, useState } from "react";
import { Button, Modal } from "semantic-ui-react";
import { api } from "utils/api";
import { TimeSelect } from "./TimeSelect";

interface TimetableModalProps {
    editable?: boolean
    open: boolean
    onClose: () => void
}

const textDates = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

const Slot = ({ slot, setSlot }) => (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
        <span style={{ marginRight: "auto" }}>{ textDates[slot.day] }</span>
        <TimeSelect value={slot?.start}
                    onChange={(e, { value }) => {
                        setSlot({
                            day: slot.day,
                            start: value.toString(),
                            end: slot.end ?? "23:30",
                        });
                    }} />
        <span style={{ margin: "0 10px" }}>-</span>
        <TimeSelect value={slot?.end}
                    onChange={(e, { value }) => {
                        setSlot({
                            day: slot.day,
                            start: slot.start ?? "00:00",
                            end: value.toString(),
                        });
                    }} />
    </div>
);

export const TimetableModal: React.FC<TimetableModalProps> = ({
    open,
    onClose,
}) => {
    const [slots, setSlots] = useState<Partial<TimeSlot>[]>([]);
    useEffect(() => {
        (async() => {
            try {
                const { data, status } = await api.get<GetUserDto>("/users/@me");
                if (status > 300) {
                    throw data;
                }

                setSlots(data.time_slots ?? []);
            } catch (e) {
                console.error(e);
            }
        })();
    }, []);
    return (
        <Modal style={{ width: "400px" }} onClose={() => onClose()} open={open}>
            <Modal.Header>Configure your timetable</Modal.Header>
            <Modal.Content>
                <p>Users will not be able to forward you meeting requests outside of the timetable.</p>
                { new Array(7).fill(0).map((v, i) => (
                    <Slot key={i}
                          slot={
                              slots.find(s => s.day === i) ?? {
                                  day: i,
                                  start: "00:00",
                                  end: "23:30",
                          }
                          }
                          setSlot={slot => {
                              setSlots([...slots.filter(s => s.day !== i), slot]);
                          }} />
                )) }
                <div style={{ textAlign: "right", marginTop: "20px" }}>
                    <Button onClick={() => onClose()}>Close</Button>
                    <Button primary onClick={() => {
                        api.patch("/users/@me/time_slots", slots);
                        onClose();
                    }}>Save</Button>
                </div>
            </Modal.Content>
        </Modal>
    );
};
