async function sendQuery() {
    const query = document.getElementById("input").value;
    const box = document.getElementById("response");
    box.textContent = "";

    const res = await fetch("/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
    });

    const data = await res.json();
    box.textContent = data.answer;
}
