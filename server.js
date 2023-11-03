const express = require('express');
const socket = require('socket.io');
const app = express();

const tasks = [];

app.get('/', (req, res) => {
    res.send('Hello, world!'); 
  });

const server = app.listen(process.env.PORT || 8000, () => {
    console.log('Server is running...');
});

app.use((req, res) => {
    res.status(404).send({ message: 'Not found...' });
});

const io = socket(server);

io.on('connection', (socket) => {
    console.log('Klient połączony.');
  
    // Wysyłanie aktualnej listy zadań tylko do nowego użytkownika
    socket.emit('updateData', tasks);
  
    // Obsługa zdarzenia "addTask" od klienta
    socket.on('addTask', (taskData) => {
      const { name, id } = taskData;
      const newTask = { name, id };
  
      // Dodaj nowe zadanie do tablicy tasks
      tasks.push(newTask);
  
      // Wyemituj zdarzenie "addTask" do wszystkich klientów (poza tym, który dodał zadanie)
      socket.broadcast.emit('addTask', newTask);
    });
  
    // Obsługa zdarzenia "removeTask" od klienta
    socket.on('removeTask', (taskId) => {
      // Usuń zadanie o zadanym id z tablicy tasks
      const removedTaskIndex = tasks.findIndex((task) => task.id === taskId);
      if (removedTaskIndex !== -1) {
        const removedTask = tasks.splice(removedTaskIndex, 1)[0];
        // Wyemituj zdarzenie "removeTask" do wszystkich klientów (poza tym, który usunął zadanie)
        socket.broadcast.emit('removeTask', removedTask.id);
      }
    });
  
    // Obsługa zdarzenia "disconnect" przy rozłączeniu klienta
    socket.on('disconnect', () => {
      console.log('Klient rozłączony.');
    });
  });