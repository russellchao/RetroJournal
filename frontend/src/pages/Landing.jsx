import { SignInButton, SignUpButton } from "@clerk/clerk-react";

export default function Landing() {
    return (
        <div style={{ textAlign: "center", marginTop: "50px", paddingTop: "30px" }}>
            <h1 style={{ fontSize: '5em' }}>📝 RetroJournal</h1>

            <h1 style={{ fontSize: '2em' }}>
                Slow down in a fast world — write, reflect, and rediscover yourself through AI-powered nostalgia.
            </h1>

            <br />

            <h1 style={{ fontSize: '1.8em' }}>
                Please sign in or sign up to continue:
            </h1>

            <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
                <SignInButton 
                    mode="modal"
                    style={{ fontSize: "1.5em", padding: "10px 20px" }}
                    appearance={{
                        elements: {
                            rootBox: { fontSize: "1.2em" },
                            card: { fontSize: "1.2em" },
                            headerTitle: { fontSize: "1.5em" },
                            headerSubtitle: { fontSize: "1.2em" },
                            formFieldLabel: { fontSize: "1.2em" },
                            formFieldInput: { fontSize: "1.2em" },
                            formButtonPrimary: { fontSize: "1.2em" },
                            footerActionLink: { fontSize: "1.2em" },
                            footerActionText: { fontSize: "1.2em" },
                        }
                    }}
                />

                <SignUpButton
                    mode="modal"
                    style={{ fontSize: "1.5em", padding: "10px 20px" }}
                    appearance={{
                        elements: {
                            rootBox: { fontSize: "1.2em" },
                            card: { fontSize: "1.2em" },
                            headerTitle: { fontSize: "1.5em" },
                            headerSubtitle: { fontSize: "1.2em" },
                            formFieldLabel: { fontSize: "1.2em" },
                            formFieldInput: { fontSize: "1.2em" },
                            formButtonPrimary: { fontSize: "1.2em" },
                            footerActionLink: { fontSize: "1.2em" },
                            footerActionText: { fontSize: "1.2em" },
                        }
                    }}
                />
            </div>
        </div>
    );
}