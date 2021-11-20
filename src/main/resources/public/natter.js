const apiUrl = 'https://localhost:4567'

const createSpace = (name, owner) => {
    let data = {name: name, owner: owner};
    let csrfToken = getCookie('csrfToken');

    fetch(apiUrl + '/spaces', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
        }
    }).then(response => {
        if (response.ok) {
            return response.json()
        } else if (response.status === 401) {
            window.location.replace('/login.html')
        } else {
            throw Error(response.statusText)
        }
    }).then(json => console.log('created space: ', json.name, json.uri))
        .catch(error => console.error('error: ', error));
}

window.addEventListener('load', function (e) {
    document.getElementById('createSpace').addEventListener('submit', processFormSubmit)
})

const processFormSubmit = (e) => {
    e.preventDefault();

    let spaceName = document.getElementById('spaceName').value;
    let owner = document.getElementById('owner').value;

    createSpace(spaceName, owner);

    return false;
}

const getCookie = (cookieName) => {
    const cookieValue = document.cookie.split(';')
        .map(item => item.split('=').map(x => decodeURIComponent(x.trim())))
        .filter(item => item[0] === cookieName)[0]

    if (cookieValue) return cookieValue[1];
}