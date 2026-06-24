import React, { useState } from 'react';
import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { PlusIcon, Edit2Icon, Trash2Icon, XCircleIcon } from 'lucide-react';
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  status: 'active' | 'inactive';
  company?: string;
  company_id?: string | number;
  avatar?: string;
  companyName?: string;
  companyAddress?: string;
  sector?: string;
  companyEmail?: string;
  managerPhoneNumber?: string;
}
type Role = 'admin' | 'manager' | 'employee';
interface UserForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
  status: 'active' | 'inactive';
  companyName: string;
  companyId: string;
  companyAddress: string;
  sector: string;
  companyEmail: string;
  managerPhoneNumber: string;
}

const defaultFormState: UserForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'admin',
  status: 'active',
  companyName: '',
  companyId: '',
  companyAddress: '',
  sector: '',
  companyEmail: '',
  managerPhoneNumber: ''
};

const FormField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
}> = ({ label, value, onChange, type = 'text', placeholder, error }) => (
  <label className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
    <span className="font-medium">{label}</span>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      type={type}
      placeholder={placeholder}
      className={`w-full rounded-2xl border px-4 py-3 text-sm text-navy dark:bg-navy-card dark:text-cream-dark outline-none transition-colors focus:ring-2 ${error ? 'border-red-300 bg-red-50/40 text-red-700 focus:border-red-500 focus:ring-red-200 dark:border-red-500/50' : 'border-gray-200 bg-white focus:border-gold focus:ring-gold/20 dark:border-navy-light'}`}
    />
    {error ? (
      <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
    ) : null}
  </label>
);

const SelectField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  error?: string;
}> = ({ label, value, onChange, options, error }) => (
  <label className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
    <span className="font-medium">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`w-full rounded-2xl border px-4 py-3 text-sm text-navy dark:bg-navy-card dark:text-cream-dark outline-none transition-colors focus:ring-2 ${error ? 'border-red-300 bg-red-50/40 text-red-700 focus:border-red-500 focus:ring-red-200 dark:border-red-500/50' : 'border-gray-200 bg-white focus:border-gold focus:ring-gold/20 dark:border-navy-light'}`}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error ? (
      <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
    ) : null}
  </label>
);

export const Users: React.FC = () => {
  const { t } = useAppContext();
  const currentUser = JSON.parse(
  localStorage.getItem('user') || '{}'
);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [formState, setFormState] = useState<UserForm>(defaultFormState);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof UserForm, string>>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [users, setUsers] = useState<User[]>([]); 
  const [companies, setCompanies] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

useEffect(() => {

  fetchUsers();
  fetchCompanies();

}, []);

const fetchUsers = async () => {

  try {

    const token = localStorage.getItem('token');

    const response = await fetch(
      'https://soft-landing-platform.onrender.com/auth/users',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

const mappedUsers = data.users
  .filter((user: any) => user.role !== 'EMPLOYEE') // إخفاء الموظفين
  .map((user: any) => ({
    ...user,

    company_id: user.company_id,

    role:
      user.role === 'ADMIN'
        ? 'admin'
        : 'manager',

    status: String(user.status || 'ACTIVE').toLowerCase()
  }));



setUsers(mappedUsers);

  } catch (error) {

 

  }

};
const fetchCompanies = async () => {

  try {

    const token = localStorage.getItem('token');

    const response = await fetch(
      'https://soft-landing-platform.onrender.com/auth/companies',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    setCompanies(data.companies || []);

  } catch (error) {

    console.error(error);

  }

};

const toggleStatus = async (
  id: string,
  currentStatus: string
) => {
  console.log(id, currentStatus);
  try {
    const token = localStorage.getItem('token');

    const newStatus =
      currentStatus === 'active'
        ? 'INACTIVE'
        : 'ACTIVE';

    const response = await fetch(
      `https://soft-landing-platform.onrender.com/auth/users/${id}/status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update status');
    }

    await fetchUsers();
  } catch (error) {
    console.error(error);
  }
};

  const openAddUserModal = () => {
    setIsEditMode(false);
    setSelectedUserId(null);
    setFormState(defaultFormState);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditUserModal = (user: User) => {
    setIsEditMode(true);
    setSelectedUserId(user.id);
    setFormState({
      name: user.name,
      email: user.email,
      password: '',
      confirmPassword: '',
      role: user.role,
      status: user.status ?? 'active',
      companyName: user.companyName ?? user.company ?? '',
      companyId: String(user.company_id ?? ''),
      companyAddress: user.companyAddress ?? '',
      sector: user.sector ?? '',
      companyEmail: user.companyEmail ?? '',
      managerPhoneNumber: user.managerPhoneNumber ?? ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
    setIsEditMode(false);
    setFormState(defaultFormState);
    setFormErrors({});
  };

  const handleFormChange = (field: keyof UserForm, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value
    }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleUserSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors: Partial<Record<keyof UserForm, string>> = {};

    if (!formState.name.trim()) {
      errors.name = t('fieldRequired');
    }

    if (!formState.email.trim()) {
      errors.email = t('fieldRequired');
    }

    if (!formState.role) {
      errors.role = t('fieldRequired');
    }

    if (!formState.status) {
      errors.status = t('fieldRequired');
    }

    const passwordRequired =
      !isEditMode ||
      formState.password ||
      formState.confirmPassword;

    if (passwordRequired) {
      if (!formState.password) {
        errors.password = t('fieldRequired');
      }

      if (!formState.confirmPassword) {
        errors.confirmPassword = t('fieldRequired');
      }

      if (
        formState.password &&
        formState.confirmPassword &&
        formState.password !== formState.confirmPassword
      ) {
        errors.confirmPassword = t('passwordMismatch');
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const token = localStorage.getItem('token') ?? '';

      if (isEditMode) {
        if (!selectedUserId) {
          throw new Error('Missing user id for update');
        }

        const response = await fetch(
          `https://soft-landing-platform.onrender.com/auth/users/${selectedUserId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
body: JSON.stringify({
  name: formState.name,
  email: formState.email,
  password: formState.password,
  company_id: Number(formState.companyId),
  status: formState.status.toUpperCase()
})
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to update user');
        }

        setSuccessMessage(t('userUpdatedSuccess'));

        await fetchUsers();
        closeModal();

        window.setTimeout(() => {
          setSuccessMessage('');
        }, 4000);

        return;
      }

let backendRole = 'ADMIN';
      if (formState.role === 'admin') {
        backendRole = 'ADMIN';
      }

      if (formState.role === 'manager') {
        backendRole = 'CLIENT';
      }

      let data: any;

      if (backendRole === 'ADMIN') {
        const response = await fetch(
          'https://soft-landing-platform.onrender.com/auth/create-admin',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: formState.name,
              email: formState.email,
              password: formState.password
            })
          }
        );

        data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to create admin');
        }
      }
      await fetchUsers();

      setSuccessMessage(t('userCreatedSuccess'));
      closeModal();

      window.setTimeout(() => {
        setSuccessMessage('');
      }, 4000);
    } catch (error) {
      console.error(error);
    alert(t('errorSavingUser'));
    }
  };

// هنا ينحذف المستخدم من النظام
  const handleDeleteUser = async (id: string) => {

  try {

    const token = localStorage.getItem('token');

    await fetch(
      `https://soft-landing-platform.onrender.com/auth/users/${id}`,
      {
        method: 'DELETE',

        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setUsers((prev) =>
      prev.filter((user) => user.id !== id)
    );
    setDeleteUserId(null);

setSuccessMessage(t('userDeletedSuccess'));

setTimeout(() => {
  setSuccessMessage("");
}, 4000);

  } catch (error) {

    console.error(error);

  }

};

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'manager':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'employee':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

const filteredUsers = users.filter((user) => {

  const matchesSearch =
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesRole =
    roleFilter === 'all' ||
    user.role === roleFilter;

  return matchesSearch && matchesRole;

});

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy dark:text-cream-dark mb-2">
            {t('users')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t("usersDescription")}
          </p>
          {successMessage ? (
            <div className="mt-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800/30 dark:bg-green-900/20 dark:text-green-200">
              {successMessage}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={openAddUserModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gold hover:bg-gold-dark text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-medium">
          <PlusIcon size={18} />
          {t('add')} {t('users')}
        </button>
      </div>

<div className="mb-4">
  <input
    type="text"
    placeholder={t("searchUsers")}
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full rounded-xl border border-gray-200 px-4 py-3"
  />
</div>

<div className="flex gap-3 mb-4">

  <button
    type="button"
    onClick={() => setRoleFilter('all')}
    className={`px-4 py-2 rounded-xl ${
      roleFilter === 'all'
        ? 'bg-navy text-white'
        : 'bg-gray-100'
    }`}
  >
  {t("all")}
  </button>

  <button
    type="button"
    onClick={() => setRoleFilter('admin')}
    className={`px-4 py-2 rounded-xl ${
      roleFilter === 'admin'
        ? 'bg-navy text-white'
        : 'bg-gray-100'
    }`}
  >
   {t("admin")}
  </button>

  <button
    type="button"
    onClick={() => setRoleFilter('manager')}
    className={`px-4 py-2 rounded-xl ${
      roleFilter === 'manager'
        ? 'bg-navy text-white'
        : 'bg-gray-100'
    }`}
  >
   {t("manager")}
  </button>

</div>

      <div className="bg-white dark:bg-navy-card rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-navy-light/20 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-navy-light">
                <th className="px-6 py-4 font-medium">{t('name')}</th>
                <th className="px-6 py-4 font-medium">{t('role')}</th>
                <th className="px-6 py-4 font-medium">{t('company')}</th>
                <th className="px-6 py-4 font-medium">{t('status')}</th>
                <th className="px-6 py-4 font-medium text-center">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-navy-light text-sm">
              {filteredUsers.map((user) =>
              <tr
                key={user.id}
                className={`hover:bg-gray-50/50 dark:hover:bg-navy-light/10 transition-colors ${user.status?.toLowerCase() === 'inactive' ? 'opacity-60' : ''}`}>
                
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-navy/10 dark:bg-cream/10 flex items-center justify-center text-navy dark:text-cream-dark font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-navy dark:text-cream-dark">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    
                    {user.role === "admin"
  ? t("admin")
  : user.role === "manager"
  ? t("manager")
  : t("employee")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {user.company}
                  </td>
                  <td className="px-6 py-4">
                    <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${user.status?.toLowerCase() === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    
                     {user.status === "active"
  ? t("active")
  : t("inactive")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <label
                      className="relative inline-flex items-center cursor-pointer"
                 title={
  user.status?.toLowerCase() === 'active'
    ? t('disableUser')
    : t('enableUser')
}>
                      
                        <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={
  user.status?.toLowerCase() === 'active'
}
onChange={() => {

  if (user.id === currentUser.id) {
alert(t("cannotDisableSelf"));
    return;
  }

  toggleStatus(
    user.id,
    user.status
  );

}}
/>
                      
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
                      </label>
                      <button
                        type="button"
                        onClick={() => openEditUserModal(user)}
                        className="p-1.5 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-md transition-colors"
                        title="Edit User">
                        <Edit2Icon size={16} />
                      </button>
                      <button
                        type="button"
onClick={() => {
  if (user.id === currentUser.id) {
    alert(t("cannotDeleteSelf"));
    return;
  }

  setDeleteUserId(user.id);
}}      
               className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-md transition-colors"
                        title="Delete User">
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

      {deleteUserId && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white dark:bg-navy-card rounded-2xl p-6 w-[420px] shadow-xl">
      <h2 className="text-xl font-bold mb-3">
        {t("deleteUser")}
      </h2>

      <p className="mb-6 text-gray-600 dark:text-gray-300">
      {t("deleteUserConfirmation")}
      </p>

      <div className="flex justify-end gap-3">
<button
  onClick={() => setDeleteUserId(null)}
  className="px-4 py-2 border rounded-xl"
>
  {t("cancel")}
</button>

<button
  onClick={() => handleDeleteUser(deleteUserId)}
  className="px-4 py-2 bg-red-600 text-white rounded-xl"
>
  {t("delete")}
</button>
      </div>
    </div>
  </div>
)}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all duration-200 ease-out">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-navy-card border border-gray-200 dark:border-navy-light shadow-2xl overflow-hidden transform transition-transform duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-navy-light p-6">
              <div>
                <h2 className="text-2xl font-semibold text-navy dark:text-cream-dark">
                 {isEditMode ? t("editUser") : t("addUser")}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {isEditMode
  ? t("updateUserDetails")
  : t("createNewUser")}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-2 text-gray-400 hover:text-navy dark:hover:text-cream-dark transition-colors">
                <XCircleIcon size={20} />
              </button>
            </div>
            <form onSubmit={handleUserSubmit} className="space-y-6 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label={t('name')}
                  value={formState.name}
                  onChange={(value) => handleFormChange('name', value)}
                  placeholder={t("enterName")}
                  error={formErrors.name}
                />
                <FormField
                  label={t('email')}
                  value={formState.email}
                  onChange={(value) => handleFormChange('email', value)}
                  type="email"
                  placeholder={t("enterEmail")}
                  error={formErrors.email}
                />
                <FormField
                  label={t('password')}
                  value={formState.password}
                  onChange={(value) => handleFormChange('password', value)}
                  type="password"
                  placeholder={t("enterPassword")}
                  error={formErrors.password}
                />
                <FormField
                  label={t('confirmPassword')}
                  value={formState.confirmPassword}
                  onChange={(value) => handleFormChange('confirmPassword', value)}
                  type="password"
                  placeholder={t('confirmPassword')}
                  error={formErrors.confirmPassword}
                />
                <SelectField
                  label={t('role')}
                  value={formState.role}
                  onChange={(value) => handleFormChange('role', value as Role)}
                 options={[
  { value: 'admin', label: t('admin') }
]}
                  error={formErrors.role}
                />

                <SelectField
                  label={t('status')}
                  value={formState.status}
                  onChange={(value) => handleFormChange('status', value as 'active' | 'inactive')}
                  options={[
                    { value: 'active', label: t('active') },
                    { value: 'inactive', label: t('inactive') }
                  ]}
                  error={formErrors.status}
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-navy-light">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-600 dark:border-navy-light dark:bg-navy-card dark:text-gray-300 hover:bg-gray-50 transition-colors">
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-gold px-5 py-3 text-sm font-medium text-white hover:bg-gold-dark transition-colors">
                  {isEditMode
  ? t("saveChanges")
  : t("createUser")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>);
  

};