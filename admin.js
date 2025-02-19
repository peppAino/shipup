async function deletePost(postId) {
    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
        console.error("Errore nell'eliminare il post:", error);
        return;
    }

    fetchPosts();
}

async function editPost(postId) {
    const newContent = prompt("Inserisci il nuovo testo del post:");
    if (!newContent) return;

    const { error } = await supabase.from("posts").update({ content: newContent }).eq("id", postId);

    if (error) {
        console.error("Errore nella modifica del post:", error);
        return;
    }

    fetchPosts();
}
