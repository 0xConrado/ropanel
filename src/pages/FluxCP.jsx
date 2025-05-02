import InstallForm from '../components/InstallForm';

export default function FluxCP() {
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
      name: "installPath",
      label: "Caminho de instalação",
      type: "text",
      defaultValue: "/var/www/fluxcp"
    },
    {
      name: "prereqs",
      type: "checkbox",
      checkboxLabel: "Instalar pré-requisitos (PHP, Apache/Nginx etc.)",
      defaultValue: true
    }
  ];

  const handleInstall = (data) => {
    console.log("Instalar FluxCP com:", data);

    if (data.installType === "local") {
      alert("Simulando instalação local do FluxCP!");
    } else {
      alert("Simulando instalação do FluxCP em hospedagem!");
    }
  };

  return (
    <InstallForm title="Instalar FluxCP" fields={fields} onInstall={handleInstall} />
  );
}
