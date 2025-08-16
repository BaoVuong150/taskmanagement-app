import React, { useState, useRef, useEffect } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import '../styles/FormLogins.css';
export default function LoginForm({ onLogin, onRetry, isLoading = false, onSwitch }) {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitErrors] = useState('');
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);
    useEffect(() => {
        if (usernameRef.current) {
            usernameRef.current.focus();
        }
    }, []);

    const handleInputChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        if (submitError) {
            setSubmitErrors('');
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.username.trim()) {
            newErrors.username = 'Username Là bắt buộc';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username phải có ít nhất 3 ký tự';
        }
        if (!formData.password) {
            newErrors.password = 'Password là bắt buộc';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password phải có ít nhất 6 ký tự';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        console.log('asd');
        if (!validateForm()) return;

        try {
            await onLogin(formData);
        } catch (error) {
            setSubmitErrors(
                error.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
            );
        }
        if (usernameRef.current) usernameRef.current.focus();
    };
    const handleDismissError = () => setSubmitErrors('');

    return (
        <div className='login-form-container'>
            <form className='login-form'>
                <h2 className='login-title'>Đăng nhập</h2>
                {submitError && (
                    <ErrorMessage
                        message={submitError}
                        onRetry={onRetry}
                        onDismiss={handleDismissError}
                    />
                )}

                <div className='form-error-message'></div>

                <div className='form-field'>
                    <label htmlFor='username' className='form-label'>
                        Username *
                    </label>
                    <input
                        ref={usernameRef}
                        value={formData.username}
                        onChange={handleInputChange}
                        className={`form-input ${
                            errors.username ? 'form-input--error' : ''
                        }`}
                        disabled={isLoading}
                        autoComplete='off'
                        type='text'
                        id='username'
                        name='username'
                        placeholder='Nhập username của bạn'
                    />
                    {errors.username && (
                        <span className='form-error'>{errors.username}</span>
                    )}
                </div>

                <div className='form-field'>
                    <label htmlFor='password' className='form-label'>
                        Password *
                    </label>
                    <input
                        ref={passwordRef}
                        value={formData.password}
                        onChange={handleInputChange}
                        autoComplete='off'
                        type='password'
                        id='password'
                        name='password'
                        className={`form-input ${
                            errors.password ? 'form-input--error' : ''
                        }`}
                        placeholder='Nhập password của bạn'
                        disabled={isLoading}
                    />
                    {errors.password && (
                        <span className='form-error'>{errors.password}</span>
                    )}
                </div>
                <button
                    onClick={handleSubmit}
                    type='submit'
                    className='submit-btn'
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <LoadingSpinner size='small' />
                            <span>Đang đăng nhập...</span>
                        </>
                    ) : (
                        'Đăng nhập'
                    )}
                </button>
                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                        <button
                            type='button'
                            disabled={isLoading}
                            onClick={onSwitch}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'blue',
                                cursor: 'pointer'
                            }}
                        >
                            Đăng ký ngay
                        </button>
                </div>
            </form>
        </div>
    );
}
