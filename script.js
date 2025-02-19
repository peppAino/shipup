const SUPABASE_URL = "https://amxtzqdawysnqpjnsgic.supabase.co";
const SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFteHR6cWRhd3lzbnFwam5zZ2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzA2NTgsImV4cCI6MjA1NTUwNjY1OH0.HNaCFBQ-BsJB4djiskK02r84Wwik-XJf5EPw2gq7ghY";

async function submitPost() {
    const title = document.getElementById("postTitle").value.trim();
    const content = document.getElementById("postContent").value.trim();

    if (!title || !content) {
        alert("⚠️ Inserisci titolo e contenuto per pubblicare!");
        return;
    }

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": SUPABASE_API_KEY,
                "Authorization": `Bearer ${SUPABASE_API_KEY}`,
                "Prefer": "return=representation"
            },
            body: JSON.stringify({
                title: title,
                content: content,
                created_at: new Date().toISOString()
            })
        });

        if (response.ok) {
            alert("✅ Post pubblicato!");
            document.getElementById("postTitle").value = "";
            document.getElementById("postContent").value = "";
            loadPosts();
        } else {
            throw new Error("Errore nella pubblicazione");
        }
    } catch (error) {
        alert("❌ Errore: " + error.message);
    }
}

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

            posts.reverse().forEach(post => {
                const postCard = document.createElement("div");
                postCard.classList.add("post-card");

                postCard.innerHTML = `
                    <p class="post-title">📌 ${post.title}</p>
                    <p class="post-content">${post.content}</p>
                `;

                postList.appendChild(postCard);
            });
        }
    } catch (error) {
        console.error("Errore nel caricamento dei post:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadPosts);
