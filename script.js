document.addEventListener('DOMContentLoaded', function () {
    loadNews();
});

function loadNews() {
    const repo = GITHUB_REPO;
    const owner = GITHUB_OWNER;
    const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=open&labels=news`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const newsList = document.getElementById('news-list');
            newsList.innerHTML = '';
            data.forEach(issue => {
                const newsItem = document.createElement('div');
                newsItem.classList.add('news-item');
                newsItem.innerHTML = `
                    <h3>${issue.title}</h3>
                    <p>${issue.body}</p>
                    <p><small>Pubblicato il: ${new Date(issue.created_at).toLocaleString()}</small></p>
                `;
                newsList.appendChild(newsItem);
            });
        })
        .catch(error => console.error('Errore:', error));
}