import { TabKey } from "./types";
import type { IconType } from "react-icons";
import {
  FiAlertCircle,
  FiBarChart2,
  FiCreditCard,
  FiHome,
  FiPackage,
  FiUsers,
} from "react-icons/fi";

export type TabLabel = {
  key: TabKey;
  label: string;
  icon: IconType;
};

export const TAB_COPY: Record<TabKey, { title: string; description: string }> = {
  geral: {
    title: "Painel geral",
    description: "Resumo dos fiados, valores recebidos e saldos ainda pendentes.",
  },
  clientes: {
    title: "Registro de clientes",
    description: "Cadastre clientes e acompanhe quanto cada um ja gastou, pagou e deve.",
  },
  cobranca: {
    title: "Lancar fiado",
    description: "Registre novas compras fiadas vinculando cliente, produto e valor.",
  },
  pendencias: {
    title: "Pendencias",
    description: "Gerencie quem esta devendo, acompanhe saldo e registre pagamentos.",
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
  { key: "cobranca", label: "Fiados", icon: FiCreditCard },
  { key: "pendencias", label: "Pendencias", icon: FiAlertCircle },
  { key: "clientes", label: "Clientes", icon: FiUsers },
  { key: "produtos", label: "Produtos", icon: FiPackage },
  { key: "relatorios", label: "Relatorios", icon: FiBarChart2 },
];
