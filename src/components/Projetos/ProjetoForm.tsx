// src/components/Projetos/ProjetoForm.tsx
/**
 * Formulário de criação/edição de projeto
 * Inclui campo para pasta do Google Drive
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleDriveFolderInput } from './GoogleDriveFolderInput';
import { useNotification } from '../../contexts/NotificationContext';
import { projetoQueries } from '../../lib/supabase-queries';
import { LoadingSpinner } from '../LoadingSpinner';
import type { Projeto } from '../../types';

interface ProjetoFormProps {
  projeto?: Projeto;
  clienteId: string;
  onSuccess?: () => void;
}

export const ProjetoForm: React.FC<ProjetoFormProps> = ({
  projeto,
  clienteId,
  onSuccess
}) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: projeto?.nome || '',
    descricao: projeto?.descricao || '',
    data_inicio: projeto?.data_inicio || new Date().toISOString().split('T')[0],
    data_fim: projeto?.data_fim || '',
    google_drive_folder_id: projeto?.google_drive_folder_id || null,
    ativo: projeto?.ativo ?? true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.nome.trim()) {
      showNotification('error', 'Nome do projeto é obrigatório');
      return;
    }

    try {
      setLoading(true);

      const data = {
        ...formData,
        cliente_id: clienteId
      };

      if (projeto) {
        // Atualizar projeto existente
        await projetoQueries.atualizar(projeto.id, data);
        showNotification('success', 'Projeto atualizado com sucesso');
      } else {
        // Criar novo projeto
        await projetoQueries.criar(data);
        showNotification('success', 'Projeto criado com sucesso');
      }

      onSuccess?.();
      navigate(-1);
    } catch (error: any) {
      showNotification('error', error.message || 'Erro ao salvar projeto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nome do Projeto */}
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-brand-dark">
          Nome do Projeto *
        </label>
        <input
          type="text"
          id="nome"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          className="mt-1 block w-full rounded-md border-brand-light shadow-sm focus:border-brand-blue focus:ring-brand-blue"
          required
        />
      </div>

      {/* Descrição */}
      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-brand-dark">
          Descrição
        </label>
        <textarea
          id="descricao"
          rows={3}
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          className="mt-1 block w-full rounded-md border-brand-light shadow-sm focus:border-brand-blue focus:ring-brand-blue"
        />
      </div>

      {/* Datas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="data_inicio" className="block text-sm font-medium text-brand-dark">
            Data de Início *
          </label>
          <input
            type="date"
            id="data_inicio"
            value={formData.data_inicio}
            onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
            className="mt-1 block w-full rounded-md border-brand-light shadow-sm focus:border-brand-blue focus:ring-brand-blue"
            required
          />
        </div>

        <div>
          <label htmlFor="data_fim" className="block text-sm font-medium text-brand-dark">
            Data de Término
          </label>
          <input
            type="date"
            id="data_fim"
            value={formData.data_fim}
            onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
            min={formData.data_inicio}
            className="mt-1 block w-full rounded-md border-brand-light shadow-sm focus:border-brand-blue focus:ring-brand-blue"
          />
        </div>
      </div>

      {/* Pasta do Google Drive */}
      <div className="border-t border-brand-lighter pt-6">
        <h3 className="text-lg font-medium text-brand-dark mb-4">
          Integração com Google Drive
        </h3>
        
        <GoogleDriveFolderInput
          value={formData.google_drive_folder_id}
          onChange={(folderId) => setFormData({ ...formData, google_drive_folder_id: folderId })}
        />
      </div>

      {/* Status Ativo */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="ativo"
          checked={formData.ativo}
          onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
          className="h-4 w-4 text-brand-blue focus:ring-brand-blue border-brand-light rounded"
        />
        <label htmlFor="ativo" className="ml-2 block text-sm text-brand-dark">
          Projeto ativo
        </label>
      </div>

      {/* Botões */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-brand-lighter">
        <button
          type="button"
          onClick={() => navigate(-1)}
          disabled={loading}
          className="px-4 py-2 border border-brand-gray text-brand-dark rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          {loading && <LoadingSpinner size="sm" className="mr-2" />}
          {projeto ? 'Atualizar' : 'Criar'} Projeto
        </button>
      </div>
    </form>
  );
};