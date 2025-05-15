const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');

registerForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const {login, password, passwordRepeat} = registerForm;
    if (password.value !== passwordRepeat.value) {
        return alert("Паролі не співпадають!");
    }

    const user = JSON.stringify({
        login: login.value,
        password: password.value
    });

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/register');
    xhr.send(user);
    xhr.onload = () => {
        alert(xhr.response)
    }
})

loginForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    const {login, password} = loginForm;
    const user = JSON.stringify({
        login: login.value,
        password: password.value
    });

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/login');
    xhr.send(user)
})