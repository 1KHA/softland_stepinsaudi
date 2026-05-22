import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import {
  PlusIcon,
  Edit2Icon,
  Trash2Icon,
  XIcon,
  ShieldCheckIcon } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface License {
  id: string;
  name: string;
  type: string;
  requiredFor: string[];
  status: 'active' | 'inactive';
  description: string;
  documents: string[];
}
export const Licenses: React.FC = () => {
  const { t } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [licenseForm, setLicenseForm] = useState({
    name: '',
    type: 'commercial',
    status: 'active' as License['status'],
    description: '',
    requiredFor: [] as string[],
    documents: [] as string[],
    selectedDocuments: [] as string[]
  });
  const [newDocumentName, setNewDocumentName] = useState('');
  const [licenseErrors, setLicenseErrors] = useState<Record<string, string>>({});
  const [licenses, setLicenses] = useState<License[]>([
  {
    id: '1',
    name: 'Commercial Trade License',
    type: 'commercial',
    requiredFor: ['commercial', 'real_estate'],
    status: 'active',
    description: 'Basic trade license for commercial activities.',
    documents: ['Passport Copy', 'Emirates ID']
  },
  {
    id: '2',
    name: 'Industrial Operating Permit',
    type: 'industrial',
    requiredFor: ['industrial'],
    status: 'active',
    description:
    'Permit required for manufacturing and industrial operations.',
    documents: ['Factory Plan', 'Environmental Clearance']
  },
  {
    id: '3',
    name: 'Tech Innovation Hub License',
    type: 'real_estate',
    requiredFor: ['real_estate', 'startup'],
    status: 'active',
    description: 'Special license for tech startups in innovation hubs.',
    documents: ['Business Plan', 'Founder CV']
  },
  {
    id: '4',
    name: 'E-Commerce Permit',
    type: 'startup',
    requiredFor: ['commercial', 'startup'],
    status: 'inactive',
    description: 'Required for selling goods online.',
    documents: ['Website Domain Proof', 'Bank Statement']
  },
  {
    id: '5',
    name: 'Food Safety Certificate',
    type: 'commercial',
    requiredFor: ['commercial'],
    status: 'active',
    description: 'Mandatory for food-related businesses.',
    documents: ['Health Certificates', 'Premises Layout']
  }]
  );
  const companyTypes = ['startup', 'industrial', 'real_estate', 'commercial'];

  const handleOpenModal = (license?: License) => {
    if (license) {
      setEditingLicense(license);
      setLicenseForm({
        name: license.name,
        type: license.type,
        status: license.status,
        description: license.description,
        requiredFor: license.requiredFor,
        documents: license.documents,
        selectedDocuments: license.documents
      });
    } else {
      setEditingLicense(null);
      setLicenseForm({
        name: '',
        type: 'commercial',
        status: 'active',
        description: '',
        requiredFor: [],
        documents: [],
        selectedDocuments: []
      });
    }
    setLicenseErrors({});
    setIsModalOpen(true);
  };
  const handleDelete = (id: string) => {
    if (confirm(t('deleteConfirmation' as any))) {
      setLicenses(licenses.filter((l) => l.id !== id));
    }
  };

  const toggleRequiredFor = (type: string) => {
    setLicenseForm((prev) => ({
      ...prev,
      requiredFor: prev.requiredFor.includes(type)
        ? prev.requiredFor.filter((item) => item !== type)
        : [...prev.requiredFor, type]
    }));
  };

  const toggleDocument = (doc: string) => {
    setLicenseForm((prev) => ({
      ...prev,
      selectedDocuments: prev.selectedDocuments.includes(doc)
        ? prev.selectedDocuments.filter((item) => item !== doc)
        : [...prev.selectedDocuments, doc]
    }));
  };

  const addDocument = () => {
    const trimmed = newDocumentName.trim();
    if (!trimmed) {
      setLicenseErrors((prev) => ({ ...prev, documents: t('fieldRequired' as any) }));
      return;
    }
    if (licenseForm.documents.some((doc) => doc.toLowerCase() === trimmed.toLowerCase())) {
      setLicenseErrors((prev) => ({ ...prev, documents: t('fieldRequired' as any) }));
      return;
    }
    setLicenseForm((prev) => ({
      ...prev,
      documents: [...prev.documents, trimmed],
      selectedDocuments: [...prev.selectedDocuments, trimmed]
    }));
    setNewDocumentName('');
    setLicenseErrors((prev) => {
      const next = { ...prev };
      delete next.documents;
      return next;
    });
  };

  const removeDocument = (doc: string) => {
    setLicenseForm((prev) => ({
      ...prev,
      documents: prev.documents.filter((item) => item !== doc),
      selectedDocuments: prev.selectedDocuments.filter((item) => item !== doc)
    }));
  };

  const handleLicenseSave = () => {
    const errors: Record<string, string> = {};
    if (!licenseForm.name.trim()) errors.name = t('fieldRequired' as any);
    if (!licenseForm.description.trim()) errors.description = t('fieldRequired' as any);
    if (!licenseForm.requiredFor.length) errors.requiredFor = t('fieldRequired' as any);
    if (!licenseForm.selectedDocuments.length) errors.documents = t('fieldRequired' as any);
    if (Object.keys(errors).length > 0) {
      setLicenseErrors(errors);
      return;
    }

    const savedLicense = {
      name: licenseForm.name,
      type: licenseForm.type,
      requiredFor: licenseForm.requiredFor,
      status: licenseForm.status,
      description: licenseForm.description,
      documents: licenseForm.selectedDocuments
    };

    if (editingLicense) {
      setLicenses((prev) =>
        prev.map((license) =>
          license.id === editingLicense.id ? { ...license, ...savedLicense } : license
        )
      );
      alert(t('licenseSaved' as any));
    } else {
      setLicenses((prev) => [
        ...prev,
        {
          id: String(prev.length + 1),
          ...savedLicense
        }
      ]);
      alert(t('licenseSaved' as any));
    }

    setIsModalOpen(false);
    setEditingLicense(null);
    setLicenseErrors({});
  };
  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy dark:text-cream-dark mb-2">
            {t('licenses')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage required licenses and permits for different company types.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-gold hover:bg-gold-dark text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-medium">
          
          <PlusIcon size={18} />
          {t('addLicense')}
        </button>
      </div>

      <div className="bg-white dark:bg-navy-card rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-navy-light/20 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-navy-light">
                <th className="px-6 py-4 font-medium">{t('licenseName')}</th>
                <th className="px-6 py-4 font-medium">{t('licenseType')}</th>
                <th className="px-6 py-4 font-medium">{t('applicableSectors')}</th>
                <th className="px-6 py-4 font-medium">{t('status')}</th>
                <th className="px-6 py-4 font-medium text-center">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-navy-light text-sm">
              {licenses.map((license) =>
              <tr
                key={license.id}
                className="hover:bg-gray-50/50 dark:hover:bg-navy-light/10 transition-colors group">
                
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-navy/5 dark:bg-cream/5 flex items-center justify-center text-navy dark:text-cream-dark">
                        <ShieldCheckIcon size={16} />
                      </div>
                      <div>
                        <p className="font-semibold text-navy dark:text-cream-dark">
                          {license.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                          {license.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {t(license.type as any)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {license.requiredFor.map((req) =>
                    <span
                      key={req}
                      className="px-2 py-1 bg-gray-100 dark:bg-navy-light/30 text-gray-600 dark:text-gray-300 rounded-md text-xs font-medium">
                      
                          {t(req as any)}
                        </span>
                    )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${license.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                    
                      {t(license.status as any)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                      onClick={() => handleOpenModal(license)}
                      className="p-2 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors">
                      
                        <Edit2Icon size={16} />
                      </button>
                      <button
                      onClick={() => handleDelete(license.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                      
                        <Trash2Icon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen &&
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/50 dark:bg-navy-dark/80 backdrop-blur-sm">
            <motion.div
            initial={{
              opacity: 0,
              scale: 0.95
            }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            exit={{
              opacity: 0,
              scale: 0.95
            }}
            className="bg-white dark:bg-navy-card rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
              <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-navy-light">
                <h2 className="text-xl font-bold text-navy dark:text-cream-dark">
                  {editingLicense ? t('edit') : t('addLicense')}
                </h2>
                <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-light rounded-full transition-colors">
                
                  <XIcon size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {t('licenseName')}
                    </label>
                    <input
                    type="text"
                    value={licenseForm.name}
                    onChange={(e) => setLicenseForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-light bg-transparent text-navy dark:text-cream-dark focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                    placeholder={t('licenseNamePlaceholder' as any)} />
                    {licenseErrors.name && (
                      <p className="text-xs text-red-500 mt-2">{licenseErrors.name}</p>
                    )}
                  
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {t('description')}
                    </label>
                    <textarea
                    value={licenseForm.description}
                    onChange={(e) => setLicenseForm((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-light bg-transparent text-navy dark:text-cream-dark focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors resize-none"
                    placeholder={t('descriptionPlaceholder' as any)} />
                    {licenseErrors.description && (
                      <p className="text-xs text-red-500 mt-2">{licenseErrors.description}</p>
                    )}
                  
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {t('licenseType')}
                      </label>
                      <select
                      value={licenseForm.type}
                      onChange={(e) => {
                        const newType = e.target.value;
                        setLicenseForm((prev) => {
                          const matchingSector = newType;
                          const newRequiredFor = prev.requiredFor.includes(matchingSector)
                            ? prev.requiredFor
                            : [...prev.requiredFor, matchingSector];
                          return { ...prev, type: newType, requiredFor: newRequiredFor };
                        });
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-light bg-transparent text-navy dark:text-cream-dark focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors appearance-none">
                        <option value="commercial">{t('commercial')}</option>
                        <option value="industrial">{t('industrial')}</option>
                        <option value="real_estate">{t('real_estate')}</option>
                        <option value="startup">{t('startup')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {t('status')}
                      </label>
                      <select
                      value={licenseForm.status}
                      onChange={(e) => setLicenseForm((prev) => ({ ...prev, status: e.target.value as License['status'] }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-light bg-transparent text-navy dark:text-cream-dark focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors appearance-none">
                        <option value="active">{t('active')}</option>
                        <option value="inactive">{t('inactive')}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('applicableSectors')}
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {companyTypes.map((type) =>
                    <label
                      key={type}
                      className="flex items-center gap-2 cursor-pointer">
                      
                          <input
                        type="checkbox"
                        checked={licenseForm.requiredFor.includes(type)}
                        onChange={() => toggleRequiredFor(type)}
                        className="w-4 h-4 text-gold rounded border-gray-300 focus:ring-gold" />
                      
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {t(type as any)}
                          </span>
                        </label>
                    )}
                    </div>
                    {licenseErrors.requiredFor && (
                      <p className="text-xs text-red-500 mt-2">{licenseErrors.requiredFor}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('requiredDocuments')}
                    </label>
                    <div className="flex flex-col gap-3 mb-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newDocumentName}
                          onChange={(e) => setNewDocumentName(e.target.value)}
                          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-navy dark:border-navy-light dark:bg-navy-card dark:text-cream-dark outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20"
                          placeholder={t('requiredDocuments' as any)}
                        />
                        <button
                          type="button"
                          onClick={addDocument}
                          className="rounded-2xl bg-gold px-4 py-3 text-sm font-medium text-white hover:bg-gold-dark transition-colors">
                          {t('add')}
                        </button>
                      </div>
                      {licenseErrors.documents && (
                        <p className="text-xs text-red-500">{licenseErrors.documents}</p>
                      )}
                    </div>
                    <div className="space-y-3">
                      {licenseForm.documents.map((doc) => (
                        <div
                          key={doc}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 dark:border-navy-light bg-gray-50 dark:bg-navy-card/50 px-4 py-3">
                          <label className="flex items-center gap-2 flex-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={licenseForm.selectedDocuments.includes(doc)}
                              onChange={() => toggleDocument(doc)}
                              className="w-4 h-4 text-gold rounded border-gray-300 focus:ring-gold" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">{doc}</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => removeDocument(doc)}
                            className="text-gray-400 hover:text-red-500 transition-colors">
                            <XIcon size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-navy-light flex justify-end gap-3 bg-gray-50 dark:bg-navy-card/50">
                <button
                onClick={() => {
                  setIsModalOpen(false);
                  setLicenseErrors({});
                }}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-light transition-colors">
                
                  {t('cancel')}
                </button>
                <button
                onClick={handleLicenseSave}
                className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gold hover:bg-gold-dark text-white shadow-md hover:shadow-lg transition-all duration-200">
                
                  {t('save')}
                </button>
              </div>
            </motion.div>
          </div>
        }
      </AnimatePresence>
    </div>);

};