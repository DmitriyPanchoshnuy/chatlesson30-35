const socket = io();

const messages = document.getElementById('messages');
const forms = document.getElementById("form");
const input = document.getElementById('input');

socket.on('all_messages', (msgArray) => {
    msgArray.forEach(msg => {
        let item = document.createElement('li');
        item.textContent = msg.login + ": " + msg.content;
        messages.appendChild(item)
    })

    window.scrollTo(0, document.body.scrollHeight);
})

forms.addEventListener('submit', (e) => {
    e.preventDefault();

    if (input.value) {
        socket.emit('new_message', input.value);
        input.value = '';
    }
});


socket.on('message', (message) => {
    var item = document.createElement('li');
    item.textContent = message;
    messages.append(item);

    window.scrollTo(0, document.body.scrollHeight);
});