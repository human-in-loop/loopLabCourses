import { Helmet } from "react-helmet-async";

type Props = {
    title: string;
    description?: string;
    canonical?: string;
    image?: string;
    type?: "website" | "article";
    publishedTime?: string;
    modifiedTime?: string;
    tags?: string[];
};

export default function Seo({
    title,
    description,
    canonical,
    image,
    type = "article",
    publishedTime,
    modifiedTime,
    tags = [],
}: Props) {
    return (
        <Helmet prioritizeSeoTags>
            <title>{title}</title>
            {description && <meta name="description" content={description} />}
            {canonical && <link rel="canonical" href={canonical} />}

            {/* OpenGraph */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            {description && <meta property="og:description" content={description} />}
            {canonical && <meta property="og:url" content={canonical} />}
            {image && <meta property="og:image" content={image} />}

            {/* Twitter */}
            <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
            <meta name="twitter:title" content={title} />
            {description && <meta name="twitter:description" content={description} />}
            {image && <meta name="twitter:image" content={image} />}

            {/* Article specifics */}
            {publishedTime && <meta property="article:published_time" content={publishedTime} />}
            {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
            {tags.slice(0, 10).map((t) => (
                <meta key={t} property="article:tag" content={t} />
            ))}
        </Helmet>
    );
}
