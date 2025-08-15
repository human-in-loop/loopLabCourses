import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import Seo from "@/components/seo";

type BlogListItem = {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    coverImage?: string;
    tags?: string[];
    publishedAt: string; // ISO
};

export default function Blog() {
    const { data, isLoading, isError } = useQuery<BlogListItem[]>({
        queryKey: ["/api/public/blog/posts"],
        queryFn: async () => {
            const r = await fetch("/api/public/blog/posts");
            if (!r.ok) throw new Error("Failed to load blog posts");
            return r.json();
        },
        staleTime: 5 * 60_000,
    });

    const posts = data ?? [];
    const canonical = "https://www.humaninloop.ca/blog";

    return (
        <div className="min-h-screen pt-20 px-4 bg-loop-dark text-white">
            <Seo
                title="Industry Insights • Human In Loop"
                description="Articles, case studies, and deep dives into AI, human-in-the-loop systems, and practical ML."
                canonical={canonical}
                type="website"
            />
            <div className="max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-bold mb-4">
                            <span className="gradient-text">Industry Insights</span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Articles, case studies, and deep dives into AI trends and applications
                        </p>
                    </div>

                    {isLoading ? (
                        <Card className="bg-gray-800/50 border-gray-700">
                            <CardContent className="p-12 text-center">Loading…</CardContent>
                        </Card>
                    ) : isError || posts.length === 0 ? (
                        <Card className="bg-gray-800/50 border-gray-700">
                            <CardContent className="p-12 text-center">
                                <p className="text-gray-400">No articles yet. Check back soon!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {posts.map((p) => (
                                <Link key={p.id} href={`/blog/${p.slug}`}>
                                    <Card className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition cursor-pointer">
                                        <CardContent className="p-6">
                                            <h2 className="text-2xl font-semibold text-white mb-2">{p.title}</h2>
                                            <p className="text-gray-400 mb-3" dangerouslySetInnerHTML={{ __html: p.excerpt }} />
                                            <div className="text-xs text-gray-500">
                                                {new Date(p.publishedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                                                {p.tags?.length ? ` • ${p.tags.join(", ")}` : ""}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
