// RichTextEditor.tsx  (updated: no lowlight runtime needed)
import { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import CodeBlock from '@tiptap/extension-code-block'; // <-- use plain code block
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Underline from '@tiptap/extension-underline'; // <-- to support underline button
import Placeholder from '@tiptap/extension-placeholder'; // optional but nice

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from '@/components/ui/spinner';


interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [showImageDialog, setShowImageDialog] = useState(false);
    const [showVideoDialog, setShowVideoDialog] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageAlt, setImageAlt] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // StarterKit already includes codeBlock; we keep it but explicitly configure below
                codeBlock: false, // disable StarterKit's to use our configured CodeBlock
            }),
            CodeBlock.configure({
                HTMLAttributes: {
                    class: 'hljs', // optional: lets you apply highlight.js theme CSS on read view as-is
                },
            }),
            Image.configure({
                HTMLAttributes: { class: 'blog-image' },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'blog-link' },
            }),
            Youtube.configure({ controls: false, nocookie: true }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Color,
            TextStyle,
            Underline, // now your underline button actually works
            Highlight.configure({ multicolor: true }),
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            Placeholder.configure({
                placeholder: placeholder ?? 'Write your post…',
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class:
                    'prose prose-invert max-w-none focus:outline-none min-h-[400px] p-4 bg-gray-800 border border-gray-600 rounded-lg text-white',
            },
        },
    });

    const handleAddLink = useCallback(() => {
        if (linkUrl) {
            if (linkText) {
                editor?.chain().focus().insertContent(
                    `<a href="${linkUrl}" class="blog-link">${linkText}</a>`
                ).run();
            } else {
                editor?.chain().focus().setLink({ href: linkUrl }).run();
            }
        }
        setLinkUrl('');
        setLinkText('');
        setShowLinkDialog(false);
    }, [editor, linkUrl, linkText]);

    const handleAddImage = useCallback(() => {
        if (imageUrl) {
            editor?.chain().focus().setImage({ src: imageUrl, alt: imageAlt }).run();
        }
        setImageUrl('');
        setImageAlt('');
        setShowImageDialog(false);
    }, [editor, imageUrl, imageAlt]);

    const handleAddVideo = useCallback(() => {
        if (videoUrl) {
            if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                editor?.chain().focus().setYoutubeVideo({ src: videoUrl }).run();
            } else {
                editor?.chain().focus().insertContent(
                    `<video controls class="blog-video"><source src="${videoUrl}" type="video/mp4">Your browser does not support the video tag.</video>`
                ).run();
            }
        }
        setVideoUrl('');
        setShowVideoDialog(false);
    }, [editor, videoUrl]);

    const handleMediaUpload = async (file: File, type: 'image' | 'video') => {
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
    
        try {
            const response = await fetch('/api/admin/blog/media/upload', {
                method: 'POST',
                body: formData,
            });
    
            if (!response.ok) {
                throw new Error('Upload failed');
            }
    
            const result = await response.json();
            
            if (type === 'image') {
                editor?.chain().focus().setImage({ src: result.url, alt: file.name }).run();
                setShowImageDialog(false);
            } else {
                editor?.chain().focus().insertContent(
                    `<video controls class="blog-video"><source src="${result.url}" type="${file.type}">Your browser does not support the video tag.</video>`
                ).run();
                setShowVideoDialog(false);
            }
    
        } catch (error) {
            console.error('Upload error:', error);
            // Here you could add a toast notification to inform the user
        } finally {
            setIsUploading(false);
        }
    };

    const addTable = useCallback(() => {
        editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }, [editor]);

    if (!editor) return null;

    return (
        <div className="space-y-4">
            {/* Toolbar (unchanged) */}
            <div className="bg-gray-700 p-3 rounded-lg border border-gray-600">
                <div className="flex flex-wrap gap-1">
                    {/* Text Formatting */}
                    <Button type="button" size="sm" variant={editor.isActive('bold') ? 'default' : 'outline'}
                        onClick={() => editor.chain().focus().toggleBold().run()} className="h-8 w-8 p-0">
                        <i className="fas fa-bold" />
                    </Button>
                    <Button type="button" size="sm" variant={editor.isActive('italic') ? 'default' : 'outline'}
                        onClick={() => editor.chain().focus().toggleItalic().run()} className="h-8 w-8 p-0">
                        <i className="fas fa-italic" />
                    </Button>
                    <Button type="button" size="sm" variant={editor.isActive('underline') ? 'default' : 'outline'}
                        onClick={() => editor.chain().focus().toggleUnderline().run()} className="h-8 w-8 p-0">
                        <i className="fas fa-underline" />
                    </Button>
                    <Button type="button" size="sm" variant={editor.isActive('strike') ? 'default' : 'outline'}
                        onClick={() => editor.chain().focus().toggleStrike().run()} className="h-8 w-8 p-0">
                        <i className="fas fa-strikethrough" />
                    </Button>

                    <Separator orientation="vertical" className="h-8 bg-gray-500" />

                    {/* Headings */}
                    <Button type="button" size="sm" variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'outline'}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="h-8 px-2">H1</Button>
                    <Button type="button" size="sm" variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="h-8 px-2">H2</Button>
                    <Button type="button" size="sm" variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'outline'}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="h-8 px-2">H3</Button>

                    <Separator orientation="vertical" className="h-8 bg-gray-500" />

                    {/* Alignment */}
                    <Button type="button" size="sm" variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'outline'}
                        onClick={() => editor.chain().focus().setTextAlign('left').run()} className="h-8 w-8 p-0">
                        <i className="fas fa-align-left" />
                    </Button>
                    <Button type="button" size="sm" variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'outline'}
                        onClick={() => editor.chain().focus().setTextAlign('center').run()} className="h-8 w-8 p-0">
                        <i className="fas fa-align-center" />
                    </Button>
                    <Button type="button" size="sm" variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'outline'}
                        onClick={() => editor.chain().focus().setTextAlign('right').run()} className="h-8 w-8 p-0">
                        <i className="fas fa-align-right" />
                    </Button>

                    <Separator orientation="vertical" className="h-8 bg-gray-500" />

                    {/* Lists */}
                    <Button type="button" size="sm" variant={editor.isActive('bulletList') ? 'default' : 'outline'}
                        onClick={() => editor.chain().focus().toggleBulletList().run()} className="h-8 w-8 p-0">
                        <i className="fas fa-list-ul" />
                    </Button>
                    <Button type="button" size="sm" variant={editor.isActive('orderedList') ? 'default' : 'outline'}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()} className="h-8 w-8 p-0">
                        <i className="fas fa-list-ol" />
                    </Button>

                    <Separator orientation="vertical" className="h-8 bg-gray-500" />

                    {/* Media & Links */}
                    <Button type="button" size="sm" variant="outline" onClick={() => setShowLinkDialog(true)} className="h-8 w-8 p-0">
                        <i className="fas fa-link" />
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setShowImageDialog(true)} className="h-8 w-8 p-0">
                        <i className="fas fa-image" />
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setShowVideoDialog(true)} className="h-8 w-8 p-0">
                        <i className="fas fa-video" />
                    </Button>

                    <Separator orientation="vertical" className="h-8 bg-gray-500" />

                    {/* Code & Tables */}
                    <Button type="button" size="sm" variant={editor.isActive('code') ? 'default' : 'outline'}
                        onClick={() => editor.chain().focus().toggleCode().run()} className="h-8 w-8 p-0">
                        <i className="fas fa-code" />
                    </Button>
                    <Button type="button" size="sm" variant={editor.isActive('codeBlock') ? 'default' : 'outline'}
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()} className="h-8 w-8 p-0">
                        <i className="fas fa-file-code" />
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={addTable} className="h-8 w-8 p-0">
                        <i className="fas fa-table" />
                    </Button>

                    <Separator orientation="vertical" className="h-8 bg-gray-500" />

                    {/* Quote & Highlight */}
                    <Button type="button" size="sm" variant={editor.isActive('blockquote') ? 'default' : 'outline'}
                        onClick={() => editor.chain().focus().toggleBlockquote().run()} className="h-8 w-8 p-0">
                        <i className="fas fa-quote-left" />
                    </Button>
                    <Button type="button" size="sm" variant={editor.isActive('highlight') ? 'default' : 'outline'}
                        onClick={() => editor.chain().focus().toggleHighlight().run()} className="h-8 w-8 p-0">
                        <i className="fas fa-highlighter" />
                    </Button>

                    <Separator orientation="vertical" className="h-8 bg-gray-500" />

                    {/* Undo/Redo */}
                    <Button type="button" size="sm" variant="outline"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().chain().focus().undo().run()}
                        className="h-8 w-8 p-0">
                        <i className="fas fa-undo" />
                    </Button>
                    <Button type="button" size="sm" variant="outline"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().chain().focus().redo().run()}
                        className="h-8 w-8 p-0">
                        <i className="fas fa-redo" />
                    </Button>
                </div>
            </div>

            {/* Editor */}
            <EditorContent editor={editor} />

            {/* Link Dialog */}
            {showLinkDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 w-96">
                        <h3 className="text-lg font-semibold mb-4 text-white">Add Link</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">URL</label>
                                <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
                                    placeholder="https://example.com" className="bg-gray-700 border-gray-600 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Text (optional)</label>
                                <Input value={linkText} onChange={(e) => setLinkText(e.target.value)}
                                    placeholder="Link text" className="bg-gray-700 border-gray-600 text-white" />
                            </div>
                            <div className="flex space-x-2">
                                <Button onClick={handleAddLink} className="flex-1">Add Link</Button>
                                <Button variant="outline" onClick={() => setShowLinkDialog(false)}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Dialog */}
            {showImageDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 w-96">
                        <h3 className="text-lg font-semibold mb-4 text-white">Add Image</h3>
                        <Tabs defaultValue="url">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="url">From URL</TabsTrigger>
                                <TabsTrigger value="upload">Upload</TabsTrigger>
                            </TabsList>
                            <TabsContent value="url">
                                <div className="space-y-4 pt-4">
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Image URL</label>
                                        <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                                            placeholder="https://example.com/image.jpg" className="bg-gray-700 border-gray-600 text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Alt Text</label>
                                        <Input value={imageAlt} onChange={(e) => setImageAlt(e.target.value)}
                                            placeholder="Image description" className="bg-gray-700 border-gray-600 text-white" />
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button onClick={handleAddImage} className="flex-1">Add Image</Button>
                                        <Button variant="outline" onClick={() => setShowImageDialog(false)}>Cancel</Button>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="upload">
                                <div className="space-y-4 pt-4">
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Select Image</label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => e.target.files && handleMediaUpload(e.target.files[0], 'image')}
                                            className="bg-gray-700 border-gray-600 text-white"
                                            disabled={isUploading}
                                        />
                                    </div>
                                    {isUploading && (
                                        <div className="flex items-center justify-center">
                                            <Spinner />
                                            <span className="ml-2 text-white">Uploading...</span>
                                        </div>
                                    )}
                                    <div className="flex space-x-2">
                                    <Button variant="outline" onClick={() => setShowImageDialog(false)} className="w-full">Cancel</Button>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            )}

            {/* Video Dialog */}
            {showVideoDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 w-96">
                        <h3 className="text-lg font-semibold mb-4 text-white">Add Video</h3>
                        <Tabs defaultValue="url">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="url">From URL</TabsTrigger>
                                <TabsTrigger value="upload">Upload</TabsTrigger>
                            </TabsList>
                            <TabsContent value="url">
                                <div className="space-y-4 pt-4">
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Video URL</label>
                                        <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                                            placeholder="YouTube or video file URL" className="bg-gray-700 border-gray-600 text-white" />
                                        <p className="text-xs text-gray-400 mt-1">Supports YouTube, MP4, and other video formats</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button onClick={handleAddVideo} className="flex-1">Add Video</Button>
                                        <Button variant="outline" onClick={() => setShowVideoDialog(false)}>Cancel</Button>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="upload">
                                <div className="space-y-4 pt-4">
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Select Video</label>
                                        <Input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => e.target.files && handleMediaUpload(e.target.files[0], 'video')}
                                            className="bg-gray-700 border-gray-600 text-white"
                                            disabled={isUploading}
                                        />
                                    </div>
                                    {isUploading && (
                                        <div className="flex items-center justify-center">
                                            <Spinner />
                                            <span className="ml-2 text-white">Uploading...</span>
                                        </div>
                                    )}
                                    <div className="flex space-x-2">
                                    <Button variant="outline" onClick={() => setShowVideoDialog(false)} className="w-full">Cancel</Button>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            )}
        </div>
    );
}