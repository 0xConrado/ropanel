import React from "react";

export default function EmuladorStatus({ logs }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      <div>
        <h3 className="font-semibold mb-1">login-server</h3>
        <div className="bg-black text-green-400 p-2 h-40 overflow-y-auto rounded">
          {logs.login.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-1">char-server</h3>
        <div className="bg-black text-green-400 p-2 h-40 overflow-y-auto rounded">
          {logs.char.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-1">map-server</h3>
        <div className="bg-black text-green-400 p-2 h-40 overflow-y-auto rounded">
          {logs.map.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
}