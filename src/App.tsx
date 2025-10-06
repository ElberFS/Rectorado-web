// src/App.tsx
import "./App.css";
import Login from "./components/Login";
import List from "./components/List";
import Calendar from "./components/CalendarList";
import Layout from "./components/Layout";
import { useSheetService, GoogleSheetProvider } from "./services/GoogleSheetProvider";
import { useState } from "react";

const MainContent = () => {
    const { isSignedIn } = useSheetService();
    const [view, setView] = useState<"list" | "calendar">("list");

    return (
        <div className="App">
            {isSignedIn ? (
                <Layout currentView={view} onChangeView={setView}>
                    {view === "list" ? <List /> : <Calendar />}
                </Layout>
            ) : (
                <Login />
            )}
        </div>
    );
};

function App() {
    return (
        <GoogleSheetProvider>
            <MainContent />
        </GoogleSheetProvider>
    );
}

export default App;
