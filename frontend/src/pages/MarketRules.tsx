import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import {
  PlusIcon,
  Edit2Icon,
  Trash2Icon,
  XIcon,
  ScaleIcon,
  ArrowRightIcon,
  ArrowLeftIcon } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface Rule {
  id: string;
  name: string;
  companyType: string;
  requirement: string;
  enabled: boolean;
}
export const MarketRules: React.FC = () => {
  const { t, language } = useAppContext();
  const isRtl = language === 'ar';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [ruleForm, setRuleForm] = useState({
    name: '',
    companyType: 'startup',
    requirement: '',
    enabled: true
  });
  const [ruleErrors, setRuleErrors] = useState<Record<string, string>>({});
  const [rules, setRules] = useState<Rule[]>([
  {
    id: '1',
    name: 'Startup Capital Requirement',
    companyType: 'startup',
    requirement: 'Minimum capital of $50,000',
    enabled: true
  },
  {
    id: '2',
    name: 'Tech Innovation License',
    companyType: 'real_estate',
    requirement: 'Tech Innovation Hub License',
    enabled: true
  },
  {
    id: '3',
    name: 'Industrial Safety Audit',
    companyType: 'industrial',
    requirement: 'Annual Safety Audit Certificate',
    enabled: true
  },
  {
    id: '4',
    name: 'Commercial Trade License',
    companyType: 'commercial',
    requirement: 'General Trade License',
    enabled: true
  },
  {
    id: '5',
    name: 'Startup Founder Visa',
    companyType: 'startup',
    requirement: 'Investor Visa for Founders',
    enabled: false
  },
  {
    id: '6',
    name: 'Industrial Environmental Clearance',
    companyType: 'industrial',
    requirement: 'Environmental Clearance Certificate',
    enabled: true
  }]
  );
  const companyTypes = ['startup', 'industrial', 'real_estate', 'commercial'];
  const handleOpenModal = (rule?: Rule) => {
    if (rule) {
      setEditingRule(rule);
      setRuleForm({
        name: rule.name,
        companyType: rule.companyType,
        requirement: rule.requirement,
        enabled: rule.enabled
      });
    } else {
      setEditingRule(null);
      setRuleForm({
        name: '',
        companyType: 'startup',
        requirement: '',
        enabled: true
      });
    }
    setRuleErrors({});
    setIsModalOpen(true);
  };
  const handleDelete = (id: string) => {
    if (confirm(t('deleteConfirmation' as any))) {
      setRules(rules.filter((r) => r.id !== id));
    }
  };
  const toggleRule = (id: string) => {
    setRules(
      rules.map((r) =>
      r.id === id ?
      {
        ...r,
        enabled: !r.enabled
      } :
      r
      )
    );
  };

  const handleRuleSave = () => {
    const errors: Record<string, string> = {};
    if (!ruleForm.name.trim()) errors.name = t('fieldRequired' as any);
    if (!ruleForm.requirement.trim()) errors.requirement = t('fieldRequired' as any);
    if (Object.keys(errors).length > 0) {
      setRuleErrors(errors);
      return;
    }

    if (editingRule) {
      setRules((prev) =>
        prev.map((rule) =>
          rule.id === editingRule.id ? { ...rule, ...ruleForm } : rule
        )
      );
      alert(t('ruleSaved' as any));
    } else {
      setRules((prev) => [
        ...prev,
        {
          id: String(prev.length + 1),
          ...ruleForm
        }
      ]);
      alert(t('ruleSaved' as any));
    }

    setIsModalOpen(false);
    setEditingRule(null);
    setRuleErrors({});
  };
  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy dark:text-cream-dark mb-2">
            {t('marketRules')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Configure conditional logic and requirements for market entry.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-gold hover:bg-gold-dark text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-medium">
          
          <PlusIcon size={18} />
          {t('addRule')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {companyTypes.map((type) => {
          const typeRules = rules.filter((r) => r.companyType === type);
          return (
            <motion.div
              key={type}
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              className="bg-white dark:bg-navy-card rounded-2xl shadow-sm overflow-hidden flex flex-col">
              
              <div className="p-6 border-b border-gray-100 dark:border-navy-light bg-gray-50/50 dark:bg-navy-light/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-navy/5 dark:bg-cream/5 flex items-center justify-center text-navy dark:text-cream-dark">
                  <ScaleIcon size={20} />
                </div>
                <h2 className="text-xl font-bold text-navy dark:text-cream-dark capitalize">
                  {t(type as any)}
                </h2>
              </div>

              <div className="p-6 flex-1 flex flex-col gap-4">
                {typeRules.length > 0 ?
                typeRules.map((rule) =>
                <div
                  key={rule.id}
                  className="flex items-start justify-between gap-4 p-4 rounded-xl border border-gray-100 dark:border-navy-light hover:border-gold/30 dark:hover:border-gold/30 transition-colors group">
                  
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-navy dark:text-cream-dark">
                            {rule.name}
                          </h3>
                          <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${rule.enabled ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                        
                            {rule.enabled ? t('active') : t('inactive')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-navy-light/20 p-2.5 rounded-lg">
                          <span className="font-medium text-navy dark:text-cream-dark">
                            {t('ifCompanyTypeIs')}
                          </span>
                          <span className="px-2 py-1 bg-white dark:bg-navy-card rounded border border-gray-200 dark:border-navy-light capitalize text-xs font-semibold">
                            {t(type as any)}
                          </span>
                          {isRtl ?
                      <ArrowLeftIcon size={14} className="text-gold" /> :

                      <ArrowRightIcon size={14} className="text-gold" />
                      }
                          <span className="font-medium text-navy dark:text-cream-dark">
                            {t('thenRequire')}
                          </span>
                          <span className="font-semibold text-gold">
                            {rule.requirement}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={rule.enabled}
                        onChange={() => toggleRule(rule.id)} />
                      
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gold"></div>
                        </label>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                        onClick={() => handleOpenModal(rule)}
                        className="p-1.5 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-md transition-colors">
                        
                            <Edit2Icon size={14} />
                          </button>
                          <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors">
                        
                            <Trash2Icon size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                ) :

                <div className="flex-1 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500 italic">
                    No rules configured for this company type.
                  </div>
                }
              </div>
            </motion.div>);

        })}
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
            className="bg-white dark:bg-navy-card rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            
              <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-navy-light">
                <h2 className="text-xl font-bold text-navy dark:text-cream-dark">
                  {editingRule ? t('edit') : t('addRule')}
                </h2>
                <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-light rounded-full transition-colors">
                
                  <XIcon size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('ruleName')}
                  </label>
                  <input
                  type="text"
                  value={ruleForm.name}
                  onChange={(e) => setRuleForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-light bg-transparent text-navy dark:text-cream-dark focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                  placeholder={t('ruleNamePlaceholder' as any)} />
                  {ruleErrors.name && (
                    <p className="text-xs text-red-500 mt-2">{ruleErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('companyType')}
                  </label>
                  <select
                  value={ruleForm.companyType}
                  onChange={(e) => setRuleForm((prev) => ({ ...prev, companyType: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-light bg-transparent text-navy dark:text-cream-dark focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors appearance-none capitalize">
                  
                    {companyTypes.map((type) =>
                  <option key={type} value={type}>
                        {t(type as any)}
                      </option>
                  )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('thenRequire')}
                  </label>
                  <input
                  type="text"
                  value={ruleForm.requirement}
                  onChange={(e) => setRuleForm((prev) => ({ ...prev, requirement: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-light bg-transparent text-navy dark:text-cream-dark focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                  placeholder={t('requirementPlaceholder' as any)} />
                  {ruleErrors.requirement && (
                    <p className="text-xs text-red-500 mt-2">{ruleErrors.requirement}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('enableRule')}
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={ruleForm.enabled}
                    onChange={(e) => setRuleForm((prev) => ({ ...prev, enabled: e.target.checked }))} />
                  
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gold"></div>
                  </label>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-navy-light flex justify-end gap-3 bg-gray-50 dark:bg-navy-card/50">
                <button
                onClick={() => {
                  setIsModalOpen(false);
                  setRuleErrors({});
                }}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-light transition-colors">
                
                  {t('cancel')}
                </button>
                <button
                onClick={handleRuleSave}
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