// import React from "react";
// import { useState, useEffect } from "react";
// export default function ToDoList(props) {
//     const [tasks, setTasks] = useState([]);
//     const [newTask, setNewTask] = useState("");
//     const { title, color } = props;
//     useEffect(() => {
//         // Load tasks from local storage on component mount
//         const savedTasks = JSON.parse(localStorage.getItem("tasks"));
//         if (savedTasks) {
//             setTasks(savedTasks);
//         }
//     }, []);

//     useEffect(() => {
//         // Save tasks to local storage whenever tasks change
//         localStorage.setItem("tasks", JSON.stringify(tasks));
//     }, [tasks]);

//     const handleAddTask = () => {
//         if (newTask.trim() !== "") {
//             setTasks([...tasks, newTask]);
//             //clear input field
//             setNewTask("");
//         }
//     };

//     const handleRemoveTask = (index) => {
//         // iterate each element over i and filter out the element at index
//         const updatedTasks = [...tasks];
//         updatedTasks.splice(index, 1);
//         setTasks(updatedTasks);
//     };

//     const handleEditTask = (index, newText) => {
//         const updatedTasks = [...tasks];
//         updatedTasks[index] = newText;
//         setTasks(updatedTasks);
//     };
//     return (
//         <div className={color}>
//             <h1>{title}</h1>
//             <input
//                 type="text"
//                 placeholder="Add new task"
//                 value={newTask}
//                 onChange={(e) => setNewTask(e.target.value)}
//             />
//             <button onClick={handleAddTask}>Add Task</button>
//             <ul>
//                 {tasks.map((task, index) => (
//                     <li key={index}>
//                         <div className="content">
//                         {task}
//                         </div>
//                         <div className="crud">
//                             <button onClick={() => handleEditTask(index, prompt('Enter new task', task))}>Edit</button>
//                             <button onClick={() => handleRemoveTask(index)}>Remove</button>
//                         </div>
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// }
import React from "react";
import {
    useState,
    useEffect,
    useCallback,
    useContext,
    useLayoutEffect,
    useRef,
    useMemo,
    useReducer,
    createContext
} from "react";

// Create Context for theme and task management
const TodoContext = createContext();

// Task reducer for state management
const taskReducer = (state, action) => {
    // useReducer: Centralized state management for complex state logic
    // Better than multiple useState calls for related state updates
    switch (action.type) {
        case 'LOAD':
            return action.payload;
        case 'ADD':
            return [...state, {
                id: Date.now(),
                text: action.payload,
                completed: false,
                priority: 'medium',
                createdAt: new Date()
            }];
        case 'REMOVE':
            return state.filter(task => task.id !== action.payload);
        case 'EDIT':
            return state.map(task =>
                task.id === action.payload.id
                    ? { ...task, text: action.payload.text }
                    : task
            );
        case 'TOGGLE':
            return state.map(task =>
                task.id === action.payload
                    ? { ...task, completed: !task.completed }
                    : task
            );
        case 'SET_PRIORITY':
            return state.map(task =>
                task.id === action.payload.id
                    ? { ...task, priority: action.payload.priority }
                    : task
            );
        default:
            return state;
    }
};

// Theme Provider Component
const ThemeProvider = ({ children }) => {
    // useState: For simple state that doesn't require complex logic
    const [theme, setTheme] = useState('light');

    const toggleTheme = useCallback(() => {
        // useCallback: Memoizes this function to prevent unnecessary re-renders
        // Particularly useful when passing callbacks to optimized child components
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    }, []);

    return (
        <TodoContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </TodoContext.Provider>
    );
};

// Main ToDo App Component
export default function ToDoApp() {
    return (
        <ThemeProvider>
            <ToDoList title="My Tasks" />
        </ThemeProvider>
    );
}

function ToDoList({ title }) {
    // useReducer: Complex state management - better than multiple useState
    const [tasks, dispatch] = useReducer(taskReducer, []);
    const [newTask, setNewTask] = useState("");
    const [filter, setFilter] = useState("all");

    // useContext: Access context without prop drilling
    const { theme, toggleTheme } = useContext(TodoContext);

    // useRef: Direct DOM access and persisting values between renders
    const inputRef = useRef(null);
    const listRef = useRef(null);
    const taskCountRef = useRef(0);

    // Track previous task count for comparison
    useEffect(() => {
        taskCountRef.current = tasks.length;
    }, [tasks.length]);

    useEffect(() => {
        // Load tasks from local storage on component mount
        const savedTasks = JSON.parse(localStorage.getItem("tasks"));
        if (savedTasks) {
            dispatch({ type: 'LOAD', payload: savedTasks });
        }

        // Focus input field on mount
        inputRef.current.focus();
    }, []);

    useEffect(() => {
        // Save tasks to local storage whenever tasks change
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    useLayoutEffect(() => {
        // useLayoutEffect: Runs synchronously after DOM mutations but before browser paint
        // Useful for measurements or DOM mutations that need to be done before user sees the change
        if (listRef.current && tasks.length > taskCountRef.current) {
            // Scroll to bottom when new task is added
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [tasks.length]);

    // useMemo: Expensive calculations that should only rerun when specific dependencies change
    const filteredTasks = useMemo(() => {
        // This prevents recalculation on every render unless tasks or filter changes
        switch (filter) {
            case 'active':
                return tasks.filter(task => !task.completed);
            case 'completed':
                return tasks.filter(task => task.completed);
            default:
                return tasks;
        }
    }, [tasks, filter]);

    const taskStats = useMemo(() => {
        // Calculate stats only when tasks change
        return {
            total: tasks.length,
            completed: tasks.filter(task => task.completed).length,
            active: tasks.filter(task => !task.completed).length,
            highPriority: tasks.filter(task => task.priority === 'high').length
        };
    }, [tasks]);

    const handleAddTask = useCallback(() => {
        if (newTask.trim() !== "") {
            dispatch({ type: 'ADD', payload: newTask });
            setNewTask("");
            // Focus back on input after adding
            inputRef.current.focus();
        }
    }, [newTask]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            handleAddTask();
        }
    }, [handleAddTask]);

    const handleRemoveTask = useCallback((id) => {
        dispatch({ type: 'REMOVE', payload: id });
    }, []);

    const handleEditTask = useCallback((id, text) => {
        dispatch({ type: 'EDIT', payload: { id, text } });
    }, []);

    const handleToggleComplete = useCallback((id) => {
        dispatch({ type: 'TOGGLE', payload: id });
    }, []);

    const handleSetPriority = useCallback((id, priority) => {
        dispatch({ type: 'SET_PRIORITY', payload: { id, priority } });
    }, []);

    return (
        <div className={`todo-app ${theme}-theme`}>
            <div className="app-header">
                <h1>{title}</h1>
                <button onClick={toggleTheme} className="theme-toggle">
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
            </div>

            <div className="add-task">
                <input
                    type="text"
                    placeholder="Add new task"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={handleKeyDown}
                    ref={inputRef} // useRef for direct DOM access
                />
                <button onClick={handleAddTask}>Add Task</button>
            </div>

            <div className="filters">
                <button
                    onClick={() => setFilter('all')}
                    className={filter === 'all' ? 'active' : ''}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('active')}
                    className={filter === 'active' ? 'active' : ''}
                >
                    Active
                </button>
                <button
                    onClick={() => setFilter('completed')}
                    className={filter === 'completed' ? 'active' : ''}
                >
                    Completed
                </button>
            </div>

            <div className="stats">
                <p>Total: {taskStats.total} | Active: {taskStats.active} | Completed: {taskStats.completed} | High Priority: {taskStats.highPriority}</p>
            </div>

            <ul ref={listRef} className="task-list">
                {filteredTasks.map((task) => (
                    <TaskItem
                        key={task.id}
                        task={task}
                        onRemove={handleRemoveTask}
                        onEdit={handleEditTask}
                        onToggle={handleToggleComplete}
                        onSetPriority={handleSetPriority}
                    />
                ))}
            </ul>
        </div>
    );
}

// Separate TaskItem component with memo for performance optimization
const TaskItem = React.memo(({ task, onRemove, onEdit, onToggle, onSetPriority }) => {
    // React.memo: Prevents unnecessary re-renders when parent re-renders
    // Only re-renders when props change
    const handleEdit = () => {
        const newText = prompt('Edit task', task.text);
        if (newText && newText.trim() !== "") {
            onEdit(task.id, newText);
        }
    };

    return (
        <li className={`priority-${task.priority} ${task.completed ? 'completed' : ''}`}>
            <div className="content">
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onToggle(task.id)}
                />
                <span className={task.completed ? 'completed-text' : ''}>
                    {task.text}
                </span>
                <span className="task-date">
                    {new Date(task.createdAt).toLocaleDateString()}
                </span>
            </div>
            <div className="crud">
                <select
                    value={task.priority}
                    onChange={(e) => onSetPriority(task.id, e.target.value)}
                    className={`priority-select priority-${task.priority}`}
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
                <button onClick={handleEdit}>Edit</button>
                <button onClick={() => onRemove(task.id)}>Remove</button>
            </div>
        </li>
    );
});

