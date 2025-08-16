import React, { useState, useRef, useEffect } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import '../styles/TaskForm.css'

function TaskForm({ task = null, onSave, onCancel, isLoading = false }) {
    // Determine if this is edit mode
    const isEditMode = Boolean(task);

    // Initial form data
    const getInitialFormData = () => ({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || 'todo',
        priority: task?.priority || 'medium',
        dueDate: task?.dueDate || ''
    });

    // State management
    const [formData, setFormData] = useState(getInitialFormData);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');

    // Refs for focus management
    const titleRef = useRef(null);

    // Focus on title when component mounts
    useEffect(() => {
        if (titleRef.current) {
            titleRef.current.focus();
        }
    }, []);

    // Reset form when task prop changes
    useEffect(() => {
        setFormData(getInitialFormData());
        setErrors({});
        setSubmitError('');
    }, [task]);

    // Handle input changes
    const handleInputChange = e => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear field error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Clear submit error
        if (submitError) {
            setSubmitError('');
        }
    };

    // Advanced validation
    const validateForm = () => {
        const newErrors = {};

        // Title validation
        if (!formData.title.trim()) {
            newErrors.title = 'Tiêu đề là bắt buộc';
        } else if (formData.title.length < 3) {
            newErrors.title = 'Tiêu đề phải có ít nhất 3 ký tự';
        } else if (formData.title.length > 100) {
            newErrors.title = 'Tiêu đề không được vượt quá 100 ký tự';
        }

        // Description validation (optional but if provided, must be reasonable)
        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Mô tả không được vượt quá 500 ký tự';
        }

        // Due date validation
        if (!formData.dueDate) {
            newErrors.dueDate = 'Ngày hạn là bắt buộc';
        } else {
            const selectedDate = new Date(formData.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                newErrors.dueDate = 'Ngày hạn không được là ngày trong quá khứ';
            }
        }

        // Status validation
        const validStatuses = ['todo', 'in-progress', 'completed'];
        if (!validStatuses.includes(formData.status)) {
            newErrors.status = 'Trạng thái không hợp lệ';
        }

        // Priority validation
        const validPriorities = ['low', 'medium', 'high'];
        if (!validPriorities.includes(formData.priority)) {
            newErrors.priority = 'Độ ưu tiên không hợp lệ';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async e => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const taskData = {
                ...formData,
                title: formData.title.trim(),
                description: formData.description.trim(),
                id: task?.id || Date.now() // Simple ID generation for new tasks
            };

            await onSave(taskData);
        } catch (error) {
            setSubmitError(
                error.message || 'Có lỗi xảy ra khi lưu task. Vui lòng thử lại.'
            );
        }
    };

    // Handle cancel
    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
    };

    // Get today's date for min attribute
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    return (
        <div className='task-form-container'>
            <form className='task-form' onSubmit={handleSubmit}>
                <h2 className='task-form-title'>
                    {isEditMode ? 'Chỉnh sửa Task' : 'Tạo Task Mới'}
                </h2>

                {/* Submit Error Display */}
                {submitError && (
                    <ErrorMessage
                        message={submitError}
                        onRetry={() => setSubmitError('')}
                        onDismiss={() => setSubmitError('')}
                    />
                )}

                {/* Title Field */}
                <div className='form-field'>
                    <label htmlFor='title' className='form-label'>
                        Tiêu đề *
                    </label>
                    <input
                        ref={titleRef}
                        type='text'
                        id='title'
                        name='title'
                        value={formData.title}
                        onChange={handleInputChange}
                        className={`form-input ${
                            errors.title ? 'form-input--error' : ''
                        }`}
                        placeholder='Nhập tiêu đề task...'
                        maxLength='100'
                        disabled={isLoading}
                    />
                    {errors.title && (
                        <span className='form-error'>{errors.title}</span>
                    )}
                    <span className='form-hint'>
                        {formData.title.length}/100 ký tự
                    </span>
                </div>

                {/* Description Field */}
                <div className='form-field'>
                    <label htmlFor='description' className='form-label'>
                        Mô tả
                    </label>
                    <textarea
                        id='description'
                        name='description'
                        value={formData.description}
                        onChange={handleInputChange}
                        className={`form-textarea ${
                            errors.description ? 'form-input--error' : ''
                        }`}
                        placeholder='Nhập mô tả chi tiết (tùy chọn)...'
                        rows='4'
                        maxLength='500'
                        disabled={isLoading}
                    />
                    {errors.description && (
                        <span className='form-error'>{errors.description}</span>
                    )}
                    <span className='form-hint'>
                        {formData.description.length}/500 ký tự
                    </span>
                </div>

                {/* Status and Priority Row */}
                <div className='form-row'>
                    <div className='form-field'>
                        <label htmlFor='status' className='form-label'>
                            Trạng thái *
                        </label>
                        <select
                            id='status'
                            name='status'
                            value={formData.status}
                            onChange={handleInputChange}
                            className={`form-select ${
                                errors.status ? 'form-input--error' : ''
                            }`}
                            disabled={isLoading}
                        >
                            <option value='todo'>Todo</option>
                            <option value='in-progress'>Đang làm</option>
                            <option value='completed'>Hoàn thành</option>
                        </select>
                        {errors.status && (
                            <span className='form-error'>{errors.status}</span>
                        )}
                    </div>

                    <div className='form-field'>
                        <label htmlFor='priority' className='form-label'>
                            Độ ưu tiên *
                        </label>
                        <select
                            id='priority'
                            name='priority'
                            value={formData.priority}
                            onChange={handleInputChange}
                            className={`form-select ${
                                errors.priority ? 'form-input--error' : ''
                            }`}
                            disabled={isLoading}
                        >
                            <option value='low'>Thấp</option>
                            <option value='medium'>Trung bình</option>
                            <option value='high'>Cao</option>
                        </select>
                        {errors.priority && (
                            <span className='form-error'>
                                {errors.priority}
                            </span>
                        )}
                    </div>
                </div>

                {/* Due Date Field */}
                <div className='form-field'>
                    <label htmlFor='dueDate' className='form-label'>
                        Ngày hạn *
                    </label>
                    <input
                        type='date'
                        id='dueDate'
                        name='dueDate'
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        className={`form-input ${
                            errors.dueDate ? 'form-input--error' : ''
                        }`}
                        min={getTodayDate()}
                        disabled={isLoading}
                    />
                    {errors.dueDate && (
                        <span className='form-error'>{errors.dueDate}</span>
                    )}
                </div>

                {/* Action Buttons */}
                <div className='form-actions'>
                    <button
                        type='button'
                        className='cancel-btn'
                        onClick={handleCancel}
                        disabled={isLoading}
                    >
                        Hủy
                    </button>

                    <button
                        type='submit'
                        className='save-btn'
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <LoadingSpinner size='small' />
                                <span>Đang lưu...</span>
                            </>
                        ) : isEditMode ? (
                            'Cập nhật'
                        ) : (
                            'Tạo Task'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default TaskForm;
