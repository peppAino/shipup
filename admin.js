const storedHash = "3d6bb4c1f8692a3ea5f34ac5c3e1877e19a5e94c8475e34c5f3bf90ea4d569e1"; // Hash di "admin123"

async function checkPassword() {
    let inputPassword = document.getElementById("password").value;
    let hash = await sha256(inputPassword);

    if (hash === storedHash) {
        document.querySelector(".login-container").classList.add("hidden");
        document.getElementById("admin-panel").classList.remove("hidden");
    } else {
        document.getElementById("error").classList.remove("hidden");
    }
}

async function sha256(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
}

async function publishPost() {
    let title = document.getElementById("title").value;
    let content = document.getElementById("content").value;

    if (title && content) {
        await db.from("posts").insert([{ title, content, likes: 0, dislikes: 0 }]);
        alert("Post pubblicato!");
        window.location.href = "index.html";
    }
}
