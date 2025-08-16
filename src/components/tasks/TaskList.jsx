import React from 'react';
import TaskItem from './TaskItem';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import '../styles/TaskManagement.css';
function TaskList({
    tasks = [],
    isLoading = false,
    error = null,
    onEditTask,
    onDeleteTask,
    onRetryLoad
}) {
    // Handle retry loading
    const handleRetryLoad = () => {
        if (onRetryLoad) {
            onRetryLoad();
        }
    };

    // Render loading state
    if (isLoading) {
        return (
            <div className='task-list-container'>
                <div className='task-list-loading'>
                    <LoadingSpinner size='large' />
                    <p className='loading-text'>Đang tải danh sách tasks...</p>
                </div>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className='task-list-container'>
                <ErrorMessage
                    message={error}
                    onRetry={onRetryLoad ? handleRetryLoad : undefined}
                    onDismiss={() => {}} // Could implement dismiss if needed
                />
            </div>
        );
    }

    // Render empty state
    if (!tasks || tasks.length === 0) {
        return (
            <div className='task-list-container'>
                <div className='task-list-empty'>
                    <div className='empty-icon'>📝</div>
                    <h3 className='empty-title'>Chưa có task nào</h3>
                    <p className='empty-description'>
                        Bắt đầu tạo task đầu tiên để quản lý công việc của bạn!
                    </p>
                </div>
            </div>
        );
    }

    // Group tasks by status for better organization
    const groupTasksByStatus = tasks => {
        return tasks.reduce((groups, task) => {
            const status = task.status || 'todo';
            if (!groups[status]) {
                groups[status] = [];
            }
            groups[status].push(task);
            return groups;
        }, {});
    };

    const groupedTasks = groupTasksByStatus(tasks);
    const statusOrder = ['todo', 'in-progress', 'completed'];
    const statusLabels = {
        todo: 'Todo',
        'in-progress': 'Đang làm',
        completed: 'Hoàn thành'
    };

    // Sort tasks within each group by priority and due date
    const sortTasks = tasks => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };

        return [...tasks].sort((a, b) => {
            // First sort by priority (high to low)
            const priorityDiff =
                priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0) return priorityDiff;

            // Then sort by due date (earliest first)
            const dateA = new Date(a.dueDate);
            const dateB = new Date(b.dueDate);

            return dateA - dateB;
        });
    };

    return (
        <div className='task-list-container'>
            <div className='task-list-header'>
                <h2 className='task-list-title'>
                    Danh sách Tasks ({tasks.length})
                </h2>
                <div className='task-list-stats'>
                    {statusOrder.map(status => {
                        const count = groupedTasks[status]?.length || 0;
                        return (
                            <span
                                key={status}
                                className={`task-stat task-stat--${status}`}
                            >
                                {statusLabels[status]}: {count}
                            </span>
                        );
                    })}
                </div>
            </div>

            <div className='task-list-content'>
                {statusOrder.map(status => {
                    const statusTasks = groupedTasks[status];
                    if (!statusTasks || statusTasks.length === 0) return null;

                    const sortedTasks = sortTasks(statusTasks);

                    return (
                        <div key={status} className='task-group'>
                            <h3
                                className={`task-group-title task-group-title--${status}`}
                            >
                                {statusLabels[status]} ({statusTasks.length})
                            </h3>
                            <div className='task-group-content'>
                                {sortedTasks.map(task => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        onEdit={onEditTask}
                                        onDelete={onDeleteTask}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default TaskList;
