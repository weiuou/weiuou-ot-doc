import React, { useRef, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import Operator from './Operator';

const RichTextEditor: React.FC = () => {
  const [value, setValue] = useState<string | undefined>("**Hello Markdown!**");
  const editorRef = useRef<HTMLDivElement | null>(null);

  const handleInsert = (text: string, position?: number) => {
    const textarea = editorRef.current?.querySelector('textarea');
    if (textarea && value !== undefined) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (start !== end) {
        // 删除选中部分
        const before = value.slice(0, start);
        const after = value.slice(end);
        setValue(`${before}${text}${after}`);
      } else if (position !== undefined) {
        // 在光标位置插入
        const before = value.slice(0, position);
        const after = value.slice(position);
        setValue(`${before}${text}${after}`);
      } else {
        // 默认在末尾插入
        setValue(`${value}\n${text}`);
      }
    }
  };

  const getCursorPosition = (): number | undefined => {
    const textarea = editorRef.current?.querySelector('textarea');
    return textarea?.selectionStart;
  };

  const deleteSelection = () => {
    const textarea = editorRef.current?.querySelector('textarea');
    if (textarea && value !== undefined) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start !== end) {
        const before = value.slice(0, start);
        const after = value.slice(end);
        setValue(`${before}${after}`);
      }
    }
  };

  return (
    <div className="h-screen w-full flex flex-col">
      <Operator onInsert={handleInsert} getCursorPosition={getCursorPosition} deleteSelection={deleteSelection} />
      <div ref={editorRef} className="flex-1 flex lg:flex-row flex-col overflow-hidden">
        <div className="flex-1 h-full">
          <MDEditor
            value={value}
            onChange={setValue}
            height="100%"
            className="w-full h-full"
          />
        </div>
        <div className="flex-1 h-full p-4 bg-white rounded-lg shadow-sm overflow-auto">
          <MDEditor.Markdown source={value} />
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;