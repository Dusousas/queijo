import { TabKey } from "./types";
import type { IconType } from "react-icons";
import { FiBarChart2, FiCreditCard, FiHome, FiPackage, FiUsers } from "react-icons/fi";

export type TabLabel = {
  key: TabKey;
  label: string;
  icon: IconType;
};

export const TAB_COPY: Record<TabKey, { title: string; description: string }> = {
  geral: {
    title: "Painel geral",
    description: "Resumo principal do sistema com indicadores de desempenho.",
  },
  clientes: {
    title: "Registro de clientes",
    description: "Cadastre nome completo, cidade e CPF de cada cliente.",
  },
  cobranca: {
    title: "Cobranca",
    description: "Registre quem deve, quanto deve e qual produto foi comprado.",
  },
  produtos: {
    title: "Produtos",
    description: "Cadastre os produtos vendidos e os respectivos valores.",
  },
  relatorios: {
    title: "Relatorios",
    description: "Acompanhe vendas, saldo devedor e distribuicao por cidade e produto.",
  },
};

export const TAB_LABELS: TabLabel[] = [
  { key: "geral", label: "Geral", icon: FiHome },
  { key: "clientes", label: "Clientes", icon: FiUsers },
  { key: "cobranca", label: "Cobranca", icon: FiCreditCard },
  { key: "produtos", label: "Produtos", icon: FiPackage },
  { key: "relatorios", label: "Relatorios", icon: FiBarChart2 },
];
