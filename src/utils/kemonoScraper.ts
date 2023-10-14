export async function artistSearch(
  artistName: string,
  client: any,
  actionType: string
) {
  await client.webView.goto(`https://kemono.party/artists`, {
    waitUntil: "networkidle2",
  });
  await client.webView.type("#q", artistName);
  await client.wait(500);
  const artistsData = await client.webView.evaluate(() => {
    const artistsDiv = document.querySelectorAll(".card-list__items a");
    const artistsAref = document.querySelectorAll(".card-list__items a[href]");

    let output: any[] = [];

    for (let i = 0; i < artistsDiv.length; i++) {
      const artist: any = artistsDiv[i];
      const artistInfo = artist.innerText.split(/\r\n|\r|\n/);
      console.log(artistInfo);
      output.push({
        service: artistInfo[0],
        name: artistInfo[1],
        favorites: artistInfo[2].split(" ")[0],
        url: "https://kemono.party" + artistsAref[i].getAttribute("href"),
        id: artistsAref[i].getAttribute("href")?.split("/").at(-1),
      });
    }

    // let artists: string[] = [];
    // let artistsLink: string[] = [];

    // artistsAref.forEach((a: any) => artistsLink.push(a.getAttribute("href")));

    // artistsDiv.forEach((artist: any) => {
    //   artists.push(artist.innerText.split(/\r\n|\r|\n/));
    // });

    return output;
  });
  if (actionType === "gpt") {
    // TODO: texto formateado para acompañar al mensaje de Lia.
    return;
  } else if (actionType === "interaction") {
    return artistsData;
  }
}
export async function artistInfo(
  artistId: string,
  serviceName: string,
  client: any,
  actionType: string
) {
  await client.webView.goto(
    `https://kemono.party/${serviceName}/user/${artistId}`,
    {
      waitUntil: "networkidle2",
    }
  );
  const [
    artistName,
    illustTitles,
    illustDates,
    illustAttachments,
    illustRefs,
    artistImage,
  ] = await client.webView.evaluate(() => {
    const artistImage: any = document
      .querySelectorAll<HTMLElement>(".fancy-image__picture img[src]")[1]
      ?.getAttribute("src");

    const artistName: string = document.querySelectorAll<HTMLElement>(
      ".user-header__profile span"
    )[1].innerText;

    const illustTitles = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".card-list__items article .image-link .post-card__header"
      )
    ).map((x) => x.innerText);

    const illustDates = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".card-list__items article .image-link .post-card__footer .timestamp"
      )
    ).map((x) => x.innerText.split(" ")[0]);

    const illustAttachments = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".card-list__items article .image-link .post-card__footer div"
      )
    ).map((x) => x.innerText);

    const illustRefs = Array.from(
      document.querySelectorAll(".card-list__items article a[href]")
    ).map((x) => x.getAttribute("href"));

    return [
      artistName,
      illustTitles,
      illustDates,
      illustAttachments,
      illustRefs,
      artistImage,
    ];
  });
  let illustsObject: any[] = [];

  for (let i = 0; i < illustTitles.length; i++) {
    const illust = {
      artistId: artistId,
      artistName: artistName,
      artistUrl: "https://kemono.party/fanbox/user/" + artistId,
      title: illustTitles[i],
      date: illustDates[i],
      attachmentsCount: illustAttachments[i],
      pageUrl: "https://kemono.party" + illustRefs[i],
      postId: illustRefs[i].split("/").at(-1),
    };
    illustsObject.push(illust);
  }
  if (actionType === "gpt") {
    // TODO: texto formateado para acompañar la respuesta de Lia
    return;
  } else if (actionType === "interaction") {
    return [illustsObject, artistImage] as any;
  }
}
export async function imageDeliver(
  artistId: string,
  postId: string,
  serviceName: string,
  client: any,
  actionType: string
) {
  await client.webView.goto(
    `https://kemono.party/${serviceName}/user/${artistId}/post/${postId}`
  );
  const grabData = await client.webView.evaluate(() => {
    const artistName =
      document.querySelector<HTMLElement>(".post__user-name")?.innerText;
    const artistProfile = document
      .querySelector<HTMLElement>(".post__user a[href]")
      ?.getAttribute("href");
    const illustTitle =
      document.querySelectorAll<HTMLElement>(".post__title")[0].innerText;

    const images = Array.from(
      document.querySelectorAll(".post__thumbnail")
    ).map((x) => {
      return [
        x.querySelector("a[href]")?.getAttribute("href"),
        x.querySelector("img[src]")?.getAttribute("src"),
      ];
    });

    const profileImages = Array.from(
      document.querySelectorAll(".fancy-image__picture")
    ).map((img) => {
      return (
        "https://kemono.party" +
        img.querySelector("img[src]")?.getAttribute("src")
      );
    });

    const data = {
      name: artistName,
      profileLink: "https://kemono.party" + artistProfile,
      avatar: profileImages,
      title: illustTitle,
      images: images,
    };
    return data;
  });
  if(actionType === "gpt"){
    // TODO solo una imagen
  } else if (actionType === "interaction"){
    return grabData;
  }
}
