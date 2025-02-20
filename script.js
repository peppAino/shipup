// ShipUp Blog - v1.2.8
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.supabase === 'undefined') {
        console.error('Errore: la libreria Supabase non è caricata. Controlla il CDN nel file index.html.');
        alert('Errore di caricamento della libreria Supabase.');
        return;
    }

    const supabaseClient = window.supabase.createClient('https://tuo-progetto.supabase.co', 'tua-anon-key');

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
                console.error('Errore caricamento allegato (RLS?):', error);
                alert(`Errore nel caricamento dell’allegato: ${error.message}. Controlla le policy RLS su Supabase per il bucket 'attachments'. Verifica che esista la policy 'Allow anon uploads' con FOR INSERT, USING (true) e WITH CHECK (true).`);
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
            console.error('Errore salvataggio post (RLS?):', error);
            alert(`Errore nel salvataggio del post: ${error.message}. Controlla le policy RLS su Supabase per la tabella 'posts'. Verifica che esista la policy 'Allow anon inserts' con USING (true) e WITH CHECK (true).`);
            return;
        }

        const post = postData[0];
        displayPost(post);
        newsForm.reset();
        adminModal.style.display = 'none';
    };

    function displayPost(post) {
        // Formatta la data/ora nel formato "DD/MM/YYYY HH:MM"
        const date = new Date(post.created_at);
        const formattedDate = date.toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(',', ''); // Rimuove la virgola per un formato più pulito, es. "20/02/2025 14:30"

        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';
        newsItem.innerHTML = `
            <h2>${post.title}</h2>
            <p>${post.description}</p>
            ${post.attachment_url && post.attachment_url.includes('image') 
                ? `<img src="${post.attachment_url}" alt="${post.title}" class="news-image">`
                : post.attachment_url ? `<p><a href="${post.attachment_url}" target="_blank" class="attachment-link">Scarica allegato (${getFileType(post.attachment_url)})</a></p>` : ''}
            <small>Pubblicato il: ${formattedDate}</small>
            <button class="read-button" data-post-id="${post.id}">Ho letto</button>
            <div class="view-count">Visualizzazioni: <span id="view-count-${post.id}">0</span></div>
        `;
        newsContainer.prepend(newsItem);

        const readButton = newsItem.querySelector('.read-button');
        readButton.addEventListener('click', async () => {
            if (readButton.classList.contains('disabled')) return;
            readButton.classList.add('disabled');
            await confirmRead(post.id);
            readButton.textContent = 'Letto!';
        });

        updateViewCount(post.id);
    }

    // Funzione per determinare il tipo di file dall'URL
    function getFileType(url) {
        if (url.endsWith('.pdf')) return 'PDF';
        if (url.endsWith('.xlsx') || url.endsWith('.xls')) return 'Excel';
        if (url.endsWith('.doc') || url.endsWith('.docx')) return 'Word';
        return 'file';
    }

    async function loadPosts() {
        try {
            const { data, error } = await supabaseClient
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) {
                console.error('Errore caricamento post (RLS?):', error);
                alert(`Errore nel caricamento delle news: ${error.message}. Controlla le policy RLS su Supabase per la tabella 'posts'. Verifica che esista la policy 'Allow anon reads' con USING (true).`);
                return;
            }
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
            console.error('Errore nella conferma di lettura (RLS?):', error);
            alert(`Errore nella conferma di lettura: ${error.message}. Controlla le policy RLS su Supabase per la tabella 'read_confirmations'.`);
            return;
        }
        alert('Grazie per aver confermato la lettura!');
    }

    async function updateViewCount(postId) {
        const lastView = localStorage.getItem(`view_${postId}`);
        const now = Date.now();
        if (lastView && (now - lastView) < 86400000) { // 24 ore
            return;
        }

        const { data: existingViews, error: fetchError } = await supabaseClient
            .from('post_views')
            .select('views')
            .eq('post_id', postId)
            .single();
        
        if (fetchError) {
            if (fetchError.code === '42P01') { // Tabella non esiste
                console.error('Errore: la tabella "post_views" non esiste. Crea la tabella su Supabase con: CREATE TABLE public.post_views (post_id INTEGER PRIMARY KEY REFERENCES public.posts(id), views INTEGER DEFAULT 0);');
                alert('La tabella delle visualizzazioni non esiste. Crea la tabella su Supabase e riprova.');
                return;
            } else if (fetchError.code === '42501') { // Violazione RLS
                console.error('Errore: violazione RLS sulla tabella "post_views". Controlla le policy RLS su Supabase per la tabella "post_views". Verifica che esista la policy "Allow anon updates" con FOR INSERT, UPDATE, USING (true) e WITH CHECK (true).', fetchError);
                alert(`Errore nell’aggiornamento delle visualizzazioni: violazione RLS. Controlla le policy su Supabase per 'post_views'.`);
                return;
            } else if (fetchError.code !== 'PGRST116') { // PGRST116 = record non trovato
                console.error('Errore nel recupero delle visualizzazioni (RLS?):', fetchError);
                return;
            }
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
            console.error('Errore nell’aggiornamento delle visualizzazioni (RLS?):', updateError);
            alert(`Errore nell’aggiornamento delle visualizzazioni: ${updateError.message}. Controlla le policy RLS su Supabase per la tabella 'post_views'. Verifica che esista la policy "Allow anon updates" con FOR INSERT, UPDATE, USING (true) e WITH CHECK (true).`);
            return;
        }

        document.getElementById(`view-count-${postId}`).textContent = views;
        localStorage.setItem(`view_${postId}`, now);
    }
});
