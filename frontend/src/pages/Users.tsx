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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [formState, setFormState] = useState<UserForm>(defaultFormState);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof UserForm, string>>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [users, setUsers] = useState<User[]>([]); 

  useEffect(() => {

  fetchUsers();

}, []);

const fetchUsers = async () => {

  try {

    const token = localStorage.getItem('token');

    const response = await fetch(
      'http://localhost:3000/auth/users',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();


setUsers(
  data.users.map((user: any) => ({

    ...user,

    role:
      user.role === 'ADMIN'
        ? 'admin'
        : user.role === 'CLIENT'
        ? 'manager'
        : 'employee',

    status:
      user.status?.toLowerCase() || 'active'

  }))
);
  } catch (error) {

    console.error(error);

  }

};

  const toggleStatus = (id: string) => {
    setUsers(
      users.map((u) =>
      u.id === id ?
      {
        ...u,
        status: u.status === 'active' ? 'inactive' : 'active'
      } :
      u
      )
    );
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

    if (formState.role === 'manager') {
      if (!formState.companyName.trim()) {
        errors.companyName = t('fieldRequired');
      }

      if (!formState.companyEmail.trim()) {
        errors.companyEmail = t('fieldRequired');
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
          `http://localhost:3000/auth/users/${selectedUserId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              name: formState.name,
              email: formState.email,
              status: formState.status
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

      let backendRole = 'EMPLOYEE';

      if (formState.role === 'admin') {
        backendRole = 'ADMIN';
      }

      if (formState.role === 'manager') {
        backendRole = 'CLIENT';
      }

      let data: any;

      if (backendRole === 'ADMIN') {
        const response = await fetch(
          'http://localhost:3000/auth/create-admin',
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
      } else if (backendRole === 'EMPLOYEE') {
        const response = await fetch(
          'http://localhost:3000/auth/users/employee',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              name: formState.name,
              email: formState.email,
              password: formState.password,
              company_id: 1
            })
          }
        );

        data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to create employee');
        }
      } else if (backendRole === 'CLIENT') {

  const response = await fetch(
    'http://localhost:3000/auth/register',
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        name: formState.name,
        email: formState.email,
        password: formState.password,
        role: 'CLIENT'
      })
    }
  );

  data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to create manager');
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
      alert('Error saving user');
    }
  };

// هنا ينحذف المستخدم من النظام
  const handleDeleteUser = async (id: string) => {

  try {

    const token = localStorage.getItem('token');

    await fetch(
      `http://localhost:3000/auth/users/${id}`,
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
  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy dark:text-cream-dark mb-2">
            {t('users')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage system users, roles, and access permissions.
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
              {users.map((user) =>
              <tr
                key={user.id}
                className={`hover:bg-gray-50/50 dark:hover:bg-navy-light/10 transition-colors ${user.status === 'inactive' ? 'opacity-60' : ''}`}>
                
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
                    
                      {t(user.role as any)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {user.company}
                  </td>
                  <td className="px-6 py-4">
                    <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    
                      {t(user.status as any)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <label
                      className="relative inline-flex items-center cursor-pointer"
                      title={
                      user.status === 'active' ?
                      t('disableUser') :
                      t('enableUser')
                      }>
                      
                        <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={user.status === 'active'}
                        onChange={() => toggleStatus(user.id)} />
                      
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
                        onClick={() => handleDeleteUser(user.id)}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all duration-200 ease-out">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-navy-card border border-gray-200 dark:border-navy-light shadow-2xl overflow-hidden transform transition-transform duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-navy-light p-6">
              <div>
                <h2 className="text-2xl font-semibold text-navy dark:text-cream-dark">
                  {isEditMode ? 'Edit User' : 'Add User'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {isEditMode ? 'Update user details' : 'Create a new user'}
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
                  placeholder="Enter name"
                  error={formErrors.name}
                />
                <FormField
                  label={t('email')}
                  value={formState.email}
                  onChange={(value) => handleFormChange('email', value)}
                  type="email"
                  placeholder="Enter email"
                  error={formErrors.email}
                />
                <FormField
                  label={t('password')}
                  value={formState.password}
                  onChange={(value) => handleFormChange('password', value)}
                  type="password"
                  placeholder="Enter password"
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
                    { value: 'admin', label: t('admin') },
                    { value: 'manager', label: t('companyManager') },
                    { value: 'employee', label: t('employee') }
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

              {formState.role === 'manager' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label={t('companyName')}
                    value={formState.companyName}
                    onChange={(value) => handleFormChange('companyName', value)}
                    placeholder={t('companyName')}
                    error={formErrors.companyName}
                  />
                  <FormField
                    label={t('companyEmail')}
                    value={formState.companyEmail}
                    onChange={(value) => handleFormChange('companyEmail', value)}
                    type="email"
                    placeholder={t('companyEmail')}
                    error={formErrors.companyEmail}
                  />
                  <FormField
                    label={t('companyAddress')}
                    value={formState.companyAddress}
                    onChange={(value) => handleFormChange('companyAddress', value)}
                    placeholder={t('companyAddress')}
                  />
                  <FormField
                    label={t('sector')}
                    value={formState.sector}
                    onChange={(value) => handleFormChange('sector', value)}
                    placeholder={t('sector')}
                  />
                  <FormField
                    label={t('managerPhoneNumber')}
                    value={formState.managerPhoneNumber}
                    onChange={(value) => handleFormChange('managerPhoneNumber', value)}
                    placeholder={t('managerPhoneNumber')}
                  />
                </div>
              )}

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
                  {isEditMode ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>);
  

};