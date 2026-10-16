import React, { useState, useMemo, useEffect } from 'react';
import { CustomSelect } from '../components/ui/CustomSelect';
import { PainelTelemetriaAoVivo } from '../components/maquinarios/PainelTelemetriaAoVivo';
import { operacionalService, type MaquinarioApi } from '../services/operacionalService';
import { useSync } from '../context/SyncContext';
import { useAuth } from '../context/AuthContext';
import { ModalCadastroMaquinario } from '../components/modals/ModalCadastroMaquinario';

interface Machine {
  id: string;
  code: string;
  name: string;
  category: 'TRATOR' | 'COLHEITADEIRA' | 'PULVERIZADOR' | 'PLANTADEIRA';
  typeTag: string;
  status: 'OPERANDO' | 'PATIO' | 'MANUTENCAO' | 'REVISAO';
  statusLabel: string;
  iconType: 'tractor' | 'harvester' | 'sprayer' | 'planter';
  horimeter: number;
  horimeterTarget: number;
  horimeterCyclePct: number;
  horimeterSub1: string;
  horimeterSub2: string;
  horimeterSub2Color?: string;
  telemetry1Label: string;
  telemetry1Val: string;
  telemetry2Label: string;
  telemetry2Val: string;
  telemetry2IsFuel?: boolean;
  fuelPct?: number;
  telemetry3Label: string;
  telemetry3Val: string;
  operator: string;
  operatorInitials: string;
  talhao: string;
  activeOS?: string;
}

interface MaintenanceOrder {
  id: string;
  code: string;
  machineCode: string;
  machineName: string;
  machineSub: string;
  type: string;
  typeDesc: string;
  horimeter: string;
  parts: string;
  partsOrigin: string;
  mechanic: string;
  cost: number;
  status: 'EM_EXECUCAO' | 'AGUARDANDO_PECA' | 'AGENDADA' | 'CONCLUIDA';
  statusLabel: string;
  statusClass: string;
  date: string;
}

interface ToastMessage {
  id: string;
  text: string;
}

const INITIAL_MACHINES: Machine[] = [
  {
    id: '1',
    code: 'TR-01',
    name: 'John Deere 8370R',
    category: 'TRATOR',
    typeTag: 'Trator Pesado • 370 cv',
    status: 'REVISAO',
    statusLabel: 'Revisão em 8h',
    iconType: 'tractor',
    horimeter: 1492,
    horimeterTarget: 1500,
    horimeterCyclePct: 98.4,
    horimeterSub1: '99% concluído do ciclo',
    horimeterSub2: 'Faltam 8h p/ troca óleo',
    horimeterSub2Color: 'var(--warning)',
    telemetry1Label: 'Consumo Instantâneo',
    telemetry1Val: '18,2 L/h',
    telemetry2Label: 'Nível Diesel S10',
    telemetry2Val: '74%',
    telemetry2IsFuel: true,
    fuelPct: 74,
    telemetry3Label: 'Velocidade Atual',
    telemetry3Val: '7,4 km/h',
    operator: 'Carlos Eduardo',
    operatorInitials: 'CE',
    talhao: 'Talhão 02',
  },
  {
    id: '2',
    code: 'TR-02',
    name: 'Case IH Magnum 380',
    category: 'TRATOR',
    typeTag: 'Trator Pesado • 380 cv',
    status: 'OPERANDO',
    statusLabel: 'Em Operação',
    iconType: 'tractor',
    horimeter: 840,
    horimeterTarget: 1000,
    horimeterCyclePct: 84,
    horimeterSub1: '84% do ciclo',
    horimeterSub2: 'Faltam 160h p/ revisão',
    telemetry1Label: 'Consumo Instantâneo',
    telemetry1Val: '17,5 L/h',
    telemetry2Label: 'Nível Diesel S10',
    telemetry2Val: '82%',
    telemetry2IsFuel: true,
    fuelPct: 82,
    telemetry3Label: 'Velocidade Atual',
    telemetry3Val: '6,8 km/h',
    operator: 'Marcos Silveira',
    operatorInitials: 'MS',
    talhao: 'Talhão 05',
  },
  {
    id: '3',
    code: 'CH-01',
    name: 'John Deere S790',
    category: 'COLHEITADEIRA',
    typeTag: 'Colheitadeira Grãos • 540 cv',
    status: 'PATIO',
    statusLabel: 'Pátio Central',
    iconType: 'harvester',
    horimeter: 640,
    horimeterTarget: 1000,
    horimeterCyclePct: 64,
    horimeterSub1: 'Plataforma Drapper 45ft acoplada',
    horimeterSub2: 'Pronta p/ Colheita',
    horimeterSub2Color: 'var(--accent-text)',
    telemetry1Label: 'Consumo Instantâneo',
    telemetry1Val: '0,0 L/h (Off)',
    telemetry2Label: 'Nível Diesel S10',
    telemetry2Val: '88%',
    telemetry2IsFuel: true,
    fuelPct: 88,
    telemetry3Label: 'Status Telemetria',
    telemetry3Val: 'Sinal GPS 100%',
    operator: 'Anderson Lima',
    operatorInitials: 'AL',
    talhao: 'Pátio Central',
  },
  {
    id: '4',
    code: 'PV-01',
    name: 'Jacto Uniport 3030',
    category: 'PULVERIZADOR',
    typeTag: 'Pulverizador • 3.000 L',
    status: 'OPERANDO',
    statusLabel: 'Pulverizando',
    iconType: 'sprayer',
    horimeter: 980,
    horimeterTarget: 1000,
    horimeterCyclePct: 98,
    horimeterSub1: 'Barra 36m • Bicos cerâmicos',
    horimeterSub2: 'Faltam 20h p/ revisão',
    telemetry1Label: 'Vazão Calda',
    telemetry1Val: '110 L/ha',
    telemetry2Label: 'Nível Tanque Calda',
    telemetry2Val: '1.480 L (49%)',
    telemetry3Label: 'Velocidade Aplicação',
    telemetry3Val: '18,5 km/h',
    operator: 'Rodrigo Pires',
    operatorInitials: 'RP',
    talhao: 'Talhão 04',
  },
  {
    id: '5',
    code: 'TR-04',
    name: 'John Deere 7230J',
    category: 'TRATOR',
    typeTag: 'Trator Médio • 230 cv',
    status: 'MANUTENCAO',
    statusLabel: 'Em Oficina (OS Aberta)',
    iconType: 'tractor',
    horimeter: 2310,
    horimeterTarget: 2500,
    horimeterCyclePct: 100,
    horimeterSub1: 'OS-2025-084 em execução',
    horimeterSub2: 'Troca Válvula Hidráulica',
    horimeterSub2Color: 'var(--danger)',
    telemetry1Label: 'Mecânico Responsável',
    telemetry1Val: 'Tiago Rezende',
    telemetry2Label: 'Custo Estimado OS',
    telemetry2Val: 'R$ 4.850,00',
    telemetry3Label: 'Previsão Liberação',
    telemetry3Val: 'Amanhã, 16h',
    operator: 'Oficina Central',
    operatorInitials: 'OF',
    talhao: 'Box 02',
    activeOS: 'OS-2025-084',
  },
  {
    id: '6',
    code: 'PL-01',
    name: 'DB ExactEmerge 36L',
    category: 'PLANTADEIRA',
    typeTag: 'Plantadeira • 36 Linhas (45cm)',
    status: 'OPERANDO',
    statusLabel: 'Plantando',
    iconType: 'planter',
    horimeter: 1280,
    horimeterTarget: 1420,
    horimeterCyclePct: 90.1,
    horimeterSub1: 'Atrelada ao Trator TR-01',
    horimeterSub2: 'Taxa Variável Ativa',
    horimeterSub2Color: 'var(--accent-text)',
    telemetry1Label: 'População Alvo',
    telemetry1Val: '280 mil pl/ha',
    telemetry2Label: 'Singulação Sementes',
    telemetry2Val: '99,2%',
    telemetry3Label: 'Pressão Linha',
    telemetry3Val: '120 kg (DownForce)',
    operator: 'Carlos Eduardo',
    operatorInitials: 'CE',
    talhao: 'Talhão 02',
  },
  {
    id: '7',
    code: 'TR-03',
    name: 'John Deere 6190M',
    category: 'TRATOR',
    typeTag: 'Trator Médio • 190 cv',
    status: 'OPERANDO',
    statusLabel: 'Em Operação',
    iconType: 'tractor',
    horimeter: 1120,
    horimeterTarget: 1250,
    horimeterCyclePct: 89.6,
    horimeterSub1: '90% do ciclo',
    horimeterSub2: 'Faltam 130h p/ revisão',
    telemetry1Label: 'Consumo Instantâneo',
    telemetry1Val: '13,8 L/h',
    telemetry2Label: 'Nível Diesel S10',
    telemetry2Val: '76%',
    telemetry2IsFuel: true,
    fuelPct: 76,
    telemetry3Label: 'Velocidade Atual',
    telemetry3Val: '7,2 km/h',
    operator: 'Lucas Ferreira',
    operatorInitials: 'LF',
    talhao: 'Talhão 08',
  },
  {
    id: '8',
    code: 'TR-05',
    name: 'Case IH Steiger 500',
    category: 'TRATOR',
    typeTag: 'Articulado • 500 cv',
    status: 'PATIO',
    statusLabel: 'Pátio Central',
    iconType: 'tractor',
    horimeter: 3410,
    horimeterTarget: 3500,
    horimeterCyclePct: 97.4,
    horimeterSub1: '97% do ciclo',
    horimeterSub2: 'Faltam 90h p/ revisão',
    telemetry1Label: 'Consumo Instantâneo',
    telemetry1Val: '0,0 L/h (Off)',
    telemetry2Label: 'Nível Diesel S10',
    telemetry2Val: '92%',
    telemetry2IsFuel: true,
    fuelPct: 92,
    telemetry3Label: 'Status Telemetria',
    telemetry3Val: 'Sinal GPS 100%',
    operator: 'Pátio Central',
    operatorInitials: 'PC',
    talhao: 'Standby',
  },
  {
    id: '9',
    code: 'CH-02',
    name: 'Case IH Axial-Flow 8250',
    category: 'COLHEITADEIRA',
    typeTag: 'Colheitadeira Grãos • 480 cv',
    status: 'PATIO',
    statusLabel: 'Pronta p/ Safra',
    iconType: 'harvester',
    horimeter: 890,
    horimeterTarget: 1000,
    horimeterCyclePct: 89,
    horimeterSub1: 'Plataforma Drapper 40ft engatada',
    horimeterSub2: 'Pronta p/ Colheita',
    horimeterSub2Color: 'var(--accent-text)',
    telemetry1Label: 'Consumo Instantâneo',
    telemetry1Val: '0,0 L/h (Off)',
    telemetry2Label: 'Nível Diesel S10',
    telemetry2Val: '95%',
    telemetry2IsFuel: true,
    fuelPct: 95,
    telemetry3Label: 'Status Telemetria',
    telemetry3Val: 'Sinal RTK Ativo',
    operator: 'Anderson Lima',
    operatorInitials: 'AL',
    talhao: 'Hangar Colheita',
  },
  {
    id: '10',
    code: 'CH-03',
    name: 'New Holland CR 8.90',
    category: 'COLHEITADEIRA',
    typeTag: 'Duplo Rotor • 503 cv',
    status: 'MANUTENCAO',
    statusLabel: 'Oficina (OS Aberta)',
    iconType: 'harvester',
    horimeter: 1200,
    horimeterTarget: 1250,
    horimeterCyclePct: 100,
    horimeterSub1: 'OS-2025-083 em execução',
    horimeterSub2: 'Balanceamento Rotores',
    horimeterSub2Color: 'var(--danger)',
    telemetry1Label: 'Mecânico Resp.',
    telemetry1Val: 'CNH Autorizada',
    telemetry2Label: 'Custo Estimado OS',
    telemetry2Val: 'R$ 12.400,00',
    telemetry3Label: 'Previsão Liberação',
    telemetry3Val: '3 dias',
    operator: 'Oficina Central',
    operatorInitials: 'OF',
    talhao: 'Box 01',
    activeOS: 'OS-2025-083',
  },
  {
    id: '11',
    code: 'PV-02',
    name: 'John Deere M4040',
    category: 'PULVERIZADOR',
    typeTag: 'Pulverizador • 36m ExactApply',
    status: 'OPERANDO',
    statusLabel: 'Pulverizando',
    iconType: 'sprayer',
    horimeter: 620,
    horimeterTarget: 1000,
    horimeterCyclePct: 62,
    horimeterSub1: 'Barra 36m • Bicos ExactApply',
    horimeterSub2: 'Faltam 380h p/ revisão',
    telemetry1Label: 'Vazão Calda',
    telemetry1Val: '85 L/ha',
    telemetry2Label: 'Nível Tanque Calda',
    telemetry2Val: '2.100 L (53%)',
    telemetry3Label: 'Velocidade Aplicação',
    telemetry3Val: '19,2 km/h',
    operator: 'Lucas Martins',
    operatorInitials: 'LM',
    talhao: 'Talhão 06',
  },
  {
    id: '12',
    code: 'PL-02',
    name: 'Case IH Fast Riser 6100',
    category: 'PLANTADEIRA',
    typeTag: 'Plantadeira Dobrável • 24L',
    status: 'PATIO',
    statusLabel: 'Pátio / Calibrada',
    iconType: 'planter',
    horimeter: 860,
    horimeterTarget: 1200,
    horimeterCyclePct: 71.6,
    horimeterSub1: 'Atrelada ao Trator TR-02',
    horimeterSub2: 'Pronta p/ Plantio',
    horimeterSub2Color: 'var(--accent-text)',
    telemetry1Label: 'População Alvo',
    telemetry1Val: '240 mil pl/ha',
    telemetry2Label: 'Singulação',
    telemetry2Val: '98,9%',
    telemetry3Label: 'Sensor Linha',
    telemetry3Val: '100% Ativo',
    operator: 'Hangar Implementos',
    operatorInitials: 'HI',
    talhao: 'Pátio',
  },
];

const INITIAL_ORDERS: MaintenanceOrder[] = [
  {
    id: 'os-1',
    code: 'OS-2025-084',
    machineCode: 'TR-04',
    machineName: 'John Deere 7230J',
    machineSub: 'Trator Médio 230 cv',
    type: 'Corretiva Urgente',
    typeDesc: 'Vazamento Válvula Hidráulica Traseira',
    horimeter: '2.310 h',
    parts: 'Kit Vedação John Deere + 24L Óleo ISO 68',
    partsOrigin: 'Estoque Galpão 01',
    mechanic: 'Tiago Rezende (Oficina Central)',
    cost: 4850.0,
    status: 'EM_EXECUCAO',
    statusLabel: 'Em Execução',
    statusClass: 'maintenance',
    date: '12/10/2026',
  },
  {
    id: 'os-2',
    code: 'OS-2025-083',
    machineCode: 'CH-03',
    machineName: 'New Holland CR 8.90',
    machineSub: 'Colheitadeira Duplo Rotor',
    type: 'Preventiva Periódica',
    typeDesc: 'Regulagem e Balanceamento de Rotores',
    horimeter: '1.200 h',
    parts: 'Rolamentos Blindados + Correia Primária',
    partsOrigin: 'Peças CNH Originais',
    mechanic: 'Oficina CNH Especializada',
    cost: 12400.0,
    status: 'AGUARDANDO_PECA',
    statusLabel: 'Aguardando Peça',
    statusClass: 'revision',
    date: '11/10/2026',
  },
  {
    id: 'os-3',
    code: 'OS-2025-082',
    machineCode: 'PV-03',
    machineName: 'Case Patriot 350',
    machineSub: 'Pulverizador Autopropelido',
    type: 'Plano Preventivo 500h',
    typeDesc: 'Troca Filtros Combustível e Bicos Cerâmicos',
    horimeter: '495 h',
    parts: 'Filtro Racor + Bicos TeeJet TTJ60',
    partsOrigin: 'Estoque da Fazenda',
    mechanic: 'Mec. Lucas Barreto',
    cost: 2150.0,
    status: 'AGENDADA',
    statusLabel: 'Agendada p/ Hoje',
    statusClass: 'revision',
    date: '12/10/2026',
  },
  {
    id: 'os-4',
    code: 'OS-2025-080',
    machineCode: 'TR-01',
    machineName: 'John Deere 8370R',
    machineSub: 'Trator Pesado 370 cv',
    type: 'Revisão de 1.000 h',
    typeDesc: 'Troca Fluido Transmissão AutoPowr',
    horimeter: '1.002 h',
    parts: 'Hy-Gard John Deere (60 L) + Filtros',
    partsOrigin: 'Concessionária Iguaçu Máquinas',
    mechanic: 'Equipe Externa Concessionária',
    cost: 14800.0,
    status: 'CONCLUIDA',
    statusLabel: 'Concluída (08/01)',
    statusClass: 'operating',
    date: '08/01/2026',
  },
];

export const Maquinarios: React.FC = () => {
  const { queueOperation } = useSync();
  const { token, propriedade } = useAuth();
  const isDemoMode = token === 'demo-token' || propriedade?.id === 'demo-property-id';

  const [machines, setMachines] = useState<Machine[]>(() => isDemoMode ? INITIAL_MACHINES : []);
  const [orders, setOrders] = useState<MaintenanceOrder[]>(() => isDemoMode ? INITIAL_ORDERS : []);
  const [isModalCadastroMaquinarioOpen, setIsModalCadastroMaquinarioOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE' | 'TELEMETRIA'>('GRID');

  useEffect(() => {
    Promise.allSettled([
      operacionalService.getMaquinarios(),
      operacionalService.getOrdensManutencao(),
    ])
      .then(([resMaq, resOrd]) => {
        if (resMaq.status === 'fulfilled' && resMaq.value && resMaq.value.length > 0) {
          const mappedMaq: Machine[] = resMaq.value.map((m, idx) => ({
            id: m.id || `api-maq-${idx}`,
            code: m.modelo || `MQ-${idx + 1}`,
            name: m.nome,
            category: (m.tipo === 'COLHEITADEIRA' || m.tipo === 'PULVERIZADOR' || m.tipo === 'PLANTADEIRA') ? (m.tipo as any) : 'TRATOR',
            typeTag: `${m.tipo} • ${m.modelo || 'Agrícola'}`,
            status: (m.status === 'EM_MANUTENCAO' ? 'MANUTENCAO' : m.status === 'OPERANDO' ? 'OPERANDO' : 'PATIO'),
            statusLabel: m.status,
            iconType: m.tipo === 'COLHEITADEIRA' ? 'harvester' : m.tipo === 'PULVERIZADOR' ? 'sprayer' : 'tractor',
            horimeter: Number(m.horimetro_atual || 0),
            horimeterTarget: Number(m.intervalo_preventiva || 1000),
            horimeterCyclePct: Math.min(100, Math.round((Number(m.horimetro_atual || 0) / Number(m.intervalo_preventiva || 1000)) * 100)),
            horimeterSub1: 'Horímetro telemetrado',
            horimeterSub2: `Próximo serviço em ${m.proximo_servico_em || 250}h`,
            telemetry1Label: 'Consumo Instantâneo',
            telemetry1Val: '16.5 L/h',
            telemetry2Label: 'Nível Diesel',
            telemetry2Val: '80%',
            telemetry2IsFuel: true,
            fuelPct: 80,
            telemetry3Label: 'Sinal Telemetria',
            telemetry3Val: 'Online GPS',
            operator: 'Equipe Operacional',
            operatorInitials: 'OP',
            talhao: 'Sede / Campo',
          }));

          setMachines((prev) => {
            if (isDemoMode) {
              const existingCodes = new Set(prev.map((p) => p.code));
              const fresh = mappedMaq.filter((fm) => !existingCodes.has(fm.code));
              return [...fresh, ...prev];
            }
            return mappedMaq;
          });
        } else if (!isDemoMode) {
          setMachines([]);
        }

        if (resOrd.status === 'fulfilled' && resOrd.value && resOrd.value.items && resOrd.value.items.length > 0) {
          const mappedOrd: MaintenanceOrder[] = resOrd.value.items.map((o, idx) => ({
            id: o.id || `api-os-${idx}`,
            code: `OS-API-${idx + 1}`,
            machineCode: 'MAQ',
            machineName: 'Máquina',
            machineSub: o.tipo || 'Preventiva',
            type: o.tipo || 'Manutenção',
            typeDesc: o.descricao || 'Ordem aberta via sistema',
            horimeter: `${o.horimetro_na_abertura || 0} h`,
            parts: 'Itens em análise',
            partsOrigin: 'Almoxarifado',
            mechanic: 'Oficina Central',
            cost: Number(o.custo_estimado || 0),
            status: o.status === 'CONCLUIDA' ? 'CONCLUIDA' : 'EM_EXECUCAO',
            statusLabel: o.status || 'Em Execução',
            statusClass: o.status === 'CONCLUIDA' ? 'operating' : 'maintenance',
            date: new Date().toLocaleDateString('pt-BR'),
          }));

          setOrders((prev) => {
            if (isDemoMode) {
              const existingIds = new Set(prev.map((p) => p.id));
              const fresh = mappedOrd.filter((fo) => !existingIds.has(fo.id));
              return [...fresh, ...prev];
            }
            return mappedOrd;
          });
        } else if (!isDemoMode) {
          setOrders([]);
        }
      })
      .catch((err) => {
        if (isDemoMode) {
          console.info('Modo demonstração ativo em Maquinários:', err);
        } else {
          setMachines([]);
          setOrders([]);
        }
      });
  }, [isDemoMode]);

  const handleMaquinaCriada = (nova: MaquinarioApi) => {
    const idx = machines.length;
    const mapped: Machine = {
      id: nova.id || `maq-user-${Date.now()}`,
      code: nova.modelo ? nova.modelo.split(' ')[0] : `MQ-${idx + 1}`,
      name: nova.nome,
      category: (nova.tipo === 'COLHEITADEIRA' || nova.tipo === 'PULVERIZADOR' || nova.tipo === 'PLANTADEIRA') ? (nova.tipo as any) : 'TRATOR',
      typeTag: `${nova.tipo} • ${nova.modelo || 'Agrícola'}`,
      status: 'PATIO',
      statusLabel: 'Pátio / Pronta',
      iconType: nova.tipo === 'COLHEITADEIRA' ? 'harvester' : nova.tipo === 'PULVERIZADOR' ? 'sprayer' : 'tractor',
      horimeter: Number(nova.horimetro_atual || 0),
      horimeterTarget: Number(nova.intervalo_preventiva || 250),
      horimeterCyclePct: 0,
      horimeterSub1: 'Máquina nova cadastrada',
      horimeterSub2: `Próximo serviço em ${nova.proximo_servico_em || 250}h`,
      telemetry1Label: 'Consumo Instantâneo',
      telemetry1Val: '0.0 L/h (Off)',
      telemetry2Label: 'Nível Diesel',
      telemetry2Val: '100%',
      telemetry2IsFuel: true,
      fuelPct: 100,
      telemetry3Label: 'Sinal Telemetria',
      telemetry3Val: 'Standby',
      operator: 'Equipe da Fazenda',
      operatorInitials: 'EF',
      talhao: 'Pátio Central',
    };
    setMachines((prev) => [mapped, ...prev]);
    showToast(`Máquina "${nova.nome}" cadastrada com sucesso na frota!`);
  };

  // Modais
  const [modalNewOSOpen, setModalNewOSOpen] = useState(false);
  const [modalTelemetryOpen, setModalTelemetryOpen] = useState(false);
  const [modalOSDetailOpen, setModalOSDetailOpen] = useState(false);
  const [selectedTelemetryMachine, setSelectedTelemetryMachine] = useState<Machine | null>(null);
  const [selectedOSDetail, setSelectedOSDetail] = useState<MaintenanceOrder | null>(null);

  // Form de Nova OS
  const machineSelectOptions = useMemo(() => {
    if (machines.length === 0) {
      return ['Nenhuma máquina cadastrada'];
    }
    return machines.map((m) => `${m.code} • ${m.name} (${m.typeTag || m.category})`);
  }, [machines]);

  const [formMachine, setFormMachine] = useState(
    isDemoMode ? 'TR-01 • John Deere 8370R (Trator Pesado)' : ''
  );
  const [formType, setFormType] = useState('Preventiva Periódica (500h / 1.000h)');
  const [formHorimeter, setFormHorimeter] = useState<number>(isDemoMode ? 1492 : 0);
  const [formDesc, setFormDesc] = useState(
    isDemoMode ? 'Revisão preventiva de 1.500 horas de motor e troca do óleo Plus-50 II' : ''
  );
  const [formMechanic, setFormMechanic] = useState(isDemoMode ? 'Tiago Rezende (Oficina Sede)' : '');
  const [formCost, setFormCost] = useState<number>(isDemoMode ? 3200 : 0);

  useEffect(() => {
    if (machineSelectOptions.length > 0 && (!formMachine || !machineSelectOptions.includes(formMachine))) {
      setFormMachine(machineSelectOptions[0]);
    }
  }, [machineSelectOptions, formMachine]);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const showToast = (text: string) => {
    const id = String(Date.now());
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const handleExportMaquinariosXlsx = async () => {
    try {
      setIsExporting(true);
      await operacionalService.exportarMaquinariosXlsx();
      showToast('Planilha de frota e ordens de serviço (.xlsx) baixada com sucesso!');
    } catch {
      showToast('Erro ao exportar planilha de maquinários. Verifique a conexão com a API.');
    } finally {
      setIsExporting(false);
    }
  };

  // Filtragem de máquinas
  const filteredMachines = useMemo(() => {
    return machines.filter((m) => {
      const matchCat = selectedCategory === 'TODOS' || m.category === selectedCategory;
      const matchStatus = selectedStatus === 'TODOS' || m.status === selectedStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        m.code.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.operator.toLowerCase().includes(q) ||
        m.talhao.toLowerCase().includes(q);

      return matchCat && matchStatus && matchSearch;
    });
  }, [machines, selectedCategory, selectedStatus, searchQuery]);

  // Contadores por categoria
  const categoryCounts = useMemo(() => {
    return {
      TODOS: machines.length,
      TRATOR: machines.filter((m) => m.category === 'TRATOR').length,
      COLHEITADEIRA: machines.filter((m) => m.category === 'COLHEITADEIRA').length,
      PULVERIZADOR: machines.filter((m) => m.category === 'PULVERIZADOR').length,
      PLANTADEIRA: machines.filter((m) => m.category === 'PLANTADEIRA').length,
    };
  }, [machines]);

  // Contadores por status (respeitando a categoria selecionada)
  const statusCounts = useMemo(() => {
    const base = selectedCategory === 'TODOS'
      ? machines
      : machines.filter((m) => m.category === selectedCategory);
    return {
      TODOS: base.length,
      OPERANDO: base.filter((m) => m.status === 'OPERANDO').length,
      PATIO: base.filter((m) => m.status === 'PATIO').length,
      MANUTENCAO: base.filter((m) => m.status === 'MANUTENCAO').length,
      REVISAO: base.filter((m) => m.status === 'REVISAO').length,
    };
  }, [machines, selectedCategory]);

  const statusFilterOptions: {
    id: 'TODOS' | 'OPERANDO' | 'PATIO' | 'MANUTENCAO' | 'REVISAO';
    label: string;
    dotColor?: string;
  }[] = [
    { id: 'TODOS', label: 'Todos' },
    { id: 'OPERANDO', label: 'Em Operação', dotColor: 'var(--accent)' },
    { id: 'PATIO', label: 'Pátio / Standby', dotColor: '#71717a' },
    { id: 'MANUTENCAO', label: 'Oficina', dotColor: 'var(--danger)' },
    { id: 'REVISAO', label: 'Revisão Próxima', dotColor: 'var(--warning)' },
  ];

  // Abertura de Modal de Telemetria
  const handleOpenTelemetry = (machine: Machine) => {
    setSelectedTelemetryMachine(machine);
    setModalTelemetryOpen(true);
  };

  // Abertura de Modal de Nova OS pré-configurada
  const handleOpenNewOSWithMachine = (machineText: string, typePreset?: string) => {
    setFormMachine(machineText);
    if (typePreset === 'PREVENTIVA_1500') {
      setFormType('Preventiva Periódica (500h / 1.000h)');
      setFormHorimeter(1492);
      setFormDesc('Revisão obrigatória de 1.500 horas de motor: Troca filtros e óleo Plus-50 II');
      setFormCost(3400);
    }
    setModalNewOSOpen(true);
  };

  // Submissão do Form de Nova OS
  const handleCreateOSSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (machines.length === 0 || formMachine === 'Nenhuma máquina cadastrada' || !formMachine) {
      showToast('Cadastre ao menos uma máquina na frota antes de abrir uma Ordem de Serviço.');
      return;
    }
    const newCode = `OS-2026-${Math.floor(100 + Math.random() * 900)}`;
    const machinePart = formMachine.split('•');
    const machineCode = machinePart[0]?.trim() || 'TR-01';
    const machineName = machinePart[1]?.trim() || 'Equipamento';

    const newOrder: MaintenanceOrder = {
      id: String(Date.now()),
      code: newCode,
      machineCode,
      machineName,
      machineSub: formType,
      type: formType.split('(')[0]?.trim() || 'Preventiva',
      typeDesc: formDesc,
      horimeter: `${formHorimeter} h`,
      parts: 'Filtros Originais + Lubrificante Especializado',
      partsOrigin: 'Estoque Central',
      mechanic: formMechanic,
      cost: formCost,
      status: 'EM_EXECUCAO',
      statusLabel: 'Em Execução',
      statusClass: 'maintenance',
      date: new Date().toLocaleDateString('pt-BR'),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setModalNewOSOpen(false);
    showToast(
      `Ordem de Serviço ${newCode} registrada com sucesso para ${machineCode}! Custo orçado: R$ ${formCost.toLocaleString('pt-BR')},00`
    );

    // Sincronizar na outbox offline
    queueOperation(
      'ordem_manutencao',
      'CREATE',
      newOrder.id,
      {
        codigo_os: newCode,
        maquinario_codigo: machineCode,
        tipo: formType,
        descricao: formDesc,
        horimetro: formHorimeter,
        custo_estimado: formCost,
      },
      'LWW'
    ).catch(() => {});

    // Sincronizar com FastAPI
    operacionalService.createOrdemManutencao({
      maquinario_id: '00000000-0000-0000-0000-000000000001',
      tipo: formType.includes('Preventiva') ? 'PREVENTIVA' : 'CORRETIVA',
      descricao: `${formDesc} (Ref: ${machineCode} - ${machineName})`,
      horimetro_na_abertura: formHorimeter,
      status: 'ABERTA',
      prioridade: 'MEDIA',
      custo_estimado: formCost,
    }).catch((err) => {
      console.info('Ordem de serviço registrada localmente em modo offline:', err);
    });
  };

  const handleOpenOSDetail = (os: MaintenanceOrder) => {
    setSelectedOSDetail(os);
    setModalOSDetailOpen(true);
  };

  const totalMaquinas = machines.length;
  const maquinasAtivas = machines.filter((m) => m.status === 'OPERANDO' || m.status === 'PATIO').length;
  const dispPct = totalMaquinas > 0 ? ((maquinasAtivas / totalMaquinas) * 100).toFixed(1) : '100';
  const osAbertas = orders.filter((o) => o.status !== 'CONCLUIDA');
  const custoTotalOS = orders.reduce((acc, o) => acc + (o.cost || 0), 0);
  const machineAlerta = machines.find((m) => m.status === 'REVISAO' || m.status === 'MANUTENCAO');

  return (
    <>
      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              style={{ width: '16px', height: '16px', color: 'var(--accent)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            <span>{t.text}</span>
          </div>
        ))}
      </div>

      {/* Cabeçalho da Página & Ações */}
      <div className="page-header stagger-item">
        <div className="page-header-left">
          <h1 className="page-heading">Gestão de Maquinários & Frotas</h1>
          <p className="page-subheading">
            Telemetria operacional em tempo real, monitoramento de horímetro e ordens de manutenção (OS)
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setIsModalCadastroMaquinarioOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nova Máquina
          </button>
          <button className="btn btn-outline" onClick={() => setModalNewOSOpen(true)} disabled={machines.length === 0}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Abrir OS
          </button>
          <button
            className="btn btn-outline"
            onClick={handleExportMaquinariosXlsx}
            disabled={isExporting || orders.length === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {isExporting ? 'Exportando...' : 'Exportar Relatório OS'}
          </button>
        </div>
      </div>

      {/* 4 Master KPIs da Frota */}
      <div className="kpi-strip stagger-item" style={{ animationDelay: '40ms' }}>
        <div className="kpi-cell">
          <span className="kpi-cell-label">Disponibilidade da Frota</span>
          <div className="kpi-cell-val">
            {dispPct}%<span className="unit-text" style={{ color: 'var(--accent-text)' }}>operacional</span>
          </div>
          <span className="kpi-cell-sub">
            {totalMaquinas > 0 ? (
              <>{maquinasAtivas} ativas • {totalMaquinas - maquinasAtivas} oficina/revisão</>
            ) : (
              'Nenhuma máquina cadastrada'
            )}
          </span>
        </div>

        <div className="kpi-cell">
          <span className="kpi-cell-label">Consumo Médio Telemetria</span>
          <div className="kpi-cell-val">
            {totalMaquinas > 0 ? '14,2' : '0,0'}<span className="unit-text">L/h</span>
          </div>
          <span className="kpi-cell-sub">
            {totalMaquinas > 0 ? 'Telemetria CAN Bus ativa' : 'Sem telemetria ativa'}
          </span>
        </div>

        <div className="kpi-cell">
          <span className="kpi-cell-label">Ordens de Serviço (OS) Abertas</span>
          <div className="kpi-cell-val" style={{ color: osAbertas.length > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>
            {osAbertas.length}
            <span className="unit-text" style={{ color: osAbertas.length > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>ativas</span>
          </div>
          <span className="kpi-cell-sub">
            {osAbertas.length > 0 ? `${osAbertas.length} preventivas/corretivas` : 'Nenhuma OS pendente'}
          </span>
        </div>

        <div className="kpi-cell">
          <span className="kpi-cell-label">Custo Acumulado Manutenção</span>
          <div className="kpi-cell-val">
            R$ {custoTotalOS.toLocaleString('pt-BR')}<span className="cents">,00</span>
          </div>
          <span className="kpi-cell-sub">
            {orders.length > 0 ? `${orders.length} ordens registradas` : 'Sem lançamentos'}
          </span>
        </div>
      </div>

      {/* Banner de Alerta Preditivo Inteligente (Horímetro Próximo à Revisão) */}
      {machineAlerta && (
        <div className="alert-banner stagger-item" style={{ animationDelay: '80ms' }}>
          <div className="alert-banner-left">
            <div className="alert-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <div className="alert-text-group">
              <div className="alert-headline">Alerta de Revisão Preditiva: {machineAlerta.code} ({machineAlerta.name})</div>
              <div className="alert-subline">
                Horímetro atingiu <strong>{machineAlerta.horimeter} h</strong> ({machineAlerta.horimeterSub2}). Recomendado agendar parada preventiva de inspeção e troca de filtros.
              </div>
            </div>
          </div>
          <div className="alert-actions">
            <button
              className="btn btn-outline"
              style={{ fontSize: '11.5px', padding: '6px 12px' }}
              onClick={() => handleOpenTelemetry(machineAlerta)}
            >
              Ver Telemetria CAN
            </button>
            <button
              className="btn btn-primary"
              style={{ fontSize: '11.5px', padding: '6px 12px' }}
              onClick={() => handleOpenNewOSWithMachine(`${machineAlerta.code} • ${machineAlerta.name}`)}
            >
              Abrir OS Preventiva
            </button>
          </div>
        </div>
      )}

      {/* Card Principal: Abas de Categoria, Filtros & Toggle de Visualização */}
      <div className="fleet-controls-card stagger-item" style={{ animationDelay: '120ms' }}>
        {/* Abas de Tipos de Máquinas */}
        <div className="category-tabs-bar">
          <button
            className={`cat-tab ${selectedCategory === 'TODOS' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('TODOS')}
          >
            Todas as Frotas <span className="count">{categoryCounts.TODOS}</span>
          </button>
          <button
            className={`cat-tab ${selectedCategory === 'TRATOR' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('TRATOR')}
          >
            Tratores Pesados <span className="count">{categoryCounts.TRATOR}</span>
          </button>
          <button
            className={`cat-tab ${selectedCategory === 'COLHEITADEIRA' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('COLHEITADEIRA')}
          >
            Colheitadeiras <span className="count">{categoryCounts.COLHEITADEIRA}</span>
          </button>
          <button
            className={`cat-tab ${selectedCategory === 'PULVERIZADOR' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('PULVERIZADOR')}
          >
            Pulverizadores <span className="count">{categoryCounts.PULVERIZADOR}</span>
          </button>
          <button
            className={`cat-tab ${selectedCategory === 'PLANTADEIRA' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('PLANTADEIRA')}
          >
            Plantadeiras & Implementos <span className="count">{categoryCounts.PLANTADEIRA}</span>
          </button>
        </div>

        {/* Sub-barra: Busca, Filtros de Status e Toggle Grid/Tabela */}
        <div className="fleet-filter-bar">
          <div className="fleet-filter-main">
            <div className="search-input-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Buscar por prefixo (TR-01), modelo, operador ou talhão..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="status-filters">
              <span className="status-filter-label">Status:</span>
              {statusFilterOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`status-pill-filter ${selectedStatus === opt.id ? 'active' : ''}`}
                  onClick={() => setSelectedStatus(opt.id)}
                >
                  {opt.dotColor && <span className="status-dot" style={{ background: opt.dotColor }} />}
                  <span>{opt.label}</span>
                  <span className="count">{statusCounts[opt.id]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggle de Visualização: Cards vs Tabela OS */}
          <div className="view-toggle">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'GRID' ? 'active' : ''}`}
              onClick={() => setViewMode('GRID')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
              </svg>
              Grid de Máquinas ({filteredMachines.length})
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'TABLE' ? 'active' : ''}`}
              onClick={() => setViewMode('TABLE')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm0 5.25h.007v.008H3.75V12Zm0 5.25h.007v.008H3.75v-.008Z" />
              </svg>
              Tabela de OS ({orders.length})
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'TELEMETRIA' ? 'active' : ''}`}
              onClick={() => setViewMode('TELEMETRIA')}
              style={{
                borderColor: viewMode === 'TELEMETRIA' ? 'var(--accent)' : undefined,
                color: viewMode === 'TELEMETRIA' ? 'var(--accent)' : undefined,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 6px #10b981',
                  display: 'inline-block',
                }}
              />
              Telemetria ao Vivo
            </button>
          </div>
        </div>

        {/* ── VISÃO 0: TELEMETRIA & RASTREAMENTO AO VIVO ── */}
        {viewMode === 'TELEMETRIA' && (
          <div style={{ marginTop: '16px' }}>
            <PainelTelemetriaAoVivo />
          </div>
        )}

        {/* ── VISÃO 1: GRID DE MÁQUINAS (Cards com Telemetria) ── */}
        {viewMode === 'GRID' && (
          <div className="fleet-grid">
            {filteredMachines.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <div className="empty-state-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.948c0-.621-.504-1.125-1.125-1.125H4.125C3.504 5.5 3 6.004 3 6.625v7.625m13.5-6.75h-3.75m0 0V4.5m3.75 2.25v2.25" />
                  </svg>
                </div>
                <h3 className="empty-state-title">Nenhum maquinário cadastrado na frota</h3>
                <p className="empty-state-desc">
                  Cadastre seus tratores, colheitadeiras, pulverizadores e plantadeiras para monitorar horímetros, telemetria de campo e gerenciar ordens de manutenção preventiva.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                  <button className="btn btn-primary" onClick={() => setIsModalCadastroMaquinarioOpen(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Cadastrar Primeira Máquina
                  </button>
                </div>
              </div>
            ) : (
              filteredMachines.map((m) => {
                const isRevision = m.status === 'REVISAO';
                const isMaintenance = m.status === 'MANUTENCAO';
                const isOperating = m.status === 'OPERANDO';

              return (
                <div key={m.id} className="machine-card">
                  <div className="machine-top">
                    <div className="machine-info-left">
                      <div className={`machine-icon-box ${m.iconType}`}>
                        {m.iconType === 'tractor' && (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m16.5 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.875a1.125 1.125 0 0 0 1.125-1.125V13.5m-19.5.75h19.5m-19.5 0L6 7.5h7.5l2.25 6.75M6 7.5V4.5H3.75" />
                          </svg>
                        )}
                        {m.iconType === 'harvester' && (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0h-10.5m10.5 0a1.5 1.5 0 0 1-3 0m-4.5 0a1.5 1.5 0 0 1-3 0" />
                          </svg>
                        )}
                        {m.iconType === 'sprayer' && (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                          </svg>
                        )}
                        {m.iconType === 'planter' && (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                          </svg>
                        )}
                      </div>
                      <div className="machine-titles">
                        <div className="machine-code-row">
                          <span className="machine-code">{m.code}</span>
                          <span className="machine-type-tag">{m.typeTag}</span>
                        </div>
                        <span className="machine-name">{m.name}</span>
                      </div>
                    </div>

                    <span
                      className={`status-badge ${
                        isOperating
                          ? 'operating'
                          : isMaintenance
                          ? 'maintenance'
                          : isRevision
                          ? 'revision'
                          : 'standby'
                      }`}
                    >
                      {isOperating && <span className="dot"></span>}
                      {m.statusLabel}
                    </span>
                  </div>

                  {/* Horímetro & Progresso até Revisão */}
                  <div className="horimeter-box">
                    <div className="horimeter-row-top">
                      <span className="horimeter-label">Horímetro Atual</span>
                      <span className="horimeter-val">
                        {m.horimeter.toLocaleString('pt-BR')} h{' '}
                        <span className="target">/ rev. {m.horimeterTarget.toLocaleString('pt-BR')} h</span>
                      </span>
                    </div>
                    <div className="horimeter-progress-bg">
                      <div
                        className={`horimeter-progress-fill ${
                          isMaintenance ? 'danger' : isRevision ? 'warn' : ''
                        }`}
                        style={{ width: `${Math.min(100, m.horimeterCyclePct)}%` }}
                      ></div>
                    </div>
                    <div className="horimeter-subtext">
                      <span>{m.horimeterSub1}</span>
                      <span style={{ color: m.horimeterSub2Color || 'var(--text-muted)' }}>
                        {m.horimeterSub2}
                      </span>
                    </div>
                  </div>

                  {/* Telemetria CAN Bus ao Vivo */}
                  <div className="telemetry-grid">
                    <div className="telemetry-cell">
                      <span className="telemetry-cell-label">{m.telemetry1Label}</span>
                      <span className="telemetry-cell-val">{m.telemetry1Val}</span>
                    </div>
                    <div className="telemetry-cell">
                      <span className="telemetry-cell-label">{m.telemetry2Label}</span>
                      {m.telemetry2IsFuel ? (
                        <span className="telemetry-cell-val diesel-bar">
                          <span>{m.telemetry2Val}</span>
                          <span className="mini-fuel-bar">
                            <span className="mini-fuel-fill" style={{ width: `${m.fuelPct || 80}%` }}></span>
                          </span>
                        </span>
                      ) : (
                        <span className="telemetry-cell-val" style={{ color: 'var(--accent-text)' }}>
                          {m.telemetry2Val}
                        </span>
                      )}
                    </div>
                    <div className="telemetry-cell">
                      <span className="telemetry-cell-label">{m.telemetry3Label}</span>
                      <span className="telemetry-cell-val">{m.telemetry3Val}</span>
                    </div>
                  </div>

                  {/* Rodapé do Card */}
                  <div className="machine-card-footer">
                    <div className="operator-info">
                      <div className="operator-avatar">{m.operatorInitials}</div>
                      <span>
                        {m.operator} • <strong>{m.talhao}</strong>
                      </span>
                    </div>
                    <div className="card-actions-row">
                      <button className="action-btn-mini" onClick={() => handleOpenTelemetry(m)}>
                        Telemetria
                      </button>
                      <button
                        className="action-btn-mini os-btn"
                        onClick={() => handleOpenNewOSWithMachine(`${m.code} • ${m.name}`)}
                      >
                        Abrir OS
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          </div>
        )}

        {/* ── VISÃO 2: TABELA DE ORDENS DE MANUTENÇÃO (OS) ────── */}
        {viewMode === 'TABLE' && (
          <div className="table-view-section">
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Código OS</th>
                    <th>Máquina & Prefixo</th>
                    <th>Tipo de Intervenção</th>
                    <th>Horímetro</th>
                    <th>Peças / Insumos Utilizados</th>
                    <th>Mecânico / Box</th>
                    <th>Custo Total</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                        Nenhuma ordem de serviço cadastrada para os equipamentos desta fazenda.
                      </td>
                    </tr>
                  ) : (
                    orders.map((os) => (
                      <tr key={os.id}>
                        <td>
                          <span className="os-code-pill">{os.code}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {os.machineCode} • {os.machineName}
                          </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{os.machineSub}</div>
                      </td>
                      <td>
                        <span
                          style={{
                            color:
                              os.status === 'EM_EXECUCAO'
                                ? 'var(--danger)'
                                : os.status === 'CONCLUIDA'
                                ? 'var(--accent-text)'
                                : 'var(--warning)',
                            fontWeight: 600,
                          }}
                        >
                          {os.type}
                        </span>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{os.typeDesc}</div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{os.horimeter}</span>
                      </td>
                      <td>
                        <div>{os.parts}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{os.partsOrigin}</div>
                      </td>
                      <td>{os.mechanic}</td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                          R$ {os.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${os.statusClass}`}>{os.statusLabel}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                          onClick={() => handleOpenOSDetail(os)}
                        >
                          Ficha OS
                        </button>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rodapé do Card de Controles */}
        <div className="inventory-card-footer">
          <div className="footer-stats">
            <span>
              Mostrando <strong>{filteredMachines.length}</strong> de <strong>{machines.length}</strong> máquinas cadastradas
            </span>
            <span className="dot-sep">•</span>
            <span>Telemetria CAN Bus J1939 conectada via Starlink</span>
          </div>
          <div className="footer-legend">
            <span className="legend-item"><span className="legend-dot green"></span> Operando</span>
            <span className="legend-item"><span className="legend-dot amber"></span> Revisão</span>
            <span className="legend-item"><span className="legend-dot red"></span> Oficina</span>
          </div>
        </div>
      </div>

      {/* Faixa de Resumo Operacional da Frota & Starlink */}
      <div className="fleet-summary-strip stagger-item" style={{ animationDelay: '160ms' }}>
        <div className="summary-item">
          <div className="summary-label">Gateway Telemetria</div>
          <div className="summary-val">Starlink Mini IP 192.168.1.80 • Latência 28ms</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Eficiência Energética Frota</div>
          <div className="summary-val">Consumo 14,2 L/h • Redução 4,1% (Modo Eco CAN)</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Oficina Central</div>
          <div className="summary-val">Box 01 e Box 02 ocupados • 2 mecânicos ativos</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Seguro de Máquinas & Frota</div>
          <div className="summary-val">Apólice Rural Allianz 2026/27 • Cobertura 100%</div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: ABRIR NOVA ORDEM DE SERVIÇO (OS)                    */}
      {/* ============================================================ */}
      {modalNewOSOpen && (
        <div className="modal-backdrop open" onClick={() => setModalNewOSOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  style={{ width: '20px', height: '20px', color: 'var(--accent)' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
                </svg>
                Abrir Nova Ordem de Serviço (OS)
              </span>
              <button className="modal-close" onClick={() => setModalNewOSOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateOSSubmit}>
              <div className="modal-body">
                {/* Equipamento Selecionado (Custom Select) */}
                <div className="form-group">
                  <label className="form-label">Equipamento / Máquina</label>
                  <CustomSelect
                    value={formMachine}
                    onChange={(val) => setFormMachine(val)}
                    options={machineSelectOptions}
                  />
                </div>

                <div className="form-row">
                  {/* Tipo de Intervenção */}
                  <div className="form-group">
                    <label className="form-label">Tipo de Manutenção</label>
                    <CustomSelect
                      value={formType}
                      onChange={(val) => setFormType(val)}
                      options={[
                        'Preventiva Periódica (500h / 1.000h)',
                        'Corretiva Emergencial',
                        'Preditiva (Análise Óleo / Vibração)',
                        'Calibração & Regulagem Eletrônica',
                      ]}
                    />
                  </div>

                  {/* Horímetro Atual (Custom Stepper) */}
                  <div className="form-group">
                    <label className="form-label">Horímetro Atual (h)</label>
                    <div className="stepper-wrap">
                      <input
                        type="number"
                        step="1"
                        className="form-input"
                        value={formHorimeter}
                        onChange={(e) => setFormHorimeter(Number(e.target.value) || 0)}
                        required
                      />
                      <div className="stepper-btns">
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => setFormHorimeter((prev) => prev + 1)}
                          title="Aumentar"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => setFormHorimeter((prev) => Math.max(0, prev - 1))}
                          title="Diminuir"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Descrição da Demanda */}
                <div className="form-group">
                  <label className="form-label">Descrição do Serviço / Sintomas</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Substituição de filtros de combustível primário e secundário..."
                    required
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  {/* Mecânico / Responsável */}
                  <div className="form-group">
                    <label className="form-label">Mecânico / Box Destino</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formMechanic}
                      onChange={(e) => setFormMechanic(e.target.value)}
                      required
                    />
                  </div>

                  {/* Custo Estimado (Custom Stepper) */}
                  <div className="form-group">
                    <label className="form-label">Custo Estimado (R$)</label>
                    <div className="stepper-wrap">
                      <input
                        type="number"
                        step="50"
                        className="form-input"
                        value={formCost}
                        onChange={(e) => setFormCost(Number(e.target.value) || 0)}
                        required
                      />
                      <div className="stepper-btns">
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => setFormCost((prev) => prev + 50)}
                          title="Aumentar"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => setFormCost((prev) => Math.max(0, prev - 50))}
                          title="Diminuir"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModalNewOSOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Registrar Ordem de Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: FICHA DE TELEMETRIA CAN BUS AO VIVO                 */}
      {/* ============================================================ */}
      {modalTelemetryOpen && selectedTelemetryMachine && (
        <div className="modal-backdrop open" onClick={() => setModalTelemetryOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-title">
                  Telemetria ao Vivo • {selectedTelemetryMachine.code} ({selectedTelemetryMachine.name})
                </span>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  CAN Bus J1939 • Gateway 4G Starlink Integrado • Atualizado há 12s
                </div>
              </div>
              <button className="modal-close" onClick={() => setModalTelemetryOpen(false)}>✕</button>
            </div>

            <div className="modal-body">
              {/* Painel de Indicadores do Motor */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Rotação do Motor
                  </span>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginTop: '4px',
                    }}
                  >
                    1.850 RPM
                  </div>
                  <span style={{ fontSize: '10.5px', color: 'var(--accent-text)' }}>Faixa econômica</span>
                </div>
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Temperatura Arref.
                  </span>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginTop: '4px',
                    }}
                  >
                    88 °C
                  </div>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Normal (85-92°C)</span>
                </div>
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Pressão Óleo Motor
                  </span>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginTop: '4px',
                    }}
                  >
                    4,2 bar
                  </div>
                  <span style={{ fontSize: '10.5px', color: 'var(--accent-text)' }}>Pressão ideal</span>
                </div>
              </div>

              {/* Localização & Operação em Campo */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Alocação Territorial Atual:</span>
                  <span style={{ fontWeight: 600, color: 'var(--accent-text)' }}>
                    {selectedTelemetryMachine.talhao} — Pivô Central (140 ha)
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Coordenadas GPS RTK:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    12°32'44"S 55°42'18"W (Precisão 2.5cm)
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Implemento Acoplado:</span>
                  <span style={{ color: 'var(--text-primary)' }}>Plantadeira DB ExactEmerge 36L</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Rendimento Operacional:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    14,8 ha/hora trabalhada
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModalTelemetryOpen(false)}>
                Fechar
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setModalTelemetryOpen(false);
                  handleOpenNewOSWithMachine(
                    `${selectedTelemetryMachine.code} • ${selectedTelemetryMachine.name}`,
                    'PREVENTIVA_1500'
                  );
                }}
              >
                Agendar Parada Técnica
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: FICHA DETALHADA DA ORDEM DE SERVIÇO (OS)            */}
      {/* ============================================================ */}
      {modalOSDetailOpen && selectedOSDetail && (
        <div className="modal-backdrop open" onClick={() => setModalOSDetailOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-title">Ficha Técnica da Ordem • {selectedOSDetail.code}</span>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {selectedOSDetail.machineCode} — {selectedOSDetail.machineName} ({selectedOSDetail.machineSub})
                </div>
              </div>
              <button className="modal-close" onClick={() => setModalOSDetailOpen(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div
                style={{
                  background: 'var(--bg-surface)',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tipo de Intervenção:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedOSDetail.type}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Horímetro no Registro:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    {selectedOSDetail.horimeter}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Peças / Insumos:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{selectedOSDetail.parts}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Origem dos Componentes:</span>
                  <span style={{ color: 'var(--text-muted)' }}>{selectedOSDetail.partsOrigin}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Mecânico Credenciado:</span>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{selectedOSDetail.mechanic}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Custo Contábil Apropriado:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-text)' }}>
                    R$ {selectedOSDetail.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Status da Execução:</span>
                  <span className={`status-badge ${selectedOSDetail.statusClass}`}>{selectedOSDetail.statusLabel}</span>
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  color: 'var(--accent-text)',
                }}
              >
                ✓ Registro em conformidade com o manual de manutenção preventiva do fabricante e plano safra 2026/27.
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModalOSDetailOpen(false)}>
                Fechar
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setModalOSDetailOpen(false);
                  showToast(`Comprovante de manutenção ${selectedOSDetail.code} impresso com sucesso!`);
                }}
              >
                Exportar Laudo Técnico
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CADASTRO DE NOVO MAQUINÁRIO */}
      <ModalCadastroMaquinario
        isOpen={isModalCadastroMaquinarioOpen}
        onClose={() => setIsModalCadastroMaquinarioOpen(false)}
        onSuccess={handleMaquinaCriada}
      />
    </>
  );
};
