console.log("JS loaded")

const btn = document.getElementById("shortenBtn")
btn.addEventListener("click", shortenUrl)

let isLoading = false  // 🔥 prevents multiple clicks

async function shortenUrl() {

  if (isLoading) return   // 🔥 ignore duplicate clicks

  console.log("Button clicked")

  let input = document.getElementById("urlInput").value.trim()
  const aliasInput = document.getElementById("alias").value.trim()

  if (!input) {
    alert("Enter URL")
    return
  }

  // ✅ Fix URL if protocol missing
  if (!input.startsWith("http")) {
    input = "https://" + input
  }

  try {
    // 🔥 disable button + mark loading
    isLoading = true
    btn.disabled = true
    btn.innerText = "Processing..."

    const res = await fetch(`${window.location.origin}/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originalUrl: input,
        customAlias: aliasInput || undefined
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
  } finally {
    // 🔥 re-enable button always
    isLoading = false
    btn.disabled = false
    btn.innerText = "Shorten"
  }
}


// 🔥 Copy feature
function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
  alert("Copied to clipboard!")
}