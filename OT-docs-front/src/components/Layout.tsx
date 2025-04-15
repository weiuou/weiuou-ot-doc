import React from 'react';
import RichTextEditor from './RichTextEditor';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-[60px] px-5 bg-gray-50 flex items-center shadow-sm">
        <h1 className="text-xl text-gray-800 font-medium">OT-docs</h1>
      </header>
      <main className="flex-1 flex overflow-hidden">
        <RichTextEditor />
      </main>
    </div>
  );
};

export default Layout;