document.addEventListener('DOMContentLoaded', function () {
    loadNews();

    const newsForm = document.getElementById('newsForm');
    newsForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addNews();
    });
});

function loadNews() {
    fetch('get_news.php')
        .then(response => response.json())
        .then(data => {
            const newsList = document.getElementById('news-list');
            newsList.innerHTML = '';
            data.forEach((news, index) => {
                const newsItem = document.createElement('div');
                newsItem.classList.add('news-item');
                newsItem.innerHTML = `
                    <h3>${news.title}</h3>
                    <p>${news.content}</p>
                    ${news.attachment ? `<div class="attachment"><a href="${news.attachment}" target="_blank">Vedi Allegato</a></div>` : ''}
                    <p><small>Pubblicato il: ${news.date}</small></p>
                    <button class="delete-button" onclick="deleteNews(${index})">Elimina</button>
                `;
                newsList.appendChild(newsItem);
            });
        });
}

function addNews() {
    const formData = new FormData(document.getElementById('newsForm'));

    fetch('add_news.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('News pubblicata con successo!');
            document.getElementById('newsForm').reset();
            loadNews();
        } else {
            alert('Errore nella pubblicazione della news.');
        }
    })
    .catch(error => console.error('Errore:', error));
}

function deleteNews(index) {
    const password = prompt('Inserisci la password per eliminare la news:');
    if (password) {
        fetch('delete_news.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ index, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('News eliminata con successo!');
                loadNews();
            } else {
                alert('Errore nell\'eliminazione della news.');
            }
        })
        .catch(error => console.error('Errore:', error));
    }
}