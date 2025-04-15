import React, { useState } from 'react';

type OperatorProps = {
  onInsert: (text: string, position?: number) => void;
  getCursorPosition: () => number | undefined;
  deleteSelection: () => void;
};

const Operator: React.FC<OperatorProps> = ({ onInsert, getCursorPosition, deleteSelection }) => {
  const [input, setInput] = useState("");

  const handleInsert = () => {
    if (input.trim()) {
      const position = getCursorPosition();
      onInsert(input, position);
      setInput("");
    }
  };

  const handleDelete = () => {
    deleteSelection();
  };

  return (
    <div className="flex items-center gap-2 p-4 bg-gray-100 border-b border-gray-300">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入文本..."
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleInsert}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        插入
      </button>
      <button
        onClick={handleDelete}
        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
      >
        删除
      </button>
    </div>
  );
};

export default Operator;