import { useAuth, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import EntryEditor from "./EntryEditor";

export default function Entries() {
    const { isSignedIn, getToken } = useAuth();
    const [entries, setEntries] = useState([]);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null); // if null, creating new entry; else, editing existing entry
  
    function truncateText(text, wordLimit = 10) {
        // Truncate the entry's text to a certain number of words
        const words = text.split(' ');
        if (words.length > wordLimit) {
            return words.slice(0, wordLimit).join(' ') + '...';
        }
        return text;
    };

    function confirmDeleteEntry(entry) {
        // Confirm with the user before deleting an entry
        const confirmation = window.confirm(
            `Are you sure you want to delete the entry titled "${entry.title}"? This action cannot be undone.`
        );

        if (confirmation) {
            deleteEntry(entry._id);
        }
    }

    async function editNewEntry(entry = null) {
        setEditingEntry(entry);
        setIsEditorOpen(true);
    }

    async function editExistingEntry(entry) {
        setEditingEntry(entry);
        setIsEditorOpen(true);
    }


    async function fetchEntries() {
        console.log("Fetching entries...");

        const token = await getToken();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/entries`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await response.json();
        setEntries(data);
    }

    async function createEntry(title, content) {
        console.log(`Creating entry with title: ${title}`);

        const token = await getToken();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/entries`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title, content }),
        });
        const newEntry = await response.json();
        setEntries((prevEntries) => [newEntry, ...prevEntries]);
    }

    async function updateEntry(id, title, content) {
        console.log(`Updating entry with title: ${title}`);

        const token = await getToken();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/entries/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title, content }),
        });
        const updatedEntry = await response.json();
        setEntries((prevEntries) =>
            prevEntries.map((entry) => (entry._id === id ? updatedEntry : entry))
        );
    }

    async function deleteEntry(id) {
        console.log(`Deleting entry with id: ${id} and title: ${entries.find(e => e._id === id)?.title}`);

        const token = await getToken();
        await fetch(`${import.meta.env.VITE_API_URL}/api/entries/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        setEntries((prevEntries) => prevEntries.filter((entry) => entry._id !== id));
    }


    useEffect(() => {
        // Fetch all entries upon sign in/sign up and when an entry is added/deleted/updated
        if (isSignedIn) {
            fetchEntries();
        }
    }, [isSignedIn, getToken]);


    return (
        <div style={{ textAlign: "center", marginTop: "50px"}}>
            {/* ---------- Entry Editor Modal ---------- */}
            {isEditorOpen && (
                <EntryEditor 
                    entry={editingEntry}
                    onClose={() => setIsEditorOpen(false)}
                    onSave={editingEntry !== null ? updateEntry : createEntry}
                />
            )}

            {/* ---------- Main Page ---------- */}

            {/* User Profile Button */}
            <div style={{ position: "absolute", top: "20px", right: "20px" }}>
                <UserButton 
                    appearance={{
                    elements: {
                        rootBox: { fontSize: "1.2em" },
                        card: { fontSize: "1.2em" },
                        userButtonPopoverCard: { fontSize: "1.2em" },
                        userButtonPopoverActionButton: { fontSize: "1.2em" },
                        userButtonPopoverActionButtonText: { fontSize: "1.2em" },
                        userButtonPopoverFooter: { fontSize: "1.2em" },
                        userPreviewMainIdentifier: { fontSize: "1.8em" },
                        userPreviewSecondaryIdentifier: { fontSize: "1.2em" }
                    }
                    }}
                />
            </div>

            <h1>Journal Entries</h1>
            {/* Create New Entry Button */}
            <button 
                style={{ fontSize: "1.5em", padding: "10px 20px" }}
                onClick={() => editNewEntry()}
            >
                Create New Entry
            </button>
            {/* Journal Entries List */}
            {entries.map((entry) => (
                <div 
                    key={entry._id}
                    style={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #444",
                        borderRadius: "10px",
                        padding: "15px",
                        margin: "20px auto",
                        maxWidth: "400px",
                        textAlign: "left",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                        position: "relative",
                    }}
                >
                    <h2 style={{ marginTop: 0, marginBottom: "2px", fontSize: "1.8em" }}>{entry.title}</h2>
                    <p style={{ fontSize: "1.2em", marginBottom: "2px", color: "gray" }}>{truncateText(entry.content)}</p>
                    {entry.mood && 
                        <p style={{ 
                            fontStyle: "italic", 
                            color: entry.mood === "positive" ? "green" : entry.mood === "negative" ? "red" : "white", 
                            fontSize: "1.2em",
                            marginBottom: "2px"
                        }}>
                            Mood: {entry.mood}
                        </p>
                    }
                    <p style={{ fontSize: "1.1em", marginBottom: "2px", color: "magenta" }}>
                        Created: {new Date(entry.createdAt).toLocaleString()},
                        Updated: {new Date(entry.updatedAt).toLocaleString()}
                    </p>
                    
                    {/* Edit and Delete entry buttons */}
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
                        <button
                            onClick={() => editExistingEntry(entry)}
                            style={{
                                padding: "8px 16px",
                                fontSize: "1em",
                                borderRadius: "5px",
                                border: "1px solid #444",
                                backgroundColor: "#2a2a2a",
                                color: "yellow",
                                cursor: "pointer",
                                fontFamily: "inherit",
                            }}
                        >
                            Edit Entry
                        </button>
                            &nbsp;
                            &nbsp;
                        <button
                            onClick={() => confirmDeleteEntry(entry)}
                            style={{
                                padding: "8px 16px",
                                fontSize: "1em",
                                borderRadius: "5px",
                                border: "1px solid #444",
                                backgroundColor: "#2a2a2a",
                                color: "red",
                                cursor: "pointer",
                                fontFamily: "inherit",
                            }}
                        >
                            Delete Entry
                        </button>
                    </div>
                </div>
            ))}   
        </div>
    );
}