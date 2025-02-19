const SUPABASE_URL = "https://amxtzqdawysnqpjnsgic.supabase.co";
const SUPABASE_API_KEY = "TU_API_KEY";

document.addEventListener("DOMContentLoaded", loadPosts);

function loadPosts() {
    fetch(`${SUPABASE_URL}/rest/v1/posts?select=*`, {
        headers: {
            "apikey": SUPABASE_API_KEY,
            "Authorization": `Bearer ${SUPABASE_API_KEY}`
        }
    })
    .then(response => response.json())
    .then(posts => {
        const container = document.getElementById("posts-container");
        container.innerHTML = "";  // Pulisce i post prima di ricaricare

        posts.reverse().forEach(post => {
            const postElement = document.createElement("div");
            postElement.classList.add("post");
            postElement.innerHTML = `
                <h2>${post.title}</h2>
                <p>${post.content}</p>
                <small>${new Date(post.created_at).toLocaleString()}</small>
                <div class="like-dislike">
                    <button class="like" onclick="updateLikes(${post.id}, 'like')">👍 ${post.likes || 0}</button>
                    <button class="dislike" onclick="updateLikes(${post.id}, 'dislike')">👎 ${post.dislikes || 0}</button>
                </div>
            `;
            container.appendChild(postElement);
        });
    })
    .catch(error => console.error("Errore nel caricamento dei post:", error));
}

function updateLikes(postId, type) {
    let column = type === "like" ? "likes" : "dislikes";

    fetch(`${SUPABASE_URL}/rest/v1/posts?id=eq.${postId}`, {
        method: "PATCH",
        headers: {
            "apikey": SUPABASE_API_KEY,
            "Authorization": `Bearer ${SUPABASE_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ [column]: { "increment": 1 } })
    })
    .then(() => loadPosts())
    .catch(error => console.error("Errore nell'aggiornamento del like/dislike:", error));
}
