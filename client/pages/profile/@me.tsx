import { PatchUserDto } from "@common/dto/patch-user.dto";
import { Header } from "components/Header";
import { Page } from "components/Page";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Button, Container, Icon, Image, Input, Segment } from "semantic-ui-react";
import styles from "styles/Page.module.css";
import { api } from "utils/api";
import { MessageContext } from "utils/MessageContext";
import { useAuth } from "utils/useAuth";

const Empty = () => {
    const [auth, setAuth] = useAuth();
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const formRef = useRef<HTMLFormElement>(undefined);
    const [, setMessage] = useContext(MessageContext);
    const [avatar, setAvatar] = useState(auth?.user?.avatar ?? "");

    useEffect(() => {
        setTimeout(() => {
            setAvatar(avatar + "?");
        }, 0);
    }, []);

    return (
        <Page>
            <Segment>
                <div style={{ float: "left", margin: "0 2rem 0 0", textAlign: "center", height: "500px" }}>
                    <Image size="small" src={avatar} avatar style={{
                        height: "150px",
                        objectFit: "cover"
                    }} />
                    <br />
                    <br />
                    <div><a href="#" onClick={() => {
                        const avatar = prompt("Enter the URL to your profile picture");
                        if (avatar && avatar.trim() != "") {
                            api.patch(`/users/${auth?.user?.id}`, { avatar }).then(
                                () => {
                                    setMessage("Profile picture changed!");
                                    localStorage.setItem("auth", JSON.stringify({ ...auth, user: { ...auth.user, avatar } }));
                                    router.reload();
                                },
                                () => setMessage("There was an error changing your profile picture.")
                            );
                        }
                    }}><Icon name="edit" /> Change avatar</a></div>
                </div>
                <form ref={formRef}>
                    <h3>
                        { auth?.user?.last_name }
                        { " " }
                        { auth?.user?.first_name }
                        { " " }
                        { auth?.user?.middle_name }
                        <br />
                        <small>{ auth?.user?.type[0].toUpperCase() + auth?.user?.type.slice(1) }</small>
                    </h3>
                    { editing && <>
                        <p>
                            <b>Last name</b><br />
                            <Input defaultValue={auth?.user?.last_name} id="last_name" fluid />
                        </p>
                        <p>
                            <b>First name</b><br />
                            <Input defaultValue={auth?.user?.first_name} id="first_name" fluid />
                        </p>
                        <p>
                            <b>Middle name</b><br />
                            <Input defaultValue={auth?.user?.middle_name} id="middle_name" fluid />
                        </p>
                    </> }
                    <p>
                        <b>E-mail</b><br />
                        { editing ? <Input defaultValue={auth?.user?.email} id="email" fluid /> : auth?.user?.email ?? <i>not set</i> }
                    </p>
                    <p>
                        <b>Phone number</b><br />
                        { editing ? <Input defaultValue={auth?.user?.phone} id="phone" fluid /> : auth?.user?.phone ?? <i>not set</i> }
                    </p>
                    { !editing && <><p>
                        <b>Rating</b><br />
                        { auth?.user?.rating ?? <i>not set</i> }
                    </p>
                        <p>
                        <b>Created at</b><br />
                        { auth?.user?.created_timestamp ? new Date(auth.user.created_timestamp).toLocaleDateString() : <i>not set</i> }
                    </p></> }
                </form>
                <div style={{ textAlign: "right", marginTop: "1rem" }}>
                    { editing ? <>
                        <Button content="Cancel" onClick={() => setEditing(false)} />{ " " }
                        <Button color="green" icon="checkmark"
                                content="Apply"
                                labelPosition="left"
                                onClick={() => {
                                    const data: PatchUserDto = {
                                        email: (formRef.current?.querySelector("#email") as HTMLInputElement).value,
                                        phone: (formRef.current?.querySelector("#phone") as HTMLInputElement).value,
                                        first_name: (formRef.current?.querySelector("#first_name") as HTMLInputElement).value,
                                        middle_name: (formRef.current?.querySelector("#middle_name") as HTMLInputElement).value,
                                        last_name: (formRef.current?.querySelector("#last_name") as HTMLInputElement).value,
                                    };
                                    api.patch(`/users/${auth?.user?.id}`, data).then(
                                        () => {
                                            setMessage("Profile data changed!");
                                            setEditing(false);
                                            localStorage.setItem("auth", JSON.stringify({ ...auth, user: { ...auth.user, ...data } }));
                                            router.reload();
                                        },
                                        () => setMessage("There was an error changing your profile data.")
                                    );
                                }} /></> :
                    <Button color="blue" icon="edit"
                                content="Edit"
                                labelPosition="left"
                                onClick={() => setEditing(true)} /> }
                </div>
            </Segment>
        </Page>
    );
};

export default Empty;
