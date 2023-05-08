/* TODO:
	1. disconnecting > update peerStatus.
*/

// calling io to connect to server
const socket = io ();
let peerStatusElement;

socket.on("NEW-USER-JOIN", (totalJoinees) => {
	console.log("new user has joined xoxo");
	printTotalJoinees(totalJoinees);

	updatePeerStatus ("Connecting...");
	setTimeout(() => {
		updatePeerStatus ("Connected");
	}, 1700);
});

socket.on("USER-LEAVE", (totalJoinees) => {
	console.log("user is leaving :(");
	printTotalJoinees(totalJoinees);

	updatePeerStatus ("Disconnected");
});

socket.on ("SOCKET-CLOSED", () => {
	// do stuff here.
})

document.addEventListener ("DOMContentLoaded", doPostLoadStuff);

function doPostLoadStuff () {

	const sendBtn           = document.querySelector("#send");
	const msgThread         = document.querySelector("#msg-thread");
	const inputElement      = document.querySelector("#text-input");
	peerStatusElement       = document.querySelector("#peer-status");

	let timerId;
	socket.on("TYPING", () => {
		clearTimeout (timerId);
		peerStatusElement.innerText = "Typing...";

		timerId = setTimeout (() => {
			peerStatusElement.innerText = "Connected"
		}, 1000);
	});

	socket.on ("MSG-INCOMING", (data) => {

		if (!data?.message) {
			console.error ("incorrect data signature for event MSG-INCOMING", data);
			return;
		}

		const pElement = document.createElement ("p");
		const textNode = document.createTextNode (data.message);

		pElement.appendChild (textNode);
		pElement.classList.add ("incoming-msg");

		msgThread.appendChild (pElement);
		msgThread.appendChild (document.createElement("br"));
	});

	// input on change, show other party is typing... 
	// after msg. is sent, send the msg on socket.
	// on msg. receive, show it on the msg-thread.
	
	inputElement.addEventListener("keydown", () => {
		socket.emit("TYPING");
	})

	sendBtn.addEventListener('click', () => {
		const inputValue = inputElement.value;
		const data = {
			message : inputValue,
			meta: {
				sentTs: new Date().toISOString(),
				// add a sentBy field too.
			}
		}
		
		if (!inputValue?.length) return;

		socket.emit ("MSG-SENT", data);
		
		const pElement = document.createElement ("p");
		const textNode = document.createTextNode (inputValue);

		pElement.appendChild (textNode);
		pElement.classList.add ("outgoing-msg");

		msgThread.appendChild (pElement);
		msgThread.appendChild (document.createElement("br"));

		// clear the input, once text sent.
		inputElement.value = "";
	})
}

function printTotalJoinees(totalJoinees) {
	console.log(`Total joinee count : ${totalJoinees}`);
}

function updatePeerStatus (status) {
	if (!peerStatusElement) return;

	peerStatusElement.innerText = status;
}

