import React from "react";
import { useState, useEffect } from "react";
export default function ToDoList(props) {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const { title, color } = props;
    useEffect(() => {
        // Load tasks from local storage on component mount
        const savedTasks = JSON.parse(localStorage.getItem("tasks"));
        if (savedTasks) {
            setTasks(savedTasks);
        }
    }, []);

    useEffect(() => {
        // Save tasks to local storage whenever tasks change
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    const handleAddTask = () => {
        if (newTask.trim() !== "") {
            setTasks([...tasks, newTask]);
            //clear input field
            setNewTask("");
        }
    };

    const handleRemoveTask = (index) => {
        // iterate each element over i and filter out the element at index
        const updatedTasks = [...tasks];
        updatedTasks.splice(index, 1);
        setTasks(updatedTasks);
    };

    const handleEditTask = (index, newText) => {
        const updatedTasks = [...tasks];
        updatedTasks[index] = newText;
        setTasks(updatedTasks);
    };
    return (
        <div className={color}>
            <h1>{title}</h1>
            <input
                type="text"
                placeholder="Add new task"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
            />
            <button onClick={handleAddTask}>Add Task</button>
            <ul>
                {tasks.map((task, index) => (
                    <li key={index}>
                        <div className="content">
                        {task}
                        </div>
                        <div className="crud">
                            <button onClick={() => handleEditTask(index, prompt('Enter new task', task))}>Edit</button>
                            <button onClick={() => handleRemoveTask(index)}>Remove</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
