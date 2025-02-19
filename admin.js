const supabaseUrl = "https://amxtzqdawysnqpjnsgic.supabase.co";
const supabaseKey = "TUAPIKEY";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// 📌 PUBBLICA UN NUOVO POST
async function publishPost() {
    const title = document.getElementById("postTitle").value.trim();
    const content = document.getElementById("postContent").value.trim();

    if (!title || !content) {
        alert("⚠️ Inserisci un titolo e un contenuto!");
        return;
    }

    const { error } = await supabase.from("posts").insert([
        { title, content, likes: 0, dislikes: 0, created_at: new Date().toISOString() }
    ]);

    if (error) {
        alert("❌ Errore nella pubblicazione!");
        console.error(error);
    } else {
        document.getElementById("postTitle").value = "";
        document.getElementById("postContent").value = "";
        fetchAdminPosts();
    }
}

// 📌 RECUPERA POST PER L'ADMIN
async function fetchAdminPosts() {
    const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Errore nel recupero:", error);
        return;
    }

    const postList = document.getElementById("adminPostList");
    postList.innerHTML = "";

    data.forEach(post => {
        const postElement = document.createElement("div");
        postElement.classList.add("post");
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            <small>📅 ${new Date(post.created_at).toLocaleString()}</small>
            <div class="actions">
                <button onclick="editPost(${post.id}, '${post.content.replace(/'/g, "\\'")}')">✏️ Modifica</button>
                <button onclick="deletePost(${post.id})">🗑 Elimina</button>
            </div>
        `;
        postList.appendChild(postElement);
    });
}

// 📌 MODIFICA POST
async function editPost(postId, oldContent) {
    const newContent = prompt("Modifica il contenuto:", oldContent);
    if (!newContent || newContent.trim() === oldContent) return;

    const { error } = await supabase
        .from("posts")
        .update({ content: newContent.trim() })
        .eq("id", postId);

    if (error) {
        alert("❌ Errore nella modifica!");
        console.error(error);
    } else {
        fetchAdminPosts();
    }
}

// 📌 ELIMINA POST
async function deletePost(postId) {
    const confirmDelete = confirm("❗ Eliminare il post?");
    if (!confirmDelete) return;

    const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

    if (error) {
        alert("❌ Errore nell'eliminazione!");
        console.error(error);
    } else {
        fetchAdminPosts();
    }
}

// 📌 CARICA I POST ALL'AVVIO
fetchAdminPosts();
