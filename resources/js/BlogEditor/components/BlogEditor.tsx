import { useEffect, useState } from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';

import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extension-placeholder';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { TableKit } from '@tiptap/extension-table';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const FontSize = TextStyle.extend({
    addAttributes() {
        return {
            fontSize: {
                default: null,
                parseHTML: (element: HTMLElement) => element.style.fontSize,
                renderHTML: (attributes: Record<string, unknown>) => {
                    if (!attributes.fontSize) {
                        return {};
                    }
                    return {
                        style: `font-size: ${attributes.fontSize}`,
                    };
                },
            },
        };
    },
});

const CustomTextAlign = TextAlign.extend({
    addAttributes() {
        return {
            textAlign: {
                default: 'left',
                parseHTML: (element: HTMLElement) =>
                    element.style.textAlign || 'left',
                renderHTML: (attributes: Record<string, unknown>) => {
                    if (attributes.textAlign === 'left') {
                        return {};
                    }
                    return {
                        style: `text-align: ${attributes.textAlign}`,
                    };
                },
            },
        };
    },
});

import { EditorMenus } from './EditorMenus';
import { Header } from './Header';
import { StatusBar } from './StatusBar';
import { Toolbar } from './Toolbar';

interface BlogEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    autoSave?: boolean;
    onSave?: () => void;
    onImageUpload?: (files: File[]) => Promise<string[]>;
}

function BlogEditorContent({
    content,
    onChange,
    placeholder = 'Commencez à écrire votre article...',
    autoSave = true,
    onSave,
    onImageUpload,
}: BlogEditorProps) {
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showFormatting, setShowFormatting] = useState(true);
    const [lastSave, setLastSave] = useState<string | null>(null);
    const [fontSize, setFontSize] = useState('16px');
    const [customColor, setCustomColor] = useState('#000000');
    const [lineHeight, setLineHeight] = useState('1.5');
    const [isUploading, setIsUploading] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4, 5, 6] },
                code: false,
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }),
            FontSize,
            Color,
            Highlight.configure({ multicolor: true }),
            Subscript,
            Superscript,
            Placeholder.configure({ placeholder }),
            CustomTextAlign.configure({
                types: ['heading', 'paragraph', 'image'],
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto',
                    style: 'max-width: 100%; height: auto; border-radius: 8px;',
                },
            }),
            TableKit.configure({
                table: { resizable: true },
            }),
        ],
        immediatelyRender: false,
        content,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);

            const text = editor.getText();
            const words = text
                .trim()
                .split(/\s+/)
                .filter((word) => word.length > 0);
            setWordCount(words.length);
            setCharCount(text.length);

            if (autoSave) {
                const now = new Date();
                setLastSave(now.toLocaleTimeString());
            }
        },
        editorProps: {
            attributes: {
                /* L'éditeur n'a plus de thème à lui : il suit celui de
                   l'administration qui l'héberge, via la variante `dark:`. */
                class: 'prose content-area prose-lg focus:outline-none min-h-[500px] p-6 dark:prose-invert',
                style: `line-height: ${lineHeight};`,
            },
            handleKeyDown: (_, event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                    return false;
                }

                if (event.key === 'Enter' && event.ctrlKey) {
                    editor?.chain().focus().setHardBreak().run();
                    return true;
                }

                if (event.key === 'b' && event.ctrlKey) {
                    event.preventDefault();
                    editor?.chain().focus().toggleBold().run();
                    return true;
                }

                if (event.key === 'i' && event.ctrlKey) {
                    event.preventDefault();
                    editor?.chain().focus().toggleItalic().run();
                    return true;
                }

                if (event.key === 'u' && event.ctrlKey) {
                    event.preventDefault();
                    editor?.chain().focus().toggleUnderline().run();
                    return true;
                }

                if (event.key === 'k' && event.ctrlKey) {
                    event.preventDefault();
                    addLink();
                    return true;
                }

                if (event.key === 's' && event.ctrlKey) {
                    event.preventDefault();
                    handleSave();
                    return true;
                }

                return false;
            },
        },
    });

    useEffect(() => {
        if (editor) {
            const text = editor.getText();
            const words = text
                .trim()
                .split(/\s+/)
                .filter((word) => word.length > 0);
            setWordCount(words.length);
            setCharCount(text.length);
        }
    }, [editor]);

    if (!editor) return null;

    const handleSetFontSize = (size: string) => {
        setFontSize(size);
        editor.chain().focus().setMark('textStyle', { fontSize: size }).run();
    };

    const handleSetColor = (color: string) => {
        setCustomColor(color);
        editor.chain().focus().setColor(color).run();
    };

    const handleSetHighlight = (color: string) => {
        editor.chain().focus().toggleHighlight({ color }).run();
    };

    const handleSetLineHeight = (height: string) => {
        setLineHeight(height);
    };

    const addLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt("Entrez l'URL:", previousUrl ?? 'https://');

        if (url === null) return;

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        const fullUrl = url.startsWith('http') ? url : `https://${url}`;
        editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: fullUrl })
            .run();
    };

    const addImage = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*';
        input.onchange = async (event) => {
            const files = Array.from(
                (event.target as HTMLInputElement).files || [],
            );
            if (files.length > 0 && onImageUpload) {
                setIsUploading(true);
                try {
                    const urls = await onImageUpload(files);
                    urls.forEach((url, index) => {
                        editor
                            ?.chain()
                            .focus()
                            .setImage({
                                src: url,
                                alt: files[index]?.name || '',
                                title: files[index]?.name || '',
                            })
                            .run();
                    });
                } catch (error) {
                    console.error('Error uploading images:', error);
                    alert('Error uploading images');
                } finally {
                    setIsUploading(false);
                }
            }
        };
        input.click();
    };

    const insertTable = () => {
        const rows = parseInt(prompt('Nombre de lignes:') || '3');
        const cols = parseInt(prompt('Nombre de colonnes:') || '3');

        if (rows && cols) {
            editor
                .chain()
                .focus()
                .insertTable({ rows, cols, withHeaderRow: true })
                .run();
        }
    };

    const clearFormatting = () => {
        editor.chain().focus().clearNodes().unsetAllMarks().run();
    };

    const copyFormatting = () => {
        const marks = editor.getAttributes('textStyle');
        alert(`Format copié: ${JSON.stringify(marks)}`);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        const element = document.querySelector('.blog-editor-container');
        if (element) {
            if (!isFullscreen) {
                element.requestFullscreen?.();
            } else {
                document.exitFullscreen?.();
            }
        }
    };

    const handleSave = () => {
        if (onSave) {
            onSave();
        }
        const now = new Date();
        setLastSave(now.toLocaleTimeString());
    };

    return (
        <TooltipProvider>
            <div
 className={`blog-editor-container overflow-hidden rounded-[2.5rem] border border-border bg-card shadow-2xl transition-all duration-300 ${
                    isFullscreen
                        ? 'fixed inset-0 z-50 m-0 flex flex-col rounded-none'
                        : ''
                }`}
            >
                <Header
                    wordCount={wordCount}
                    charCount={charCount}
                    lastSave={lastSave}
                    showFormatting={showFormatting}
                    isFullscreen={isFullscreen}
                    onToggleFormatting={() =>
                        setShowFormatting(!showFormatting)
                    }
                    onSave={handleSave}
                    onToggleFullscreen={toggleFullscreen}
                />

                {showFormatting && (
                    <>
                        <Toolbar
                            editor={editor}
                            fontSize={fontSize}
                            customColor={customColor}
                            onSetFontSize={handleSetFontSize}
                            onSetColor={handleSetColor}
                            onAddLink={addLink}
                            onAddImage={addImage}
                            onInsertTable={insertTable}
                            onClearFormatting={clearFormatting}
                            onCopyFormatting={copyFormatting}
                            onSetHighlight={handleSetHighlight}
                            onSetLineHeight={handleSetLineHeight}
                        />
                        <EditorMenus
                            editor={editor}
                            onAddLink={addLink}
                            onClearFormatting={clearFormatting}
                            onAddImage={function (): void {
                                throw new Error('Function not implemented.');
                            }}
                        />
                    </>
                )}

                {isUploading && (
 <div className="absolute inset-0 z-50 flex items-center justify-center bg-foreground/50">
 <div className="rounded-lg bg-card p-6 shadow-xl">
                            <div className="flex flex-col items-center gap-4">
                                <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
 <p className="font-medium text-foreground">
                                    Chargement de l&apos;image...
                                </p>
 <p className="text-sm text-muted-foreground">
                                    Veuillez patienter
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div
                    className={`relative ${isFullscreen ? 'flex-1 overflow-y-auto' : ''}`}
                >
                    <div
                        className={`p-4 ${isFullscreen ? 'mx-auto max-w-6xl' : ''}`}
                    >
                        <EditorContent editor={editor} />
                    </div>

                    <div className="pointer-events-none absolute inset-0 -z-10">
                        <div
                            className="mx-auto h-full"
                            style={{ maxWidth: '800px' }}
                        >
                            {Array.from({ length: 30 }).map((_, i) => (
                                <div
                                    key={i}
 className="border-t border-border"
                                    style={{
                                        height: `${parseInt(lineHeight) * 24}px`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <StatusBar
                    lineHeight={lineHeight}
                    fontSize={fontSize}
                    onDecreaseFont={() =>
                        handleSetFontSize(`${parseInt(fontSize) - 1}px`)
                    }
                    onIncreaseFont={() =>
                        handleSetFontSize(`${parseInt(fontSize) + 1}px`)
                    }
                    canDecrease={parseInt(fontSize) <= 8}
                    canIncrease={parseInt(fontSize) >= 48}
                />
            </div>
        </TooltipProvider>
    );
}

export function BlogEditor(props: BlogEditorProps) {
    return <BlogEditorContent {...props} />;
}
