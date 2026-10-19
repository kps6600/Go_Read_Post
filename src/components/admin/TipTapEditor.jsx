import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import Youtube from '@tiptap/extension-youtube';
import { 
  Heading1, Heading2, Heading3, Bold, Italic, Strikethrough,
  List, ListOrdered, Quote, Code, Link as LinkIcon, 
  Image as ImageIcon, Video, Table as TableIcon, 
  Undo, Redo, Pilcrow, Minus, RemoveFormatting, Sparkles
} from 'lucide-react';

export default function TipTapEditor({ 
  content, 
  onChange, 
  onEditorReady,
  onOpenMediaPicker,
  placeholder = 'Start writing your rich editorial story...' 
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editorial-link',
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'editorial-article-img'
        }
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'editorial-table'
        }
      }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({
        HTMLAttributes: {
          class: 'editorial-youtube-embed'
        }
      })
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    }
  });

  // Expose editor instance to parent if requested
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Sync external content changes if editor already initialized
  useEffect(() => {
    if (editor && content !== undefined && editor.getHTML() !== content) {
      if (content === '') {
        editor.commands.setContent('');
      }
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="aem-tiptap-loading-skeleton">
        <Sparkles size={20} className="rotate-icon" style={{ color: 'var(--brand-primary, #e11d48)' }} />
        <span>Initializing Editorial Studio Engine...</span>
      </div>
    );
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter destination URL:', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleImageClick = () => {
    if (onOpenMediaPicker) {
      onOpenMediaPicker();
    } else {
      const url = window.prompt('Enter Image URL:');
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }
  };

  const addYoutube = () => {
    const url = window.prompt('Enter YouTube Video URL (e.g. https://www.youtube.com/watch?v=...):');
    if (url) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const rawText = editor.getText();
  const wordCount = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
  const charCount = rawText.length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="aem-tiptap-studio-card">
      {/* Editorial Toolbar */}
      <div className="aem-tiptap-toolbar">
        {/* Paragraph & Headings Group */}
        <div className="aem-tiptap-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`aem-tool-btn ${editor.isActive('paragraph') ? 'active' : ''}`}
            title="Regular Paragraph (Normal Text)"
          >
            <Pilcrow size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`aem-tool-btn ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
            title="Heading 1 (Main Section)"
          >
            <Heading1 size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`aem-tool-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
            title="Heading 2 (Sub-section)"
          >
            <Heading2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`aem-tool-btn ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
            title="Heading 3 (Minor Topic)"
          >
            <Heading3 size={16} />
          </button>
        </div>

        <span className="aem-tool-separator" />

        {/* Inline Formatting */}
        <div className="aem-tiptap-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`aem-tool-btn ${editor.isActive('bold') ? 'active' : ''}`}
            title="Bold (Ctrl+B)"
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`aem-tool-btn ${editor.isActive('italic') ? 'active' : ''}`}
            title="Italic (Ctrl+I)"
          >
            <Italic size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`aem-tool-btn ${editor.isActive('strike') ? 'active' : ''}`}
            title="Strikethrough"
          >
            <Strikethrough size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`aem-tool-btn ${editor.isActive('code') ? 'active' : ''}`}
            title="Inline Code"
          >
            <Code size={15} />
          </button>
        </div>

        <span className="aem-tool-separator" />

        {/* Lists & Quotes */}
        <div className="aem-tiptap-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`aem-tool-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
            title="Bulleted List"
          >
            <List size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`aem-tool-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
            title="Numbered List"
          >
            <ListOrdered size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`aem-tool-btn ${editor.isActive('blockquote') ? 'active' : ''}`}
            title="Editorial Pull-Quote"
          >
            <Quote size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`aem-tool-btn ${editor.isActive('codeBlock') ? 'active' : ''}`}
            title="Code Snippet Block"
          >
            <span style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'monospace' }}>&lt;/&gt;</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="aem-tool-btn"
            title="Horizontal Divider"
          >
            <Minus size={15} />
          </button>
        </div>

        <span className="aem-tool-separator" />

        {/* Media & Embeds */}
        <div className="aem-tiptap-group">
          <button
            type="button"
            onClick={setLink}
            className={`aem-tool-btn ${editor.isActive('link') ? 'active' : ''}`}
            title="Insert or Edit Link"
          >
            <LinkIcon size={15} />
          </button>
          <button
            type="button"
            onClick={handleImageClick}
            className="aem-tool-btn"
            title="Insert Image (Media Library or URL)"
          >
            <ImageIcon size={15} />
          </button>
          <button
            type="button"
            onClick={addYoutube}
            className="aem-tool-btn"
            title="Embed YouTube Video"
          >
            <Video size={15} />
          </button>
          <button
            type="button"
            onClick={insertTable}
            className="aem-tool-btn"
            title="Insert Table (3x3)"
          >
            <TableIcon size={15} />
          </button>
        </div>

        <span className="aem-tool-separator" />

        {/* Actions & History */}
        <div className="aem-tiptap-group" style={{ marginLeft: 'auto' }}>
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            className="aem-tool-btn"
            title="Clear All Formatting"
          >
            <RemoveFormatting size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="aem-tool-btn"
            title="Undo (Ctrl+Z)"
            style={{ opacity: editor.can().undo() ? 1 : 0.4 }}
          >
            <Undo size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="aem-tool-btn"
            title="Redo (Ctrl+Y)"
            style={{ opacity: editor.can().redo() ? 1 : 0.4 }}
          >
            <Redo size={15} />
          </button>
        </div>
      </div>

      {/* Editor Content Canvas */}
      <div className="aem-tiptap-canvas-body">
        <EditorContent editor={editor} className="aem-tiptap-prosemirror-wrap" />
      </div>

      {/* Modern Status Footer */}
      <div className="aem-tiptap-statusbar">
        <div className="aem-tiptap-status-left">
          <span className="aem-tiptap-status-pill">
            <span className="aem-status-pulse-dot" />
            TipTap Visual Studio
          </span>
          <span className="aem-tiptap-status-sub">Rich Typography &amp; Embeds</span>
        </div>
        <div className="aem-tiptap-status-right">
          <span><strong>{wordCount}</strong> words</span>
          <span className="aem-tiptap-dot">•</span>
          <span>~<strong>{readTime}</strong> min read</span>
          <span className="aem-tiptap-dot">•</span>
          <span>{charCount} characters</span>
        </div>
      </div>
    </div>
  );
}
