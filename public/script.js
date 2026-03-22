async function shortenUrl() {
  const input = document.getElementById("urlInput").value

  const res = await fetch('/shorten', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ originalUrl: input })
  })

  const data = await res.json()

  if (data.shortUrl) {
    document.getElementById("result").innerHTML =
      `<a href="${data.shortUrl}" target="_blank">${data.shortUrl}</a>`
  } else {
    document.getElementById("result").innerHTML =
      `<p style="color:red;">Invalid URL</p>`
  }
}