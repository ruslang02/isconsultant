import { ArrangeEventDto } from "@common/dto/arrange-event.dto";
import { CreateUserDto } from "@common/dto/create-user.dto";
import { ErrorDto } from "@common/dto/error.dto";
import { GetUserDto } from "@common/dto/get-user.dto";
import router from "next/router";
import React, { useState, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Form, Button, TextArea, Image, Dropdown } from "semantic-ui-react";
import { api } from "utils/api";
import { MessageContext } from "utils/MessageContext";
import { useAuth } from "utils/useAuth";
import { UserCacheContext } from "utils/UserCacheContext";

export function EventArrange({ open, onClose, description: descr, lawyerId }: { open: boolean; onClose: () => void; description?: string; lawyerId?: string}) {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState(descr);
  const [auth] = useAuth();
  const [users, setUsers] = useContext(UserCacheContext);
  const [lawyer, setLawyer] = useState<string | undefined>(lawyerId);
  const { setValue: setMessage } = useContext(MessageContext);

  useEffect(() => {
    if (open) setLawyer(lawyerId);
  }, [open])

  const handleSubmit = async () => {
    let access_token = auth?.access_token;
    if (!access_token) {
      try {
        access_token = (await api.post<{ access_token: string }>("/auth/register", {
          email,
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
          password,
        } as CreateUserDto)).data.access_token;

        createRequest(access_token);
        setMessage(
          "Your meeting request was created. In order for it to be accepted, you need to <b>verify your email address</b> using the link we sent you."
        );
        onClose();
      } catch (e) {
        console.log(e);
        setMessage("Error: " + (e as ErrorDto).message);
      }
    } else {
      createRequest(access_token);
      setMessage(
        "Your meeting request was created. You are now being redirected to the meetings page."
      );
      router.push("/meetings");
    }
  };
  const createRequest = async (access_token: string) => {
    // TODO: choose time?
    const timespan_end = new Date();
    timespan_end.setDate(timespan_end.getDate() + 1);
    timespan_end.setHours(0, 0, 0);
    try {
      await api.post("/events/request", {
        description,
        lawyer_id: lawyer,
        additional_ids: [auth.user.id],
        timespan_start: new Date().toISOString(),
        timespan_end: timespan_end.toISOString(),
      } as ArrangeEventDto, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
    } catch (e) {}
  };

  return (
    <Modal size="small" open={open} onClose={onClose}>
      <Modal.Header>Arrange a meeting</Modal.Header>
      <Modal.Content>
        <Form onSubmit={handleSubmit}>
          {!auth?.access_token ? (
            <>
              <Form.Field>
                <label>First name:</label>
                <input
                  placeholder="John"
                  onChange={(e) => setFirstName(e.target.value)}
                  type="text"
                  value={firstName}
                />
              </Form.Field>
              <Form.Field>
                <label>Middle name:</label>
                <input
                  onChange={(e) => setMiddleName(e.target.value)}
                  value={middleName}
                />
              </Form.Field>
              <Form.Field>
                <label>Last name:</label>
                <input
                  placeholder="Smith"
                  onChange={(e) => setLastName(e.target.value)}
                  value={lastName}
                />
              </Form.Field>
              <Form.Field>
                <label>E-mail:</label>
                <input
                  placeholder="example@example.org"
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  value={email}
                />
              </Form.Field>
              <Form.Field>
                <label>Password:</label>
                <input
                  placeholder=""
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
              </Form.Field>
            </>
          ) : <>
          <Form.Field>
          <label>From:</label>
          <div>
            <Image src={auth?.user?.avatar} size="tiny" style={{width: "36px"}} avatar />
            {" "}
            <b>{auth?.user?.first_name} {auth?.user?.last_name}</b>
          </div>
        </Form.Field>
          <Form.Field>
          <label>To:</label>
              <Dropdown
                placeholder="First available lawyer"
                fluid
                search
                selection
                onChange={(_e, d) => {
                  setLawyer(d.value.toString());
                }}
                onSearchChange={(_e, d) => {
                  api.get<GetUserDto[]>(`/users/search?query=${d.searchQuery}`).then(({ data }) => {
                    setUsers([...(users.filter(u => !data.some(v => v.id === u.id))), ...data]);
                  });
                }}
                options={users.map((user) => ({
                  key: user.id,
                  text: `${user.first_name} ${user.last_name}`,
                  value: user.id,
                }))}
                value={lawyer}
              />
        </Form.Field>
        </>}
          <Form.Field>
            <label>Description:</label>
            <textarea
              onChange={(e) => setDescription(e.target.value)}
              value={description}
            ></textarea>
          </Form.Field>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button onClick={(e) => onClose()} type="button">
              Cancel
            </Button>
            <Button primary type="submit">
              Send
            </Button>
          </div>
        </Form>
      </Modal.Content>
    </Modal>
  );
}
