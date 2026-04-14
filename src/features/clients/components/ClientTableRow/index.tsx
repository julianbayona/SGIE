import React from 'react';
import type { Client } from '@/features/clients/types';

interface ClientTableRowProps {
  client: Client;
  onEditClient: (client: Client) => void;
}

const ClientTableRow: React.FC<ClientTableRowProps> = ({ client, onEditClient }) => {
  const isMember = client.category === 'Socio';
  const isActive = client.status === 'Activo';

  return (
    <tr className="hover:bg-stone-50/60 transition-colors group">
      <td className="px-6 py-4">
        <span className="bg-stone-100 text-stone-600 px-2 py-1 rounded text-xs font-mono font-bold">
          {client.idNumber}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-gold font-bold hover:underline cursor-pointer">{client.fullName}</span>
          <span className="text-[10px] text-stone-400 uppercase tracking-wide">Registrado: {client.registeredAt}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-stone-600">{client.phone}</td>
      <td className="px-6 py-4 text-sm text-stone-600 italic underline decoration-gold/20">
        {client.email}
      </td>
      <td className="px-6 py-4">
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            isMember ? 'bg-green-bg text-green-text' : 'bg-stone-100 text-stone-600'
          }`}
        >
          {client.category}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${
            isActive ? 'bg-green-bg text-green-text' : 'bg-stone-100 text-stone-500'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green' : 'bg-stone-400/60'}`}></span>
          {client.status}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEditClient(client)}
            className="p-1.5 text-stone-400 hover:text-gold transition-colors"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
          <button type="button" className="p-1.5 text-stone-400 hover:text-gold transition-colors">
            <span className="material-symbols-outlined text-lg">visibility</span>
          </button>
          <button type="button" className="p-1.5 text-stone-400 hover:text-red transition-colors">
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ClientTableRow;
