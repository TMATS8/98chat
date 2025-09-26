const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = {}; // { socket.id: { username, avatar } }

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("set username", (data) => {
    users[socket.id] = { username: data.username, avatar: data.avatar };
    io.emit("user list", Object.values(users));
    io.emit("chat message", { user: "System", text: `${data.username} joined the chat` });
  });

  socket.on("chat message", (msg) => {
    if (!users[socket.id]) return;
    io.emit("chat message", {
      user: users[socket.id].username,
      avatar: users[socket.id].avatar,
      text: msg
    });
  });

  socket.on("disconnect", () => {
    if (users[socket.id]) {
      io.emit("chat message", { user: "System", text: `${users[socket.id].username} left the chat` });
      delete users[socket.id];
      io.emit("user list", Object.values(users));
    }
  });
});

const PORT = process.env.PORT || 3000; // Replit will use its own port
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
