import React from "react";
import ConfBancoDeDados from "./subconfigs/conf_bancodedados";
import ConfEmulador from "./subconfigs/conf_emulador";
import ConfVPS from "./subconfigs/conf_vps";
import ConfFirewall from "./subconfigs/conf_firewall";

export default function Configuracoes() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <ConfBancoDeDados />
      <ConfEmulador />
      <ConfVPS />
      <ConfFirewall />
    </div>
  );
}