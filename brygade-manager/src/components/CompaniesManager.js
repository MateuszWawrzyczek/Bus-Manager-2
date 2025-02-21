import React, { useState, useEffect } from "react";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [newCompany, setNewCompany] = useState({ name: "", phone: "", email: "" });

  const fetchCompanies = async () => {
    try {
      const response = await fetch("http://localhost:5057/api/Companies");
      const data = await response.json();
      console.log(data);
      setCompanies(data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNewChange = (e) => {
    const { name, value } = e.target;
    setNewCompany({ ...newCompany, [name]: value });
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5057/api/companies/delete/${id}`);
      setCompanies(companies.filter((company) => company.id !== id));
      alert("Firma usunięta pomyślnie");
    } catch (error) {
      console.error("Error deleting company:", error);
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({ name: company.name, phone: company.phone, email: company.email });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/companies/edit/${editingCompany.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setCompanies((prev) =>
          prev.map((company) =>
            company.id === editingCompany.id ? { ...company, ...formData } : company
          )
        );
        setEditingCompany(null);
        setFormData({ name: "", phone: "", email: "" });
      } else {
        console.error("Error saving company:", response.statusText);
      }
    } catch (error) {
      console.error("Error saving company:", error);
    }
  };

  const handleAdd = async () => {
    try {
      const response = await fetch("http://localhost:5057/api/Companies/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCompany),
      });

      if (response.ok) {
        const addedCompany = await response.json();
        setCompanies([...companies, addedCompany]);
        setNewCompany({ name: "", phone: "", email: "" });
      } else {
        console.error("Error adding company:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding company:", error);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Lista Firm</h1>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Nazwa</th>
            <th className="border border-gray-300 px-4 py-2">Telefon</th>
            <th className="border border-gray-300 px-4 py-2">Email</th>
            <th className="border border-gray-300 px-4 py-2">Akcje</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id}>
              <td className="border border-gray-300 px-4 py-2">{company.name}</td>
              <td className="border border-gray-300 px-4 py-2">{company.phone}</td>
              <td className="border border-gray-300 px-4 py-2">{company.email}</td>
              <td className="border border-gray-300 px-4 py-2">
                <button
                  onClick={() => handleEdit(company)}
                  className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                >
                  Edytuj
                </button>
                <button
                  onClick={() => handleDelete(company.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Usuń
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">Dodaj Nową Firmę</h2>
        <div className="mb-2">
          <label className="block mb-1">Nazwa:</label>
          <input
            type="text"
            name="name"
            value={newCompany.name}
            onChange={handleNewChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Telefon:</label>
          <input
            type="text"
            name="phone"
            value={newCompany.phone}
            onChange={handleNewChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Email:</label>
          <input
            type="email"
            name="email"
            value={newCompany.email}
            onChange={handleNewChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <button
          onClick={handleAdd}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Dodaj
        </button>
      </div>

      {editingCompany && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Edytuj Firmę</h2>
          <div className="mb-2">
            <label className="block mb-1">Nazwa:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border px-2 py-1"
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1">Telefon:</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border px-2 py-1"
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border px-2 py-1"
            />
          </div>
          <button
            onClick={handleSave}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Zapisz
          </button>
        </div>
      )}
    </div>
  );
};

export default Companies;
