import { useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TypeAnimation } from "react-type-animation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type ServiceKey = "marketing" | "web" | "aiBuild" | "events" | "research";

type ServiceCategory = {
    key: ServiceKey;
    title: string;
    tagline?: string;
    items: string[];
    prompts: string[];
    accentBG: string; // gradient for blob
    ring: string;     // ring color classes
    icon: string;     // fontawesome icon
};

const SERVICE_CATEGORIES: ServiceCategory[] = [
    {
        key: "marketing",
        title: "AI-Powered Marketing (strategy, not ad buying)",
        tagline: "Strategy and systems that compound — not media buying.",
        items: [
            "Answer-Engine Optimization (AEO) & modern SEO",
            "Creative kits for ads (headlines, angles, variants)",
            "Content systems: briefs → drafts → publish",
            "Analytics setup: GA4 & events, dashboards",
            "Social campaign design & content calendars",
        ],
        prompts: [
            "What would a 90-day AEO + SEO plan look like for us?",
            "Can you audit our content workflow and suggest an AI-assisted system?",
            "Best way to structure GA4 events for our funnel?",
            "What creative angles should we test for {product}?",
            "How should we plan a monthly social calendar around 3 core themes?",
        ],
        accentBG: "from-fuchsia-500/35 via-purple-500/25 to-sky-500/25",
        ring: "ring-purple-400/30 hover:ring-purple-300/50",
        icon: "fa-bullseye",
    },
    {
        key: "web",
        title: "Web Development & Design",
        tagline: "Fast, accessible, and built for ranking + conversion.",
        items: [
            "High-performance marketing sites & landing pages",
            "Design systems & component libraries",
            "Headless CMS integrations",
            "Accessibility (WCAG), Core Web Vitals, SEO tech",
        ],
        prompts: [
            "What stack and architecture would you recommend for a high-performance marketing site?",
            "How to migrate to a headless CMS with minimal downtime?",
            "What’s the fastest path to pass Core Web Vitals on key pages?",
            "Can you help us define a pragmatic design system?",
        ],
        accentBG: "from-sky-500/35 via-blue-500/25 to-indigo-500/25",
        ring: "ring-sky-400/30 hover:ring-sky-300/50",
        icon: "fa-globe",
    },
    {
        key: "aiBuild",
        title: "AI Consulting & Build",
        tagline: "From discovery to production with guardrails.",
        items: [
            "Discovery & roadmapping",
            "RAG systems, agents, data pipelines",
            "Prototyping → Pilot → Production (MLOps)",
            "Model-as-a-Service / SaaS builds",
            "Full-stack integrations",
        ],
        prompts: [
            "What’s the quickest way to validate a RAG use-case with our docs?",
            "Could you outline a pilot → production plan (infra, evals, safety)?",
            "How would you expose our model as a service with auth & quotas?",
            "What data pipeline do we need to keep models fresh?",
        ],
        accentBG: "from-emerald-500/35 via-teal-500/25 to-green-500/25",
        ring: "ring-emerald-400/30 hover:ring-emerald-300/50",
        icon: "fa-robot",
    },
    {
        key: "events",
        title: "Event Hosting & Community",
        tagline: "Run sharp, on-brand events that produce content assets.",
        items: [
            "Event strategy & run-of-show",
            "Speaker curation, moderation, workshops",
            "Production, recording, post-event content",
        ],
        prompts: [
            "What would a run-of-show look like for a 60-min virtual event?",
            "Can you propose speakers and a moderator for {topic}?",
            "How do we turn an event into a month of content assets?",
        ],
        accentBG: "from-orange-500/35 via-amber-500/25 to-red-500/25",
        ring: "ring-orange-400/30 hover:ring-orange-300/50",
        icon: "fa-microphone",
    },
    {
        key: "research",
        title: "Research & Podcast Collaboration",
        tagline: "Original insights and distribution with partners.",
        items: [
            "Research sprints & whitepapers",
            "Interviews, guest episodes, cross-posting",
            "Case studies & measurement",
        ],
        prompts: [
            "What’s a lightweight plan for a 4-week research sprint?",
            "Could we co-produce a podcast episode on {topic}?",
            "How would you structure a credible case study (data + story)?",
        ],
        accentBG: "from-pink-500/35 via-rose-500/25 to-fuchsia-500/25",
        ring: "ring-pink-400/30 hover:ring-pink-300/50",
        icon: "fa-flask",
    },
];
const AnimatedBackground = () => (
    <div className="area" aria-hidden="true">
        <ul className="circles">
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
        </ul>
    </div>
);
export default function Services() {
    const { toast } = useToast();
    const formRef = useRef<HTMLDivElement | null>(null);

    // FORM STATE
    const [selectedService, setSelectedService] = useState<ServiceKey | "">("");
    const activeCategory = useMemo(
        () => SERVICE_CATEGORIES.find((c) => c.key === selectedService),
        [selectedService]
    );
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [formData, setFormData] = useState({ name: "", email: "", company: "", message: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // NEW UI STATE
    const [openKey, setOpenKey] = useState<ServiceKey | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);

    const toggleOpen = (key: ServiceKey) => {
        setOpenKey((k) => (k === key ? null : key));
    };

    const handleStartEnquiry = (key: ServiceKey) => {
        setSelectedService(key);
        setOpenKey(key); // Ensure the card is open
        setSelectedItems([]); // Reset selections
        setIsFormVisible(true); // Show the form
    };

    const handlePromptClick = (p: string, key: ServiceKey) => {
        const text = p.replace("{product}", "").replace("{topic}", "");
        setFormData((f) => ({
            ...f,
            message: f.message ? `${f.message}\n\n${text}` : text,
        }));
        handleStartEnquiry(key); // Also select service and open form
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.message || !selectedService) {
            toast({ title: "Missing info", description: "Please add your email and a message.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                // ... (payload logic is unchanged)
            };

            const r = await fetch("/api/contact", {
                // ... (fetch logic is unchanged)
            });

            if (!r.ok) throw new Error("Failed to submit");

            toast({ title: "Thanks — we’ve got it!", description: "We’ll reply with a short plan and options." });

            setFormData({ name: "", email: "", company: "", message: "" });
            setSelectedItems([]);
            setIsFormVisible(false); // Hide form on success
            setTimeout(() => {
                setSelectedService("");
                setOpenKey(null);
            }, 300); // Delay deselecting to allow form to animate out

        } catch {
            toast({ title: "Something went wrong", description: "Please try again, or email hello@humaninloop.ca.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-loop-dark text-white overflow-hidden flex flex-col items-center justify-center p-4">
            {/* New Animated Background */}
            <AnimatedBackground />

            {/* Main content container */}
            <div className="relative z-10 w-full max-w-7xl">
                {/* Header with Typewriter */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-400 to-sky-400 min-h-[60px] md:min-h-[72px]">
                        <TypeAnimation
                            sequence={[
                                'How can we help you grow?',
                                2000,
                                'Explore our capabilities.',
                                2000,
                                'Let’s build something amazing.',
                                2000,
                            ]}
                            wrapper="span"
                            speed={50}
                            repeat={Infinity}
                        />
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                        Tap a service to see details and start an enquiry.
                    </p>
                </motion.div>

                {/* Service Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {SERVICE_CATEGORIES.map((cat, i) => {
                        const isOpen = openKey === cat.key;
                        const isSelected = selectedService === cat.key;
                        const isDimmed = selectedService && !isSelected;

                        return (
                            <motion.div
                                key={cat.key}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{
                                    opacity: isDimmed ? 0.6 : 1,
                                    scale: isDimmed ? 0.98 : 1,
                                    y: 0
                                }}
                                transition={{ duration: 0.4, delay: i * 0.05, type: 'spring' }}
                                className={`relative group rounded-xl transition-all duration-300 ${isSelected ? 'shadow-2xl shadow-purple-500/30' : ''}`}
                            >
                                <motion.div
                                    onClick={() => toggleOpen(cat.key)}
                                    className={`cursor-pointer w-full text-left rounded-xl p-[1px] transition-all duration-300 ${isSelected ? 'bg-gradient-to-br from-fuchsia-500 via-purple-500 to-sky-500' : 'bg-white/10'}`}
                                >
                                    <div className="rounded-[11px] bg-gray-800/80 backdrop-blur-md min-h-[120px] p-4 flex flex-col justify-center">
                                        <div className="flex items-center gap-4 text-xl text-white">
                                            <motion.span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 transition-colors group-hover:bg-white/10">
                                                <i className={`fas ${cat.icon} text-white/80`} />
                                            </motion.span>
                                            <span className="flex-1 font-semibold">{cat.title}</span>
                                            <motion.i className="fas fa-chevron-down text-white/60" animate={{ rotate: isOpen ? 180 : 0 }} />
                                        </div>

                                        <AnimatePresence initial={false}>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                                    animate={{ height: "auto", opacity: 1, marginTop: "1rem" }}
                                                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                >
                                                    <p className="text-sm text-gray-300 mb-4">{cat.tagline}</p>
                                                    <div className="border-t border-white/10 pt-4 flex flex-wrap gap-2 mb-4">
                                                        {cat.prompts.map((p) => (
                                                            <button key={p} type="button" onClick={(e) => { e.stopPropagation(); handlePromptClick(p, cat.key); }}
                                                                className="text-xs bg-gray-700/70 hover:bg-gray-600/70 border border-white/10 rounded-md px-2 py-1 text-gray-200"
                                                                title="Insert into message & start enquiry"
                                                            >{p}</button>
                                                        ))}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); handleStartEnquiry(cat.key); }}
                                                        className="bg-gradient-to-r from-fuchsia-500 to-sky-500 hover:from-fuchsia-400 hover:to-sky-400 w-full"
                                                    >Start Enquiry</Button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Floating Enquiry Form Panel */}
            <AnimatePresence>
                {isFormVisible && (
                    <motion.div
                        ref={formRef}
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed bottom-4 right-4 w-[calc(100%-2rem)] max-w-sm z-50"
                    >
                        <Card className="bg-gray-900/80 backdrop-blur-lg border border-white/10 shadow-2xl shadow-purple-500/20 rounded-xl">
                            <CardContent className="p-0">
                                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold">Enquiry: <span className="text-gray-300">{activeCategory?.title}</span></h3>
                                        <p className="text-xs text-gray-400">We'll follow up with a short plan.</p>
                                    </div>
                                    <button onClick={() => setIsFormVisible(false)} className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 transition-colors">
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input value={formData.name} onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))} className="bg-gray-800/70" placeholder="Name (optional)" />
                                        <Input type="email" required value={formData.email} onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))} className="bg-gray-800/70" placeholder="Email *" />
                                    </div>
                                    <div>
                                        <Label className="text-gray-300 mb-2 block text-sm">Focus (optional)</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {activeCategory?.items.map((label) => (
                                                <label key={label} className="flex items-center gap-2 bg-gray-800/60 border border-white/10 rounded-md px-3 py-2 hover:bg-gray-700/80 transition cursor-pointer">
                                                    <Checkbox checked={selectedItems.includes(label)} onCheckedChange={() => setSelectedItems((cur) => cur.includes(label) ? cur.filter((l) => l !== label) : [...cur, label])} />
                                                    <span className="text-xs text-gray-200">{label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <Textarea
                                        required value={formData.message} onChange={(e) => setFormData((f) => ({ ...f, message: e.target.value }))}
                                        className="bg-gray-800/70 min-h-[120px]"
                                        placeholder={`Your question or context * \nE.g., “${activeCategory?.prompts[0]}”`}
                                    />
                                    <Button type="submit" disabled={isSubmitting} className="w-full h-10 bg-gradient-to-r from-fuchsia-500 to-sky-500 hover:from-fuchsia-400 hover:to-sky-400">
                                        {isSubmitting ? <><i className="fas fa-circle-notch animate-spin mr-2" />Sending…</> : "Send Enquiry"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}