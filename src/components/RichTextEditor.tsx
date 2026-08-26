"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import "react-quill/dist/quill.snow.css";

// Dynamically import ReactQuill to prevent SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  dir?: "rtl" | "ltr";
}

export default function RichTextEditor({ value, onChange, placeholder, dir = "rtl" }: RichTextEditorProps) {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }, { 'direction': 'rtl' }],
      ['link', 'image', 'video'],
      ['blockquote', 'code-block'],
      ['clean']
    ]
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'align', 'direction',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'blockquote', 'code-block'
  ];

  return (
    <div className={`rich-text-editor-container bg-surface border border-outline-variant/50 rounded-xl overflow-hidden ${dir === 'ltr' ? 'text-left' : 'text-right'}`} dir={dir}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="min-h-[300px]"
      />
    </div>
  );
}
