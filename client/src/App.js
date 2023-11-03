
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import shortid from 'shortid';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');

  useEffect(() => {
    const newSocket = io('ws://localhost:8000', { transports: ['websocket'] });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Połączono z serwerem.');
    });

    newSocket.on('updateData', (data) => {
      setTasks(data);
    });

    newSocket.on('addTask', (newTask) => {
      setTasks((prevTasks) => [...prevTasks, newTask]);
    });

    newSocket.on('removeTask', (taskId) => {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleAddTask = (name) => {
    if (name.trim() !== '') {
      const id = shortid.generate()
      socket.emit('addTask', { name, id });
      setTaskName('');
      setTasks([...tasks, { name, id }])
    }
  };

  const handleRemoveTask = (taskId) => {
    // Usuń zadanie o zadanym id z tablicy tasks
    const removedTaskIndex = tasks.findIndex((task) => task.id === taskId);
    if (removedTaskIndex !== -1) {
      const newTableTasks = tasks.filter((task) => task.id !== taskId);
      setTasks(newTableTasks);
      socket.emit('removeTask', taskId);
    }
  };

  const submitForm = (e) => {
    e.preventDefault(); 
    handleAddTask(taskName);
  };

  return (
    <div className="App">
      <header>
        <h1>ToDoList.app</h1>
      </header>

      <section className="tasks-section" id="tasks-section">
        <h2>Tasks</h2>

        <ul className="tasks-section__list" id="tasks-list">
          {tasks.map((task) => (
            <li key={task.id} className="task">
              {task.name}{' '}
              <button
                className="btn btn--red"
                onClick={() => handleRemoveTask(task.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        <form id="add-task-form" onSubmit={submitForm}>
          <input
            className="text-input"
            autoComplete="off"
            type="text"
            placeholder="Type your description"
            id="task-name"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
          <button className="btn" type="submit">
            Add
          </button>
        </form>
      </section>
    </div>
  );
};

export default App;