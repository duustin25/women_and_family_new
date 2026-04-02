
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Bold, Italic, Strikethrough, List, ListOrdered, Link as LinkIcon, Quote, Undo, Redo, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { useEffect } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        // cancelled
        if (url === null) {
            return;
        }

        // empty
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        // update link
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 rounded-t-md">
            <Toggle
                type="button"
                size="sm"
                pressed={editor.isActive('bold')}
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
                aria-label="Toggle bold"
            >
                <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
                type="button"
                size="sm"
                pressed={editor.isActive('italic')}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                aria-label="Toggle italic"
            >
                <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle
                type="button"
                size="sm"
                pressed={editor.isActive('strike')}
                onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                aria-label="Toggle strikethrough"
            >
                <Strikethrough className="h-4 w-4" />
            </Toggle>
            <Toggle
                type="button"
                size="sm"
                pressed={editor.isActive('underline')}
                onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
                aria-label="Toggle underline"
            >
                <span className="font-bold underline text-xs">U</span>
            </Toggle>

            <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-700 mx-1 self-center" />

            <Toggle
                type="button"
                size="sm"
                pressed={editor.isActive('bulletList')}
                onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                aria-label="Toggle bullet list"
            >
                <List className="h-4 w-4" />
            </Toggle>
            <Toggle
                type="button"
                size="sm"
                pressed={editor.isActive('orderedList')}
                onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                aria-label="Toggle ordered list"
            >
                <ListOrdered className="h-4 w-4" />
            </Toggle>

            <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-700 mx-1 self-center" />

            <Toggle
                type="button"
                size="sm"
                pressed={editor.isActive({ textAlign: 'left' })}
                onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
                aria-label="Align left"
            >
                <AlignLeft className="h-4 w-4" />
            </Toggle>
            <Toggle
                type="button"
                size="sm"
                pressed={editor.isActive({ textAlign: 'center' })}
                onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
                aria-label="Align center"
            >
                <AlignCenter className="h-4 w-4" />
            </Toggle>
            <Toggle
                type="button"
                size="sm"
                pressed={editor.isActive({ textAlign: 'right' })}
                onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
                aria-label="Align right"
            >
                <AlignRight className="h-4 w-4" />
            </Toggle>

            <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-700 mx-1 self-center" />

            <Button
                type="button"
                variant={editor.isActive('link') ? "secondary" : "ghost"}
                size="sm"
                onClick={setLink}
                className="h-9 w-9 p-0"
            >
                <LinkIcon className="h-4 w-4" />
            </Button>
            <Toggle
                type="button"
                size="sm"
                pressed={editor.isActive('blockquote')}
                onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                aria-label="Toggle blockquote"
            >
                <Quote className="h-4 w-4" />
            </Toggle>
        </div>
    );
};

const RichTextEditor = ({ value, onChange, placeholder, className }: RichTextEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
                defaultProtocol: 'https',
                HTMLAttributes: {
                    class: 'text-blue-600 dark:text-blue-400 hover:underline cursor-pointer',
                    target: '_blank',
                    rel: 'noopener noreferrer',
                },
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[150px] p-4 text-sm',
            },
        },
    });

    // Sync external value changes if needed (optional, purely controlled)
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            // Check content difference to avoid cursor jumping or loops
            if (editor.getText() === '' && value === '') return; // Avoid clearing on mount if empty
            // Only set content if drastically different? 
            // Actually for controlled inputs, it's tricky with Tiptap. 
            // We'll assume one-way binding from editor to parent is main flow. 
            // Use `useEffect` only for initial valid value or specific reset scenarios?
            // For now, let's keep it simple. If we need to reset, we might need a key prop on the component.
        }
    }, [value, editor]);


    return (
        <div className={`border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden bg-white dark:bg-neutral-950 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all ${className}`}>
            <MenuBar editor={editor} />
            <EditorContent editor={editor} className="max-h-[400px] overflow-y-auto custom-scrollbar" />
        </div>
    );
};

export default RichTextEditor;
