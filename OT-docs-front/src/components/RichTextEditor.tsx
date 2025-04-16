import React, { useRef, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import Operator from './Operator';

// 定义操作类型
interface Operation {
  type: 'insert' | 'delete' | 'replace';
  position?: number;
  length?: number; // 删除或替换时的长度
  content?: string; // 插入或替换的内容
}

const RichTextEditor: React.FC = () => {
  const [value, setValue] = useState<string | undefined>("**Hello Markdown!**");
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  const [compositionRange, setCompositionRange] = useState<{start: number, end: number} | null>(null);

  const handleCompositionStart = () => {
    setIsComposing(true);
    const textarea = editorRef.current?.querySelector('textarea');
    if (textarea) {
      setCompositionRange({ start: textarea.selectionStart, end: textarea.selectionEnd });
    } else {
      setCompositionRange(null);
    }
  };

  const handleCompositionEnd = (event: React.CompositionEvent<HTMLDivElement>) => {
    setIsComposing(false);
    const data = event.data;
    if (compositionRange && value !== undefined) {
      const { start, end } = compositionRange;
      if (start !== end) {
        // 选区替换
        setOperations((prev) => [
          ...prev,
          { type: 'replace', position: start, length: end - start, content: data }
        ]);
      } else {
        // 普通插入
        setOperations((prev) => [
          ...prev,
          { type: 'insert', position: start, content: data }
        ]);
      }
    }
    setCompositionRange(null);
  };

  // 处理操作
  const handleOperation = (operation: Operation) => {
    if (value === undefined) return;

    const textarea = editorRef.current?.querySelector('textarea');
    const position = operation.position ?? textarea?.selectionStart ?? value.length;

    let newValue = value;
    switch (operation.type) {
      case 'insert': {
        const before = value.slice(0, position);
        const after = value.slice(position);
        newValue = `${before}${operation.content ?? ''}${after}`;
        break;
      }
      case 'delete': {
        const before = value.slice(0, position);
        const after = value.slice(position + (operation.length ?? 0));
        newValue = `${before}${after}`;
        break;
      }
      case 'replace': {
        const before = value.slice(0, position);
        const after = value.slice(position + (operation.length ?? 0));
        newValue = `${before}${operation.content ?? ''}${after}`;
        break;
      }
      default:
        break;
    }

    setValue(newValue);
    setOperations((prev) => [...prev, operation]);
  };

  return (
    <div className="h-screen w-full flex flex-col">
      <Operator onOperation={handleOperation} />
      <div ref={editorRef} className="flex-1 flex lg:flex-row flex-col overflow-hidden">
        <div className="flex-1 h-full">
          <MDEditor
            value={value}
            onChange={(newValue) => {
              if (!isComposing && newValue !== undefined && value !== undefined && editorRef.current) {
                const textarea = editorRef.current.querySelector('textarea');
                const selectionStart = textarea?.selectionStart ?? value.length;
                const selectionEnd = textarea?.selectionEnd ?? value.length;
                // diff算法
                let diffStart = 0;
                while (
                  diffStart < value.length &&
                  diffStart < newValue.length &&
                  value[diffStart] === newValue[diffStart]
                ) {
                  diffStart++;
                }
                let diffEndOld = value.length - 1;
                let diffEndNew = newValue.length - 1;
                while (
                  diffEndOld >= diffStart &&
                  diffEndNew >= diffStart &&
                  value[diffEndOld] === newValue[diffEndNew]
                ) {
                  diffEndOld--;
                  diffEndNew--;
                }
                const deletedLen = diffEndOld - diffStart + 1;
                const insertedLen = diffEndNew - diffStart + 1;
                // 替换操作
                if (deletedLen > 0 && insertedLen > 0) {
                  setOperations((prev) => [
                    ...prev,
                    {
                      type: 'replace',
                      position: diffStart,
                      length: deletedLen,
                      content: newValue.slice(diffStart, diffEndNew + 1)
                    }
                  ]);
                } else {
                  // 删除操作
                  if (deletedLen > 0) {
                    setOperations((prev) => [
                      ...prev,
                      { type: 'delete', position: diffStart, length: deletedLen }
                    ]);
                  }
                  // 插入操作
                  if (insertedLen > 0) {
                    setOperations((prev) => [
                      ...prev,
                      { type: 'insert', position: diffStart, content: newValue.slice(diffStart, diffEndNew + 1) }
                    ]);
                  }
                }
              }
              setValue(newValue);
            }}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            height="100%"
            className="w-full h-full"
          />
        </div>
        <div className="flex-1 h-full p-4 bg-white rounded-lg shadow-sm overflow-auto">
          <MDEditor.Markdown source={value} />
        </div>
      </div>
      <div className="p-4 bg-gray-100 border-t border-gray-300">
        <h3 className="text-lg font-bold mb-2">操作记录:</h3>
        <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
          <ul className="list-disc pl-5">
            {operations.map((op, index) => (
              <li key={index}>
                {JSON.stringify(op)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;