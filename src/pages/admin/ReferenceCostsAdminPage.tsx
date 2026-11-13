import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import {
  dbGetReferenceCosts,
  dbSaveReferenceCostItem,
  dbGetReferenceCostRevisions,
} from '../../services/database';
import { CostReferenceItem, CostReferenceRevision, VehicleCategory } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ToastBanner } from '../../components/ui/ToastBanner';

export const ReferenceCostsAdminPage: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<CostReferenceItem[]>([]);
  const [revisions, setRevisions] = useState<CostReferenceRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<CostReferenceItem | null>(null);
  const [previousItem, setPreviousItem] = useState<CostReferenceItem | undefined>(undefined);
  const [isNew, setIsNew] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadAll = async () => {
    setLoading(true);
    const [data, revs] = await Promise.all([dbGetReferenceCosts(), dbGetReferenceCostRevisions()]);
    setItems(data);
    setRevisions(revs);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  if (!isAdmin) {
    return <div className="p-8 text-center text-xs text-slate-500">Access Restricted</div>;
  }

  const openEdit = (item: CostReferenceItem) => {
    setIsNew(false);
    setPreviousItem(item);
    setEditingItem({ ...item });
  };

  const openNew = () => {
    setIsNew(true);
    setPreviousItem(undefined);
    setEditingItem({
      id: 'ref-' + Date.now(),
      partName: '',
      category: 'hatchback',
      repairLaborMin: 1000,
      repairLaborMax: 2000,
      replacePartsMin: 2000,
      replacePartsMax: 4500,
      paintingAllowanceMin: 1200,
      paintingAllowanceMax: 2500,
      notes: '',
      lastUpdated: Date.now(),
      updatedBy: currentUser?.email || currentUser?.uid || 'Admin',
    });
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !currentUser || !editingItem.partName.trim()) return;

    const updated: CostReferenceItem = {
      ...editingItem,
      partName: editingItem.partName.trim(),
      lastUpdated: Date.now(),
      updatedBy: currentUser.email || currentUser.uid,
    };

    await dbSaveReferenceCostItem(updated, previousItem);
    await loadAll();
    setEditingItem(null);
    setBanner({
      type: 'success',
      message: `${isNew ? 'Added' : 'Updated'} cost baseline for ${updated.partName} and logged revision.`,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Manage Repair Cost References</h1>
            <p className="text-xs text-slate-600">
              Update baseline labor rates, parts replacement ranges, and painting allowances used by the estimator.
            </p>
          </div>
        </div>
        <Button size="sm" onClick={openNew} className="gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Add New Component</span>
        </Button>
      </div>

      {banner && <ToastBanner type={banner.type} message={banner.message} onClose={() => setBanner(null)} />}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {loading ? (
          <div className="text-center py-8 text-xs text-slate-500">Loading cost reference table...</div>
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 font-semibold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-3">Component</th>
                  <th className="p-3">Segment</th>
                  <th className="p-3">Repair Labor</th>
                  <th className="p-3">Replace Parts</th>
                  <th className="p-3">Painting</th>
                  <th className="p-3">Last Modified</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3 font-bold text-slate-900">{item.partName}</td>
                    <td className="p-3 uppercase text-slate-600">{item.category}</td>
                    <td className="p-3">Rs. {item.repairLaborMin}-{item.repairLaborMax}</td>
                    <td className="p-3">Rs. {item.replacePartsMin}-{item.replacePartsMax}</td>
                    <td className="p-3">Rs. {item.paintingAllowanceMin}-{item.paintingAllowanceMax}</td>
                    <td className="p-3 text-slate-500">{new Date(item.lastUpdated).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(item)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Revision History */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-blue-600" />
          <span>Reference Table Revision History ({revisions.length})</span>
        </h2>
        {revisions.length === 0 ? (
          <p className="text-xs text-slate-500">No edits logged yet. Any updates saved above will record a full diff here.</p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {revisions.map((rev) => (
              <div key={rev.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-900">{rev.partName}</span>
                  <span className="text-slate-600 ml-2">
                    Parts updated to Rs. {rev.newValues.replacePartsMin}-{rev.newValues.replacePartsMax} | Labor Rs.{' '}
                    {rev.newValues.repairLaborMin}-{rev.newValues.repairLaborMax}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 shrink-0">
                  {rev.updatedBy} &bull; {new Date(rev.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit / Add Reference Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">
              {isNew ? 'Add New Component Reference' : `Edit ${editingItem.partName} Reference`}
            </h3>
            <form onSubmit={handleSaveItem} className="space-y-3">
              <Input
                label="Component Name"
                value={editingItem.partName}
                onChange={(e) => setEditingItem({ ...editingItem, partName: e.target.value })}
                required
              />
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Baseline Segment</label>
                <select
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as VehicleCategory })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white"
                >
                  <option value="hatchback">Hatchback</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="luxury">Luxury</option>
                  <option value="two_wheeler">Two-Wheeler</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Repair Labor Min (Rs)"
                  type="number"
                  value={editingItem.repairLaborMin}
                  onChange={(e) => setEditingItem({ ...editingItem, repairLaborMin: Number(e.target.value) })}
                />
                <Input
                  label="Repair Labor Max (Rs)"
                  type="number"
                  value={editingItem.repairLaborMax}
                  onChange={(e) => setEditingItem({ ...editingItem, repairLaborMax: Number(e.target.value) })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Replace Parts Min (Rs)"
                  type="number"
                  value={editingItem.replacePartsMin}
                  onChange={(e) => setEditingItem({ ...editingItem, replacePartsMin: Number(e.target.value) })}
                />
                <Input
                  label="Replace Parts Max (Rs)"
                  type="number"
                  value={editingItem.replacePartsMax}
                  onChange={(e) => setEditingItem({ ...editingItem, replacePartsMax: Number(e.target.value) })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Painting Min (Rs)"
                  type="number"
                  value={editingItem.paintingAllowanceMin}
                  onChange={(e) => setEditingItem({ ...editingItem, paintingAllowanceMin: Number(e.target.value) })}
                />
                <Input
                  label="Painting Max (Rs)"
                  type="number"
                  value={editingItem.paintingAllowanceMax}
                  onChange={(e) => setEditingItem({ ...editingItem, paintingAllowanceMax: Number(e.target.value) })}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="w-full">
                  Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditingItem(null)} className="w-full">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
