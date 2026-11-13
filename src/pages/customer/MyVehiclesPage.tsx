import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Plus, Trash2, Edit, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { dbGetVehicles, dbDeleteVehicle } from '../../services/database';
import { Vehicle } from '../../types';
import { Button } from '../../components/ui/Button';

export const MyVehiclesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    async function load() {
      setLoading(true);
      const list = await dbGetVehicles(currentUser!.uid);
      setVehicles(list);
      setLoading(false);
    }
    load();
  }, [currentUser]);

  const handleDelete = async (vehicleId: string) => {
    if (!currentUser) return;
    if (confirm('Are you sure you want to remove this vehicle record?')) {
      await dbDeleteVehicle(currentUser.uid, vehicleId);
      setVehicles(vehicles.filter((v) => v.id !== vehicleId));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Vehicles</h1>
          <p className="text-xs text-slate-600">Manage registered vehicles for accident assessment and policy linking.</p>
        </div>

        <Link to="/vehicles/add">
          <Button size="md" className="gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </Button>
        </Link>
      </div>

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
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-black text-slate-900 text-base tracking-wider uppercase bg-slate-100 px-2.5 py-1 rounded border border-slate-300">
                    {vehicle.displayRegistrationNumber || vehicle.registrationNumber}
                  </span>
                  <p className="text-xs font-semibold text-slate-700 mt-2">
                    {vehicle.make} {vehicle.model} {vehicle.variant ? `(${vehicle.variant})` : ''}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase">
                  {vehicle.category}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1 border-t border-slate-100 pt-3">
                <p><strong>Manufacturing Year:</strong> {vehicle.manufacturingYear}</p>
                <p><strong>Fuel Type:</strong> {vehicle.fuelType || 'Not specified'}</p>
                <p><strong>Color:</strong> {vehicle.color || 'Not specified'}</p>
                <p><strong>Owner Relationship:</strong> {vehicle.ownerRelationship.toUpperCase()}</p>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  onClick={() => handleDelete(vehicle.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
