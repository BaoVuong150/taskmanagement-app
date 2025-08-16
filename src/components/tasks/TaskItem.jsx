import React from 'react';
import '../styles/TaskItem.css';
function TaskItem({ task, onEdit, onDelete }) {
    const handleEdit = () => {
        onEdit(task);
    };

    const handleDelete = () => {
        if (window.confirm(`Bạn có chắc muốn xóa task "${task.title}"?`)) {
            onDelete(task.id);
        }
    };

    // Helper function để format date
    const formatDate = dateString => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };
    // Helper function để get status display text
    const getStatusText = status => {
        const statusMap = {
            todo: 'Todo',
            'in-progress': 'Đang làm',
            completed: 'Hoàn thành'
        };
        return statusMap[status] || status;
    };

    // Helper function để get priority display text
    const getPriorityText = priority => {
        const priorityMap = {
            low: 'Thấp',
            medium: 'Trung bình',
            high: 'Cao'
        };
        return priorityMap[priority] || priority;
    };

    return (
        <div className='task-item'>
            <div className='task-info'>
                <h4 className='task-title'>{task.title}</h4>

                {task.description && (
                    <p className='task-description'>{task.description}</p>
                )}

                <div className='task-meta'>
                    <span className={`task-status task-status--${task.status}`}>
                        {getStatusText(task.status)}
                    </span>

                    <span
                        className={`task-priority task-priority--${task.priority}`}
                    >
                        Ưu tiên: {getPriorityText(task.priority)}
                    </span>

                    <span className='task-due-date'>
                        📅 Hạn: {formatDate(task.dueDate)}
                    </span>
                </div>
            </div>

            <div className='task-actions'>
                <button
                    className='edit-btn'
                    onClick={handleEdit}
                    title='Chỉnh sửa task'
                >
                    ✏️ Sửa
                </button>

                <button
                    className='delete-btn'
                    onClick={handleDelete}
                    title='Xóa task'
                >
                    ️ Xóa
                </button>
            </div>
        </div>
    );
}

export default TaskItem;
