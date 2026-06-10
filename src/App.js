import React, { useState } from 'react';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setUserId] = useState(null);
    const [showRegister, setShowRegister] = useState(false);

    const handleLogin = (id) => {
        if (id === 'register') {
            setShowRegister(true);
            return;
        }
        setUserId(id);
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUserId(null);
    };

    if (showRegister) {
        return <Register onRegister={() => setShowRegister(false)} />;
    }

    if (!isLoggedIn) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div>
            <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
            <Dashboard userId={userId} />
        </div>
    );
}

const styles = {
    logoutButton: { position: 'absolute', top: '20px', right: '20px', padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export default App;