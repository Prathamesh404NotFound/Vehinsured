import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Plus, Trash2, Edit, ShieldCheck, FileText } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { dbGetVehicles, dbDeleteVehicle, dbGetPolicies, dbGetClaims, dbAddActivityLog } from '../../services/database';
import { Vehicle, InsurancePolicy, ClaimAssistanceCase } from '../../types';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ToastBanner } from '../../components/ui/ToastBanner';
import { useTranslation } from '../../features/i18n/context';

export const MyVehiclesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [claims, setClaims] = useState<ClaimAssistanceCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    async function load() {
      setLoading(true);
      const [vList, pList, cList] = await Promise.all([
        dbGetVehicles(currentUser!.uid),
        dbGetPolicies(currentUser!.uid),
        dbGetClaims(currentUser!.uid),
      ]);
      setVehicles(vList);
      setPolicies(pList);
      setClaims(cList);
      setLoading(false);
    }
    load();
  }, [currentUser]);

  const confirmDelete = async () => {
    if (!currentUser || !deleteTarget) return;
    try {
      await dbDeleteVehicle(currentUser.uid, deleteTarget.id);
      await dbAddActivityLog(currentUser.uid, {
        title: 'Vehicle Removed',
        description: `Deleted vehicle ${deleteTarget.displayRegistrationNumber || deleteTarget.registrationNumber}`,
        type: 'vehicle',
      });
      setVehicles(vehicles.filter((v) => v.id !== deleteTarget.id));
      setBanner({ type: 'success', message: `Removed vehicle ${deleteTarget.displayRegistrationNumber}.` });
    } catch (err: any) {
      setBanner({ type: 'error', message: err?.message || 'Failed to delete vehicle.' });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t('vehicles.title')}</h1>
          <p className="text-xs text-slate-600">{t('vehicles.subtitle')}</p>
        </div>

        <Link to="/vehicles/add">
          <Button size="md" className="gap-2">
            <Plus className="w-4 h-4" />
            <span>{t('vehicles.add')}</span>
          </Button>
        </Link>
      </div>

      {banner && <ToastBanner type={banner.type} message={banner.message} onClose={() => setBanner(null)} />}

      {loading ? (
        <div className="text-center py-10 text-xs text-slate-500">Loading vehicles...</div>
      ) : vehicles.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
          <Car className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900">No Vehicles Registered</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add your car or two-wheeler details to quickly select it when recording accident damage.
          </p>
          <Link to="/vehicles/add">
            <Button size="sm">Register Vehicle Now</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((vehicle) => {
            const linkedPolicy = policies.find((p) => p.vehicleId === vehicle.id || p.id === vehicle.policyId);
            const vehicleClaimsCount = claims.filter((c) => c.vehicleId === vehicle.id).length;

            return (
              <div key={vehicle.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-black text-slate-900 text-base tracking-wider uppercase bg-slate-100 px-2.5 py-1 rounded border border-slate-300">
                      {vehicle.displayRegistrationNumber || vehicle.registrationNumber}
                    </span>
                    <p className="text-xs font-semibold text-slate-700 mt-2">
                      {vehicle.make} {vehicle.model} {vehicle.variant ? `(${vehicle.variant})` : ''}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase shrink-0">
                    {vehicle.category.replace('_', ' ')}
                  </span>
                </div>

                {vehicle.photoPreview && (
                  <img
                    src={vehicle.photoPreview}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-36 object-cover rounded-lg border border-slate-200"
                  />
                )}

                <div className="text-xs text-slate-600 space-y-1 border-t border-slate-100 pt-3">
                  <p>
                    <strong>Manufacturing Year:</strong> {vehicle.manufacturingYear}
                  </p>
                  <p>
                    <strong>Fuel Type:</strong> {vehicle.fuelType?.toUpperCase() || 'Not specified'}
                  </p>
                  <p>
                    <strong>Owner Relationship:</strong> {vehicle.ownerRelationship.toUpperCase()}
                  </p>
                  <p className="flex items-center gap-1.5 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Policy:</strong>{' '}
                      {linkedPolicy ? `${linkedPolicy.insurerName} (Exp: ${linkedPolicy.expiryDate})` : 'No policy linked yet'}
                    </span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>
                      <strong>Recorded Accident Cases:</strong> {vehicleClaimsCount}
                    </span>
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                  <Link to={`/vehicles/edit/${vehicle.id}`}>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Edit className="w-3.5 h-3.5" />
                      <span>{t('btn.edit')}</span>
                    </Button>
                  </Link>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteTarget(vehicle)}
                    className="text-red-600 hover:bg-red-50"
                    aria-label={`Delete ${vehicle.displayRegistrationNumber}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove Vehicle Record"
        message={`Are you sure you want to remove ${deleteTarget?.make} ${deleteTarget?.model} (${deleteTarget?.displayRegistrationNumber})? Existing accident reports will remain accessible.`}
        confirmLabel={t('btn.delete')}
        cancelLabel={t('btn.cancel')}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
