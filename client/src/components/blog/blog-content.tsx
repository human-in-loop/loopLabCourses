import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/atom-one-dark.css';

interface BlogContentProps {
    content: string;
    className?: string;
}

export default function BlogContent({ content, className = '' }: BlogContentProps) {
    return (
        <div className={`blog-content prose prose-invert prose-lg max-w-none ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                components={{
                    // Custom components for better styling
                    h1: ({ children }) => (
                        <h1 className="text-4xl font-bold mb-6 text-white border-b border-gray-700 pb-4">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-3xl font-semibold mb-4 text-white mt-8">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-2xl font-semibold mb-3 text-white mt-6">
                            {children}
                        </h3>
                    ),
                    p: ({ children }) => (
                        <p className="text-gray-300 leading-relaxed mb-4">
                            {children}
                        </p>
                    ),
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            className="text-loop-purple hover:text-loop-purple/80 underline transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {children}
                        </a>
                    ),
                    img: ({ src, alt }) => (
                        <figure className="my-8">
                            <img
                                src={src}
                                alt={alt}
                                className="w-full rounded-lg shadow-lg"
                                loading="lazy"
                            />
                            {alt && (
                                <figcaption className="text-center text-gray-400 text-sm mt-2 italic">
                                    {alt}
                                </figcaption>
                            )}
                        </figure>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-loop-purple bg-gray-800/50 pl-6 py-4 my-6 italic text-gray-300">
                            {children}
                        </blockquote>
                    ),
                    code: ({ children, className }) => {
                        const isBlock = className?.includes('language-');
                        if (isBlock) {
                            return (
                                <code className={`${className} bg-gray-900 rounded-lg block p-4 text-sm overflow-x-auto`}>
                                    {children}
                                </code>
                            );
                        }
                        return (
                            <code className="bg-gray-800 text-loop-purple px-2 py-1 rounded text-sm">
                                {children}
                            </code>
                        );
                    },
                    pre: ({ children }) => (
                        <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto my-6">
                            {children}
                        </pre>
                    ),
                    ul: ({ children }) => (
                        <ul className="list-disc pl-6 mb-4 text-gray-300 space-y-2">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal pl-6 mb-4 text-gray-300 space-y-2">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="text-gray-300">
                            {children}
                        </li>
                    ),
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-6">
                            <table className="w-full border-collapse border border-gray-700">
                                {children}
                            </table>
                        </div>
                    ),
                    th: ({ children }) => (
                        <th className="border border-gray-700 bg-gray-800 px-4 py-2 text-left text-white font-semibold">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="border border-gray-700 px-4 py-2 text-gray-300">
                            {children}
                        </td>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>

            {/* Custom styles for additional elements */}
            <style>{`
        .blog-content .blog-image {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
          margin: 2rem 0;
        }
        
        .blog-content .blog-link {
          color: #a855f7;
          text-decoration: underline;
          transition: color 0.2s;
        }
        
        .blog-content .blog-link:hover {
          color: #c084fc;
        }
        
        .blog-content .blog-video {
          width: 100%;
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 2rem 0;
        }
        
        .blog-content iframe {
          border-radius: 0.5rem;
          margin: 2rem 0;
        }
        
        .blog-content .ProseMirror-selectednode {
          outline: 2px solid #a855f7;
        }
      `}</style>
        </div>
    );
}