console.log("JS loaded")

document.getElementById("shortenBtn").addEventListener("click", shortenUrl)

async function shortenUrl() {
  console.log("Button clicked")

  let input = document.getElementById("urlInput").value.trim()
  const alias = document.getElementById("alias").value.trim()

  if (!input) {
    alert("Enter URL")
    return
  }

  // ✅ AUTO FIX URL
  if (!input.startsWith("http")) {
    input = "https://" + input
  }

  try {
    const res = await fetch(`${window.location.origin}/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originalUrl: input,
        customAlias: alias || undefined   // 🔥 only send if exists
      })
    })

    const data = await res.json()

    const resultDiv = document.getElementById("result")

    if (res.ok && data.shortUrl) {
      resultDiv.innerHTML = `
        <p>Short URL:</p>
        <a href="${data.shortUrl}" target="_blank">${data.shortUrl}</a>
        <br/><br/>
        <button onclick="copyToClipboard('${data.shortUrl}')">Copy</button>
      `
    } else {
      resultDiv.innerHTML =
        `<p style="color:red;">${data.error || "Something went wrong"}</p>`
    }

  } catch (err) {
    console.error(err)
    alert("Server error")
  }
}

// 🔥 NEW: Copy feature
function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
  alert("Copied to clipboard!")
}