const apiUrl = 'https://localhost:4567'

const createSpace = (name, owner) => {
    let data = {name: name, owner: owner};

    fetch(apiUrl + '/spaces', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            return response.json()
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