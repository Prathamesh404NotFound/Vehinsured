import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto">
        <FileQuestion className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900">404 - Page Not Found</h1>
        <p className="text-sm text-slate-600">The page or assessment record you requested does not exist or has been moved.</p>
      </div>

      <Link to="/">
        <Button size="md" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Home</span>
        </Button>
      </Link>
    </div>
  );
};
