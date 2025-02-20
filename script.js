// ShipUp Blog - v1.2.0
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.supabase === 'undefined') {
        console.error('Errore: la libreria Supabase non è caricata. Controlla il CDN nel file index.html.');
        alert('Errore di caricamento della libreria Supabase.');
        return;
    }

    const supabaseClient = window.supabase.createClient('https://amxtzqdawysnqpjnsgic.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFteHR6cWRhd3lzbnFwam5zZ2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzA2NTgsImV4cCI6MjA1NTUwNjY1OH0.HNaCFBQ-BsJB4djiskK02r84Wwik-XJf5EPw2gq7ghY');

    const newsContainer = document.getElementById('newsContainer');
    const adminModal = document.getElementById('adminModal');
    const adminBtn = document.getElementById('adminBtn');
    const closeBtn = document.querySelector('.close');
    const newsForm = document.getElementById('newsForm');
    const adminPassword = '12345'; // Password admin

    if (!newsContainer || !adminModal || !adminBtn || !closeBtn || !newsForm) {
        console.error('Uno o più elementi DOM non sono stati trovati.');
        return;
    }

    loadPosts();

    adminBtn.onclick = () => {
        const password = prompt('Inserisci la password per accedere all\'area admin:');
        if (password === adminPassword) {
            adminModal.style.display = 'flex';
        } else {
            alert('Password errata!');
        }
    };

    closeBtn.onclick = () => adminModal.style.display = 'none';
    window.onclick = (e) => { if (e.target === adminModal) adminModal.style.display = 'none'; };

    newsForm.onsubmit = async (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const attachment = document.getElementById('attachment').files[0];
        let attachmentUrl = null;

        if (attachment) {
            const fileName = `${Date.now()}_${attachment.name}`;
            const { data, error } = await supabaseClient.storage
                .from('attachments')
                .upload(fileName, attachment, { upsert: false });
            if (error) {
                console.error('Errore caricamento allegato:', error);
                alert(`Errore nel caricamento dell’allegato: ${error.message}`);
                return;
            }
            const { data: urlData } = supabaseClient.storage
                .from('attachments')
                .getPublicUrl(fileName);
            attachmentUrl = urlData.publicUrl;
        }

        const { data: postData, error } = await supabaseClient
            .from('posts')
            .insert([{ title, description, attachment_url: attachmentUrl }])
            .select();
        if (error) {
            console.error('Errore salvataggio post:', error);
            alert(`Errore nel salvataggio del post: ${error.message}`);
            return;
        }

        const post = postData[0];
        displayPost(post);
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
            <button class="read-button" data-post-id="${post.id}">Ho letto</button>
            <div class="view-count">Visualizzazioni: <span id="view-count-${post.id}">0</span></div>
        `;
        newsContainer.prepend(newsItem);

        // Aggiungi evento al bottone "Ho letto"
        const readButton = newsItem.querySelector('.read-button');
        readButton.addEventListener('click', () => confirmRead(post.id));

        // Aggiorna il conteggio delle visualizzazioni all’apertura
        updateViewCount(post.id);
    }

    async function loadPosts() {
        try {
            const { data, error } = await supabaseClient
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            data.forEach(displayPost);
        } catch (error) {
            console.error('Errore nel caricamento dei post:', error);
        }
    }

    async function confirmRead(postId) {
        const { error } = await supabaseClient
            .from('read_confirmations')
            .insert({ post_id: postId });
        if (error) {
            console.error('Errore nella conferma di lettura:', error);
            alert(`Errore nella conferma di lettura: ${error.message}`);
            return;
        }
        alert('Grazie per aver confermato la lettura!');
    }

    async function updateViewCount(postId) {
        // Incrementa il conteggio delle visualizzazioni
        const { data: existingViews, error: fetchError } = await supabaseClient
            .from('post_views')
            .select('views')
            .eq('post_id', postId)
            .single();
        
        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = record non trovato
            console.error('Errore nel recupero delle visualizzazioni:', fetchError);
            return;
        }

        let views = 0;
        if (existingViews) {
            views = existingViews.views || 0;
        }

        views += 1;

        const { error: updateError } = await supabaseClient
            .from('post_views')
            .upsert({ post_id: postId, views }, { onConflict: 'post_id' });
        
        if (updateError) {
            console.error('Errore nell’aggiornamento delle visualizzazioni:', updateError);
            return;
        }

        document.getElementById(`view-count-${postId}`).textContent = views;
    }

    // Incrementa le visualizzazioni quando una news viene visualizzata
    newsContainer.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.news-item').forEach(item => {
            const postId = item.querySelector('.read-button').dataset.postId;
            updateViewCount(postId);
        });
    });
});
