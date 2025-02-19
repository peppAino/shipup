const SUPABASE_URL = "https://amxtzqdawysnqpjnsgic.supabase.co";
const SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // Inserisci la tua API Key

async function loadPosts() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/posts?select=*`, {
            headers: {
                "apikey": SUPABASE_API_KEY,
                "Authorization": `Bearer ${SUPABASE_API_KEY}`
            }
        });

        if (response.ok) {
            const posts = await response.json();
            const postList = document.getElementById("postList");
            postList.innerHTML = "";

            posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            posts.forEach(post => {
                const postCard = document.createElement("div");
                postCard.classList.add("post-card");

                const postDate = new Date(post.created_at).toLocaleString();

                postCard.innerHTML = `
                    <p class="post-title">📌 ${post.title}</p>
                    <p class="post-content">${post.content}</p>
                    <p class="post-date">🕒 ${postDate}</p>
                    <div class="reaction-buttons">
                        <button class="like-btn" onclick="updateLikes(${post.id}, 'like')">👍 <span id="like-count-${post.id}">${post.likes || 0}</span></button>
                        <button class="dislike-btn" onclick="updateLikes(${post.id}, 'dislike')">👎 <span id="dislike-count-${post.id}">${post.dislikes || 0}</span></button>
                    </div>
                    <div class="admin-actions">
                        <button class="edit-btn" onclick="editPost(${post.id})">✏️ Modifica</button>
                        <button class="delete-btn" onclick="deletePost(${post.id})">🗑️ Elimina</button>
                    </div>
                `;

                postList.appendChild(postCard);
            });
        }
    } catch (error) {
        console.error("Errore nel caricamento dei post:", error);
    }
}

async function updateLikes(postId, type) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/posts?id=eq.${postId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "apikey": SUPABASE_API_KEY",
                "Authorization": `Bearer ${SUPABASE_API_KEY}`
            },
            body: JSON.stringify({
                [type === "like" ? "likes" : "dislikes"]: { "increment": 1 }
            })
        });

        if (response.ok) {
            const countElement = document.getElementById(`${type}-count-${postId}`);
            countElement.textContent = parseInt(countElement.textContent) + 1;
        }
    } catch (error) {
        console.error("Errore aggiornamento like/dislike:", error);
    }
}

async function deletePost(postId) {
    await fetch(`${SUPABASE_URL}/rest/v1/posts?id=eq.${postId}`, {
        method: "DELETE",
        headers: { "apikey": SUPABASE_API_KEY, "Authorization": `Bearer ${SUPABASE_API_KEY}` }
    });
    loadPosts();
}

document.addEventListener("DOMContentLoaded", loadPosts);
