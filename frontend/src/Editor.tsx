import React, { useRef, useState } from "react";
import JSONEditor from "jsoneditor";

import "jsoneditor/dist/jsoneditor.css";

export const Editor = ({
  value,
  onChange,
}: {
  value: any;
  onChange: (newValue: any) => void;
}) => {
  const [jsonEditor, setJsonEditor] = useState<JSONEditor | null>(null);
  const ref = useRef<HTMLDivElement>();
  const setRef = (node: HTMLDivElement) => {
    if (!ref.current) {
      ref.current = node;

      const editor = new JSONEditor(ref.current, {
        onChange: () => {
          onChange(editor.get());
        },
        modes: ["tree", "code"],
      });

      editor.set(value);
      editor.expandAll();

      setJsonEditor(editor);
    }
  };

  return <div className="editor" ref={setRef}></div>;
};
