import React, { useState, useEffect } from 'react';
import Navbar from './components/auth/Navbar';
import LoginForm from './components/auth/LoginForm';
import ErrorMessage from './components/common/ErrorMessage';
import TaskManagement from './components/tasks/TaskManagement';
import RegisterForm from './components/auth/RegisterForm';
import './App.css';

function App() {
    // Authentication state
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [globalError, setGlobalError] = useState(null);
    const [isRegister, setIsRegister] = useState(false);
    // Check for existing authentication khi app load
    useEffect(() => {
        checkExistingAuth();
    }, []);

    // JSON Server API
    const API_BASE_URL = 'http://localhost:8000';

    // Check localStorage cho existing session
    const checkExistingAuth = async () => {
        setAuthLoading(true);

        try {
            const savedUser = localStorage.getItem('taskapp_user');
            const savedToken = localStorage.getItem('taskapp_token');

            if (savedUser && savedToken) {
                const userData = JSON.parse(savedUser);

                // Verify token với server (giả lập)
                const isValidSession = await verifySession(
                    userData.id,
                    savedToken
                );

                if (isValidSession) {
                    setUser(userData);
                    setIsLoggedIn(true);
                } else {
                    // Clear invalid session
                    clearAuthData();
                }
            }
        } catch (error) {
            console.error('Auth check error:', error);

            clearAuthData();
        } finally {
            setAuthLoading(false);
        }
    };

    // Verify session với server
    const verifySession = async (userId, token) => {
        try {
            // Trong thực tế sẽ gọi API verify token
            // Ở đây chúng ta giả lập bằng cách check user exists
            const response = await fetch(`${API_BASE_URL}/users/${userId}`);
            return response.ok;
        } catch (error) {
            return false;
        }
    };

    // Clear authentication data
    const clearAuthData = () => {
        localStorage.removeItem('taskapp_user');
        localStorage.removeItem('taskapp_token');
        setUser(null);
        setIsLoggedIn(false);
    };

    // Handle login
    const handleLogin = async credentials => {
        try {
            // Tìm user trong database
            const response = await fetch(
                `${API_BASE_URL}/users?username=${credentials.username}`
            );

            if (!response.ok) {
                throw new Error('Network error');
            }

            const users = await response.json();
            const foundUser = users.find(
                user =>
                    user.username === credentials.username &&
                    user.password === credentials.password
            );

            if (!foundUser) {
                throw new Error('Username hoặc password không đúng');
            }

            // Giả lập tạo token (trong thực tế sẽ từ server)

            const token = `token_${foundUser.id}_${Date.now()}`;

            // Save to localStorage
            localStorage.setItem(
                'taskapp_user',
                JSON.stringify({
                    id: foundUser.id,
                    username: foundUser.username,
                    email: foundUser.email
                })
            );
            localStorage.setItem('taskapp_token', token);

            // Update state
            setUser({
                id: foundUser.id,
                username: foundUser.username,
                email: foundUser.email
            });
            setIsLoggedIn(true);

            // Clear any global errors
            setGlobalError(null);
        } catch (error) {
            console.error('Login error:', error);
            throw error; // Re-throw để LoginForm handle
        }
    };
    const handleRegister = async formData => {
        try {
            // 1. Kiểm tra trùng username
            const usernameRes = await fetch(
                `${API_BASE_URL}/users?username=${formData.username}`
            );
            const usernameData = await usernameRes.json();
            if (usernameData.length > 0) {
                throw new Error('Tên tài khoản này đã được sử dụng');
            }

            // 2. Kiểm tra trùng email
            const emailRes = await fetch(
                `${API_BASE_URL}/users?email=${formData.email}`
            );
            const emailData = await emailRes.json();
            if (emailData.length > 0) {
                throw new Error('Email này đã được đăng ký');
            }

            // 3. Tạo user mới
            const newUser = {
                id: Date.now().toString(), // hoặc crypto.randomUUID()
                username: formData.username,
                password: formData.password,
                email: formData.email,
                createdAt: new Date().toISOString()
            };

            const res = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });

            if (!res.ok) {
                throw new Error('Lỗi mạng khi đăng ký');
            }

            // 4. Đăng nhập ngay sau khi đăng ký
            const createdUser = await res.json();
            const token = `token_${createdUser.id}_${Date.now()}`;

            localStorage.setItem('taskapp_user', JSON.stringify(createdUser));
            localStorage.setItem('taskapp_token', token);

            setUser(createdUser);
            setIsLoggedIn(true);
            setIsRegister(false);
            setGlobalError(null);
        } catch (error) {
            console.error('Register error:', error);
            throw error; // để RegisterForm hiển thị lỗi
        }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            // Trong thực tế sẽ call API logout để invalidate token

            // Clear local data
            clearAuthData();

            // Clear global error
            setGlobalError(null);
        } catch (error) {
            console.error('Logout error:', error);
            setGlobalError('Có lỗi khi đăng xuất. Vui lòng thử lại.');
        }
    };

    // Global error handler
    const handleGlobalError = error => {
        setGlobalError(error);

        // Auto clear error sau 5 giây
        setTimeout(() => setGlobalError(null), 5000);
    };

    // Handle network errors globally
    useEffect(() => {
        const handleOnline = () => {
            if (globalError && globalError.includes('mạng')) {
                setGlobalError(null);
            }
        };

        const handleOffline = () => {
            setGlobalError(
                'Mất kết nối mạng. Vui lòng kiểm tra kết nối internet.'
            );
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [globalError]);

    // Show loading screen khi check auth
    if (authLoading) {
        return (
            <div className='app-loading'>
                <div className='loading-container'>
                    <div className='app-logo'>📝</div>
                    <h1>Task Manager</h1>
                    <div className='loading-spinner'></div>
                    <p>Đang kiểm tra phiên đăng nhập...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='app'>
            {/* Global Error Display */}
            {globalError && (
                <div className='global-error'>
                    <ErrorMessage
                        message={globalError}
                        onDismiss={() => setGlobalError(null)}
                    />
                </div>
            )}
            {/* Navigation Bar */}
            <Navbar
                isLoggedIn={isLoggedIn}
                user={user}
                onLogout={handleLogout}
            />
            {/* Main Content */}
            <main className='app-main'>
                {isLoggedIn ? (
                    <TaskManagement user={user} />
                ) : (
                    <div className='login-container'>
                        <div className='login-welcome'>
                            <div className='welcome-logo'>📝</div>
                            <h1>Chào mừng đến với Task Manager</h1>
                            <p>Quản lý công việc hiệu quả và dễ dàng</p>

                            <div className='features-list'>
                                <div className='feature-item'>
                                    <span className='feature-icon'>✅</span>
                                    <span>Tạo và quản lý tasks</span>
                                </div>
                                <div className='feature-item'>
                                    <span className='feature-icon'>🎯</span>
                                    <span>Ưu tiên và deadline</span>
                                </div>
                                <div className='feature-item'>
                                    <span className='feature-icon'>📊</span>
                                    <span>Theo dõi tiến độ</span>
                                </div>
                                <div className='feature-item'>
                                    <span className='feature-icon'>🔍</span>
                                    <span>Tìm kiếm và lọc</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            {isRegister ? (
                                <RegisterForm
                                    onSwitch={() => setIsRegister(false)}
                                    onRegister={handleRegister}
                                />
                            ) : (
                                <LoginForm
                                    onSwitch={() => setIsRegister(true)}
                                    onLogin={handleLogin}
                                />
                            )}
                        </div>
                    </div>
                )}
            </main>
            {/* Footer */}
            <footer className='app-footer'>
                <p>&copy; 2024 Task Manager. Built with React & JSON Server.</p>
            </footer>
        </div>
    );
}

export default App;
