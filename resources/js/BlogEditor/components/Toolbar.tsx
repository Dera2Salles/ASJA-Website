import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Toggle } from '@/components/ui/toggle';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Editor } from '@tiptap/react';
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    CheckSquare,
    ChevronDown,
    Code,
    Eraser,
    Type as FontSizeIcon,
    GripVertical,
    Highlighter,
    Image as ImageIcon,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Minus,
    Paintbrush,
    PaintBucket,
    Pilcrow,
    Quote,
    RedoIcon,
    Sparkles,
    Strikethrough,
    Subscript as SubscriptIcon,
    Superscript as SuperscriptIcon,
    Table as TableIcon,
    Type,
    Underline as UnderlineIcon,
    UndoIcon,
} from 'lucide-react';
import React, { useRef } from 'react';

interface ToolbarProps {
    editor: Editor;
    fontSize: string;
    customColor: string;
    onSetFontSize: (size: string) => void;
    onSetColor: (color: string) => void;
    onAddLink: () => void;
    onAddImage: (files?: File[]) => void;
    onInsertTable: () => void;
    onClearFormatting: () => void;
    onCopyFormatting: () => void;
    onSetHighlight: (color: string) => void;
    onSetLineHeight: (height: string) => void;
}

const fontSizeOptions = [
    { label: '8pt - Très petit', value: '8px' },
    { label: '10pt - Petit', value: '10px' },
    { label: '12pt - Petit', value: '12px' },
    { label: '14pt - Normal', value: '14px' },
    { label: '16pt - Grand', value: '16px' },
    { label: '18pt - Grand', value: '18px' },
    { label: '20pt - Très grand', value: '20px' },
    { label: '24pt - Énorme', value: '24px' },
    { label: '32pt - Titre', value: '32px' },
    { label: '48pt - Affichage', value: '48px' },
];

const fontFamilyOptions = [
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Times New Roman', value: 'Times New Roman, serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Courier New', value: 'Courier New, monospace' },
    { label: 'Verdana', value: 'Verdana, sans-serif' },
    { label: 'Tahoma', value: 'Tahoma, sans-serif' },
    { label: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
    { label: 'Comic Sans MS', value: 'Comic Sans MS, cursive' },
];

const colorOptions = [
    { name: 'Noir', value: '#000000' },
    { name: 'Rouge', value: '#ef4444' },
    { name: 'Vert', value: '#22c55e' },
    { name: 'Bleu', value: '#3b82f6' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Rose', value: '#ec4899' },
    { name: 'Jaune', value: '#fbbf24' },
    { name: 'Gris clair', value: '#9ca3af' },
    { name: 'Gris foncé', value: '#4b5563' },
    { name: 'Blanc', value: '#ffffff' },
];

const highlightColors = [
    { name: 'Jaune', value: '#fef3c7' },
    { name: 'Vert', value: '#d1fae5' },
    { name: 'Bleu', value: '#dbeafe' },
    { name: 'Rose', value: '#fce7f3' },
    { name: 'Orange', value: '#ffedd5' },
    { name: 'Violet', value: '#ede9fe' },
];

export function Toolbar({
    editor,
    fontSize,
    customColor,
    onSetFontSize,
    onSetColor,
    onAddLink,
    onAddImage,
    onInsertTable,
    onClearFormatting,
    onCopyFormatting,
    onSetHighlight,
    onSetLineHeight,
}: ToolbarProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageClick = () => {
        onAddImage();
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            onAddImage([file]);
            event.target.value = '';
        }
    };

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            <div className="flex flex-wrap items-center gap-1 border-b bg-gradient-to-r from-green-50/50 to-white p-3 dark:from-zinc-900/40 dark:to-zinc-950/40">
                {}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-9 gap-1">
                            <Type className="h-4 w-4" />
                            <span className="text-xs">Police</span>
                            <GripVertical className="ml-1 h-3 w-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        {fontFamilyOptions.map((font) => (
                            <DropdownMenuItem
                                key={font.value}
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .setMark('textStyle', {
                                            fontFamily: font.value,
                                        })
                                        .run()
                                }
                                style={{ fontFamily: font.value }}
                            >
                                {font.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-9 gap-1">
                            <FontSizeIcon className="h-4 w-4" />
                            <span className="text-xs">
                                {fontSize.replace('px', '')}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                        <div className="p-2">
                            <Slider
                                defaultValue={[
                                    parseInt(fontSize.replace('px', '')),
                                ]}
                                min={8}
                                max={48}
                                step={1}
                                onValueChange={([value]) =>
                                    onSetFontSize(`${value}px`)
                                }
                            />
                        </div>
                        <DropdownMenuSeparator />
                        {fontSizeOptions.map((option) => (
                            <DropdownMenuItem
                                key={option.value}
                                onClick={() => onSetFontSize(option.value)}
                            >
                                <span
                                    style={{ fontSize: option.value }}
                                    className="mr-2"
                                >
                                    Aa
                                </span>
                                {option.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <Separator orientation="vertical" className="h-6" />

                <Separator orientation="vertical" className="h-6" />

                {}
                <div className="flex items-center gap-0.5 rounded-md border bg-white p-0.5 dark:bg-gray-800">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle
                                size="sm"
                                pressed={editor.isActive('bold')}
                                onPressedChange={() =>
                                    editor.chain().focus().toggleBold().run()
                                }
                                className="h-8 w-8 data-[state=on]:bg-green-100 dark:data-[state=on]:bg-green-900/50"
                            >
                                <Bold className="h-4 w-4" />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>Gras (Ctrl+B)</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle
                                size="sm"
                                pressed={editor.isActive('italic')}
                                onPressedChange={() =>
                                    editor.chain().focus().toggleItalic().run()
                                }
                                className="h-8 w-8 data-[state=on]:bg-green-100 dark:data-[state=on]:bg-green-900/50"
                            >
                                <Italic className="h-4 w-4" />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>Italique (Ctrl+I)</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle
                                size="sm"
                                pressed={editor.isActive('underline')}
                                onPressedChange={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleUnderline()
                                        .run()
                                }
                                className="h-8 w-8 data-[state=on]:bg-green-100 dark:data-[state=on]:bg-green-900/50"
                            >
                                <UnderlineIcon className="h-4 w-4" />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>Souligné (Ctrl+U)</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle
                                size="sm"
                                pressed={editor.isActive('strike')}
                                onPressedChange={() =>
                                    editor.chain().focus().toggleStrike().run()
                                }
                                className="h-8 w-8 data-[state=on]:bg-green-100 dark:data-[state=on]:bg-green-900/50"
                            >
                                <Strikethrough className="h-4 w-4" />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>Barré</TooltipContent>
                    </Tooltip>

                    <Separator orientation="vertical" className="mx-0.5 h-6" />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle
                                size="sm"
                                pressed={editor.isActive('superscript')}
                                onPressedChange={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleSuperscript()
                                        .run()
                                }
                                className="h-8 w-8 data-[state=on]:bg-green-100 dark:data-[state=on]:bg-green-900/50"
                            >
                                <SuperscriptIcon className="h-4 w-4" />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>Exposant</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle
                                size="sm"
                                pressed={editor.isActive('subscript')}
                                onPressedChange={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleSubscript()
                                        .run()
                                }
                                className="h-8 w-8 data-[state=on]:bg-green-100 dark:data-[state=on]:bg-green-900/50"
                            >
                                <SubscriptIcon className="h-4 w-4" />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>Indice</TooltipContent>
                    </Tooltip>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-9 gap-1">
                            <PaintBucket className="h-4 w-4" />
                            <div
                                className="h-4 w-4 rounded border"
                                style={{ backgroundColor: customColor }}
                            />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                        <div className="space-y-4">
                            <Label>Couleur du texte</Label>
                            <div className="grid grid-cols-6 gap-2">
                                {colorOptions.map((color) => (
                                    <button
                                        key={color.value}
                                        className="h-8 w-8 rounded-full border transition-transform hover:scale-110"
                                        style={{ backgroundColor: color.value }}
                                        onClick={() => onSetColor(color.value)}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="custom-color">
                                    Couleur personnalisée
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="custom-color"
                                        type="color"
                                        value={customColor}
                                        onChange={(e) =>
                                            onSetColor(e.target.value)
                                        }
                                        className="h-10"
                                    />
                                    <Input
                                        value={customColor}
                                        onChange={(e) =>
                                            onSetColor(e.target.value)
                                        }
                                        className="h-10 font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                {}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-9">
                            <Highlighter className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48">
                        <Label>Surlignage</Label>
                        <div className="mt-2 grid grid-cols-4 gap-2">
                            {highlightColors.map((color) => (
                                <button
                                    key={color.value}
                                    className="h-8 w-8 rounded border transition-transform hover:scale-110"
                                    style={{ backgroundColor: color.value }}
                                    onClick={() => onSetHighlight(color.value)}
                                    title={color.name}
                                />
                            ))}
                            <button
                                className="flex h-8 w-8 items-center justify-center rounded border"
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .unsetHighlight()
                                        .run()
                                }
                                title="Enlever le surlignage"
                            >
                                <Eraser className="h-4 w-4" />
                            </button>
                        </div>
                    </PopoverContent>
                </Popover>

                <Separator orientation="vertical" className="h-6" />

                {}
                <div className="flex items-center gap-0.5">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle
                                size="sm"
                                pressed={editor.isActive({ textAlign: 'left' })}
                                onPressedChange={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .setTextAlign('left')
                                        .run()
                                }
                                className="h-8 w-8"
                            >
                                <AlignLeft className="h-4 w-4" />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>Aligner à gauche</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle
                                size="sm"
                                pressed={editor.isActive({
                                    textAlign: 'center',
                                })}
                                onPressedChange={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .setTextAlign('center')
                                        .run()
                                }
                                className="h-8 w-8"
                            >
                                <AlignCenter className="h-4 w-4" />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>Centrer</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle
                                size="sm"
                                pressed={editor.isActive({
                                    textAlign: 'right',
                                })}
                                onPressedChange={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .setTextAlign('right')
                                        .run()
                                }
                                className="h-8 w-8"
                            >
                                <AlignRight className="h-4 w-4" />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>Aligner à droite</TooltipContent>
                    </Tooltip>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {}
                <div className="flex items-center gap-0.5">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle
                                size="sm"
                                pressed={editor.isActive('bulletList')}
                                onPressedChange={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleBulletList()
                                        .run()
                                }
                                className="h-8 w-8"
                            >
                                <List className="h-4 w-4" />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>Liste à puces</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle
                                size="sm"
                                pressed={editor.isActive('orderedList')}
                                onPressedChange={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleOrderedList()
                                        .run()
                                }
                                className="h-8 w-8"
                            >
                                <ListOrdered className="h-4 w-4" />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>Liste numérotée</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle
                                size="sm"
                                pressed={editor.isActive('taskList')}
                                onPressedChange={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleTaskList()
                                        .run()
                                }
                                className="h-8 w-8"
                            >
                                <CheckSquare className="h-4 w-4" />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>Liste de tâches</TooltipContent>
                    </Tooltip>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onAddLink}
                            className="h-8"
                        >
                            <LinkIcon className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Insérer un lien</TooltipContent>
                </Tooltip>

                {}
                <div className="flex items-center">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleImageClick}
                                className="h-8 rounded-r-none"
                            >
                                <ImageIcon className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Insérer une image</TooltipContent>
                    </Tooltip>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 rounded-l-none border-l px-1"
                            >
                                <ChevronDown className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleImageClick}>
                                <ImageIcon className="mr-2 h-4 w-4" />
                                Depuis votre ordinateur
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAddImage()}>
                                <LinkIcon className="mr-2 h-4 w-4" />
                                Depuis une URL
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onInsertTable}
                            className="h-8"
                        >
                            <TableIcon className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Insérer un tableau</TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" className="h-6" />

                {}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-9 gap-1">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-xs">Plus</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem
                            onClick={() =>
                                editor.chain().focus().toggleBlockquote().run()
                            }
                        >
                            <Quote className="mr-2 h-4 w-4" />
                            Citation
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                editor.chain().focus().toggleCode().run()
                            }
                        >
                            <Code className="mr-2 h-4 w-4" />
                            Code
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                editor.chain().focus().setHorizontalRule().run()
                            }
                        >
                            <Minus className="mr-2 h-4 w-4" />
                            Ligne horizontale
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onClearFormatting}>
                            <Eraser className="mr-2 h-4 w-4" />
                            Effacer le formatage
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onCopyFormatting}>
                            <Paintbrush className="mr-2 h-4 w-4" />
                            Copier le formatage
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onSetLineHeight('1')}>
                            <Pilcrow className="mr-2 h-4 w-4" />
                            Interligne: Simple
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onSetLineHeight('1.5')}
                        >
                            <Pilcrow className="mr-2 h-4 w-4" />
                            Interligne: 1.5
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSetLineHeight('2')}>
                            <Pilcrow className="mr-2 h-4 w-4" />
                            Interligne: Double
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Separator orientation="vertical" className="h-6" />

                {}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().undo().run()}
                            disabled={!editor.can().undo()}
                            className="h-8"
                        >
                            <UndoIcon className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Annuler (Ctrl+Z)</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().redo().run()}
                            disabled={!editor.can().redo()}
                            className="h-8"
                        >
                            <RedoIcon className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Rétablir (Ctrl+Y)</TooltipContent>
                </Tooltip>
            </div>
        </>
    );
}
