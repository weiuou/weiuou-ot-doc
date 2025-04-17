import React, { useRef, useState, useEffect, useCallback } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { CONFIG } from '../config';

// 定义操作类型
interface Operation {
  type: 'insert' | 'delete' | 'replace';
  position?: number;
  length?: number; // 删除或替换时的长度
  content?: string; // 插入或替换的内容
}
// 操作记录类型，包含来源
interface OperationRecord {
  operation: Operation;
  source: 'local' | 'remote';
}

const RichTextEditor: React.FC = () => {
  const [value, setValue] = useState<string | undefined>("**Hello Markdown!**");
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [operationRecords, setOperationRecords] = useState<OperationRecord[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  const [compositionRange, setCompositionRange] = useState<{start: number, end: number} | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pendingOpsRef = useRef<Operation[]>([]);
  // 添加标记，追踪是否刚完成中文输入
  const justCompletedComposition = useRef(false);

  // 统一的保存函数
  const saveContent = useCallback((content: string) => {
    fetch(CONFIG.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: content
    });
  }, []);

  // 建立 WebSocket 连接
  useEffect(() => {
    const ws = new WebSocket(CONFIG.wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket 连接已建立');
    };
    ws.onclose = () => {
      console.log('WebSocket 连接已关闭');
    };
    ws.onerror = (err) => {
      console.error('WebSocket 错误', err);
    };
    ws.onmessage = (event) => {
      try {
        const op: Operation = JSON.parse(event.data);
        // 检查是否为本地已发出的操作，若是则忽略
        const idx = pendingOpsRef.current.findIndex(
          (pending) => JSON.stringify(pending) === JSON.stringify(op)
        );
        if (idx !== -1) {
          // 已经本地应用过，移除pending
          pendingOpsRef.current.splice(idx, 1);
          return;
        }
        // 只同步内容，不再 setOperations
        handleOperation(op, true);
        setOperationRecords((prev) => [...prev, { operation: op, source: 'remote' }]);
      } catch (e) {
        console.error('解析 WebSocket 消息失败', e);
      }
    };
    return () => {
      ws.close();
    };
  }, []);

  // 页面加载时获取文档内容
  useEffect(() => {
    fetch(CONFIG.apiUrl, {
      headers: {
        'Accept': 'text/plain',
        'Content-Type': 'text/plain'
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.text();
      })
      .then(text => {
        console.log('获取到文档内容:', text);
        if (text) {
          setValue(text);
        }
      })
      .catch(error => {
        console.error('获取文档内容失败:', error);
      });
  }, []);

  // 发送操作到后端
  useEffect(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (operations.length === 0) return;
    // 只发送最新的操作
    const lastOp = operations[operations.length - 1];
    wsRef.current.send(JSON.stringify(lastOp));
    // 标记为本地已发出
    pendingOpsRef.current.push(lastOp);
  }, [operations]);

  const handleCompositionStart = () => {
    setIsComposing(true);
    justCompletedComposition.current = false;
    const textarea = editorRef.current?.querySelector('textarea');
    if (textarea) {
      setCompositionRange({ start: textarea.selectionStart, end: textarea.selectionEnd });
    } else {
      setCompositionRange(null);
    }
  };

  const handleCompositionEnd = (event: React.CompositionEvent<HTMLDivElement>) => {
    setIsComposing(false);
    justCompletedComposition.current = true;
    const data = event.data;
    if (compositionRange && value !== undefined) {
      const { start, end } = compositionRange;
      let op: Operation;
      if (start !== end) {
        op = { type: 'replace', position: start, length: end - start, content: data };
      } else {
        op = { type: 'insert', position: start, content: data };
      }
      // 记录操作
      setOperations((prev) => [...prev, op]);
      setOperationRecords((prev) => [...prev, { operation: op, source: 'local' }]);
      // 立即同步到后端
      saveContent(value);
      // 发送 WebSocket 消息
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(op));
        pendingOpsRef.current.push(op);
      }
    }
    setCompositionRange(null);
    // 下一个事件循环重置标记
    setTimeout(() => {
      justCompletedComposition.current = false;
    }, 0);
  };

  // 处理操作
  const handleOperation = (operation: Operation, isRemote: boolean = false) => {
    if (!isRemote) {
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
      setOperationRecords((prev) => [...prev, { operation, source: 'local' }]);
      saveContent(newValue);  // newValue 在这里一定是 string
    } else {
      // 远程操作，必须用 setValue 的回调，确保顺序
      setValue(prev => {
        if (prev === undefined) return prev;
        const position = operation.position ?? prev.length;
        let newValue = prev;
        switch (operation.type) {
          case 'insert': {
            const before = prev.slice(0, position);
            const after = prev.slice(position);
            newValue = `${before}${operation.content ?? ''}${after}`;
            break;
          }
          case 'delete': {
            const before = prev.slice(0, position);
            const after = prev.slice(position + (operation.length ?? 0));
            newValue = `${before}${after}`;
            break;
          }
          case 'replace': {
            const before = prev.slice(0, position);
            const after = prev.slice(position + (operation.length ?? 0));
            newValue = `${before}${operation.content ?? ''}${after}`;
            break;
          }
          default:
            break;
        }
        return newValue;
      });
    }
  };

  return (
    <div className="h-screen w-full flex flex-col">
      <div ref={editorRef} className="flex-1 flex lg:flex-row flex-col overflow-hidden">
        <div className="flex-1 h-full">
          <MDEditor
            value={value}
            onChange={(newValue) => {
              // 如果刚完成中文输入，跳过操作处理（因为已在 handleCompositionEnd 中处理）
              if (justCompletedComposition.current) {
                setValue(newValue);
                // 统一保存最新内容
                if (newValue !== undefined) {
                  saveContent(newValue);
                }
                return;
              }

              if (isComposing) {
                setValue(newValue);
                return;
              }
              
              if (newValue !== undefined && value !== undefined && editorRef.current) {
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

                setValue(newValue);  // 先更新 value

                // 替换操作
                if (deletedLen > 0 && insertedLen > 0) {
                  const op: Operation = {
                    type: 'replace',
                    position: diffStart,
                    length: deletedLen,
                    content: newValue.slice(diffStart, diffEndNew + 1)
                  };
                  setOperations((prev) => [...prev, op]);
                  setOperationRecords((prev) => [...prev, { operation: op, source: 'local' }]);
                } else {
                  // 删除操作
                  if (deletedLen > 0) {
                    const op: Operation = { type: 'delete', position: diffStart, length: deletedLen };
                    setOperations((prev) => [...prev, op]);
                    setOperationRecords((prev) => [...prev, { operation: op, source: 'local' }]);
                  }
                  // 插入操作
                  if (insertedLen > 0) {
                    const op: Operation = { type: 'insert', position: diffStart, content: newValue.slice(diffStart, diffEndNew + 1) };
                    setOperations((prev) => [...prev, op]);
                    setOperationRecords((prev) => [...prev, { operation: op, source: 'local' }]);
                  }
                }
                
                // 统一保存
                saveContent(newValue);
              } else {
                setValue(newValue);
              }
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
            {operationRecords.map((rec, index) => (
              <li key={index} style={{ color: rec.source === 'local' ? '#2563eb' : '#059669' }}>
                [{rec.source === 'local' ? '本地' : '远程'}] {JSON.stringify(rec.operation)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;