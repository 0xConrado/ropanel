import React from "react";

export default function EmuladorStatus({ logs }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full h-full pb-4">
      <div className="flex flex-col h-full">
        <h3 className="font-semibold mb-1">login-server</h3>
        <div className="bg-black text-green-400 p-2 rounded flex-1 min-h-[400px] h-96 overflow-y-auto">
          {logs.login.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      </div>
      <div className="flex flex-col h-full">
        <h3 className="font-semibold mb-1">char-server</h3>
        <div className="bg-black text-green-400 p-2 rounded flex-1 min-h-[400px] h-96 overflow-y-auto">
          {logs.char.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      </div>
      <div className="flex flex-col h-full">
        <h3 className="font-semibold mb-1">map-server</h3>
        <div className="bg-black text-green-400 p-2 rounded flex-1 min-h-[400px] h-96 overflow-y-auto">
          {logs.map.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
}