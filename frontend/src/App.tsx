import { useAuthStore } from "./states/auth.store";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from "./states/themeStore";
import { useEffect } from "react";
import { LoginForm } from "./components/auth/login-page.component";


function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuthStore();
    return isAuthenticated ? children : <Navigate to="/login" />;
}

function App({ }) {
    const { isDarkMode } = useThemeStore();

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    return (
        <Router future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
        }}>
            <div className={isDarkMode ? 'dark' : ''}>
                <Routes>
                    <Route
                        path="/login"
                        element={
                            <LoginForm />
                        }
                    />
                    <Route path="*" element={
                        <PrivateRoute>
                            <h1> Successfully logged in!</h1>
                        </PrivateRoute>
                    } />
                    <Route index element={
                        <PrivateRoute>
                            <h1> Successfully logged in!</h1>
                        </PrivateRoute>
                    } />
                </Routes>
            </div>
        </Router >
    );
}

export default App;
