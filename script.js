const SUPABASE_URL = "https://amxtzqdawysnqpjnsgic.supabase.co";
const SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFteHR6cWRhd3lzbnFwam5zZ2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzA2NTgsImV4cCI6MjA1NTUwNjY1OH0.HNaCFBQ-BsJB4djiskK02r84Wwik-XJf5EPw2gq7ghY";

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
                "apikey": SUPABASE_API_KEY,
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
        console.error("Errore nell'aggiornamento del like/dislike:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadPosts);

