import React, { useMemo, useState } from 'react';
import ClientsHeader from '@/features/clients/components/ClientsHeader';
import ClientsTable from '@/features/clients/components/ClientsTable';
import ClientsTablePagination from '@/features/clients/components/ClientsTablePagination';
import type { Client, ClientsTab } from '@/features/clients/types';

const clientsData: Client[] = [
  {
    idNumber: '1.024.456.789',
    fullName: 'Ricardo Albarracín',
    phone: '+57 312 456 7890',
    email: 'r.albarracin@email.com',
    category: 'Socio',
    status: 'Activo',
    registeredAt: '12 Oct 2023',
  },
  {
    idNumber: '79.567.890',
    fullName: 'Claudia Mendoza',
    phone: '+57 300 123 4455',
    email: 'claudia.m@gmail.com',
    category: 'No Socio',
    status: 'Activo',
    registeredAt: '05 Nov 2023',
  },
  {
    idNumber: '1.018.234.567',
    fullName: 'Mauricio Herrera',
    phone: '+57 315 987 6543',
    email: 'm.herrera@boyaca.org',
    category: 'Socio',
    status: 'Suspendido',
    registeredAt: '20 Ene 2024',
  },
  {
    idNumber: '1.052.889.442',
    fullName: 'Natalia Forero',
    phone: '+57 316 331 7890',
    email: 'natalia.forero@correo.com',
    category: 'No Socio',
    status: 'Activo',
    registeredAt: '15 Feb 2024',
  },
];

const ClientsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ClientsTab>('Todos');

  const visibleClients = useMemo(() => {
    if (activeTab === 'Socios') {
      return clientsData.filter((client) => client.category === 'Socio');
    }

    if (activeTab === 'No Socios') {
      return clientsData.filter((client) => client.category === 'No Socio');
    }

    return clientsData;
  }, [activeTab]);

  return (
    <section className="space-y-6">
      <ClientsHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="bg-surface rounded-xl shadow-sm border border-border/80 overflow-hidden flex-1 flex flex-col">
        <ClientsTable clients={visibleClients} />
        <ClientsTablePagination from={1} to={visibleClients.length} total={1245} />
      </div>
    </section>
  );
};

export default ClientsPage;
