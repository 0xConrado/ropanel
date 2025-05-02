import InstallForm from "@/components/InstallForm";

export default function BancoDeDados() {
  const fields = [
    {
      name: "installType",
      label: "Tipo de Instalação",
      type: "select",
      options: [
        { value: "local", label: "Local" },
        { value: "remote", label: "Hospedagem" }
      ],
      defaultValue: "local"
    },
    {
      name: "dbType",
      label: "Tipo de Banco de Dados",
      type: "select",
      options: [
        { value: "mysql", label: "MySQL" },
        { value: "mariadb", label: "MariaDB" },
        { value: "postgresql", label: "PostgreSQL" }
      ],
      defaultValue: "mysql"
    },
    {
      name: "installPath",
      label: "Caminho de instalação",
      type: "text",
      defaultValue: "/home/ragnarok/database"
    },
    {
      name: "prereqs",
      type: "checkbox",
      checkboxLabel: "Instalar pré-requisitos",
      defaultValue: true
    }
  ];

  const handleInstall = (data) => {
    console.log("Instalar Banco de Dados com:", data);

    if (data.installType === "local") {
      alert(`Simulando instalação local de ${data.dbType}`);
    } else {
      alert(`Simulando instalação remota de ${data.dbType}`);
    }
  };

  return (
    <InstallForm title="Instalar Banco de Dados" fields={fields} onInstall={handleInstall} />
  );
}
