import { useState, useEffect } from "react";

export default function EntryEditor({ entry, onClose, onSave }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    useEffect(() => {
        if (entry) {
            setTitle(entry.title || "");
            setContent(entry.content || "");
        }
    }, [entry]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (entry) {
            await onSave(entry._id, title, content);
        } else {
            await onSave(title, content);
        }
        onClose();
    };

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    backgroundColor: "#1a1a1a",
                    padding: "30px",
                    borderRadius: "10px",
                    width: "90%",
                    maxWidth: "600px",
                    maxHeight: "80vh",
                    overflow: "auto",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
                }}
            >
                <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    marginBottom: "20px",
                    color: "white"
                }}>
                    <h1 style={{ margin: 0, fontSize: "2em" }}>
                        {entry !== null ? "Edit Entry" : "Create New Entry"}
                    </h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        style={{
                            width: "100%",
                            padding: "12px",
                            fontSize: "1.5em",
                            marginBottom: "15px",
                            borderRadius: "5px",
                            border: "1px solid #444",
                            backgroundColor: "#2a2a2a",
                            color: "var(--primary-text-color)",
                            fontFamily: "inherit",
                            boxSizing: "border-box",
                        }}
                    />
                    <textarea
                        placeholder="What's on your mind?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows={10}
                        style={{
                            width: "100%",
                            padding: "12px",
                            fontSize: "1.5em",
                            marginBottom: "20px",
                            borderRadius: "5px",
                            border: "1px solid #444",
                            backgroundColor: "#2a2a2a",
                            color: "var(--primary-text-color)",
                            fontFamily: "inherit",
                            resize: "vertical",
                            boxSizing: "border-box",
                        }}
                    />

                    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: "12px 24px",
                                fontSize: "1.1em",
                                borderRadius: "5px",
                                border: "1px solid #444",
                                backgroundColor: "#2a2a2a",
                                color: "red",
                                cursor: "pointer",
                                fontFamily: "inherit",
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            style={{
                                padding: "12px 24px",
                                fontSize: "1.1em",
                                borderRadius: "5px",
                                border: "1px solid #444",
                                backgroundColor: "#2a2a2a",
                                color: "var(--primary-text-color)",
                                cursor: "pointer",
                                fontFamily: "inherit",
                            }}
                        >
                            {/* Either Update or Create the entry depending on if the current entry is null */}
                            {entry !== null ? "Update" : "Create"} Entry
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}