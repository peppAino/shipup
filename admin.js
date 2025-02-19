document.addEventListener("DOMContentLoaded", loadAdminPosts);

function loadAdminPosts() {
    fetch('https://amxtzqdawysnqpjnsgic.supabase.co/rest/v1/posts', {
        headers: {
            'apikey': 'TU_API_KEY',
            'Authorization': 'Bearer TU_API_KEY'
        }
    })
    .then(response => response.json())
    .then(posts => {
        const container = document.getElementById("admin-posts-container");
        container.innerHTML = "";
        
        posts.reverse().forEach(post => {
            const postElement = document.createElement("div");
            postElement.classList.add("post");
            postElement.innerHTML = `
                <h2>${post.title}</h2>
                <p>${post.content}</p>
                <small>${new Date(post.created_at).toLocaleString()}</small>
                <button onclick="deletePost(${post.id})">🗑 Elimina</button>
            `;
            container.appendChild(postElement);
        });
    });
}

function publishPost() {
    const title = document.getElementById("post-title").value;
    const content = document.getElementById("post-content").value;

    fetch('https://amxtzqdawysnqpjnsgic.supabase.co/rest/v1/posts', {
        method: 'POST',
        headers: {
            'apikey': 'TU_API_KEY',
            'Authorization': 'Bearer TU_API_KEY',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content, likes: 0, dislikes: 0 })
    }).then(() => loadAdminPosts());
}

function deletePost(postId) {
    fetch(`https://amxtzqdawysnqpjnsgic.supabase.co/rest/v1/posts?id=eq.${postId}`, {
        method: 'DELETE',
        headers: {
            'apikey': 'TU_API_KEY',
            'Authorization': 'Bearer TU_API_KEY'
        }
    }).then(() => loadAdminPosts());
}
