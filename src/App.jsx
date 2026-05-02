import { useState, useEffect, use } from "react";
import "./App.css";
import confetti from "canvas-confetti";

export default function App() {
    const [input, setInput] = useState("");
    const [tasks, setTasks] = useState(() => {
        const savedTasks = localStorage.getItem("tasks");
        return savedTasks ? JSON.parse(savedTasks) : [];
    });
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const completedTasks = tasks.filter((task) => task.completed).length;
    const totalTasks = tasks.length;
    const [editItem, setEditItem] = useState(null);
    const [editText, setEditText] = useState("");

    const handleAdd = () => {
        if (input.trim() !== "") {
            setTasks([...tasks, { text: input, completed: false }]);
            setInput("");
        }
    };

    const handleDelete = (index) => {
        setTasks(tasks.filter((_, i) => i !== index));
    };

    const handleToggle = (index) => {
        const updatedTasks = [ ...tasks ];
        updatedTasks[index].completed = !updatedTasks[index].completed;
        setTasks(updatedTasks);
    };

    useEffect(() => {
        if (!isRunning || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setIsRunning(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isRunning, timeLeft]);

    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    useEffect(() => {
        if (tasks.length > 0 && tasks.every((t)=> t.completed)) {
            confetti({
                particleCount: 100,
                spread: 75,
                origin: { y: 0.6 }
            });
        }
    }, [tasks]);

    const handleEdit = (index) => {
        setEditItem(index);
        setEditText(tasks[index].text);
    };

    const handleSaveEdit = (index) => {
        if (editText.trim() === "") return;
        const updatedTasks = [...tasks];
        updatedTasks[index].text = editText;
        setTasks(updatedTasks);
        setEditItem(null);
        setEditText("");
    };

    const handleCancelEdit = () => {
        setEditItem(null);
        setEditText("");
    };

    return (
        <div className="app">
            <h1>FocuzTime</h1>
            <p >Welcome to FocuzTime</p>
            <p >Are you ready to get some work done today?</p>
            <p>Progress: {completedTasks} / {totalTasks} tasks completed</p>

            <div className="timer">
                <h3>Focus Timer</h3>
                <p className="timer-text">{formatTime(timeLeft)}</p>
                <button onClick={() => setIsRunning(!isRunning)}>
                    {isRunning ? "Pause" : "Start"}
                </button>
                <button onClick={() => {
                    setIsRunning(false);
                    setTimeLeft(25 * 60);
                }}>
                    Focus
                </button>
                
                <button onClick={() => {
                    setIsRunning(false);
                    setTimeLeft(5 * 60);
                }}>Break</button>
            </div>
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter a task here..."
            />
            <button className="add-btn" onClick={handleAdd}>Add Task</button>
            <ul>
                {tasks.map((task, index) => (
                    <li className={task.completed ? "task-item completed-task" : "task-item"} key={index}>
                        <input
                            type="checkbox"
                            className="task-checkbox"
                            checked={task.completed}
                            onChange={() => handleToggle(index)}
                        />

                        {editItem === index ? (
                            <div className="task-content">
                                <input
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                />
                            </div>
                        ) : (
                            <div className="task-content">
                                <span className="task-text" style={{textDecoration: task.completed ? "line-through" : "none"}}>{task.text}</span>
                            </div>
                        )}

                        <div className="task-actions">
                            {editItem === index ? (
                                <>
                                    <button onClick={() => handleSaveEdit(index)}>Save</button>
                                    <button onClick={handleCancelEdit}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => handleEdit(index)}>Edit</button>
                                    <button className="delete-btn" onClick={() => handleDelete(index)}>Delete</button>
                                </>
                            )}
                        </div>

                    </li>
                ))}
            </ul>
        </div>
    )
}