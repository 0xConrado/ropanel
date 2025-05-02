import InstallForm from "../components/InstallForm";

export default function Forum() {
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
      name: "forumType",
      label: "Tipo de Fórum",
      type: "select",
      options: [
        { value: "phpbb", label: "phpBB" },
        { value: "invision", label: "Invision" },
        { value: "discourse", label: "Discourse" },
        { value: "outro", label: "Outro" }
      ],
      defaultValue: "phpbb"
    },
    {
      name: "installPath",
      label: "Caminho de instalação",
      type: "text",
      defaultValue: "/var/www/forum"
    },
    {
      name: "prereqs",
      type: "checkbox",
      checkboxLabel: "Instalar pré-requisitos (PHP, Banco de Dados etc.)",
      defaultValue: true
    }
  ];

  const handleInstall = (data) => {
    console.log("Instalar Fórum com:", data);

    if (data.installType === "local") {
      alert(`Simulando instalação local do ${data.forumType}`);
    } else {
      alert(`Simulando instalação remota do ${data.forumType}`);
    }
  };

  return (
    <InstallForm title="Instalar Fórum" fields={fields} onInstall={handleInstall} />
  );
}
