import { ChevronDown } from "lucide-react";

export default function MenuButton({ icon: Icon, label, isOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full p-2 rounded hover:bg-gray-700"
    >
      <div className="flex items-center gap-2">
        <Icon size={18} /> {label}
      </div>
      <ChevronDown
        size={16}
        className={`transition-transform duration-300 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
  );
}
