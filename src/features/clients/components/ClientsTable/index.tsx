import React from 'react';
import ClientTableRow from '@/features/clients/components/ClientTableRow';
import type { Client } from '@/features/clients/types';

interface ClientsTableProps {
  clients: Client[];
  onEditClient: (client: Client) => void;
}

const ClientsTable: React.FC<ClientsTableProps> = ({ clients, onEditClient }) => {
  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-stone-50">
          <th className="px-6 py-4 text-[11px] font-bold text-stone-400 uppercase tracking-widest">Cédula</th>
          <th className="px-6 py-4 text-[11px] font-bold text-stone-400 uppercase tracking-widest">Nombre Completo</th>
          <th className="px-6 py-4 text-[11px] font-bold text-stone-400 uppercase tracking-widest">Teléfono</th>
          <th className="px-6 py-4 text-[11px] font-bold text-stone-400 uppercase tracking-widest">Correo Electrónico</th>
          <th className="px-6 py-4 text-[11px] font-bold text-stone-400 uppercase tracking-widest">Tipo</th>
          <th className="px-6 py-4 text-[11px] font-bold text-stone-400 uppercase tracking-widest text-center">Estado</th>
          <th className="px-6 py-4 text-[11px] font-bold text-stone-400 uppercase tracking-widest text-right">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-stone-100">
        {clients.map((client) => (
          <ClientTableRow key={client.idNumber} client={client} onEditClient={onEditClient} />
        ))}
      </tbody>
    </table>
  );
};

export default ClientsTable;
