// src/App.tsx
import './App.css';
import Login from './components/Login';
import List from './components/List';
import Layout from './components/Layout';
import { useSheetService, GoogleSheetProvider } from './services/GoogleSheetProvider';

const MainContent = () => {
    const { isSignedIn } = useSheetService();
    return (
        <div className="App">
            {isSignedIn ? (
                <Layout>
                    <List />
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
