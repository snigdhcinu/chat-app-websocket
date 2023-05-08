const path     = require ('path');
const http     = require ('http');
const express  = require ('express');
const socketio = require ('socket.io');

const app           = express ();
const server        = http.createServer (app);
const io            = socketio (server);

const port          = process.env.PORT || 3000;
const publicDirPath = path.join (__dirname, '../public');

app.use (express.static (publicDirPath));

// socket events.

let totalJoinees = 0;
// will run for each connection.
io.on ('connection', (socket) => {
	console.log (`New websocket connection : ${socket}`);
	totalJoinees += 1;

	/* ============================ HANDLE INCOMING MESSAGES ==========================*/

	// handles disconnection when specific socket connection breaks.
	socket.on ("disconnecting", () => {
		console.log("User about to disconnect :(");
		totalJoinees -= 1;

		socket.emit("USER-LEAVE", totalJoinees);
	});

	socket.on ("TYPING", () => {
		socket.broadcast.emit ("TYPING");
	})

	socket.on ("MSG-SENT", (data) => {
		socket.broadcast.emit ("MSG-INCOMING", data);
	})

	/* ============================ SEND MESSAGES ==========================*/
	// to send an event
	socket.emit ("NEW-USER-JOIN", totalJoinees);
});

// handles disconnection when entire io connection breaks.
io.on ('disconnect', (socket) => {
	console.log (`Websocket connection disconnected : ${socket}`);
	totalJoinees -= 1;

	socket.emit ("SOCKET-CLOSED", totalJoinees);
});

// server events.
app.get ('/', (req, res) => {
	res.sendFile (__dirname + "/index.html");
});

server.listen (port, () => {
	console.log (`hello world from ${port}`);
});
