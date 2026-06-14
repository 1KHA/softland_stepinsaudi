import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../node_modules/react-i18next';
import CompanyHeader from "../components/CompanyHeader";

export default function CompanyProfile() {

    const { i18n } = useTranslation();

    const user = JSON.parse(
        localStorage.getItem('user') || 'null'
    );
    console.log(user);
    const [isEditing, setIsEditing] = useState(false);
const [showSuccess, setShowSuccess] = useState(false);
    const [companyData, setCompanyData] = useState(
        {

            companyName: user?.name || '',
            managerName: '',
            country: 'Saudi Arabia',
            sector: 'Commercial',
            description: '',
            founders: ['Founder 1'],
            branches_count: '',
            phone: '',
            email: user?.email || '',
            logo: null as any
        }

    );

    const [originalData, setOriginalData] =
        useState(companyData);
    useEffect(() => {

        const fetchCompany = async () => {

            try {

                const companyId = user?.company_id;

                if (!companyId) return;

const token = localStorage.getItem("token");

const response = await axios.get(
`http://localhost:3000/companies/${companyId}`,
{
    headers: {
        Authorization: `Bearer ${token}`
    }
}
);

                const company = response.data;
                console.log(company)
setCompanyData({

    companyName: company.name || '',

    managerName: company.manager_name || '',

    country: company.country || '',

    sector: company.sector_id || '',

    description: company.description || '',

    founders:
        company.founders?.map((f: any) =>
            typeof f === 'string'
                ? f
                : f.full_name
        ) || [],

    branches_count: company.branches_count || '',

    phone: company.phone || '',

    email: company.email || '',

    logo: company.logo_url || null

});
                setOriginalData({
    companyName: company.name || '',
    managerName: company.manager_name || '',
    country: company.country || '',
    sector: company.sector_id || '',
    description: company.description || '',
    founders:
        company.founders?.map((f: any) =>
            typeof f === 'string'
                ? f
                : f.full_name
        ) || [],
    branches_count: company.branches_count || '',
    phone: company.phone || '',
    email: company.email || '',
    logo: null
});

            } catch (error) {

                console.log(error);

            }

        };

        fetchCompany();

    }, []);

    const countries = [
        'Saudi Arabia',
        'United Arab Emirates',
        'Kuwait',
        'Qatar',
        'Bahrain',
        'Oman',
        'Egypt',
        'Jordan',
        'United States',
        'United Kingdom',
        'France',
        'Germany',
        'China',
        'Japan'
    ];

    const sectors = [
  { id: 1, name: 'Entrepreneurial' },
  { id: 2, name: 'Industrial' },
  { id: 3, name: 'Commercial' },
  { id: 4, name: 'Real Estate' }
];

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement |
            HTMLTextAreaElement |
            HTMLSelectElement
        >
    ) => {

        setCompanyData({
            ...companyData,
            [e.target.name]: e.target.value
        });

    };

    const addFounder = () => {

        setCompanyData({
            ...companyData,
            founders: [
                ...companyData.founders,
                ''
            ]
        });

    };

    const updateFounder = (
        index: number,
        value: string
    ) => {

        const updated = [...companyData.founders];

        updated[index] = value;

        setCompanyData({
            ...companyData,
            founders: updated
        });

    };

    const handleSave = async () => {

        try {
console.log(user);
console.log(user.company_id);
await axios.put(
  `http://localhost:3000/companies/${user.company_id}`,
{
  name: companyData.companyName,
  manager_name: companyData.managerName,
  country: companyData.country,
  sector_id: Number(companyData.sector),
  founders: companyData.founders,
  description: companyData.description,
  phone: companyData.phone,
  email: companyData.email,
  branches_count: companyData.branches_count,
  logo_url: companyData.logo
},

                {
                    headers: {
Authorization: `Bearer ${localStorage.getItem("token")}`                    }
                }
            );

            setOriginalData(companyData);

            setIsEditing(false);

setShowSuccess(true);

setTimeout(() => {
  setShowSuccess(false);
}, 4000);
        } catch (error) {

            console.log(error);

            alert('Update failed ❌');

        }

    };

    const handleCancel = () => {

        setCompanyData(originalData);

        setIsEditing(false);

    };

return (
  <>
    <CompanyHeader />

    <div className="min-h-screen bg-[#F7F3EE]">


            {/* Content */}
            <div className="p-8">

                <div className="bg-white rounded-3xl shadow-sm p-8">
                    {showSuccess && (
  <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4">
    <h3 className="font-semibold text-green-700">
      ✅ Changes saved successfully
    </h3>

    <p className="mt-1 text-sm text-green-600">
      Company information has been updated.
    </p>
  </div>
)}

                    {/* Top Section */}
                    <div className="flex items-center justify-between mb-10">

                        <div>

                            <h2 className="text-3xl font-bold text-[#1E3A5F]">
                                Company Profile
                            </h2>

                            <p className="text-gray-500 mt-2">
                                Manage your company information
                            </p>

                        </div>

                        <button
                            onClick={() =>
                                setIsEditing(!isEditing)
                            }
                            className={`px-6 py-3 rounded-xl font-medium transition ${isEditing
                                ? 'bg-[#C5A55A] text-white'
                                : 'bg-white border border-gray-300'
                                }`}
                        >

                            {isEditing
                                ? 'Editing Mode'
                                : 'View Mode'}

                        </button>

                    </div>

                    {/* Logo */}
                    <div className="mb-10">

                        <label className="block text-gray-600 mb-3">
                            Company Logo
                        </label>

                        <div className="flex items-center gap-5">

                            <div className="w-28 h-28 rounded-2xl bg-gray-100 border flex items-center justify-center overflow-hidden">

                                {companyData.logo ? (

                                    <img
                                        src={
                                            typeof companyData.logo === 'string'
                                                ? companyData.logo
                                                : URL.createObjectURL(companyData.logo)
                                        }
                                        alt="logo"
                                        className="w-full h-full object-cover"
                                    />

                                ) : (

                                    <span className="text-gray-400">
                                        Logo
                                    </span>

                                )}

                            </div>

                            {isEditing && (

                                <input
                                    type="file"
                                    onChange={(e) => {

                                        if (!e.target.files?.[0]) return;

                                        setCompanyData({
                                            ...companyData,
                                            logo: URL.createObjectURL(
                                                e.target.files[0]
                                            )
                                        });

                                    }}
                                />

                            )}

                        </div>

                    </div>

                    {/* Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Company Name */}
                        <div>

                            <label className="block text-gray-600 mb-2">
                                Company Name
                            </label>

                            <input
                                type="text"
                                name="companyName"
                                value={companyData.companyName}
                                disabled={!isEditing}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 disabled:bg-gray-100"
                            />

                        </div>

                        {/* Manager */}
                        <div>

                            <label className="block text-gray-600 mb-2">
                                Company Manager
                            </label>

                            <input
                                type="text"
                                name="managerName"
                                value={companyData.managerName}
                                disabled={!isEditing}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 disabled:bg-gray-100"
                            />

                        </div>

                        {/* Country */}
                        <div>

                            <label className="block text-gray-600 mb-2">
                                Country
                            </label>

                            <select
                                name="country"
                                value={companyData.country}
                                disabled={!isEditing}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 disabled:bg-gray-100"
                            >

                                {countries.map((country) => (

                                    <option key={country}>
                                        {country}
                                    </option>

                                ))}

                            </select>

                        </div>

                        {/* Sector */}
                        <div>

                            <label className="block text-gray-600 mb-2">
                                Sector
                            </label>

                            <select
                                name="sector"
                                value={companyData.sector}
                                disabled={!isEditing}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 disabled:bg-gray-100"
                            >

                                {sectors.map((sector) => (

                                    <option
                                        key={sector.id}
                                        value={sector.id}
                                    >
                                        {sector.name}
                                    </option>

                                ))}

                            </select>

                        </div>

                        {/* Branches */}
                        <div>

                            <label className="block text-gray-600 mb-2">
                                Number Of Branches
                            </label>

                            <input
                                type="number"
                                name="branches_count"
                                value={companyData.branches_count}
                                disabled={!isEditing}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 disabled:bg-gray-100"
                            />

                        </div>

                        {/* Phone */}
                        <div>

                            <label className="block text-gray-600 mb-2">
                                Contact Number
                            </label>

                            <input
                                type="text"
                                name="phone"
                                value={companyData.phone}
                                disabled={!isEditing}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 disabled:bg-gray-100"
                            />

                        </div>

                        {/* Email */}
                        <div className="md:col-span-2">

                            <label className="block text-gray-600 mb-2">
                                Company Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={companyData.email}
                                disabled={!isEditing}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 disabled:bg-gray-100"
                            />

                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">

                            <label className="block text-gray-600 mb-2">
                                Company Description
                            </label>

                            <textarea
                                name="description"
                                value={companyData.description}
                                disabled={!isEditing}
                                onChange={handleChange}
                                rows={5}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 disabled:bg-gray-100"
                            />

                        </div>

                    </div>

                    {/* Founders */}
                    <div className="mt-10">

                        <div className="flex items-center justify-between mb-5">

                            <h3 className="text-2xl font-bold text-[#1E3A5F]">
                                Company Founders
                            </h3>

                            {isEditing && (

                                <button
                                    onClick={addFounder}
                                    className="bg-[#C5A55A] text-white px-5 py-2 rounded-xl"
                                >
                                    + Add Founder
                                </button>

                            )}

                        </div>

                        <div className="space-y-4">

                            {companyData.founders.map(
                                (founder, index) => (

                                    <input
                                        key={index}
                                        type="text"
                                        value={founder}
                                        disabled={!isEditing}
                                        onChange={(e) =>
                                            updateFounder(
                                                index,
                                                e.target.value
                                            )
                                        }
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 disabled:bg-gray-100"
                                    />

                                )
                            )}

                        </div>

                    </div>

                    {/* Buttons */}
                    {isEditing && (

                        <div className="mt-10 flex gap-4">

                            <button
                                onClick={handleSave}
                                className="bg-[#1E3A5F] text-white px-8 py-4 rounded-2xl hover:opacity-90"
                            >
                                Save Changes
                            </button>

                            <button
                                onClick={handleCancel}
                                className="bg-white border border-gray-300 px-8 py-4 rounded-2xl hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                        </div>

                    )}

                </div>

            </div>

        </div>
    </>
  );
}