const socket = io();
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const usersList = document.getElementById('users');
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});


socket.emit('joinRoom', {username, room});

socket.on('roomusers', ({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
});

socket.on('message', message => {
    outputMessage(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});


chatForm.addEventListener('submit', e => {
    e.preventDefault();

    const msg = e.target.elements.msg.value;
    socket.emit('chatMessage', msg);

    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<div class="message">
                <p class="meta">${message.username} <span>${message.time}</span></p>
                <p class="text">
                    ${message.text}
                </p>
            </div>`;
    chatMessages.appendChild(div);
}

function outputRoomName(room) {
    roomName.innerText = room;
}

function outputUsers(users) {
    usersList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}