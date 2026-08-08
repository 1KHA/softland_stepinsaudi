import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import {
  PlusIcon,
  Edit2Icon,
  Trash2Icon,
  XCircleIcon
} from 'lucide-react';

import { API_URL } from "../config";
import { authHeaders } from "../lib/session";
interface Task {
  id: number;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  stage_id: number;
  sector_id: number | null;
  task_type: 'file' | 'license';
  is_global: number;
  required: number;
  stage_name: string;
stage_name_ar?: string;

sector_name: string;
sector_name_ar?: string;
}

interface Stage {
  id: number;
  name: string;
  name_ar?: string;
}

interface Sector {
  id: number;
  name_en: string;
  name_ar?: string;
}

export const TasksLicenses: React.FC = () => {

const { t, language } = useAppContext();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);

  const [loading, setLoading] = useState(true);
const [successMessage, setSuccessMessage] = useState('');
const [errorMessage, setErrorMessage] = useState('');

const [formErrors, setFormErrors] = useState<{
  title?: string;
  stage_id?: string;
}>({});

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingTask, setEditingTask] =
    useState<Task | null>(null);

const [formData, setFormData] = useState<{
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  stage_id: string;
  sector_id: string;
  task_type: 'file' | 'license';
  is_global: number;
  required: number;
  documents: string[];
}>({
  title: '',
  title_ar: '',
  description: '',
  description_ar: '',
  stage_id: '',
  // Sector 5 ("All Sectors") is a real row and the backend's all-sectors
  // sentinel. The previous 'all' value matched no <option> in the select.
  sector_id: '5',
  task_type: 'file',
  is_global: 1,
  required: 1,
  documents: []
});

const [newDocument, setNewDocument] =
  useState('');

// Fallback text for server failures that come back without a message.
const genericError =
  language === 'ar'
    ? 'تعذّر إتمام العملية. حاول مرة أخرى.'
    : 'The operation could not be completed. Please try again.';

const showError = (message: string) => {

  setSuccessMessage('');
  setErrorMessage(message);

  setTimeout(() => {
    setErrorMessage('');
  }, 6000);

};

// Pull the server's own message off a failed response so the banner explains
// what actually went wrong instead of claiming success.
const readErrorMessage = async (res: Response) => {

  try {
    const body = await res.json();
    return body?.message || body?.error || genericError;
  } catch {
    return genericError;
  }

};

  const loadData = async () => {

    try {

      const [tasksRes, stagesRes, sectorsRes] =
        await Promise.all([
          fetch(`${API_URL}/tasks`, {
            headers: {
              ...authHeaders()
            }
          }),
          fetch(`${API_URL}/stages`, {
            headers: {
              ...authHeaders()
            }
          }),
          fetch(`${API_URL}/sectors`, {
            headers: {
              ...authHeaders()
            }
          })
        ]);

      const tasksData = await tasksRes.json();
      const stagesData = await stagesRes.json();
      const sectorsData = await sectorsRes.json();

      setTasks(tasksData.tasks || []);
      setStages(stagesData.stages || []);
      setSectors(sectorsData.sectors || []);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: number) => {

    try {

      const res = await fetch(
        `${API_URL}/tasks/${id}`,
        {
          method: 'DELETE',
          headers: {
            ...authHeaders()
          }
        }
      );

      if (!res.ok) {
        showError(await readErrorMessage(res));
        return;
      }

      loadData();
setSuccessMessage(t("taskDeleted"));

setTimeout(() => {
  setSuccessMessage('');
}, 3000);
    } catch (error) {

      console.log(error);
      showError(genericError);

    }

  };

  const closeModal = () => {

    setIsModalOpen(false);
    setFormErrors({});
    setErrorMessage('');
    setNewDocument('');

  };

  // Esc closes the drawer — previously the only exits were Cancel and Save,
  // both of which could render off-screen.
  useEffect(() => {

    if (!isModalOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };

  }, [isModalOpen]);

  const openAddModal = () => {

    setEditingTask(null);
    setFormErrors({});
    setErrorMessage('');

setFormData({
  title: '',
  title_ar: '',
  description: '',
  description_ar: '',
  stage_id: '',
  sector_id: '5',
  task_type: 'file',
  is_global: 1,
  required: 1,
  documents: []
});

    setIsModalOpen(true);

  };

  const openEditModal = (task: Task) => {

    setEditingTask(task);
    setFormErrors({});
    setErrorMessage('');

setFormData({
  title: task.title,
  title_ar: (task as any).title_ar || '',
  description: task.description,
  description_ar: (task as any).description_ar || '',
  stage_id: String(task.stage_id),
  sector_id: task.sector_id
    ? String(task.sector_id)
    : '5',
  task_type: task.task_type,
  is_global: task.is_global,
  required: task.required,
  documents: []
});

    setIsModalOpen(true);

  };


  const handleSave = async () => {

  // Required fields. stage_id defaults to '' and the select has an empty
  // placeholder option, so an empty stage was submittable and produced a
  // foreign-key 500 on the server.
  const errors: { title?: string; stage_id?: string } = {};

  if (!formData.title.trim()) {
    errors.title = t('fieldRequired');
  }

  if (!formData.stage_id) {
    errors.stage_id = t('fieldRequired');
  }

  setFormErrors(errors);

  if (Object.keys(errors).length > 0) {
    return;
  }

  try {

const payload = {
  title: formData.title,
  title_ar: formData.title_ar,
  description: formData.description,
  description_ar: formData.description_ar,
  stage_id: Number(formData.stage_id),

  sector_id: Number(formData.sector_id),

  task_type: formData.task_type, // ✅ أضفه هنا

  // Sector 5 is "All Sectors".
  is_global:
    formData.sector_id === '5'
      ? 1
      : 0,

  required: formData.required,

  documents: formData.documents
};

    if (editingTask) {

      const res = await fetch(
        `${API_URL}/tasks/${editingTask.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders()
          },
          body: JSON.stringify(payload)
        }
      );

      if (!res.ok) {
        showError(await readErrorMessage(res));
        return;
      }

setSuccessMessage(t("taskUpdated"));

setTimeout(() => {
  setSuccessMessage('');
}, 3000);
    } else {

      const res = await fetch(
        `${API_URL}/tasks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders()
          },
          body: JSON.stringify(payload)
        }
      );

      if (!res.ok) {
        showError(await readErrorMessage(res));
        return;
      }

setSuccessMessage(t("taskAdded"));

setTimeout(() => {
  setSuccessMessage('');
}, 3000);
    }

    closeModal();

    loadData();
  } catch (error) {

    console.log(error);
    showError(genericError);

  }

};

  return (

    <div className="space-y-8 pb-8">

      <div className="flex justify-between items-center">

        <div>

<h1>{t("tasksLicenses")}</h1>
<p>
  {language === "ar"
    ? "إدارة المهام والملفات والتراخيص"
    : "Manage onboarding files and licenses"}
</p>

{successMessage && (
  <div className="mt-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
    {successMessage}
  </div>
)}

{errorMessage && !isModalOpen && (
  <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
    {errorMessage}
  </div>
)}
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gold text-white rounded-xl">

          <PlusIcon size={18} />

{t("addTask")}

        </button>

      </div>

      <div className="bg-white dark:bg-navy-card rounded-2xl shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b">

                <th className="p-4 text-left">
                  {t("title")}
                </th>

                <th className="p-4 text-left">
                  {t("licenseType")}
                </th>

                <th className="p-4 text-left">
                  {t("stage")}
                </th>

                <th className="p-4 text-left">
                  {t("sector")}
                </th>

                <th className="p-4 text-left">
                  {t("scope")}
                </th>

                <th className="p-4 text-center">
                  {t("actions")}
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan={6}
                    className="p-8 text-center">

                    Loading...

                  </td>

                </tr>

              ) : (

                tasks.map((task) => (

                  <tr
                    key={task.id}
                    className="border-b">

                    <td className="p-4">

                      <div>

<div className="font-semibold">
  {language === "ar"
    ? (task.title_ar || task.title)
    : task.title}
</div>

<div className="text-sm text-gray-500">
  {language === "ar"
    ? (task.description_ar || task.description)
    : task.description}
</div>

                      </div>

                    </td>

                    <td className="p-4">

                     {task.task_type === "file"
  ? t("file")
  : t("license")}

                    </td>
<td className="p-4">
  {language === "ar"
    ? (task.stage_name_ar || task.stage_name)
    : task.stage_name}
</td>

<td className="p-4">
  {language === "ar"
    ? (task.sector_name_ar || task.sector_name)
    : (task.sector_name || "-")}
</td>

                    <td className="p-4">

                      {task.is_global
  ? t("allSectors")
  : language === "ar"
    ? "قطاع محدد"
    : "Sector Specific"}

                    </td>

                    <td className="p-4">

                      <div className="flex justify-center gap-2">

                        <button
                          onClick={() =>
                            openEditModal(task)
                          }>

                          <Edit2Icon size={18} />

                        </button>

                        <button
                          onClick={() =>
                            handleDelete(task.id)
                          }>

                          <Trash2Icon size={18} />

                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

</div>

      {isModalOpen && (

        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={closeModal}>

          {/* Flex column with a scrollable body and a pinned footer: the card
              used to have no max-height inside an `h-screen overflow-hidden`
              shell, so Save and Cancel rendered off-screen. */}
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}>

            <div className="flex items-start justify-between gap-4 p-6 pb-4">

              <h2 className="text-2xl font-bold">

               {t(editingTask ? 'editTask' : 'addTask')}

              </h2>

              <button
                type="button"
                onClick={closeModal}
                aria-label={t('cancel')}
                className="rounded-full p-2 text-gray-400 hover:text-navy dark:hover:text-cream-dark transition-colors">

                <XCircleIcon size={20} />

              </button>

            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">

{errorMessage && (
  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
    {errorMessage}
  </div>
)}


              <div>

                <input
                  type="text"
                  placeholder={t('title')}
                  value={formData.title}
                  onChange={(e) => {
                    setFormErrors((prev) => ({
                      ...prev,
                      title: undefined
                    }));
                    setFormData({
                      ...formData,
                      title: e.target.value
                    });
                  }}
                  className={`w-full border rounded-xl px-4 py-3 ${formErrors.title ? 'border-red-400' : ''}`}
                />

                {formErrors.title && (
                  <span className="mt-1 block text-xs text-red-600">
                    {formErrors.title}
                  </span>
                )}

              </div>

              <input
  type="text"
  placeholder={t('titleArabic')}
  value={formData.title_ar}
  onChange={(e) =>
    setFormData({
      ...formData,
      title_ar: e.target.value
    })
  }
  className="w-full border rounded-xl px-4 py-3"
/>

              <textarea
                placeholder={t('description')}
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value
                  })
                }
                className="w-full border rounded-xl px-4 py-3"
              />

<textarea
  placeholder={t('descriptionArabic')}
  value={formData.description_ar}
  onChange={(e) =>
    setFormData({
      ...formData,
      description_ar: e.target.value
    })
  }
  className="w-full border rounded-xl px-4 py-3"
/>
              <select
                value={formData.task_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    task_type: e.target.value as 'file' | 'license',
                    is_global:
                      e.target.value === 'file'
                        ? 1
                        : 0
                  })
                }
                className="w-full border rounded-xl px-4 py-3">

<option value="file">
  {t('file')}
</option>

<option value="license">
  {t('license')}
</option>

              </select>

              <div>

                <select
                  value={formData.stage_id}
                  onChange={(e) => {
                    setFormErrors((prev) => ({
                      ...prev,
                      stage_id: undefined
                    }));
                    setFormData({
                      ...formData,
                      stage_id: e.target.value
                    });
                  }}
                  className={`w-full border rounded-xl px-4 py-3 ${formErrors.stage_id ? 'border-red-400' : ''}`}>

                  <option value="">
                    {t('selectStage')}
                  </option>

                  {stages.map((stage) => (

                    <option
                      key={stage.id}
                      value={stage.id}>

                      {language === 'ar'
    ? (stage as any).name_ar
    : stage.name}

                    </option>

                  ))}

                </select>

                {formErrors.stage_id && (
                  <span className="mt-1 block text-xs text-red-600">
                    {formErrors.stage_id}
                  </span>
                )}

              </div>

              <select
  value={formData.sector_id}
  onChange={(e) =>
    setFormData({
      ...formData,
      sector_id: e.target.value
    })
  }
  className="w-full border rounded-xl px-4 py-3">

  {sectors.map((sector) => (

    <option
      key={sector.id}
      value={sector.id}>

      {language === 'ar'
  ? (sector as any).name_ar
  : sector.name_en}

    </option>

  ))}

</select>

{formData.task_type === 'license' && (

  <div>

    <label className="font-medium mb-2 block">
      {language === 'ar'
  ? 'المستندات المطلوبة'
  : 'Required Documents'}
    </label>

    <div className="flex gap-2 mb-3">

      <input
        type="text"
        value={newDocument}
        onChange={(e) =>
          setNewDocument(e.target.value)
        }
placeholder={
  language === 'ar'
    ? 'اسم المستند'
    : 'Document name'
}
        className="flex-1 border rounded-xl px-4 py-2"
      />

      <button
        type="button"
        onClick={() => {

          if (!newDocument.trim())
            return;

          setFormData({
            ...formData,
            documents: [
              ...formData.documents,
              newDocument
            ]
          });

          setNewDocument('');

        }}
        className="px-4 py-2 bg-gold text-white rounded-xl">

{language === 'ar' ? 'إضافة' : 'Add'}
      </button>

    </div>

    <div className="space-y-2">

      {formData.documents.map((doc, index) => (

        <div
          key={index}
          className="flex justify-between border rounded-xl px-3 py-2">

          <span>{doc}</span>

          <button
            type="button"
            onClick={() => {

              setFormData({
                ...formData,
                documents:
                  formData.documents.filter(
                    (_, i) => i !== index
                  )
              });

            }}>

            ❌

          </button>

        </div>

      ))}

    </div>

  </div>

)}

              <label className="flex items-center gap-2">

                <input
                  type="checkbox"
                  checked={formData.required === 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      required:
                        e.target.checked
                          ? 1
                          : 0
                    })
                  }
                />

                {t('required')}

              </label>

            </div>

            <div className="flex justify-end gap-3 p-6 pt-4 border-t">

              <button
                onClick={closeModal}
                className="px-5 py-2 rounded-xl border">

{t('cancel')}
              </button>

              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-gold text-white">

{t('save')}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};

export default TasksLicenses;