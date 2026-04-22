"use client";
import React, { useMemo } from "react";
import "react-quill-new/dist/quill.snow.css";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const RichTextEditor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (content: string) => void;
}) => {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ font: [] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ size: ["small", "large", "huge", false] }],
        ["bold", "italic", "underline", "strike"],
        ["blockquote", "code-block"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ align: [] }],
        ["link", "image", "video"],
        ["clean"],
        [{ color: [] }],
        [{ background: [] }],
        [{ script: "sub" }, { script: "super" }],
      ],
    }),
    [],
  );

  return (
    <div className="relative w-full max-w-full">
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={onChange}
        modules={modules}
        placeholder="Write a detailed product description here..."
        className="text-white"
        style={{
          minHeight: "250px",
        }}
      />
      <style>{`
            /* Remove outer border if we want it to look unified, or let Quill handle it */
            .ql-toolbar.ql-snow {
                background: transparent;
                border-color: #444;
                border-top-left-radius: 0.375rem;
                border-top-right-radius: 0.375rem;
            }
            .ql-container.ql-snow {
                background: transparent;
                border-color: #444;
                color: white;
                border-bottom-left-radius: 0.375rem;
                border-bottom-right-radius: 0.375rem;
                transition: all 0.3s ease-in-out;
                width: 100%;
                max-width: 100%;
            }
            .ql-editor{
                color : white!important;
                min-height: 200px;
                max-height: 350px;
                overflow-y: auto;
                overflow-x: hidden;
                word-wrap: break-word;
                overflow-wrap: break-word;
                word-break: break-word;
                width: 100%;
                max-width: 100%;
            }
            .ql-snow {
                border-color: #444!important;
            }
            .ql-editor.ql-blank::before{
                color : #aaa!important;
            }
            .ql-picker {
                color: white!important;
            }
            .ql-picker-options{
                background-color : #333!important;
                color : white!important;
                border-color: #444!important;
            }
            .ql-picker-item{
                color : white!important;
            }
            .ql-picker-label{
                color: white!important;
            }
            .ql-stroke{
                stroke : white!important;
            }
            .ql-fill, .ql-stroke.ql-fill {
                fill : white!important;
            }
            
        `}</style>
    </div>
  );
};
export default RichTextEditor;
