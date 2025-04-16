import React, { useState } from 'react';

interface OperatorProps {
  onOperation: (operation: {
    type: 'insert' | 'delete' | 'replace';
    position?: number;
    length?: number;
    content?: string;
  }) => void;
}

const Operator: React.FC<OperatorProps> = ({ onOperation }) => {
  const [operationType, setOperationType] = useState<'insert' | 'delete' | 'replace'>('insert');
  const [position, setPosition] = useState<number | undefined>(undefined);
  const [length, setLength] = useState<number | undefined>(undefined);
  const [content, setContent] = useState<string | undefined>("");

  const handleExecute = () => {
    onOperation({ type: operationType, position, length, content });
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-100 border-b border-gray-300">
      <div className="flex items-center gap-2">
        <label>操作类型:</label>
        <select
          value={operationType}
          onChange={(e) => setOperationType(e.target.value as 'insert' | 'delete' | 'replace')}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="insert">插入</option>
          <option value="delete">删除</option>
          <option value="replace">替换</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label>位置:</label>
        <input
          type="number"
          value={position ?? ""}
          onChange={(e) => setPosition(e.target.value ? parseInt(e.target.value, 10) : undefined)}
          placeholder="光标位置"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {operationType !== 'delete' && (
        <div className="flex items-center gap-2">
          <label>内容:</label>
          <input
            type="text"
            value={content ?? ""}
            onChange={(e) => setContent(e.target.value)}
            placeholder="输入内容"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {operationType !== 'insert' && (
        <div className="flex items-center gap-2">
          <label>长度:</label>
          <input
            type="number"
            value={length ?? ""}
            onChange={(e) => setLength(e.target.value ? parseInt(e.target.value, 10) : undefined)}
            placeholder="删除或替换的长度"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <button
        onClick={handleExecute}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        执行操作
      </button>
    </div>
  );
};

export default Operator;