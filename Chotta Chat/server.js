const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", ({ room, user }) => {
    console.log(`${user} joined room: ${room}`);
    socket.join(room);
    socket.room = room;
    socket.username = user;

    // Notify everyone in the room
    io.to(room).emit("chatMessage", {
      user: "System",
      msg: `${user} has joined ${room}`
    });
  });

  socket.on("chatMessage", ({ room, user, msg }) => {
    console.log(`Message from ${user} in ${room}: ${msg}`);
    if (room) {
      io.to(room).emit("chatMessage", { user, msg });
    }
  });

  socket.on("disconnect", () => {
    if (socket.room && socket.username) {
      io.to(socket.room).emit("chatMessage", {
        user: "System",
        msg: `${socket.username} has left ${socket.room}`
      });
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
