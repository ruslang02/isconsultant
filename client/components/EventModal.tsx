import { GetEventDto } from "@common/dto/get-event.dto";
import React, { useState } from "react";
import { Button, Modal } from "semantic-ui-react";

interface EventModalProps {
  editable?: boolean;
  open: boolean;
  onClose: () => void;
  onSubmit: (e: GetEventDto) => void;
  event: GetEventDto;
}

export function EventModal({ editable, open, onClose, event, onSubmit }: EventModalProps) {
  const [temp, setTemp] = useState(event);
  return (
    <Modal size="tiny" onClose={() => onClose()} open={open}>
      <Modal.Header>Update meeting info</Modal.Header>
      <Modal.Content></Modal.Content>
      <Modal.Actions>
        <Button color="black" onClick={() => onClose()}>
          Cancel
        </Button>
        <Button
          content="Update"
          labelPosition="right"
          icon="edit"
          onClick={() => onSubmit(temp)}
          positive />
      </Modal.Actions>
    </Modal>
  );
}
