import { useRouter } from "next/router";
import React from "react";
import { Button, Icon, Input } from "semantic-ui-react";

export default function Video() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <main
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
                flexGrow: 1
            }}>
            <header
                style={{
                    display: "flex",
                    background: "white",
                    borderBottom: "1px solid rgba(0, 0, 0, 0.3)",
                    height: "55px"
                }}>
                <div style={{ flexGrow: 1, overflow: "hidden" }}></div>
                <div
                    style={{
                        width: "30%",
                        minWidth: "350px",
                        maxWidth: "450px",
                        display: "flex",
                        padding: ".5rem",
                        justifyContent: "stretch",
                        borderLeft: "1px solid rgba(0,0,0,0.3)"
                    }}>
                    <Button
                        primary
                        style={{ flexGrow: 1, marginRight: ".5rem" }}>
                        Настройки
                    </Button>
                    <Button color="red" style={{ flexGrow: 1 }}>
                        Покинуть звонок
                    </Button>
                </div>
            </header>
            <section
                style={{
                    display: "flex",
                    background: "white",
                    borderBottom: "1px solid rgba(0, 0, 0, 0.3)",
                    flexGrow: 1
                }}>
                <section
                    style={{
                        background: "linear-gradient(white, lightblue)",
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column"
                    }}>
                    <div style={{ flexGrow: 1 }}></div>
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            margin: "1rem",
                            justifyContent: "center"
                        }}>
                        <div
                            style={{
                                width: "320px",
                                height: "180px",
                                borderRadius: "10px",
                                background: "black",
                                boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                margin: "1rem"
                            }}>
                            <div
                                style={{
                                    fontWeight: "bold",
                                    textAlign: "center",
                                    fontSize: "13pt"
                                }}>
                                Ruslan Garifullin
                            </div>
                        </div>
                        <div
                            style={{
                                width: "320px",
                                height: "180px",
                                borderRadius: "10px",
                                background: "black",
                                boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                margin: "1rem"
                            }}>
                            <div
                                style={{
                                    fontWeight: "bold",
                                    textAlign: "center",
                                    fontSize: "13pt"
                                }}>
                                Egor Dadugin
                            </div>
                        </div>
                        <div
                            style={{
                                width: "320px",
                                height: "180px",
                                borderRadius: "10px",
                                background: "black",
                                boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                margin: "1rem"
                            }}>
                            <div
                                style={{
                                    fontWeight: "bold",
                                    textAlign: "center",
                                    fontSize: "13pt"
                                }}>
                                Vladislav Dineev
                            </div>
                        </div>
                        <div
                            style={{
                                width: "320px",
                                height: "180px",
                                borderRadius: "10px",
                                background: "black",
                                boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                margin: "1rem"
                            }}>
                            <div
                                style={{
                                    fontWeight: "bold",
                                    textAlign: "center",
                                    fontSize: "13pt"
                                }}>
                                Salekh Hadi
                            </div>
                        </div>
                        <div
                            style={{
                                width: "320px",
                                height: "180px",
                                borderRadius: "10px",
                                background: "black",
                                boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                margin: "1rem"
                            }}>
                            <div
                                style={{
                                    fontWeight: "bold",
                                    textAlign: "center",
                                    fontSize: "13pt"
                                }}>
                                Sergey Avdoshin
                            </div>
                        </div>
                    </div>
                    <div style={{ flexGrow: 1 }}></div>
                    <div
                        style={{
                            position: "sticky",
                            bottom: 0,
                            width: "100%",
                            padding: "1.5rem",
                            display: "flex",
                            justifyContent: "center"
                        }}>
                        <Button
                            icon
                            secondary
                            circular
                            style={{
                                width: "64px",
                                height: "64px",
                                marginRight: "1rem"
                            }}>
                            <Icon
                                style={{ width: "26px" }}
                                name="tv"
                                size="large"></Icon>
                        </Button>
                        <Button
                            icon
                            secondary
                            circular
                            style={{
                                width: "64px",
                                height: "64px",
                                marginRight: "1rem"
                            }}>
                            <Icon
                                style={{ width: "26px" }}
                                name="microphone slash"
                                size="large"></Icon>
                        </Button>
                        <Button
                            icon
                            color="red"
                            circular
                            style={{ width: "64px", height: "64px" }}>
                            <Icon
                                style={{ width: "26px" }}
                                name="phone volume"
                                size="large"></Icon>
                        </Button>
                    </div>
                </section>
                <section
                    style={{
                        borderLeft: "1px solid rgba(0,0,0,0.8)",
                        background: "white",
                        width: "30%",
                        minWidth: "350px",
                        maxWidth: "450px",
                        display: "flex",
                        flexDirection: "column"
                    }}>
                    <section
                        style={{
                            borderBottom: "1px solid rgba(0,0,0,0.3)",
                            flexGrow: 1,
                            padding: ".5rem",
                            overflow: "auto"
                        }}>
                        <b>Файлы конференции</b>
                        <div style={{ flexGrow: 1, marginTop: ".5rem" }}>
                            <div
                                style={{
                                    background: "lightgray",
                                    border: "1px solid rgba(0, 0, 0, 0.3)",
                                    marginBottom: ".5rem",
                                    display: "flex",
                                    alignItems: "center",
                                    padding: ".5rem 1rem"
                                }}>
                                <Icon name="user" size="big" />
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        marginLeft: ".5rem"
                                    }}>
                                    <div>
                                        <b>document1.pdf</b>
                                    </div>
                                    <a href="#">Скачать</a>
                                </div>
                            </div>
                            <div
                                style={{
                                    background: "lightgray",
                                    border: "1px solid rgba(0, 0, 0, 0.3)",
                                    marginBottom: ".5rem",
                                    display: "flex",
                                    alignItems: "center",
                                    padding: ".5rem 1rem"
                                }}>
                                <Icon name="image" size="big" />
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        marginLeft: ".5rem"
                                    }}>
                                    <div>
                                        <b>scan4433.jpg</b>
                                    </div>
                                    <a href="#">Скачать</a>
                                </div>
                            </div>
                            <div
                                style={{
                                    background: "lightgray",
                                    border: "1px solid rgba(0, 0, 0, 0.3)",
                                    marginBottom: ".5rem",
                                    display: "flex",
                                    alignItems: "center",
                                    padding: ".5rem 1rem"
                                }}>
                                <Icon name="image" size="big" />
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        marginLeft: ".5rem"
                                    }}>
                                    <div>
                                        <b>face.jpg</b>
                                    </div>
                                    <a href="#">Скачать</a>
                                </div>
                            </div>
                            <div
                                style={{
                                    background: "lightgray",
                                    border: "1px solid rgba(0, 0, 0, 0.3)",
                                    marginBottom: ".5rem",
                                    display: "flex",
                                    alignItems: "center",
                                    padding: ".5rem 1rem"
                                }}>
                                <Icon name="file" size="big" />
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        marginLeft: ".5rem"
                                    }}>
                                    <div>
                                        <b>passport.pdf</b>
                                    </div>
                                    <a href="#">Скачать</a>
                                </div>
                            </div>
                            <div
                                style={{
                                    background: "lightgray",
                                    border: "1px solid rgba(0, 0, 0, 0.3)",
                                    marginBottom: ".5rem",
                                    display: "flex",
                                    alignItems: "center",
                                    padding: ".5rem 1rem"
                                }}>
                                <Icon name="file" size="big" />
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        marginLeft: ".5rem"
                                    }}>
                                    <div>
                                        <b>zayavlenie.docx</b>
                                    </div>
                                    <a href="#">Скачать</a>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section
                        style={{
                            flexGrow: 1,
                            padding: ".5rem",
                            display: "flex",
                            flexDirection: "column"
                        }}>
                        <b>Текстовый чат</b>
                        <div style={{ flexGrow: 1 }}></div>
                        <div style={{ display: "flex" }}>
                            <Input
                                style={{ flexGrow: 1, marginRight: ".5rem" }}
                                placeholder="Ваше сообщение..."></Input>
                            <Button icon primary>
                                <Icon name="send" />
                            </Button>
                        </div>
                    </section>
                </section>
            </section>
        </main>
    );
}
