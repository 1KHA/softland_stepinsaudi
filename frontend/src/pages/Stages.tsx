import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import {
  PlusIcon,
  Edit2Icon,
  Trash2Icon,
  GripVerticalIcon,
  XIcon } from
'lucide-react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { API_URL } from "../config";
interface Stage {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  order: number;
  workflow_phase: string;
}
export const Stages: React.FC = () => {
const { t, language } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
const [formData, setFormData] = useState({
  name: '',
  name_ar: '',
  description: '',
  description_ar: '',
  workflow_phase: 'PROCESSING'
});
const [errors, setErrors] = useState<{
  name?: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  workflow_phase?: string;
}>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [stages, setStages] = useState<Stage[]>([]);
  const [deleteStage, setDeleteStage] = useState<Stage | null>(null);

useEffect(() => {
  fetch(`${API_URL}/stages`)
    .then((res) => res.json())
    .then((data) => {

const mappedStages = data.stages.map((stage: any) => ({
  id: String(stage.id),
  name: stage.name,
  name_ar: stage.name_ar || '',
  description: stage.description || '',
  description_ar: stage.description_ar || '',
  order: stage.stage_order,
  workflow_phase: stage.workflow_phase
}));
      setStages(mappedStages);
    })
    .catch((err) => {
      console.error('Error loading stages:', err);
    });
}, []);

  const handleOpenModal = (stage?: Stage) => {
    if (stage) {
      setSelectedStage(stage);
setFormData({
  name: stage.name,
  name_ar: (stage as any).name_ar || '',
  description: stage.description,
  description_ar: (stage as any).description_ar || '',
  workflow_phase: (stage as any).workflow_phase || 'PROCESSING'
});

    } else {
      setSelectedStage(null);
setFormData({
  name: '',
  name_ar: '',
  description: '',
  description_ar: '',
  workflow_phase: 'PROCESSING'
});
    }
    setErrors({});
    setIsModalOpen(true);
  };
  const handleFormChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSave = () => {
const newErrors: {
  name?: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
} = {};    

if (!formData.name.trim()) {
  newErrors.name = t('fieldRequired');
}

if (!formData.name_ar.trim()) {
  newErrors.name_ar = t('fieldRequired');
}

if (!formData.description.trim()) {
  newErrors.description = t('fieldRequired');
}

if (!formData.description_ar.trim()) {
  newErrors.description_ar = t('fieldRequired');
}

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

if (selectedStage) {

  fetch(`${API_URL}/stages/${selectedStage.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
body: JSON.stringify({
  name: formData.name,
  name_ar: formData.name_ar,
  description: formData.description,
  description_ar: formData.description_ar,
  workflow_phase: formData.workflow_phase
})
  })
.then((res) => res.json())
.then((data) => {

  if (!data.success) {

    setErrorMessage(data.message);

    setTimeout(() => {
      setErrorMessage('');
    }, 4000);

    throw new Error(data.message);
  }

  console.log('PUT RESPONSE', data);

  return fetch(`${API_URL}/stages`);

})
.then((res) => res.json())
.then((data) => {

const mappedStages = data.stages.map((stage: any) => ({
  id: String(stage.id),
  name: stage.name,
  name_ar: stage.name_ar || '',
  description: stage.description || '',
  description_ar: stage.description_ar || '',
  order: stage.stage_order,
  workflow_phase: stage.workflow_phase
}));

  setStages(mappedStages);

  setSuccessMessage(t('stageUpdatedSuccess'));

})
.catch((err) => {
  console.log('PUT ERROR', err);
});

} else {
    fetch(`${API_URL}/stages`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
body: JSON.stringify({
  name: formData.name,
  name_ar: formData.name_ar,
  description: formData.description,
  description_ar: formData.description_ar,
  workflow_phase: formData.workflow_phase
})
})
.then((res) => res.json())
.then((data) => {

  if (!data.success) {

    setErrorMessage(data.message);

    setTimeout(() => {
      setErrorMessage('');
    }, 4000);

    throw new Error(data.message);
  }

  return fetch(`${API_URL}/stages`);

})
  .then((res) => res.json())
  .then((data) => {

const mappedStages = data.stages.map((stage: any) => ({
  id: String(stage.id),
  name: stage.name,
  name_ar: stage.name_ar || '',
  description: stage.description || '',
  description_ar: stage.description_ar || '',
  order: stage.stage_order,
  workflow_phase: stage.workflow_phase
}));

    setStages(mappedStages);

    setSuccessMessage(t('stageCreatedSuccess'));
  });
    }
    setIsModalOpen(false);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

const handleDelete = (id: string) => {

  fetch(`${API_URL}/stages/${id}`, {
    method: 'DELETE'
  })
   .then((res) => res.json())
.then((data) => {

  if (!data.success) {

setErrorMessage(data.message);

setTimeout(() => {
  setErrorMessage('');
}, 4000);

throw new Error(data.message);  }

  return fetch(`${API_URL}/stages`);

})
    .then((res) => res.json())
    .then((data) => {

const mappedStages = data.stages.map((stage: any) => ({
  id: String(stage.id),
  name: stage.name,
  name_ar: stage.name_ar || '',
  description: stage.description || '',
  description_ar: stage.description_ar || '',
  order: stage.stage_order,
  workflow_phase: stage.workflow_phase
}));

      setStages(mappedStages);
      setSuccessMessage(t('stageDeletedSuccess'));

setTimeout(() => {
  setSuccessMessage('');
}, 3000);

    })
    .catch((err) => {
      console.log('DELETE ERROR:', err);
    });

};
  return (
    <div className="space-y-8 pb-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy dark:text-cream-dark mb-2">
            {t('stages')}
          </h1>
<p className="text-gray-500 dark:text-gray-400">
  {t("stagesDescription" as any)}
</p>
          {successMessage ? (
            
            <div className="mt-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800/30 dark:bg-green-900/20 dark:text-green-200">
              {successMessage}
            </div>
          ) : null}
        </div>
        {errorMessage ? (
  <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
    {errorMessage}
  </div>
) : null}
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-gold hover:bg-gold-dark text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-medium">
          
          <PlusIcon size={18} />
          {t('addStage')}
        </button>
      </div>

      <div className="bg-white dark:bg-navy-card rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6 pb-4 border-b border-gray-100 dark:border-navy-light">
          <GripVerticalIcon size={16} />
          <span>{t('dragToReorder')}</span>
        </div>

        <Reorder.Group
          axis="y"
          values={stages}
onReorder={(newOrder) => {

  setStages(newOrder);

  fetch(`${API_URL}/stages/reorder`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      stages: newOrder
    })
  })
    .then((res) => res.json())
    .then((data) => {

  console.log('ORDER SAVED', data);

setSuccessMessage(t('stageOrderSavedSuccess'));
  setTimeout(() => {
    setSuccessMessage('');
  }, 3000);

})
    .catch((err) => {
      console.log('ORDER ERROR', err);
    });

}}
          className="space-y-4">
          
          {stages.map((stage, index) =>
          <Reorder.Item
            key={stage.id}
            value={stage}
            className="bg-gray-50 dark:bg-navy-light/10 border border-gray-100 dark:border-navy-light rounded-xl p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing hover:border-gold/30 dark:hover:border-gold/30 transition-colors group">
            
              <div className="text-gray-400 hover:text-navy dark:hover:text-cream-dark transition-colors">
                <GripVerticalIcon size={20} />
              </div>

              <div className="w-10 h-10 rounded-lg bg-navy/5 dark:bg-cream/5 flex items-center justify-center text-navy dark:text-cream-dark flex-shrink-0 font-bold">
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
<h3 className="text-lg font-semibold text-navy dark:text-cream-dark mb-1">
  {language === "ar" && stage.name_ar
    ? stage.name_ar
    : stage.name}
</h3>

<p className="text-sm text-gray-500 dark:text-gray-400 truncate">
  {language === "ar" && stage.description_ar
    ? stage.description_ar
    : stage.description}
</p>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal(stage);
                }}
                className="p-2 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors">
                
                  <Edit2Icon size={18} />
                </button>
                <button
                onClick={(e) => {
                  e.stopPropagation();
setDeleteStage(stage);                }}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                
                  <Trash2Icon size={18} />
                </button>
              </div>
            </Reorder.Item>
          )}
        </Reorder.Group>
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
                  {selectedStage ? t('edit') : t('addStage')}
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
                    {t('stageName')}
                  </label>
                  <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-navy dark:text-cream-dark focus:outline-none focus:ring-1 transition-colors ${errors.name ? 'border-red-300 bg-red-50/40 text-red-700 focus:border-red-500 focus:ring-red-200 dark:border-red-500/50' : 'border-gray-200 dark:border-navy-light focus:border-gold focus:ring-gold'}`}
                  placeholder={t("stagePlaceholder")} />
                  {errors.name ? (
                    <span className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.name}</span>
                  ) : null}
                </div>

                <div>
<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
  {t("stageNameArabic" as any)}
</label>

  <input
    type="text"
    value={formData.name_ar}
    onChange={(e) => handleFormChange("name_ar", e.target.value)}
    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-light bg-transparent text-navy dark:text-cream-dark"
    placeholder={t("stageArabicPlaceholder" as any)}
  />
  {errors.name_ar ? (
  <span className="text-xs text-red-600 dark:text-red-400 mt-1">
    {errors.name_ar}
  </span>
) : null}
</div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('description')}
                  </label>
                  <textarea
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-navy dark:text-cream-dark focus:outline-none focus:ring-1 transition-colors resize-none ${errors.description ? 'border-red-300 bg-red-50/40 text-red-700 focus:border-red-500 focus:ring-red-200 dark:border-red-500/50' : 'border-gray-200 dark:border-navy-light focus:border-gold focus:ring-gold'}`}
                  placeholder={t("stageDescriptionPlaceholder")} />
                  {errors.description ? (
                    <span className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.description}</span>
                  ) : null}
                </div>
                <div>

                  <div>
<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
  {t("descriptionArabic" as any)}
</label>

  <textarea
    value={formData.description_ar}
    onChange={(e) =>
      handleFormChange("description_ar", e.target.value)
    }
    rows={4}
    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-light bg-transparent text-navy dark:text-cream-dark resize-none"
placeholder={t("stageArabicDescriptionPlaceholder" as any)}
  />

  {errors.description_ar ? (
  <span className="text-xs text-red-600 dark:text-red-400 mt-1">
    {errors.description_ar}
  </span>
) : null}
</div>

<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
  {t("workflowPhase")}
</label>

  <select
    value={formData.workflow_phase}
    onChange={(e) =>
      handleFormChange("workflow_phase", e.target.value)
    }
    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-light"
  >
<option value="REGISTRATION">{t("registrationPhase")}</option>
<option value="UNDER_REVIEW">{t("underReviewPhase")}</option>
<option value="PROCESSING">{t("processingPhase")}</option>
<option value="FINAL_APPROVAL">{t("finalApprovalPhase")}</option>
  </select>
</div>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-navy-light flex justify-end gap-3 bg-gray-50 dark:bg-navy-card/50">
                <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-light transition-colors">
                
                  {t('cancel')}
                </button>
                <button
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gold hover:bg-gold-dark text-white shadow-md hover:shadow-lg transition-all duration-200">
                
                  {t('save')}
                </button>
              </div>
            </motion.div>
          </div>
        }
        {deleteStage && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">

<h3 className="text-lg font-bold mb-3">
  {t("deleteConfirmationTitle" as any)}
</h3>

<p className="text-gray-600 mb-6">
  {t("deleteConfirmationMessage" as any)}
</p>
<div className="flex justify-end gap-3">

  <button
    onClick={() => setDeleteStage(null)}
    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
  >
    {t("cancel")}
  </button>

  <button
    onClick={() => {
      handleDelete(deleteStage.id);
      setDeleteStage(null);
    }}
    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
  >
    {t("delete")}
  </button>

</div>
    </div>
  </div>
)}
      </AnimatePresence>
    </div>);

};