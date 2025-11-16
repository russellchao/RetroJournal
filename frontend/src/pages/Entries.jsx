import { useAuth, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import EntryEditor from "./EntryEditor";
import Dashboard from "./Dashboard";

export default function Entries() {
    const { isSignedIn, getToken } = useAuth();
    const [entries, setEntries] = useState([]);
    const [entriesByDate, setEntriesByDate] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null); // if null, creating new entry; else, editing existing entry
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  
    function truncateText(text, wordLimit = 20) {
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

    async function filterEntriesByDate(date) {
        const filteredEntries = entries.filter(entry => {
            const entryDate = new Date(entry.createdAt).toLocaleDateString("en-US", { timeZone: "America/New_York" });
            return entryDate === date;
        });
        setEntriesByDate(filteredEntries);
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

        // Reset the selected date to today to show the newly created entry (in case user was viewing another date)
        setSelectedDate(new Date().toLocaleDateString("en-US", { timeZone: "America/New_York" }));
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

        setEntries((prevEntries) => prevEntries.map((entry) => (entry._id === id ? updatedEntry : entry)));
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
        async function initialize() {
            if (isSignedIn) {
                await fetchEntries();
            }
        }

        initialize();
    }, [isSignedIn, getToken]);

    useEffect(() => {
        // Filter entries by date upon initial load and when entries or selected date changes
        if (entries.length > 0) {
            if (!selectedDate) {
                // Initially filter entries for today's date in US Eastern Time
                const todaysDate = new Date().toLocaleDateString("en-US", { timeZone: "America/New_York" });
                setSelectedDate(todaysDate);
                filterEntriesByDate(todaysDate);
            } else {
                filterEntriesByDate(selectedDate);
            }
        }
    }, [entries, selectedDate]);

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            {/* ---------- Entry Editor Modal ---------- */}
            {isEditorOpen && (
                <EntryEditor 
                    entry={editingEntry}
                    onClose={() => setIsEditorOpen(false)}
                    onSave={editingEntry !== null ? updateEntry : createEntry}
                />
            )}

            {/* ---------- Dashboard Modal ---------- */}
            {isDashboardOpen && (
                <Dashboard 
                    entries={entries}
                    onClose={() => setIsDashboardOpen(false)}
                />
            )}

            {/* ---------- Main Page ---------- */}
            {/* RetroJournal Logo */}
            <div style={{ position: "absolute", top: "2px", left: "20px" }}>
                <h1 style={{ fontSize: '2em' }}>📝 RetroJournal</h1>
            </div>

            {/* Dashboard and User Profile Button */}
            <div style={{ position: "absolute", top: "20px", right: "20px" }}>
                <button 
                style={{ fontSize: "1.2em", top: "20px" }}
                    onClick={() => setIsDashboardOpen(true)}
                >
                    Dashboard
                </button>

                &nbsp;
                &nbsp;
                &nbsp;

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

            <div>
                {/* Create New Entry Button */}
                <button 
                    style={{ fontSize: "1.5em", padding: "10px 20px" }}
                    onClick={() => editNewEntry()}
                >
                    Create New Entry
                </button>

                &nbsp;
                &nbsp;
                &nbsp;

                {/* Date Picker */}
                <input
                    type="date"
                    value={selectedDate ? new Date(selectedDate).toISOString().split('T')[0] : ''}
                    style={{ fontSize: "1.2em", padding: "8px" }}
                    onChange={(e) => {
                        const dateValue = e.target.value;
                        const formattedDate = new Date(dateValue + 'T00:00:00').toLocaleDateString("en-US", { timeZone: "America/New_York" });
                        setSelectedDate(formattedDate);
                    }}
                />
            </div>
            
            {/* Journal Entries List */}
            {entriesByDate.map((entry) => (
                <div 
                    key={entry._id}
                    style={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #444",
                        borderRadius: "10px",
                        padding: "15px",
                        margin: "20px auto",
                        maxWidth: "800px",
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
                            color: entry.mood === "positive" ? "green" : entry.mood === "negative" ? "red" : "yellow", 
                            fontSize: "1.2em",
                            marginBottom: "2px"
                        }}>
                            Mood: {entry.mood} (Sentiment Score: {entry.sentimentScore})
                        </p>
                    }
                    <p style={{ fontSize: "1.1em", marginBottom: "2px", color: "magenta" }}>
                        Created: {new Date(entry.createdAt).toLocaleString("en-US", { timeZone: "America/New_York" })},
                        Updated: {new Date(entry.updatedAt).toLocaleString("en-US", { timeZone: "America/New_York" })}
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

            &nbsp;
            &nbsp;
            &nbsp;
        </div>
    );
}