// ShipUp Blog - v1.3.6
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.supabase === 'undefined') {
        console.error('Errore: la libreria Supabase non è caricata. Controlla il CDN nel file index.html.');
        alert('Errore di caricamento della libreria Supabase.');
        return;
    }

    const supabaseClient = window.supabase.createClient('https://amxtzqdawysnqpjnsgic.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFteHR6cWRhd3lzbnFwam5zZ2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzA2NTgsImV4cCI6MjA1NTUwNjY1OH0.HNaCFBQ-BsJB4djiskK02r84Wwik-XJf5EPw2gq7ghY');

    const newsContainer = document.getElementById('newsContainer');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const newPostBtn = document.getElementById('newPostBtn');
    const newsModal = document.getElementById('newsModal');
    const newsClose = document.getElementById('newsClose');
    const newsForm = document.getElementById('newsForm');
    const editModal = document.getElementById('editModal');
    const editClose = document.getElementById('editClose');
    const editForm = document.getElementById('editForm');
    const adminPassword = '12345'; // Password admin

    if (!newsContainer || !adminLoginBtn || !newPostBtn || !newsModal || !newsClose || !newsForm || !editModal || !editClose || !editForm) {
        console.error('Uno o più elementi DOM non sono stati trovati.');
        return;
    }

    let isAdmin = localStorage.getItem('isAdmin') === 'true'; // Persiste lo stato admin nel localStorage
    updateAdminUI(); // Aggiorna l'interfaccia al caricamento

    loadPosts();

    adminLoginBtn.onclick = () => {
        const password = prompt('Inserisci la password per accedere all\'area admin:');
        if (password === adminPassword) {
            isAdmin = true;
            localStorage.setItem('isAdmin', 'true'); // Salva lo stato nel localStorage
            updateAdminUI();
            loadPosts(); // Ricarica le news per mostrare i bottoni admin
        } else {
            alert('Password errata!');
        }
    };

    newPostBtn.onclick = () => {
        // Resetta i campi del form prima di aprire il modal
        newsForm.reset();
        newsModal.style.display = 'flex';
    };

    newsClose.onclick = () => newsModal.style.display = 'none';
    window.onclick = (e) => { if (e.target === newsModal) newsModal.style.display = 'none'; };
    editClose.onclick = () => editModal.style.display = 'none';
    window.onclick = (e) => { if (e.target === editModal) editModal.style.display = 'none'; };

    newsForm.onsubmit = async (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const description =...

Qualcosa è andato storto. Riprova.
