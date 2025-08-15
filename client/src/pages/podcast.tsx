import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Episode = {
    id: string;
    title: string;
    description: string;
    audioUrl?: string;
    link?: string;
    image?: string;
    duration?: string;
    pubDate: string; // ISO
    embedUrl?: string;
};

function truncate(text: string, max = 220) {
    const t = (text || "").trim().replace(/\s+/g, " ");
    return t.length > max ? t.slice(0, max).trimEnd() + "…" : t;
}

export default function Podcast() {
    const { data, isLoading, isError } = useQuery<{ episodes: Episode[] }>({
        queryKey: ["/api/podcast/episodes"],
        queryFn: async () => {
            const r = await fetch("/api/podcast/episodes");
            if (!r.ok) throw new Error("Failed to fetch episodes");
            return r.json();
        },
        staleTime: 60_000,
    });

    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const episodes = data?.episodes ?? [];

    return (
        <div className="min-h-screen pt-20 px-4 bg-loop-dark text-white">
            <Helmet>
                <title>AI Insights Podcast | Loop Lab</title>
                <meta name="description" content="Conversations with AI leaders, researchers, and practitioners from the AI Insights Podcast." />
            </Helmet>
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-bold mb-4">
                            <span className="gradient-text">AI Insights Podcast</span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Conversations with AI leaders, researchers, and practitioners
                        </p>
                    </div>

                    {isLoading ? (
                        <Card className="bg-gray-800/50 border-gray-700">
                            <CardContent className="p-12 space-y-4 animate-pulse">
                                <div className="h-6 bg-gray-700 rounded w-1/2" />
                                <div className="h-4 bg-gray-700 rounded w-5/6" />
                                <div className="h-40 bg-gray-700 rounded" />
                            </CardContent>
                        </Card>
                    ) : isError ? (
                        <Card className="bg-gray-800/50 border-gray-700">
                            <CardContent className="p-12 text-center">
                                <p className="text-gray-400">Couldn’t load episodes. Please try again.</p>
                            </CardContent>
                        </Card>
                    ) : episodes.length === 0 ? (
                        <Card className="bg-gray-800/50 border-gray-700">
                            <CardContent className="p-12 text-center">
                                <div className="bg-purple-500/20 p-6 rounded-full mx-auto mb-6 w-fit">
                                    <i className="fas fa-microphone text-purple-400 text-3xl"></i>
                                </div>
                                <h3 className="text-2xl font-semibold text-white mb-4">No episodes yet</h3>
                                <p className="text-gray-400">Check back soon!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {episodes.map((ep) => {
                                const isOpen = !!expanded[ep.id];
                                const text = isOpen ? ep.description : truncate(ep.description, 220);

                                return (
                                    <Card key={ep.id} className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition">
                                        <script type="application/ld+json">
                                            {JSON.stringify({
                                                "@context": "https://schema.org",
                                                "@type": "PodcastEpisode",
                                                "name": ep.title,
                                                "description": ep.description,
                                                "datePublished": ep.pubDate,
                                                "url": ep.link,
                                                "associatedMedia": {
                                                    "@type": "MediaObject",
                                                    "contentUrl": ep.audioUrl
                                                },
                                                "partOfSeries": {
                                                    "@type": "PodcastSeries",
                                                    "name": "AI Insights Podcast"
                                                }
                                            })}
                                        </script>
                                        <CardHeader className="flex flex-row items-start gap-4">
                                            {ep.image ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={ep.image} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                                            ) : (
                                                <div className="w-20 h-20 rounded-xl bg-gray-700 flex items-center justify-center">
                                                    <i className="fas fa-microphone text-2xl text-gray-400" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <CardTitle className="text-xl">{ep.title}</CardTitle>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    {new Date(ep.pubDate).toLocaleDateString()}
                                                    {ep.duration ? ` • ${ep.duration}` : null}
                                                </p>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-300 mb-2">{text}</p>

                                            {/* Toggle */}
                                            {ep.description && ep.description.length > 220 && (
                                                <button
                                                    className="text-sm text-purple-300 hover:text-purple-200 underline mb-4"
                                                    onClick={() =>
                                                        setExpanded((prev) => ({ ...prev, [ep.id]: !isOpen }))
                                                    }
                                                >
                                                    {isOpen ? "Show less" : "Show more"}
                                                </button>
                                            )}

                                            {ep.embedUrl ? (
                                                <iframe
                                                    src={ep.embedUrl}
                                                    width="100%"
                                                    height="152"
                                                    frameBorder={0}
                                                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                                    loading="lazy"
                                                    className="mb-2"
                                                    title={`Episode player: ${ep.title}`}
                                                />
                                            ) : ep.audioUrl ? (
                                                <audio controls preload="none" className="w-full mb-2">
                                                    <source src={ep.audioUrl} type="audio/mpeg" />
                                                    Your browser does not support the audio element.
                                                </audio>
                                            ) : null}

                                            <div className="flex gap-3">
                                                {ep.link && (
                                                    <a
                                                        href={ep.link}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-purple-300 hover:text-purple-200 underline"
                                                    >
                                                        Open episode page →
                                                    </a>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
