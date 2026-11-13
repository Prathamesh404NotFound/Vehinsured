import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Search } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { dbSaveVehicle, dbGetVehicles, dbAddActivityLog } from '../../services/database';
import { Vehicle, VehicleCategory, FuelType } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ToastBanner } from '../../components/ui/ToastBanner';
import { compressImageForPreview } from '../../services/storage/imageCompressor';
import { POPULAR_INDIAN_VEHICLES } from '../../data/onlineReferenceData';
import {
  normalizeRegistrationNumber,
  formatRegistrationNumber,
  isValidRegistrationNumber,
} from '../../utils/validation';
import { useTranslation } from '../../features/i18n/context';

export const AddEditVehiclePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);

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
  const [existingCreatedAt, setExistingCreatedAt] = useState<number | null>(null);
  const [existingPolicyId, setExistingPolicyId] = useState<string | undefined>(undefined);

  const [onlineModels, setOnlineModels] = useState<string[]>([]);
  const [lookingUpModels, setLookingUpModels] = useState(false);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{ type: 'error' | 'info' | 'success'; message: string } | null>(null);

  useEffect(() => {
    if (!currentUser || !id) return;
    async function loadVehicle() {
      const list = await dbGetVehicles(currentUser!.uid);
      const found = list.find((v) => v.id === id);
      if (found) {
        setRegNo(found.displayRegistrationNumber || found.registrationNumber);
        setMake(found.make);
        setModel(found.model);
        setVariant(found.variant || '');
        setYear(found.manufacturingYear);
        setCategory(found.category);
        setFuelType(found.fuelType || 'petrol');
        setColor(found.color || '');
        setOwnerRelationship(found.ownerRelationship);
        setPhotoPreview(found.photoPreview);
        setExistingCreatedAt(found.createdAt);
        setExistingPolicyId(found.policyId);
      }
    }
    loadVehicle();
  }, [currentUser, id]);

  const handleLookupOnlineModels = async () => {
    if (!make.trim()) {
      setBanner({ type: 'info', message: 'Enter a vehicle make first (e.g. Honda, Hyundai, Toyota) to query online models.' });
      return;
    }
    setLookingUpModels(true);
    setBanner(null);
    try {
      const res = await fetch(`/api/vehicles/models/${encodeURIComponent(make.trim())}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.models) && data.models.length > 0) {
        setOnlineModels(data.models);
        setBanner({ type: 'success', message: `Loaded ${data.models.length} models for ${make} from NHTSA catalog.` });
      } else {
        setBanner({
          type: 'info',
          message: data.error || 'No extra NHTSA models found for that brand name. Choose from the Indian catalog or enter manually.',
        });
      }
    } catch {
      setBanner({ type: 'info', message: 'Online model lookup unreachable right now; enter model name manually.' });
    } finally {
      setLookingUpModels(false);
    }
  };

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

    if (!isValidRegistrationNumber(regNo)) {
      setBanner({
        type: 'error',
        message: 'Enter a valid alphanumeric registration number (6 to 12 characters, e.g. MH 12 AB 1234).',
      });
      return;
    }

    if (!make.trim() || !model.trim()) {
      setBanner({ type: 'error', message: 'Please provide both vehicle make and model.' });
      return;
    }

    const currentYear = new Date().getFullYear() + 1;
    if (year < 1980 || year > currentYear) {
      setBanner({ type: 'error', message: `Manufacturing year must be between 1980 and ${currentYear}.` });
      return;
    }

    setLoading(true);
    setBanner(null);

    const normalizedReg = normalizeRegistrationNumber(regNo);
    const displayReg = formatRegistrationNumber(regNo);
    const vehicleId = id || 'veh-' + Date.now();

    const vehicle: Vehicle = {
      id: vehicleId,
      uid: currentUser.uid,
      registrationNumber: normalizedReg,
      displayRegistrationNumber: displayReg,
      make: make.trim(),
      model: model.trim(),
      variant: variant.trim(),
      manufacturingYear: year,
      category,
      fuelType,
      color: color.trim(),
      ownerRelationship,
      policyId: existingPolicyId,
      photoPreview,
      createdAt: existingCreatedAt || Date.now(),
      updatedAt: Date.now(),
    };

    try {
      await dbSaveVehicle(currentUser.uid, vehicle);
      await dbAddActivityLog(currentUser.uid, {
        title: isEditing ? 'Vehicle Updated' : 'Vehicle Registered',
        description: `${vehicle.make} ${vehicle.model} (${vehicle.displayRegistrationNumber})`,
        type: 'vehicle',
      });
      navigate('/vehicles');
    } catch (err: any) {
      setBanner({ type: 'error', message: err.message || 'Failed to save vehicle details.' });
    } finally {
      setLoading(false);
    }
  };

  const indianModelsForMake = POPULAR_INDIAN_VEHICLES[make] || [];

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
          <h1 className="text-2xl font-extrabold text-slate-900">
            {isEditing ? t('vehicles.edit') : t('vehicles.add')}
          </h1>
          <p className="text-xs text-slate-600">
            Select from popular Indian brands, query online NHTSA models, or enter details manually.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {banner && <ToastBanner type={banner.type} message={banner.message} onClose={() => setBanner(null)} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Registration Number"
            placeholder="e.g. MH 12 AB 1234"
            value={regNo}
            onChange={(e) => setRegNo(e.target.value)}
            helperText="Automatically normalized and formatted for search."
            required
          />

          {/* Quick Indian Make Preset Chips */}
          <div className="space-y-1.5">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
              Quick Brand Selection (India)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(POPULAR_INDIAN_VEHICLES).map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => {
                    setMake(brand);
                    setOnlineModels([]);
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border cursor-pointer transition-colors ${
                    make === brand
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Input
                label="Vehicle Make"
                placeholder="e.g. Maruti Suzuki, Hyundai, Tata"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={handleLookupOnlineModels}
                disabled={lookingUpModels}
                className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Search className="w-3 h-3" />
                <span>{lookingUpModels ? 'Looking up online...' : 'Lookup Models Online (NHTSA API)'}</span>
              </button>
            </div>

            <div className="space-y-1">
              <Input
                label="Vehicle Model"
                placeholder="e.g. Swift, Creta, Nexon"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
              />
              {(indianModelsForMake.length > 0 || onlineModels.length > 0) && (
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) setModel(e.target.value);
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 text-xs px-2.5 py-1.5 text-slate-700"
                >
                  <option value="">-- Select from catalog ({indianModelsForMake.length + onlineModels.length}) --</option>
                  {indianModelsForMake.map((m) => (
                    <option key={`in-${m}`} value={m}>
                      {m}
                    </option>
                  ))}
                  {onlineModels.map((m) => (
                    <option key={`api-${m}`} value={m}>
                      {m} (NHTSA)
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Variant (Optional)"
              placeholder="e.g. VXi, SX, XZ+"
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
            />
            <Input
              label="Manufacturing Year"
              type="number"
              min={1980}
              max={new Date().getFullYear() + 1}
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
                onChange={(e) => setOwnerRelationship(e.target.value as Vehicle['ownerRelationship'])}
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
              accept="image/jpeg,image/png,image/webp"
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
              <span>{t('btn.save')}</span>
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/vehicles')} className="w-full sm:w-auto">
              {t('btn.cancel')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
