import React, { useMemo, useState } from 'react';
import ClientsHeader from '@/features/clients/components/ClientsHeader';
import ClientsTable from '@/features/clients/components/ClientsTable';
import ClientsTablePagination from '@/features/clients/components/ClientsTablePagination';
import ClientFormModal, { type ClientFormValues } from '@/features/clients/components/ClientFormModal';
import type { Client, ClientsTab } from '@/features/clients/types';

const initialClientsData: Client[] = [
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
  const [clients, setClients] = useState<Client[]>(initialClientsData);
  const [activeTab, setActiveTab] = useState<ClientsTab>('Todos');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  const editingClient = useMemo(
    () => clients.find((client) => client.idNumber === editingClientId) ?? null,
    [clients, editingClientId]
  );

  const idNumbersInUse = useMemo(() => {
    return clients
      .filter((client) => client.idNumber !== editingClientId)
      .map((client) => client.idNumber.replace(/[^\d]/g, ''));
  }, [clients, editingClientId]);

  const formattedToday = useMemo(
    () =>
      new Intl.DateTimeFormat('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date()),
    []
  );

  const openCreateForm = () => {
    setEditingClientId(null);
    setIsFormOpen(true);
  };

  const openEditForm = (client: Client) => {
    setEditingClientId(client.idNumber);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingClientId(null);
  };

  const saveClient = (values: ClientFormValues) => {
    if (editingClientId) {
      setClients((prev) =>
        prev.map((client) => {
          if (client.idNumber !== editingClientId) {
            return client;
          }

          return {
            ...client,
            idNumber: values.idNumber,
            fullName: values.fullName,
            category: values.category,
            phone: values.phone,
            email: values.email,
          };
        })
      );
      closeForm();
      return;
    }

    const newClient: Client = {
      idNumber: values.idNumber,
      fullName: values.fullName,
      phone: values.phone,
      email: values.email,
      category: values.category,
      status: 'Activo',
      registeredAt: formattedToday,
    };

    setClients((prev) => [newClient, ...prev]);
    closeForm();
  };

  const visibleClients = useMemo(() => {
    if (activeTab === 'Socios') {
      return clients.filter((client) => client.category === 'Socio');
    }

    if (activeTab === 'No Socios') {
      return clients.filter((client) => client.category === 'No Socio');
    }

    return clients;
  }, [activeTab, clients]);

  return (
    <section className="space-y-6 relative isolate min-h-[calc(100vh-10rem)]">
      <ClientsHeader activeTab={activeTab} onTabChange={setActiveTab} onCreateClient={openCreateForm} />

      <div className="bg-surface rounded-xl shadow-sm border border-border/80 overflow-hidden flex-1 flex flex-col">
        <ClientsTable clients={visibleClients} onEditClient={openEditForm} />
        <ClientsTablePagination from={1} to={visibleClients.length} total={1245} />
      </div>

      <ClientFormModal
        isOpen={isFormOpen}
        mode={editingClient ? 'edit' : 'create'}
        initialClient={editingClient}
        idNumbersInUse={idNumbersInUse}
        onCancel={closeForm}
        onSubmit={saveClient}
      />
    </section>
  );
};

export default ClientsPage;
