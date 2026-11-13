import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, FileDown, Plus } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { dbGetClaims } from '../../services/database';
import { ClaimAssistanceCase } from '../../types';
import { Button } from '../../components/ui/Button';

export const MyReportsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [claims, setClaims] = useState<ClaimAssistanceCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    async function load() {
      setLoading(true);
      const list = await dbGetClaims(currentUser!.uid);
      setClaims(list);
      setLoading(false);
    }
    load();
  }, [currentUser]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Reports & Cases</h1>
          <p className="text-xs text-slate-600">History of created accident assessment reports and submitted cases.</p>
        </div>

        <Link to="/claim-wizard">
          <Button size="md" className="gap-2">
            <Plus className="w-4 h-4" />
            <span>New Report</span>
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10 text-xs text-slate-500">Loading claims...</div>
      ) : claims.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900">No Reports Found</h3>
          <Link to="/claim-wizard"><Button size="sm">Create First Report</Button></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {claims.map((claim) => (
            <div key={claim.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{claim.caseReference}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {claim.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Incident: {claim.incidentDate} &bull; Locality: {claim.location || 'N/A'} &bull; Photos: {claim.evidenceList.length}
                </p>
              </div>

              <Link to={`/report-preview?id=${claim.id}`}>
                <Button size="sm" variant="outline">View Full Report</Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
