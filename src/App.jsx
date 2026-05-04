import { useState, useEffect } from "react";
import "./App.css";
import confetti from "canvas-confetti";

export default function App() {
    const [input, setInput] = useState("");
    const [tasks, setTasks] = useState(() => {
        const savedTasks = localStorage.getItem("tasks");
        return savedTasks ? JSON.parse(savedTasks) : [];
    });
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [focuzMin, setFocuzMin] = useState(() => localStorage.getItem("focuzMin") || "25");
    const [breakMin, setBreakMin] = useState(() => localStorage.getItem("breakMin") || "5");
    const [isRunning, setIsRunning] = useState(false);
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "system";
    });
    const completedTasks = tasks.filter((task) => task.completed).length;
    const totalTasks = tasks.length;
    const [editItem, setEditItem] = useState(null);
    const [editText, setEditText] = useState("");
    const [timerNotice, setTimerNotice] = useState("");

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
                    notifyTimerComplete();
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

    useEffect(() => {
        localStorage.setItem("focuzMin", focuzMin);
    }, [focuzMin]);

    useEffect(() => {
        localStorage.setItem("breakMin", breakMin);
    }, [breakMin]);

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

    useEffect(() => {
        localStorage.setItem("theme", theme);
        if (theme === "system") {
            document.documentElement.removeAttribute("data-theme");
        } else {
            document.documentElement.setAttribute("data-theme", theme);
        }
    }, [theme]);

    const handleThemeButton = () => {
        if (theme === "system") {
            const prefersDark =
                typeof window !== "undefined" &&
                window.matchMedia &&
                window.matchMedia("(prefers-color-scheme: dark)").matches;
            // If system is dark -> offer light, else offer dark
            setTheme(prefersDark ? "light" : "dark");
        } else {
            // If currently manual, switch back to system
            setTheme("system");
        }
    };

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

    const applyTimerMinutes = (minutes) => {
        setIsRunning(false);
        const parsedMinutes = Number.parseInt(minutes, 10);

        if (!Number.isFinite(parsedMinutes) || parsedMinutes <= 0) {
            return;
        }

        setTimeLeft(parsedMinutes * 60);
    };

    const notifyTimerComplete = () => {
        const message = "Time is up!";
        setTimerNotice(message);
        playBeep();

        if (typeof window !== "undefined") {
            window.setTimeout(() => {
                setTimerNotice("");
            }, 5000);
        }

        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate([200, 125, 200]);
        }

        if (typeof window === "undefined" || !("Notification" in window)) return;

        if (Notification.permission === "granted") {
            new Notification("FocuzTime", { body: message });
        }

        if (Notification.permission === "default") {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    new Notification("FocuzTime", { body: message });
                }
            });
        }
    };

    const playBeep = () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800; // Hz (pitch)
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log("Audio not supported");
        }
    };

    return (
        <>
            <button className="theme-toggle" onClick={handleThemeButton} title="Toggle theme">
                {theme === "system" ? (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "☀️" : "🌙") : (theme === "dark" ? "☀️" : "🌙")}
            </button>
            <div className="app">
                <h1>FocuzTime</h1>
                <p >Welcome to FocuzTime</p>
                <p >Are you ready to get some work done today?</p>
                <p>Progress: {completedTasks} / {totalTasks} tasks completed</p>

                <div className="timer">
                    <h3>Focus Timer</h3>
                    <p className="timer-text">{formatTime(timeLeft)}</p>
                    {timerNotice && <p className="timer-notice">{timerNotice}</p>}
                    <button onClick={() => setIsRunning(!isRunning)}>
                        {isRunning ? "Pause" : "Start"}
                    </button>
                    <button onClick={() => {
                        applyTimerMinutes(focuzMin);
                    }}>
                        Focus
                    </button>
                    
                    <button onClick={() => {
                        applyTimerMinutes(breakMin);
                    }}>Break</button>
                </div>
                <div className="custom-timer">
                    <div className="timer-row">
                        <span>Focus Minutes:</span>
                        <input
                            type="number"
                            min="1"
                            value={focuzMin}
                            onChange={(e) => setFocuzMin(e.target.value)}
                        />
                        <button onClick={() => applyTimerMinutes(focuzMin)}>Save</button>
                    </div>

                    <div className="timer-row">
                        <span>Break Minutes:</span>
                        <input
                            type="number"
                            min="1"
                            value={breakMin}
                            onChange={(e) => setBreakMin(e.target.value)}
                        />
                        <button onClick={() => applyTimerMinutes(breakMin)}>Save</button>
                    </div>
                </div>
                <input className="input-task"
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
        </>
    )
}