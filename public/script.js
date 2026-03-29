console.log("JS loaded")

const btn = document.getElementById("shortenBtn")
btn.addEventListener("click", shortenUrl)

let isLoading = false

function formatDate(dateStr) {
  if (!dateStr) return "No expiry"

  const date = new Date(dateStr)

  if (isNaN(date)) return "Invalid Date"

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function shortenUrl() {

  if (isLoading) return

  console.log("Button clicked")

  let input = document.getElementById("urlInput").value.trim()
  const aliasInput = document.getElementById("alias").value.trim()

  if (!input) {
    alert("Enter URL")
    return
  }

  // ✅ Ensure protocol
  if (!input.startsWith("http")) {
    input = "https://" + input
  }

  try {
    isLoading = true
    btn.disabled = true
    btn.innerText = "Processing..."
    console.log("Sending request...")

    const res = await fetch(`${window.location.origin}/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originalUrl: input,
        customAlias: aliasInput || undefined
      })
    })

    // 🔥 SAFE JSON PARSE (IMPORTANT)
    let data = {}
    try {
      data = await res.json()
    } catch (e) {
      console.log("Response is not JSON")
    }

    console.log("Response:", res.status, data)

    const resultDiv = document.getElementById("result")

    if (res.ok && data.shortUrl) {
  resultDiv.innerHTML = `<p>Short URL:</p>
    <a href="${data.shortUrl}" target="_blank">${data.shortUrl}</a>
    <p style="margin-top:10px; color:gray;">
      Expires at: ${formatDate(data.expiryTime)}
    </p>
    <br/>
    <button onclick="copyToClipboard('${data.shortUrl}')">Copy</button>
  `
} else {
      // 🔥 SHOW ACTUAL ERROR
      const errorMsg = data.error || `Error: ${res.status}`
      resultDiv.innerHTML =
        `<p style="color:red;">${errorMsg}</p>`

      alert(errorMsg) // 👈 now shows real issue
    }

  } catch (err) {
    console.error("FETCH ERROR:", err)
    alert("Server not reachable")
  } finally {
    isLoading = false
    btn.disabled = false
    btn.innerText = "Shorten"
  }
}


// Copy feature
function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
  alert("Copied to clipboard!")
}