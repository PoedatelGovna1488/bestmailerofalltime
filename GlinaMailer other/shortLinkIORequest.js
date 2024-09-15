let shortScr = "api.short.io";
let url = "https://ytcomment.kmcat.uk/";

async function foo() {
  const res = await fetch("https://" + shortScr + "/links", {
    method: "POST",
    body: JSON.stringify({
      domain: "g9c1.short.gy",
      originalURL: url,
    }),
    headers: {
      "Content-type": "application/json",
      accept: "application/json",
      authorization: "sk_oQvXAMigziJ2QnuO",
    },
  });

  link = await res.json();
  shortedLink = link.shortURL;
}

async function grabInfo() {
  await foo();
  await console.log(shortedLink);
}
grabInfo();
