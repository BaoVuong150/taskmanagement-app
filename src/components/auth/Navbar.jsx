import React from 'react';
import '../styles/Navbar.css'
export default function Navbar({ isLoggedIn, user, onLogout }) {
    return (
        <nav className='navbar'>
            <div className='navbar-brand'>
                <h1>Task Manager</h1>
            </div>

            <div className='navbar-menu'>
                {isLoggedIn ? (
                    <div className='navbar-user'>
                        <span className='welcome-text'>
                            Xin chào, <u>{user?.username || 'User'}!</u>
                        </span>
                        <button className='logout-btn' onClick={onLogout}>
                            Đăng xuất
                        </button>
                    </div>
                ) : (
                    <span className='navbar-guest'>Vui lòng đăng nhập</span>
                )}
            </div>
        </nav>
    );
}
