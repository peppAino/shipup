document.addEventListener('DOMContentLoaded', () => {
    const newsContainer = document.getElementById('newsContainer');
    const adminModal = document.getElementById('adminModal');
    const adminBtn = document.getElementById('adminBtn');
    const closeBtn = document.querySelector('.close');
    const newsForm = document.getElementById('newsForm');
    const adminPassword = '12345'; // Password per l'admin

    // Carica news salvate
    loadNews();

    // Apri modal admin con controllo password
    adminBtn.onclick = () => {
        const password = prompt('Inserisci la password per accedere all\'area admin:');
        if (password === adminPassword) {
            adminModal.style.display = 'flex';
        } else {
            alert('Password errata!');
        }
    };

    // Chiudi modal
    closeBtn.onclick = () => adminModal.style.display = 'none';
    window.onclick = (e) => { if (e.target == adminModal) adminModal.style.display = 'none'; };

    // Gestione del form
    newsForm.onsubmit = (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const attachment = document.getElementById('attachment').files[0];

        const news = { title, description, date: new Date().toLocaleString() };
        
        if (attachment) {
            const reader = new FileReader();
            reader.onload = (event) => {
                news.attachment = event.target.result;
                news.attachmentType = attachment.type;
                saveNews(news);
                displayNews(news);
                newsForm.reset();
                adminModal.style.display = 'none';
            };
            if (attachment.type.startsWith('image/')) {
                reader.readAsDataURL(attachment);
            } else {
                news.attachmentName = attachment.name;
                saveNews(news);
                displayNews(news);
                newsForm.reset();
                adminModal.style.display = 'none';
            }
        } else {
            saveNews(news);
            displayNews(news);
            newsForm.reset();
            adminModal.style.display = 'none';
        }
    });

    function displayNews(news) {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';
        newsItem.innerHTML = `
            <h2>${news.title}</h2>
            <p>${news.description}</p>
            <small>Pubblicato il: ${news.date}</small>
            ${news.attachment && news.attachmentType && news.attachmentType.startsWith('image/') 
                ? `<img src="${news.attachment}" alt="${news.title}">`
                : news.attachmentName ? `<p><a href="#" onclick="alert('Download non disponibile in questa demo.')">${news.attachmentName}</a></p>` : ''}
        `;
        newsContainer.prepend(newsItem);
    }

    function saveNews(news) {
        const newsList = JSON.parse(localStorage.getItem('news') || '[]');
        newsList.push(news);
        localStorage.setItem('news', JSON.stringify(newsList));
    }

    function loadNews() {
        const newsList = JSON.parse(localStorage.getItem('news') || '[]');
        newsList.forEach(displayNews);
    }
});
