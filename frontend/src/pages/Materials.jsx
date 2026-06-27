import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Plus, 
  Search, 
  AlertTriangle, 
  Trash2, 
  Minus,
  PackageCheck,
  Package2,
  PackageOpen,
  ShieldAlert
} from 'lucide-react';

const Materials = () => {
  const { user } = useAuth();

  if (user?.role !== 'teacher') {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 font-sans">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-205/50 dark:border-slate-800/15 rounded-2xl p-8 shadow-sm text-left">
          <ShieldAlert className="h-10 w-10 text-red-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white text-center">Access Denied</h3>
          <p className="text-xs mt-1 text-slate-500 dark:text-slate-400 text-center">You do not have teacher permissions to access the Materials Inventory.</p>
        </div>
      </div>
    );
  }
  
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [availableQuantity, setAvailableQuantity] = useState(10);
  const [requiredQuantity, setRequiredQuantity] = useState(5);
  const [assignedTeacher, setAssignedTeacher] = useState('');

  const fetchMaterials = async () => {
    try {
      const response = await api.get('/materials');
      if (response.success && response.data) {
        setMaterials(response.data);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    try {
      const body = {
        name,
        quantity,
        availableQuantity,
        requiredQuantity,
        assignedTeacher: assignedTeacher || `${user.name} (${user.classroom})`
      };
      
      const response = await api.post('/materials', body);
      if (response.success) {
        fetchMaterials();
        resetForm();
        setShowAddModal(false);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAdjustQuantity = async (id, currentAvail, delta) => {
    const newVal = Math.max(0, currentAvail + delta);
    
    // Optimistic UI update
    setMaterials(prev => 
      prev.map(m => {
        if (m._id === id) {
          let status = 'in-stock';
          if (newVal === 0) status = 'out-of-stock';
          else if (newVal < m.requiredQuantity) status = 'low-stock';
          return { ...m, availableQuantity: newVal, status };
        }
        return m;
      })
    );

    try {
      await api.put(`/materials/${id}`, { availableQuantity: newVal });
      fetchMaterials(); // sync final state with database triggers
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('Delete this material from inventory?')) return;
    try {
      const response = await api.delete(`/materials/${id}`);
      if (response.success) {
        fetchMaterials();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setName('');
    setQuantity(10);
    setAvailableQuantity(10);
    setRequiredQuantity(5);
    setAssignedTeacher('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'out-of-stock':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-red-500/10 text-red-650 dark:bg-red-950/20 dark:text-red-400 font-sans">
            Out of Stock
          </span>
        );
      case 'low-stock':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-650 dark:bg-amber-950/20 dark:text-amber-400 font-sans">
            Low Stock
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-650 dark:bg-emerald-950/20 dark:text-emerald-400 font-sans">
            In Stock
          </span>
        );
    }
  };

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.assignedTeacher.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white font-sans">Materials & Resource Checklist</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-sans mt-0.5">
            Audit school supplies, track inventory distributions, and receive notifications when stocks run low.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 transition-all font-sans"
        >
          <Plus className="h-4.5 w-4.5 mr-1.5" /> Log Material Resource
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-4 rounded-2xl max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by material name or teacher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm glass-input font-sans"
          />
        </div>
      </div>

      {/* Table grid display */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-16 glass-card rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PackageOpen className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white font-sans">No materials registered</h3>
          <p className="text-slate-400 text-xs font-sans max-w-sm mx-auto mt-1">
            Try adjusting your search criteria or register a new physical resource above.
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/40 text-slate-400 dark:text-slate-500 uppercase font-semibold">
                  <th className="py-4 pl-6">Material Name</th>
                  <th className="py-4 text-center">Total Quantity</th>
                  <th className="py-4 text-center">Available Stock</th>
                  <th className="py-4 text-center">Required Min</th>
                  <th className="py-4">Status</th>
                  <th className="py-4">Assigned Location / Teacher</th>
                  <th className="py-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
                {filteredMaterials.map((mat) => (
                  <tr key={mat._id} className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                    <td className="py-4 pl-6 font-bold text-slate-800 dark:text-white text-sm">
                      {mat.name}
                    </td>
                    <td className="py-4 text-center font-semibold text-slate-600 dark:text-slate-350">
                      {mat.quantity}
                    </td>
                    <td className="py-4">
                      {/* Available adjuster */}
                      <div className="flex items-center justify-center space-x-2.5">
                        <button
                          onClick={() => handleAdjustQuantity(mat._id, mat.availableQuantity, -1)}
                          className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 dark:text-slate-300 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-extrabold text-sm text-slate-800 dark:text-white min-w-[20px] text-center">
                          {mat.availableQuantity}
                        </span>
                        <button
                          onClick={() => handleAdjustQuantity(mat._id, mat.availableQuantity, 1)}
                          className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 dark:text-slate-300 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 text-center font-semibold text-slate-500 dark:text-slate-400">
                      {mat.requiredQuantity}
                    </td>
                    <td className="py-4">
                      {getStatusBadge(mat.status)}
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-300 font-medium">
                      {mat.assignedTeacher || 'Shared facility'}
                    </td>
                    <td className="py-4 pr-6 text-right">
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleDeleteMaterial(mat._id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD MATERIAL MODAL */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-scale-up">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/40 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/35">
              <div>
                <h3 className="font-bold text-base text-slate-850 dark:text-white font-sans">Add Inventory Resource</h3>
                <p className="text-xs text-slate-400 dark:text-slate-400 font-sans">Define total count, safety minimums, and storage assignments.</p>
              </div>
              <button 
                onClick={() => {
                  resetForm();
                  setShowAddModal(false);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-semibold text-sm"
              >
                Close
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddMaterial} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                  Material Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Washable White Paint (Litres)"
                  className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 font-sans">
                    Total Qty
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm glass-input font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 font-sans">
                    Available Qty
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={availableQuantity}
                    onChange={(e) => setAvailableQuantity(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm glass-input font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 font-sans">
                    Required Min
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={requiredQuantity}
                    onChange={(e) => setRequiredQuantity(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm glass-input font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                  Assigned Location / Teacher Custody
                </label>
                <input
                  type="text"
                  value={assignedTeacher}
                  onChange={(e) => setAssignedTeacher(e.target.value)}
                  placeholder="e.g. Shared Facility / Nursery-A classroom"
                  className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-sans"
                />
              </div>

            </form>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800/40 bg-slate-50 dark:bg-slate-900/25 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowAddModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white font-sans"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMaterial}
                disabled={!name}
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold font-sans shadow shadow-brand-500/15"
              >
                Log Supply Item
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Materials;
