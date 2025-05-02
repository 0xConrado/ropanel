import { useState } from "react";
import { ChevronDown } from "lucide-react";
import MenuButton from "./MenuButton";

export default function InstallForm({ title, fields, onInstall }) {
  const [formData, setFormData] = useState(() =>
    fields.reduce((acc, field) => {
      acc[field.name] = field.defaultValue ?? "";
      return acc;
    }, {})
  );

  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      onInstall(formData);
    } catch (error) {
      console.error("Erro na instalação:", error);
      alert("Ocorreu um erro durante a instalação");
    }
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <form onSubmit={handleSubmit} className="p-4 text-white space-y-4">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>

      <div className="space-y-4 max-w-md">
        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            {field.label && (
              <label className="block text-sm font-medium">
                {field.label}
              </label>
            )}

            {field.type === "text" && (
              <input
                type="text"
                value={formData[field.name]}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
                required={field.required}
              />
            )}

            {field.type === "select" && (
              <select
                value={formData[field.name]}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
                required={field.required}
              >
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {field.type === "checkbox" && (
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  checked={formData[field.name] || false}
                  onChange={(e) => handleChange(field.name, e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
                {field.checkboxLabel && <label>{field.checkboxLabel}</label>}
              </div>
            )}
          </div>
        ))}

        <div className="pt-2">
          <MenuButton
            icon={ChevronDown}
            label="Instalar"
            isOpen={isOpen}
            onClick={handleSubmit}
          />
        </div>
      </div>
    </form>
  );
}