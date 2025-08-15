import { XMLParser } from "fast-xml-parser";

export type Episode = {
  id: string;
  title: string;
  description: string; // plain text
  audioUrl?: string;
  link?: string;
  image?: string;
  duration?: string;
  pubDate: string; // ISO
  embedUrl?: string; // spotify iframe URL if detected
};

const parser = new XMLParser({ ignoreAttributes: false });

function stripHtml(html: string) {
  return (html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toIsoDate(input?: string): string {
  const d = input ? new Date(input) : new Date();
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

export async function fetchEpisodesFromRSS(rssUrl: string): Promise<Episode[]> {
  const res = await fetch(rssUrl, { headers: { "user-agent": "HILBot/1.0" } });
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
  const xml = await res.text();
  const data = parser.parse(xml);

  const channel = data?.rss?.channel;
  const items = Array.isArray(channel?.item)
    ? channel.item
    : [channel?.item].filter(Boolean);

  return (items || []).map((it: any) => {
    const enclosureUrl =
      it?.enclosure?.["@_url"] || it?.enclosure?.url || undefined;
    const guid =
      (typeof it?.guid === "object" ? it?.guid?.["#text"] : it?.guid) ??
      it?.link ??
      enclosureUrl ??
      it?.title;

    const image =
      it?.["itunes:image"]?.["@_href"] ||
      channel?.["itunes:image"]?.["@_href"] ||
      channel?.image?.url;

    const link: string | undefined = it?.link;
    let embedUrl: string | undefined;

    // If the link is an open.spotify.com episode, build an embed
    // (Anchor sometimes links to podcasters.spotify.com; if you later want,
    // you can resolve that to open.spotify.com server-side.)
    const spotifyMatch = link?.match(
      /open\.spotify\.com\/episode\/([A-Za-z0-9]+)/
    );
    if (spotifyMatch?.[1]) {
      embedUrl = `https://open.spotify.com/embed/episode/${spotifyMatch[1]}?utm_source=generator`;
    }

    return {
      id: String(guid || crypto.randomUUID()),
      title: it?.title ?? "Untitled",
      description: stripHtml(it?.description ?? ""),
      audioUrl: enclosureUrl,
      link,
      image,
      duration: it?.["itunes:duration"],
      pubDate: toIsoDate(it?.pubDate),
      embedUrl,
    };
  });
}
