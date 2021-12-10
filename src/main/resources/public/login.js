const apiUrl = "https://localhost:4567";

const login = (username, password) => {
    let credentials = 'Basic ' + btoa(username + ':' + password);

    fetch(apiUrl + '/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': credentials
        },
    }).then(res => {
        if (res.ok) {
            res.json().then(json => {
                localStorage.setItem('token', json.token);
                window.location.replace('/natter.html')
            })
        }
    }).catch(error => console.error('Error logging in: ', error))
}

window.addEventListener('load', e => {
    document.getElementById('login').addEventListener('submit', processLoginSubmit)
})

const processLoginSubmit = e => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    login(username, password);
    return false;
}