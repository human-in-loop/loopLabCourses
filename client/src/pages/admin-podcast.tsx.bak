import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

type Episode = {
    id: string;
    title: string;
    pubDate: string;
};

export default function AdminPodcast() {
    const { data, isLoading, isError } = useQuery<{ episodes: Episode[] }>({
        queryKey: ["/api/podcast/episodes"],
        queryFn: async () => {
            const r = await fetch("/api/podcast/episodes");
            if (!r.ok) throw new Error("Failed to fetch episodes");
            return r.json();
        },
        staleTime: 60_000,
    });

    const episodes = data?.episodes ?? [];

    return (
        <div className="min-h-screen pt-20 px-4 bg-loop-dark text-white">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Podcast Management</h1>

                <Card className="bg-gray-800/50 border-gray-700 mb-6">
                    <CardContent className="p-6">
                        {isLoading ? (
                            <p className="text-gray-400">Loading episodes…</p>
                        ) : isError ? (
                            <p className="text-gray-400">Couldn’t load episodes.</p>
                        ) : (
                            <p className="text-gray-300">
                                Total episodes: <span className="font-semibold">{episodes.length}</span>
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Latest 10</h2>
                        <ul className="space-y-3">
                            {episodes.slice(0, 10).map((e) => (
                                <li key={e.id} className="flex justify-between border-b border-gray-700/50 pb-2">
                                    <span className="truncate pr-4">{e.title}</span>
                                    <span className="text-gray-500 text-sm">{new Date(e.pubDate).toLocaleDateString()}</span>
                                </li>
                            ))}
                            {episodes.length === 0 && <li className="text-gray-400">No episodes found.</li>}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
