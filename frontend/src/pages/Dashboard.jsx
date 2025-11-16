import { useAuth, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { Line, Pie } from "react-chartjs-2"; 
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, ArcElement, Tooltip, Legend } from "chart.js"; 

ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    ArcElement,
    Tooltip,
    Legend
);

export default function Dashboard({ entries, onClose }) {
    const { isSignedIn, getToken } = useAuth();
    const [dailyStats, setDailyStats] = useState([]);
    const [summaryStats, setSummaryStats] = useState({});
    const [recapDate, setRecapDate] = useState("");
    const [weeklyRecap, setWeeklyRecap] = useState("");

    async function generate_new_weekly_recap() {
        try {
            // This endpoint also saves the new recap to the database
            const generateRes = await fetch(`${import.meta.env.VITE_API_URL}/api/entries/generate_new_weekly_recap`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${await getToken()}`,
                },
            });
            
            if (!generateRes.ok) {
                const error = await generateRes.json();
                console.error("Failed to generate recap:", error);
                setWeeklyRecap("Unable to generate recap. Please check your API key or try again later.");
                setRecapDate(new Date().toLocaleDateString("en-US", { timeZone: "America/New_York" }));
                return;
            }
            
            const newRecapData = await generateRes.json();
            setWeeklyRecap(newRecapData.recap);
            setRecapDate(new Date(newRecapData.todaysDate).toLocaleDateString("en-US", { timeZone: "America/New_York" }));
        } catch (error) {
            console.error("Error generating new weekly recap:", error);
            setWeeklyRecap("Unable to generate recap. Please try again later.");
            setRecapDate(new Date().toLocaleDateString("en-US", { timeZone: "America/New_York" }));
        }
    }

    useEffect(() => {
        async function fetchStats() {
            try {
                // Get the stats for entries grouped by day
                const dailyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/entries/stats/daily`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${await getToken()}`,
                    },
                });
                const dailyData = await dailyRes.json();

                // Get the stats for every entry
                const summaryRes = await fetch(`${import.meta.env.VITE_API_URL}/api/entries/stats/summary`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${await getToken()}`,
                    },
                });
                const summaryData = await summaryRes.json();

                // Get the weekly recap
                const recapRes = await fetch(`${import.meta.env.VITE_API_URL}/api/entries/weekly_recap`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${await getToken()}`,
                    },
                });
                const recapData = await recapRes.json();

                // Set a new weekly recap if it's a new day (eastern time)
                const today = new Date().toLocaleDateString("en-US", { timeZone: "America/New_York" });
                const recapDate = new Date(recapData.todaysDate).toLocaleDateString("en-US", { timeZone: "America/New_York" });
                if (recapDate !== today) {
                    await generate_new_weekly_recap();
                } else {
                    setWeeklyRecap(recapData.recap);
                    setRecapDate(recapData.todaysDate);
                }
                
                setDailyStats(dailyData);
                setSummaryStats(summaryData);
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            }
        }

        fetchStats();
    }, []);

    // ---------------------------
    // Chart Data Formatting
    // ---------------------------

    // Line chart: Mood Over Time
    const moodLineData = {
        labels: dailyStats.map((d) => d.date), // 2025-11-15, etc.
        datasets: [
            {
                label: "Average Mood Score",
                data: dailyStats.map((d) => d.averageMoodScore),
                borderColor: "#4CAF50",
                backgroundColor: "rgba(76,175,80,0.3)"
            }
        ]
    };

    // Pie chart: Mood Distribution
    const moodPieData = {
        labels: ["Positive", "Neutral", "Negative"],
        datasets: [
            {
                data: [
                    summaryStats.positiveEntries || 0,
                    summaryStats.neutralEntries || 0,
                    summaryStats.negativeEntries || 0
                ],
                backgroundColor: ["#4CAF50", "#FFC107", "#F44336"]
            }
        ]
    };


    return (
        /* Dashboard modal */
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
                    border: "1px solid #444",
                    borderRadius: "10px",
                    padding: "30px",
                    margin: "20px",
                    width: "90%",
                    maxWidth: "1000px",
                    height: "80vh",
                    maxHeight: "80vh",
                    overflow: "auto",
                    textAlign: "left",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        marginBottom: "20px",
                        background: "#cb0606ff",
                        padding: "8px 12px",
                        borderRadius: "5px"
                    }}
                >
                    Close
                </button>

                <h1 style={{ textAlign: "center" }}>Dashboard</h1>
                <h2>Total Entries: {entries.length}</h2>

                {/* ---------- Mood Over Time ---------- */}
                <div style={{ marginBottom: "40px", maxWidth: "600px" }}>
                    <h2>Mood Over Time</h2>
                    {dailyStats.length > 0 ? (
                        <div style={{ height: "250px" }}>
                            <Line 
                                data={moodLineData} 
                                options={{ 
                                    maintainAspectRatio: false,
                                    responsive: true 
                                }} 
                            />
                        </div>
                    ) : (
                        <p>No data yet.</p>
                    )}
                </div>

                {/* ---------- Mood Distribution ---------- */}
                <div style={{ marginBottom: "40px", maxWidth: "400px" }}>
                    <h2>Mood Distribution</h2>
                    <div style={{ height: "250px" }}>
                        <Pie 
                            data={moodPieData} 
                            options={{ 
                                maintainAspectRatio: false,
                                responsive: true 
                            }} 
                        />
                    </div>
                </div>

                {/* ---------- Weekly Recap ---------- */}
                <div>
                    <h2>AI-Powered Weekly Recap {recapDate && `(as of ${new Date(recapDate).toLocaleDateString('en-US', { timeZone: 'America/New_York' })})`}:</h2>
                    <h2 style={{ color: 'white' }}>{weeklyRecap || "Loading recap..."}</h2>
                </div>

            </div>
        </div>
    );
};