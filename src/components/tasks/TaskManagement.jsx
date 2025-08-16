import React, { useState, useEffect, useRef } from 'react';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import '../styles/TaskManagement.css';
function TaskManagement({ user }) {
    // State management cho tasks
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // State cho TaskForm modal
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [isFormLoading, setIsFormLoading] = useState(false);

    // State cho filters và search
    const [filters, setFilters] = useState({
        status: 'all', // all, todo, in-progress, completed
        priority: 'all', // all, low, medium, high
        search: ''
    });

    // Ref cho scroll behavior
    const taskListRef = useRef(null);

    // Load tasks khi component mount
    useEffect(() => {
        loadTasks();
    }, [user]);

    // JSON Server API functions
    const API_BASE_URL = 'http://localhost:8000';

    // Load all tasks from server
    const loadTasks = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${API_BASE_URL}/tasks?userId=${user.id}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setTasks(data);
        } catch (err) {
            console.error('Error loading tasks:', err);
            setError(
                'Không thể tải danh sách tasks. Vui lòng kiểm tra kết nối mạng.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Create new task
    const createTask = async taskData => {
        setIsFormLoading(true);

        try {
            const newTask = {
                ...taskData,
                id: String(taskData.id),
                userId: Number(user.id),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const response = await fetch(`${API_BASE_URL}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTask)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const createdTask = await response.json();

            // Update local state
            setTasks(prev => [createdTask, ...prev]);

            // Close form
            setShowTaskForm(false);
            setEditingTask(null);
            // Scroll to top để user thấy task mới
            if (taskListRef.current) {
                taskListRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        } catch (err) {
            console.error('Error creating task:', err);
            throw new Error('Không thể tạo task. Vui lòng thử lại.');
        } finally {
            setIsFormLoading(false);
        }
    };

    // Update existing task
    const updateTask = async taskData => {
        setIsFormLoading(true);

        try {
            const updatedTask = {
                ...taskData,
                userId: user.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const response = await fetch(
                `${API_BASE_URL}/tasks/${taskData.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedTask)
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseTask = await response.json();

            // Update local state
            setTasks(prev =>
                prev.map(task =>
                    task.id === responseTask.id ? responseTask : task
                )
            );

            // Close form
            setShowTaskForm(false);
            setEditingTask(null);
        } catch (err) {
            console.error('Error updating task:', err);
            throw new Error('Không thể cập nhật task. Vui lòng thử lại.');
        } finally {
            setIsFormLoading(false);
        }
    };

    // Delete task
    const deleteTask = async taskId => {
        // Optimistic update
        const originalTasks = tasks;
        setTasks(prev => prev.filter(task => task.id !== taskId));

        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (err) {
            console.error('Error deleting task:', err);

            // Revert optimistic update
            setTasks(originalTasks);

            setError('Không thể xóa task. Vui lòng thử lại.');

            // Auto clear error sau 3 giây
            setTimeout(() => setError(null), 3000);
        }
    };

    // Handle task form submission
    const handleTaskSave = async taskData => {
        if (editingTask) {
            await updateTask(taskData);
        } else {
            await createTask(taskData);
        }
    };

    // Handle edit task
    const handleEditTask = task => {
        setEditingTask(task);
        setShowTaskForm(true);
    };

    // Handle create new task
    const handleCreateTask = () => {
        setEditingTask(null);
        setShowTaskForm(true);
    };

    // Handle cancel form
    const handleCancelForm = () => {
        setShowTaskForm(false);
        setEditingTask(null);
    };

    // Handle filter changes
    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    // Filter tasks based on current filters
    const getFilteredTasks = () => {
        return tasks.filter(task => {
            // Status filter
            if (filters.status !== 'all' && task.status !== filters.status) {
                return false;
            }

            // Priority filter
            if (
                filters.priority !== 'all' &&
                task.priority !== filters.priority
            ) {
                return false;
            }

            // Search filter
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const titleMatch = task.title
                    .toLowerCase()
                    .includes(searchLower);
                const descriptionMatch = task.description
                    ?.toLowerCase()
                    .includes(searchLower);

                if (!titleMatch && !descriptionMatch) {
                    return false;
                }
            }

            return true;
        });
    };

    const filteredTasks = getFilteredTasks();

    // Quick stats
    const getTaskStats = () => {
        const total = tasks.length;
        const completed = tasks.filter(
            task => task.status === 'completed'
        ).length;
        const inProgress = tasks.filter(
            task => task.status === 'in-progress'
        ).length;
        const todo = tasks.filter(task => task.status === 'todo').length;

        return { total, completed, inProgress, todo };
    };

    const stats = getTaskStats();

    return (
        <div className='task-management'>
            {/* Header với controls */}
            <div className='task-management-header'>
                <div className='header-title'>
                    <h1>Quản lý Tasks</h1>
                    <p className='header-subtitle'>
                        Xin chào <strong>{user.username}</strong>! Bạn có{' '}
                        {stats.total} tasks ({stats.completed} hoàn thành)
                    </p>
                </div>

                <button
                    className='create-task-btn'
                    onClick={handleCreateTask}
                    disabled={isLoading}
                >
                    ➕ Tạo Task Mới
                </button>
            </div>

            {/* Filters và Search */}
            <div className='task-filters'>
                <div className='filter-group'>
                    <label className='filter-label'>Trạng thái:</label>
                    <select
                        value={filters.status}
                        onChange={e =>
                            handleFilterChange('status', e.target.value)
                        }
                        className='filter-select'
                    >
                        <option value='all'>Tất cả</option>
                        <option value='todo'>Todo</option>

                        <option value='in-progress'>Đang làm</option>
                        <option value='completed'>Hoàn thành</option>
                    </select>
                </div>

                <div className='filter-group'>
                    <label className='filter-label'>Độ ưu tiên:</label>
                    <select
                        value={filters.priority}
                        onChange={e =>
                            handleFilterChange('priority', e.target.value)
                        }
                        className='filter-select'
                    >
                        <option value='all'>Tất cả</option>
                        <option value='high'>Cao</option>
                        <option value='medium'>Trung bình</option>
                        <option value='low'>Thấp</option>
                    </select>
                </div>

                <div className='filter-group search-group'>
                    <label className='filter-label'>Tìm kiếm:</label>
                    <input
                        type='text'
                        value={filters.search}
                        onChange={e =>
                            handleFilterChange('search', e.target.value)
                        }
                        placeholder='Tìm theo tiêu đề hoặc mô tả...'
                        className='search-input'
                    />
                    {filters.search && (
                        <button
                            className='clear-search-btn'
                            onClick={() => handleFilterChange('search', '')}
                            title='Xóa tìm kiếm'
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Results info */}
            {(filters.status !== 'all' ||
                filters.priority !== 'all' ||
                filters.search) && (
                <div className='filter-results'>
                    <span className='results-text'>
                        Hiển thị {filteredTasks.length} / {tasks.length} tasks
                    </span>
                    {filteredTasks.length !== tasks.length && (
                        <button
                            className='clear-filters-btn'
                            onClick={() =>
                                setFilters({
                                    status: 'all',
                                    priority: 'all',
                                    search: ''
                                })
                            }
                        >
                            Xóa bộ lọc
                        </button>
                    )}
                </div>
            )}

            {/* Global error display */}
            {error && (
                <ErrorMessage
                    message={error}
                    onRetry={loadTasks}
                    onDismiss={() => setError(null)}
                />
            )}

            {/* Task List */}
            <div ref={taskListRef}>
                <TaskList
                    tasks={filteredTasks}
                    isLoading={isLoading}
                    error={null} // Error được handle ở level trên
                    onEditTask={handleEditTask}
                    onDeleteTask={deleteTask}
                    onRetryLoad={loadTasks}
                />
            </div>

            {/* Task Form Modal */}
            {showTaskForm && (
                <TaskForm
                    task={editingTask}
                    onSave={handleTaskSave}
                    onCancel={handleCancelForm}
                    isLoading={isFormLoading}
                />
            )}
        </div>
    );
}

export default TaskManagement;
