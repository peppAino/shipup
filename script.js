document.addEventListener('DOMContentLoaded', function () {
    loadNews();

    const newsForm = document.getElementById('newsForm');
    newsForm.addEventListener('submit', function (event) {
        event.preventDefault();
        createNews();
    });
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
                let attachments = '';
                const bodyLines = issue.body.split('\n');
                const attachmentLines = bodyLines.filter(line => line.startsWith('Attachment:'));

                if (attachmentLines.length > 0) {
                    attachments = attachmentLines.map(line => {
                        const attachmentUrl = line.replace('Attachment:', '').trim();
                        return `<div class="attachment"><a href="${attachmentUrl}" target="_blank">Vedi Allegato</a></div>`;
                    }).join('');
                }

                newsItem.innerHTML = `
                    <h3>${issue.title}</h3>
                    <p>${bodyLines.filter(line => !line.startsWith('Attachment:')).join('<br>')}</p>
                    ${attachments}
                    <p><small>Pubblicato il: ${new Date(issue.created_at).toLocaleString()}</small></p>
                `;
                newsList.appendChild(newsItem);
            });
        })
        .catch(error => console.error('Errore:', error));
}

function createNews() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const attachment = document.getElementById('attachment').value;
    const body = `${content}\nAttachment: ${attachment}`;

    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`;
    const token = GITHUB_TOKEN;

    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: title,
            body: body,
            labels: ['news']
        })
    })
    .then(response => response.json())
    .then(data => {
        alert('News pubblicata con successo!');
        document.getElementById('newsForm').reset();
        loadNews();
    })
    .catch(error => console.error('Errore:', error));
}