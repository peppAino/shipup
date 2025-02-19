const supabaseUrl = "https://amxtzqdawysnqpjnsgic.supabase.co";
const supabaseKey = "TUAPIKEY";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

async function fetchPosts() {
    const { data, error } = await supabase.from("posts").select("*").order("id", { ascending: false });

    if (error) {
        console.error("Errore nel recupero dei post:", error);
        return;
    }

    const postList = document.getElementById("postList");
    postList.innerHTML = "";

    data.forEach(post => {
        const postElement = document.createElement("div");
        postElement.classList.add("post");
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            <small>📅 ${new Date(post.created_at).toLocaleString()}</small>
            <div class="actions">
                <button class="like-btn" onclick="likePost(${post.id})">👍 ${post.likes || 0}</button>
                <button class="dislike-btn" onclick="dislikePost(${post.id})">👎 ${post.dislikes || 0}</button>
            </div>
        `;

        postList.appendChild(postElement);
    });
}

async function likePost(postId) {
    const { data, error } = await supabase
        .from("posts")
        .update({ likes: supabase.sql`likes + 1` })
        .eq("id", postId);

    if (error) {
        console.error("Errore nel mettere 'Mi Piace':", error);
        return;
    }

    fetchPosts();
}

async function dislikePost(postId) {
    const { data, error } = await supabase
        .from("posts")
        .update({ dislikes: supabase.sql`dislikes + 1` })
        .eq("id", postId);

    if (error) {
        console.error("Errore nel mettere 'Non Mi Piace':", error);
        return;
    }

    fetchPosts();
}

fetchPosts();
