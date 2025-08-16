import React from 'react';
import '../styles/ErrorMessage.css';
export default function ErrorMessage({ message, onDismiss, onRetry }) {

    return (
        <div className='error-message'>
            <div className='error-content'>
                <span className='error-icon'>❌</span>
                <span className='error-text'>{message}</span>
            </div>

            <div className='error-actions'>
                {onRetry && (
                    <button
                        type='button'
                        className='btn btn-sm btn-outline'
                        onClick={onRetry}
                    >
                        Thử lại
                    </button>
                )}

                {onDismiss && (
                    <button
                        type='button'
                        className='btn btn-sm btn-ghost'
                        onClick={onDismiss}
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
}
