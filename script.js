// ShipUp Blog - v1.1.1
document.addEventListener('DOMContentLoaded', () => {
    // Inizializza Supabase con le tue credenziali (nota: "supabase" minuscolo)
    const supabase = supabase.createClient('https://amxtzqdawysnqpjnsgic.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFteHR6cWRhd3lzbnFwam5zZ2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzA2NTgsImV4cCI6MjA1NTUwNjY1OH0.HNaCFBQ-BsJB4djiskK02r84Wwik-XJf5EPw2gq7ghY');

    const newsContainer = document.getElementById('newsContainer');
    const adminModal = document.getElementById('adminModal');
    const adminBtn = document.getElementById('adminBtn');
    const closeBtn = document.querySelector('.close');
    const newsForm = document.getElementById('newsForm');
    const adminPassword = '12345'; // Password admin

    // Verifica elementi DOM
    if (!newsContainer || !adminModal || !adminBtn || !closeBtn || !newsForm) {
        console.error('Uno o più elementi DOM non sono stati trovati.');
        return;
    }

    // Carica i post da Supabase
    loadPosts();

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
    window.onclick = (e) => { if (e.target === adminModal) adminModal.style.display = 'none'; };

    // Gestione del form per salvare post e allegati
    newsForm.onsubmit = async (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const attachment = document.getElementById('attachment').files[0];
        let attachmentUrl = null;

        // Se c’è un allegato, caricalo su Supabase Storage
        if (attachment) {
            const fileName = `${Date.now()}_${attachment.name}`;
            const { data, error } = await supabase.storage
                .from('attachments')
                .upload(fileName, attachment);
            if (error) {
                console.error('Errore caricamento allegato:', error);
                alert('Errore nel caricamento dell’allegato.');
                return;
            }
            // Ottieni l’URL pubblico dell’allegato
            const { data: urlData } = supabase.storage
                .from('attachments')
                .getPublicUrl(fileName);
            attachmentUrl = urlData.publicUrl;
        }

        // Salva il post nel database
        const { data, error } = await supabase
            .from('posts')
            .insert([{ title, description, attachment_url: attachmentUrl }]);
        if (error) {
            console.error('Errore salvataggio post:', error);
            alert('Errore nel salvataggio del post.');
            return;
        }

        // Aggiorna la UI
        displayPost({ title, description, created_at: new Date().toLocaleString(), attachment_url: attachmentUrl });
        newsForm.reset();
        adminModal.style.display = 'none';
    };

    function displayPost(post) {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';
        newsItem.innerHTML = `
            <h2>${post.title}</h2>
            <p>${post.description}</p>
            <small>Pubblicato il: ${post.created_at}</small>
            ${post.attachment_url && post.attachment_url.includes('image') 
                ? `<img src="${post.attachment_url}" alt="${post.title}">`
                : post.attachment_url ? `<p><a href="${post.attachment_url}" target="_blank">Scarica allegato</a></p>` : ''}
        `;
        newsContainer.prepend(newsItem);
    }

    async function loadPosts() {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            data.forEach(displayPost);
        } catch (error) {
            console.error('Errore nel caricamento dei post:', error);
        }
    }
});
