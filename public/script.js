console.log("JS loaded")

document.getElementById("shortenBtn").addEventListener("click", shortenUrl)

async function shortenUrl() {
  console.log("Button clicked")

  let input = document.getElementById("urlInput").value

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
      body: JSON.stringify({ originalUrl: input })
    })

    console.log("Status:", res.status)

    const data = await res.json()
    console.log("Response:", data)

    const resultDiv = document.getElementById("result")

    if (data.shortUrl) {
      resultDiv.innerHTML =
        `<a href="${data.shortUrl}" target="_blank">${data.shortUrl}</a>`
    } else {
      resultDiv.innerHTML =
        `<p style="color:red;">Invalid URL</p>`
    }

  } catch (err) {
    console.error(err)
  }
}