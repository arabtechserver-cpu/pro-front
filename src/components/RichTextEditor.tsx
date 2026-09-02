"use client";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  dir?: "rtl" | "ltr";
}

export default function RichTextEditor({ value, onChange, placeholder, dir = "rtl" }: RichTextEditorProps) {
  return (
    <div className={`rich-text-editor-container bg-surface border border-outline-variant/50 rounded-xl ${dir === 'ltr' ? 'text-left' : 'text-right'}`} dir={dir}>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={16}
        className="w-full min-h-[300px] resize-y bg-transparent p-4 text-sm leading-7 text-on-surface outline-none placeholder:text-on-surface-variant/60"
      />
    </div>
  );
}
