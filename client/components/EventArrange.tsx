import { ArrangeEventDto } from "@common/dto/arrange-event.dto";
import { CreateUserDto } from "@common/dto/create-user.dto";
import { ErrorDto } from "@common/dto/error.dto";
import { GetUserDto } from "@common/dto/get-user.dto";
import { TimeSlot } from "@common/models/time-slot.entity";
import router from "next/router";
import React, { useState, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SemanticDatepicker from "react-semantic-ui-datepickers";
import {
  Modal,
  Form,
  Button,
  TextArea,
  Image,
  Dropdown,
  Message,
} from "semantic-ui-react";
import { api } from "utils/api";
import { MessageContext } from "utils/MessageContext";
import { useAuth } from "utils/useAuth";
import { UserCacheContext } from "utils/UserCacheContext";
import { TimeSelect } from "./TimeSelect";

export function EventArrange({
  open,
  onClose,
  description: descr,
  lawyerId,
}: {
  open: boolean;
  onClose: () => void;
  description?: string;
  lawyerId?: string;
}) {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [time, setTime] = useState(new Date().toISOString());
  const [description, setDescription] = useState(descr);
  const [auth] = useAuth();
  const [users, setUsers] = useContext(UserCacheContext);
  const [lawyer, setLawyer] = useState<string | undefined>(lawyerId);
  const [, setMessage] = useContext(MessageContext);
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    if (open) setLawyer(lawyerId);
  }, [open]);

  useEffect(() => {
    if (lawyerId && !users[lawyerId]) {
      (async () => {
        const { data } = await api.get<GetUserDto[]>(
          `/users/search?ids=${lawyerId}`
        );
        setUsers([
          ...users.filter((u) => !data.some((v) => v.id === u.id)),
          ...data,
        ]);
      })();
    }
  }, [lawyerId]);

  const handleSubmit = async () => {
    let access_token = auth?.access_token;
    if (!description) {
      setError("You did not specify request's description.");
      return;
    }
    if (!access_token) {
      try {
        const { data: regData } = await api.post<
          { access_token: string; user: GetUserDto } | ErrorDto
        >("/auth/register", {
          email,
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
          password,
        } as CreateUserDto);
        if ("message" in regData) {
          setError(regData.message);
          return;
        }
        access_token = regData.access_token;

        if (await createRequest(regData)) {
          setMessage(
            "Your meeting request was created. In order for it to get accepted, you need to <b>verify your email address</b> using the link we sent you."
          );
          setError("");
          onClose();
        }
      } catch (e) {
        console.log(e);
        setError((e as ErrorDto).message);
      }
    } else {
      if (await createRequest({ access_token, user: auth?.user })) {
        setMessage(
          "Your meeting request was created. You are now being redirected to the meetings page."
        );
        router.push("/meetings");
      }
    }
  };
  const createRequest = async (auth: {
    access_token: string;
    user: GetUserDto;
  }) => {
    try {
      const { status, data } = await api.post(
        "/events/request",
        {
          description,
          lawyer_id: auth.access_token ? lawyer : undefined,
          additional_ids: [auth.user?.id].filter((x) => x),
          timespan_start: time,
        } as ArrangeEventDto,
        {
          headers: {
            Authorization: `Bearer ${auth.access_token}`,
          },
        }
      );
      if (status > 300) {
        setError(data.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Modal size="small" open={open} onClose={onClose}>
      <Modal.Header>Arrange a meeting</Modal.Header>
      <Modal.Content>
        <Form onSubmit={handleSubmit} loading={loading}>
          {!auth?.access_token ? (
            <>
              <Form.Field>
                <label>
                  First name<span style={{ color: "red" }}>*</span>:
                </label>
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
                <label>
                  Last name<span style={{ color: "red" }}>*</span>:
                </label>
                <input
                  placeholder="Smith"
                  onChange={(e) => setLastName(e.target.value)}
                  value={lastName}
                />
              </Form.Field>
              <Form.Field>
                <label>
                  E-mail<span style={{ color: "red" }}>*</span>:
                </label>
                <input
                  placeholder="example@example.org"
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  value={email}
                />
              </Form.Field>
              <Form.Field>
                <label>
                  Password<span style={{ color: "red" }}>*</span>:
                </label>
                <input
                  placeholder=""
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
                <small>At least 6 symbols</small>
              </Form.Field>
            </>
          ) : (
            <>
              <Form.Field>
                <label>From:</label>
                <div>
                  <Image
                    src={auth?.user?.avatar}
                    size="tiny"
                    style={{ width: "36px", height: "36px" }}
                    avatar
                  />{" "}
                  <b>
                    {auth?.user?.first_name} {auth?.user?.last_name}
                  </b>
                </div>
              </Form.Field>
            </>
          )}
          <Form.Field>
            <label>To:</label>
            <Dropdown
              placeholder="First available lawyer"
              fluid
              search
              selection
              disabled={!!lawyerId}
              onChange={(_e, d) => {
                setLawyer(d.value.toString());
              }}
              onSearchChange={(_e, d) => {
                api
                  .get<GetUserDto[]>(`/users/search?query=${d.searchQuery}`)
                  .then(({ data }) => {
                    setUsers([
                      ...users.filter((u) => !data.some((v) => v.id === u.id)),
                      ...data,
                    ]);
                  });
              }}
              options={users.map((user) => ({
                key: user.id,
                text: `${user.first_name} ${user.last_name}`,
                value: user.id,
              }))}
              value={lawyer ?? lawyerId}
            />
          </Form.Field>
          <Form.Field
            inline
            style={{ display: "flex", alignItems: "center" }}
            className="date-picker"
          >
            <label>
              Time<span style={{ color: "red" }}>*</span>
            </label>
            <SemanticDatepicker
              onChange={(_e, { value }) => {
                const nowDate = ((value as Date) ?? new Date());
                const date = nowDate.toISOString();
                setTime(date);
                setLoading(true);
                (async() => {
                  const { data, status } = await api.get<TimeSlot[]>(`/users/${lawyer ?? lawyerId}/time_slots?date=${nowDate.getFullYear()}-${nowDate.getMonth() + 1}-${nowDate.getDate()}`)
                  setSlots(data.filter(s => s.day === nowDate.getDay()));
                  setLoading(false);
                })();
              }}
              value={new Date(time)}
            />{" "}
            &nbsp;
            <TimeSelect
              free={slots}
              onChange={(e, { value }) => {
                const date = new Date(time);
                const [hours, minutes] = value.toString().split(":");
                date.setHours(+hours, +minutes, 0, 0);
                setTime(date.toISOString());
              }}
              value={new Date(time).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            />
          </Form.Field>
          <Form.Field>
            <label>
              Description<span style={{ color: "red" }}>*</span>:
            </label>
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
          {error && <Message color="red" content={error} />}
        </Form>
      </Modal.Content>
    </Modal>
  );
}
