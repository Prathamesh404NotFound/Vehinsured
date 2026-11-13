import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { dbGetReferenceCosts, dbSaveReferenceCostItem } from '../../services/database';
import { CostReferenceItem } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const ReferenceCostsAdminPage: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<CostReferenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<CostReferenceItem | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await dbGetReferenceCosts();
      setItems(data);
      setLoading(false);
    }
    load();
  }, []);

  if (!isAdmin) {
    return <div className="p-8 text-center text-xs text-slate-500">Access Restricted</div>;
  }

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !currentUser) return;

    const updated: CostReferenceItem = {
      ...editingItem,
      lastUpdated: Date.now(),
      updatedBy: currentUser.email || currentUser.uid
    };

    await dbSaveReferenceCostItem(updated);
    setItems(items.map((i) => (i.id === updated.id ? updated : i)));
    setEditingItem(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <button onClick={() => navigate('/admin')} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manage Repair Cost References</h1>
          <p className="text-xs text-slate-600">Update baseline labor rates and parts replacement ranges used by the estimator engine.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {loading ? (
          <div className="text-center py-8 text-xs text-slate-500">Loading cost reference table...</div>
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 font-semibold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-3">Component</th>
                  <th className="p-3">Category</th>
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
                      <Button size="sm" variant="ghost" onClick={() => setEditingItem(item)}>
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

      {/* Edit Reference Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Edit {editingItem.partName} Reference Data</h3>
            <form onSubmit={handleSaveItem} className="space-y-3">
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

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="w-full">Save Changes</Button>
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
