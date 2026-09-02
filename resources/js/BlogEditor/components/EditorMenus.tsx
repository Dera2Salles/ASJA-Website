import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';

import { Editor } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';

import {
    Bold,
    Eraser,
    Image as ImageIcon,
    Italic,
    Link as LinkIcon,
    Underline as UnderlineIcon,
} from 'lucide-react';

interface EditorMenusProps {
    editor: Editor;
    onAddLink: () => void;
    onAddImage: () => void;
    onClearFormatting: () => void;
}

export function EditorMenus({
    editor,
    onAddLink,
    onAddImage,
    onClearFormatting,
}: EditorMenusProps) {
    return (
        <>
            <FloatingMenu
                editor={editor}
 className="bg-popover flex flex-col gap-1 rounded-lg border p-2 shadow-xl"
            >
 <div className="mb-1 text-xs font-medium text-muted-foreground">
                    Insérer
                </div>
                <div className="flex gap-1">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 1 })
                                .run()
                        }
 className="text-lg font-bold text-foreground"
                    >
                        H1
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 2 })
                                .run()
                        }
 className="text-base font-bold text-foreground"
                    >
                        H2
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 3 })
                                .run()
                        }
 className="font-bold text-foreground"
                    >
                        H3
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={onAddImage}
 className="text-foreground"
                    >
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                </div>
            </FloatingMenu>

            <BubbleMenu
                editor={editor}
 className="bg-popover flex gap-1 rounded-lg border p-2 shadow-xl"
            >
                <Toggle
                    size="sm"
                    pressed={editor.isActive('bold')}
                    onPressedChange={() =>
                        editor.chain().focus().toggleBold().run()
                    }
 className="h-8 w-8 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
                >
                    <Bold className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('italic')}
                    onPressedChange={() =>
                        editor.chain().focus().toggleItalic().run()
                    }
 className="h-8 w-8 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
                >
                    <Italic className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('underline')}
                    onPressedChange={() =>
                        editor.chain().focus().toggleUnderline().run()
                    }
 className="h-8 w-8 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
                >
                    <UnderlineIcon className="h-4 w-4" />
                </Toggle>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={onAddLink}
 className="h-8 text-foreground"
                >
                    <LinkIcon className="h-4 w-4" />
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={onClearFormatting}
 className="h-8 text-muted-foreground"
                >
                    <Eraser className="h-4 w-4" />
                </Button>
            </BubbleMenu>
        </>
    );
}
