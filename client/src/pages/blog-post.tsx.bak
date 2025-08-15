// client/src/pages/blog-post.tsx  (updated: adds highlight.js for HTML posts)
import { useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import Seo from "@/components/seo";

// 👇 highlight.js (core + a few common languages; add more as needed)
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import "highlight.js/styles/atom-one-dark.css";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("css", css);
hljs.registerLanguage("xml", xml);

type Post = {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    html: string;
    coverImage?: string;
    tags?: string[];
    author?: { name: string };
    publishedAt: string;    // ISO
    updatedAt?: string;     // ISO
    seo?: { title?: string; description?: string; canonical?: string; image?: string };
    faq?: Array<{ question: string; answer: string }>;
    readingTimeMinutes?: number;
};

export default function BlogPost() {
    const { slug } = useParams();
    const contentRef = useRef<HTMLDivElement>(null);

    const { data, isLoading, isError } = useQuery<Post>({
        queryKey: ["/api/public/blog/posts", slug],
        queryFn: async () => {
            const r = await fetch(`/api/public/blog/posts/${slug}`);
            if (!r.ok) throw new Error("Not found");
            return r.json();
        },
        staleTime: 5 * 60_000,
    });

    // ▶ highlight code blocks after HTML is injected/updated
    useEffect(() => {
        if (!data?.html) return;
        const root = contentRef.current;
        if (!root) return;
        root.querySelectorAll("pre code").forEach((el) => {
            hljs.highlightElement(el as HTMLElement);
        });
    }, [data?.html]);

    if (isLoading) {
        return (
            <div className="min-h-screen pt-20 px-4 bg-loop-dark text-white">
                <div className="max-w-4xl mx-auto">
                    <Card className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-12 text-center">Loading…</CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="min-h-screen pt-20 px-4 bg-loop-dark text-white">
                <div className="max-w-4xl mx-auto">
                    <Card className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-12 text-center">
                            <h3 className="text-2xl font-semibold text-white mb-4">Article Not Found</h3>
                            <p className="text-gray-400">The article “{slug}” isn’t available.</p>
                            <div className="mt-6">
                                <Link href="/blog" className="underline text-loop-purple">← Back to Blog</Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const canonical = data.seo?.canonical ?? `https://www.humaninloop.ca/blog/${data.slug}`;
    const title = data.seo?.title ?? `${data.title} • Human In Loop`;
    const description = data.seo?.description ?? data.excerpt;
    const image = data.seo?.image ?? data.coverImage;

    const articleLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: data.title,
        description,
        image: image ? [image] : undefined,
        datePublished: data.publishedAt,
        dateModified: data.updatedAt ?? data.publishedAt,
        author: data.author?.name ? [{ "@type": "Person", name: data.author.name }] : undefined,
        mainEntityOfPage: canonical,
    };

    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Blog", item: "https://www.humaninloop.ca/blog" },
            { "@type": "ListItem", position: 2, name: data.title, item: canonical },
        ],
    };

    const faqLd = data.faq?.length
        ? {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: data.faq.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
        }
        : null;

    return (
        <div className="min-h-screen pt-20 px-4 bg-loop-dark text-white">
            <Seo
                title={title}
                description={description}
                canonical={canonical}
                image={image}
                type="article"
                publishedTime={data.publishedAt}
                modifiedTime={data.updatedAt}
                tags={data.tags}
            />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
            {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}

            <div className="max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <article className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
                        <header className="p-8">
                            <h1 className="text-4xl font-bold mb-3">{data.title}</h1>
                            <p className="text-gray-400">
                                {new Date(data.publishedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                                {data.readingTimeMinutes ? ` • ${data.readingTimeMinutes} min read` : ""}
                                {data.author?.name ? ` • by ${data.author.name}` : ""}
                            </p>
                            {data.tags?.length ? (
                                <div className="mt-3 text-xs text-gray-400">Tags: {data.tags.join(", ")}</div>
                            ) : null}
                        </header>

                        {/* {data.excerpt && (
                            <div className="px-8">
                                <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-4 mb-6">
                                    <strong className="text-white">TL;DR:</strong>{" "}
                                    <span className="text-gray-300" dangerouslySetInnerHTML={{ __html: data.excerpt }} />
                                </div>
                            </div>
                        )} */}

                        <div className="px-8 pb-10">
                            {/* render sanitized HTML from server */}
                            <div
                                ref={contentRef}
                                className="prose prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: data.html }}
                            />

                            <div className="mt-10 border-t border-gray-700 pt-6 text-sm text-gray-300">
                                <p className="mb-2">Keep exploring:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li><Link href="/blog" className="underline text-loop-purple">More articles</Link></li>
                                    <li><Link href="/courses" className="underline text-loop-purple">Courses on Human-in-the-Loop</Link></li>
                                    <li><Link href="/podcast" className="underline text-loop-purple">AI Insights Podcast</Link></li>
                                </ul>
                            </div>
                        </div>
                    </article>
                </motion.div>
            </div>
        </div>
    );
}
