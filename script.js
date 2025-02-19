document.addEventListener("DOMContentLoaded", loadPosts);

function loadPosts() {
    fetch('https://amxtzqdawysnqpjnsgic.supabase.co/rest/v1/posts', {
        headers: {
            'apikey': 'TU_API_KEY',
            'Authorization': 'Bearer TU_API_KEY'
        }
    })
    .then(response => response.json())
    .then(posts => {
        const container = document.getElementById("posts-container");
        container.innerHTML = "";
        
        posts.reverse().forEach(post => {
            const postElement = document.createElement("div");
            postElement.classList.add("post");
            postElement.innerHTML = `
                <h2>${post.title}</h2>
                <p>${post.content}</p>
                <small>${new Date(post.created_at).toLocaleString()}</small>
                <div class="like-dislike">
                    <button class="like" onclick="updateLikes(${post.id}, 'like')">👍 ${post.likes}</button>
                    <button class="dislike" onclick="updateLikes(${post.id}, 'dislike')">👎 ${post.dislikes}</button>
                </div>
            `;
            container.appendChild(postElement);
        });
    });
}

function updateLikes(postId, type) {
    let column = type === 'like' ? 'likes' : 'dislikes';

    fetch(`https://amxtzqdawysnqpjnsgic.supabase.co/rest/v1/posts?id=eq.${postId}`, {
        method: 'PATCH',
        headers: {
            'apikey': 'TU_API_KEY',
            'Authorization': 'Bearer TU_API_KEY',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [column]: column + 1 })
    }).then(() => loadPosts());
}
