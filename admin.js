const supabaseUrl = "https://amxtzqdawysnqpjnsgic.supabase.co";
const supabaseKey = "TUAPIKEY";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

async function publishPost() {
    const title = document.getElementById("postTitle").value;
    const content = document.getElementById("postContent").value;

    if (!title || !content) {
        alert("⚠️ Inserisci titolo e contenuto!");
        return;
    }

    const { error } = await supabase.from("posts").insert([{ title, content, likes: 0, dislikes: 0 }]);

    if (error) {
        console.error("Errore nella pubblicazione:", error);
        return;
    }

    document.getElementById("postTitle").value = "";
    document.getElementById("postContent").value = "";
    fetchPosts();
}

async function fetchPosts() {
    const { data, error } = await supabase.from("posts").select("*").order("id", { ascending: false });

    if (error) {
        console.error("Errore nel recupero dei post:", error);
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
                <button class="edit-btn" onclick="editPost(${post.id})">✏️ Modifica</button>
                <button class="delete-btn" onclick="deletePost(${post.id})">🗑 Elimina</button>
            </div>
        `;

        postList.appendChild(postElement);
    });
}

async function editPost(postId) {
    const newContent = prompt("Modifica il contenuto del post:");
    if (!newContent) return;

    const { error } = await supabase.from("posts").update({ content: newContent }).eq("id", postId);

    if (error) {
        console.error("Errore nella modifica del post:", error);
        return;
    }

    fetchPosts();
}

async function deletePost(postId) {
    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
        console.error("Errore nell'eliminare il post:", error);
        return;
    }

    fetchPosts();
}

function logout() {
    window.location.href = "index.html";
}

fetchPosts();
