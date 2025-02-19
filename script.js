const SUPABASE_URL = "https://amxtzqdawysnqpjnsgic.supabase.co";
const SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFteHR6cWRhd3lzbnFwam5zZ2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzA2NTgsImV4cCI6MjA1NTUwNjY1OH0.HNaCFBQ-BsJB4djiskK02r84Wwik-XJf5EPw2gq7ghY";

async function submitPost() {
    const title = document.getElementById("postTitle").value;
    const content = document.getElementById("postContent").value;

    if (!title || !content) {
        alert("Inserisci titolo e contenuto.");
        return;
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_API_KEY,
            "Authorization": `Bearer ${SUPABASE_API_KEY}`,
            "Prefer": "return=minimal"
        },
        body: JSON.stringify({
            title: title,
            content: content,
            created_at: new Date().toISOString()
        })
    });

    if (response.ok) {
        alert("Post pubblicato!");
        document.getElementById("postTitle").value = "";
        document.getElementById("postContent").value = "";
        loadPosts();
    } else {
        alert("Errore nella pubblicazione!");
    }
}

async function loadPosts() {
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

        posts.forEach(post => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${post.title}</strong><br>${post.content}`;
            postList.appendChild(li);
        });
    }
}

document.addEventListener("DOMContentLoaded", loadPosts);
