const SUPABASE_URL = "https://amxtzqdawysnqpjnsgic.supabase.co";  // Sostituisci con il tuo URL
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFteHR6cWRhd3lzbnFwam5zZ2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzA2NTgsImV4cCI6MjA1NTUwNjY1OH0.HNaCFBQ-BsJB4djiskK02r84Wwik-XJf5EPw2gq7ghY";  // Usa la chiave pubblica di Supabase

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const container = document.getElementById("posts-container");

async function loadPosts() {
    let { data: posts, error } = await db.from("posts").select("*").order("created_at", { ascending: false });

    if (error) {
        container.innerHTML = "<p>Errore nel caricamento dei post.</p>";
        return;
    }

    container.innerHTML = "";
    posts.forEach(post => {
        container.innerHTML += `
            <article>
                <h2>${post.title}</h2>
                <p>${post.content}</p>
                <div>
                    <button onclick="updateLike(${post.id}, 'likes')">👍 ${post.likes}</button>
                    <button onclick="updateLike(${post.id}, 'dislikes')">👎 ${post.dislikes}</button>
                </div>
            </article>
        `;
    });
}

async function updateLike(postId, type) {
    let { data, error } = await db.from("posts").select(type).eq("id", postId).single();
    if (error) return;

    let newCount = data[type] + 1;
    await db.from("posts").update({ [type]: newCount }).eq("id", postId);
    loadPosts();
}

function goToAdmin() {
    window.location.href = "admin.html";
}

loadPosts();
