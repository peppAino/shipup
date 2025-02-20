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
                newsForm.reset(); // Resetta anche in caso di errore
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
            newsForm.reset(); // Resetta anche in caso di errore
            return;
        }

        const post = postData[0];
        displayPost(post);
        newsForm.reset(); // Resetta sempre i campi dopo il successo
        newsModal.style.display = 'none';
    };

    editForm.onsubmit = async (e) => {
        e.preventDefault();
        const postId = document.getElementById('editPostId').value;
        const title = document.getElementById('editTitle').value;
        const description = document.getElementById('editDescription').value;
        const attachment = document.getElementById('editAttachment').files[0];
        let attachmentUrl = null;

        if (attachment) {
            const fileName = `${Date.now()}_${attachment.name}`;
            const { data, error } = await supabaseClient.storage
                .from('attachments')
                .upload(fileName, attachment, { upsert: false });
            if (error) {
                console.error('Errore caricamento allegato per modifica (RLS?):', error);
                alert(`Errore nel caricamento dell’allegato per modifica: ${error.message}. Controlla le policy RLS su Supabase per il bucket 'attachments'.`);
                return;
            }
            const { data: urlData } = supabaseClient.storage
                .from('attachments')
                .getPublicUrl(fileName);
            attachmentUrl = urlData.publicUrl;
        }

        const { error } = await supabaseClient
            .from('posts')
            .update({
                title,
                description,
                attachment_url: attachmentUrl || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', postId);
        if (error) {
            console.error('Errore modifica post (RLS?):', error);
            alert(`Errore nella modifica del post: ${error.message}. Controlla le policy RLS su Supabase per la tabella 'posts'. Verifica che esista la policy 'Allow admin updates' con USING (true) e WITH CHECK (true).`);
            return;
        }

        loadPosts(); // Ricarica le news per aggiornare l’interfaccia
        editModal.style.display = 'none';
    };

    function displayPost(post) {
        // Formatta la data/ora nel formato "DD/MM/YYYY HH:MM"
        const createdDate = new Date(post.created_at);
        const formattedCreated = createdDate.toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(',', ''); // Rimuove la virgola, es. "20/02/2025 14:30"

        let updatedText = '';
        if (post.updated_at) {
            const updatedDate = new Date(post.updated_at);
            const formattedUpdated = updatedDate.toLocaleString('it-IT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).replace(',', ''); // Rimuove la virgola, es. "20/02/2025 14:30"
            updatedText = `<br><small>Ultima modifica: ${formattedUpdated}</small>`;
        }

        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';
        newsItem.innerHTML = `
            <h2>${post.title}</h2>
            <p>${post.description}</p>
            ${post.attachment_url && post.attachment_url.includes('image') 
                ? `<img src="${post.attachment_url}" alt="${post.title}" class="news-image">`
                : post.attachment_url ? `<p><a href="${post.attachment_url}" target="_blank" class="attachment-link">Scarica allegato (${getFileType(post.attachment_url)})</a></p>` : ''}
            <small>Pubblicato il: ${formattedCreated}</small>
            ${updatedText} <!-- Posizionato sotto "Pubblicato il..." -->
            <button class="read-button" data-post-id="${post.id}">Ho letto</button>
            <div class="view-count">Visualizzazioni: <span id="view-count-${post.id}">0</span></div>
            ${isAdmin ? `
                <button class="edit-button" data-post-id="${post.id}">Modifica</button>
                <button class="delete-button" data-post-id="${post.id}">Cancella</button>
            ` : ''}
        `;
        newsContainer.prepend(newsItem);

        const readButton = newsItem.querySelector('.read-button');
        readButton.addEventListener('click', async () => {
            if (readButton.classList.contains('disabled')) return;
            readButton.classList.add('disabled');
            await confirmRead(post.id);
            readButton.textContent = 'Letto!';
        });

        if (isAdmin) {
            const editButton = newsItem.querySelector('.edit-button');
            const deleteButton = newsItem.querySelector('.delete-button');

            editButton.addEventListener('click', () => {
                document.getElementById('editPostId').value = post.id;
                document.getElementById('editTitle').value = post.title;
                document.getElementById('editDescription').value = post.description;
                editModal.style.display = 'flex';
            });

            deleteButton.addEventListener('click', async () => {
                if (confirm('Sei sicuro di voler cancellare questa news?')) {
                    const { error } = await supabaseClient
                        .from('posts')
                        .delete()
                        .eq('id', post.id);
                    if (error) {
                        console.error('Errore cancellazione post (RLS o vincolo?):', error);
                        if (error.message.includes('foreign key constraint')) {
                            alert(`Errore nella cancellazione del post: ${error.message}. Il vincolo di chiave esterna su 'read_confirmations' o 'post_views' blocca la cancellazione. Modifica i vincoli su Supabase con ON DELETE CASCADE (es. su 'read_confirmations' e 'post_views') o elimina i record correlati. Controlla anche le policy RLS su Supabase per la tabella 'posts'. Verifica che esista la policy 'Allow admin deletes' con USING (true) e WITH CHECK (true).`);
                        } else if (error.message.includes('42501')) { // Violazione RLS
                            alert(`Errore nella cancellazione del post: violazione RLS. Controlla le policy RLS su Supabase per la tabella 'posts'. Verifica che esista la policy 'Allow admin deletes' con USING (true) e WITH CHECK (true).`);
                        } else {
                            alert(`Errore nella cancellazione del post: ${error.message}. Controlla le policy RLS su Supabase per la tabella 'posts'. Verifica che esista la policy 'Allow admin deletes' con USING (true) e WITH CHECK (true).`);
                        }
                        return;
                    }
                    newsItem.remove();
                }
            });
        }

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
                .order('updated_at', { ascending: false, nullsLast: true }) // Ordina per updated_at, con nullsLast
                .order('created_at', { ascending: false }); // Poi per created_at, se updated_at è nullo
            if (error) {
                console.error('Errore caricamento post (RLS o rete?):', error);
                if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
                    alert(`Errore di rete nel caricamento delle news: ${error.message}. Verifica la connessione internet o le credenziali Supabase. Controlla anche le policy RLS su Supabase per la tabella 'posts'. Verifica che esista la policy 'Allow anon reads' con USING (true).`);
                } else {
                    alert(`Errore nel caricamento delle news: ${error.message}. Controlla le policy RLS su Supabase per la tabella 'posts'. Verifica che esista la policy 'Allow anon reads' con USING (true).`);
                }
                return;
            }
            newsContainer.innerHTML = ''; // Pulisci il container prima di ricaricare
            data.forEach(displayPost);
        } catch (error) {
            console.error('Errore nel caricamento dei post:', error);
            alert(`Errore imprevisto nel caricamento delle news: ${error.message}. Controlla la connessione o le policy RLS su Supabase.`);
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

    function updateAdminUI() {
        if (isAdmin) {
            newPostBtn.style.display = 'inline-block';
            adminLoginBtn.style.display = 'none';
        } else {
            newPostBtn.style.display = 'none';
            adminLoginBtn.style.display = 'inline-block';
        }
        loadPosts(); // Ricarica le news per aggiornare i bottoni
    }
});
