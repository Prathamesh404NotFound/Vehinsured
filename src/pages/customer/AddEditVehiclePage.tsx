import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { dbSaveVehicle } from '../../services/database';
import { Vehicle, VehicleCategory, FuelType } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { compressImageForPreview } from '../../services/storage/imageCompressor';

export const AddEditVehiclePage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [regNo, setRegNo] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [variant, setVariant] = useState('');
  const [year, setYear] = useState<number>(2022);
  const [category, setCategory] = useState<VehicleCategory>('hatchback');
  const [fuelType, setFuelType] = useState<FuelType>('petrol');
  const [color, setColor] = useState('');
  const [ownerRelationship, setOwnerRelationship] = useState<Vehicle['ownerRelationship']>('self');
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const result = await compressImageForPreview(e.target.files[0], 600, 600, 0.7);
        setPhotoPreview(result.previewBase64);
      } catch (err) {
        console.warn('Image preview compression failed:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!regNo || !make || !model) {
      setError('Please provide registration number, make, and model.');
      return;
    }

    setLoading(true);
    setError(null);

    const normalizedReg = regNo.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const displayReg = normalizedReg.replace(/^([A-Z]{2})([0-9]{2})([A-Z]{1,2})([0-9]{4})$/, '$1 $2 $3 $4');

    const vehicleId = 'veh-' + Date.now();
    const vehicle: Vehicle = {
      id: vehicleId,
      uid: currentUser.uid,
      registrationNumber: normalizedReg,
      displayRegistrationNumber: displayReg,
      make,
      model,
      variant,
      manufacturingYear: year,
      category,
      fuelType,
      color,
      ownerRelationship,
      photoPreview,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      await dbSaveVehicle(currentUser.uid, vehicle);
      navigate('/vehicles');
    } catch (err: any) {
      setError(err.message || 'Failed to save vehicle details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={() => navigate('/vehicles')}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Add Vehicle Details</h1>
          <p className="text-xs text-slate-600">Register a new vehicle record under your profile.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        {error && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Registration Number"
            placeholder="e.g. MH 12 AB 1234"
            value={regNo}
            onChange={(e) => setRegNo(e.target.value)}
            helperText="Normalized for search automatically."
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Vehicle Make"
              placeholder="e.g. Maruti Suzuki, Hyundai, Tata"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              required
            />
            <Input
              label="Vehicle Model"
              placeholder="e.g. Swift, Creta, Nexon"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Variant (Optional)"
              placeholder="e.g. VXi, SX, LXi"
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
            />
            <Input
              label="Manufacturing Year"
              type="number"
              min={1990}
              max={2027}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Vehicle Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as VehicleCategory)}
                className="w-full rounded-lg border border-slate-300 bg-white text-sm px-3.5 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500"
              >
                <option value="hatchback">Hatchback</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV / MUV</option>
                <option value="luxury">Luxury Premium</option>
                <option value="two_wheeler">Two-Wheeler</option>
                <option value="commercial">Commercial Vehicle</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Fuel Type
              </label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
                className="w-full rounded-lg border border-slate-300 bg-white text-sm px-3.5 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500"
              >
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="cng">CNG</option>
                <option value="electric">Electric (EV)</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Color (Optional)"
              placeholder="e.g. Pearl White, Metallic Grey"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Owner Relationship
              </label>
              <select
                value={ownerRelationship}
                onChange={(e) => setOwnerRelationship(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 bg-white text-sm px-3.5 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500"
              >
                <option value="self">Self (Registered Owner)</option>
                <option value="spouse">Spouse</option>
                <option value="parent">Parent</option>
                <option value="child">Child</option>
                <option value="employer">Employer / Company</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Optional Vehicle Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="text-xs text-slate-600 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {photoPreview && (
              <img src={photoPreview} alt="Vehicle Preview" className="mt-2 h-32 rounded-lg object-cover border border-slate-200" />
            )}
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="submit" isLoading={loading} className="w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" />
              <span>Save Vehicle</span>
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/vehicles')} className="w-full sm:w-auto">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
