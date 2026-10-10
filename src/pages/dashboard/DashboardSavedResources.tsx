import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { CulturalResource } from '../../types';
import { ResourceCard } from '../../components/ResourceCard';
import { Bookmark, BookOpen } from 'lucide-react';

export const DashboardSavedResources: React.FC = () => {
  const [savedResources, setSavedResources] = useState<CulturalResource[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      const data = await api.getSavedResources();
      setSavedResources(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleToggle = async (id: string) => {
    await api.toggleSaveResource(id);
    fetchSaved();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="font-editorial text-3xl font-bold text-[#163D32]">
          Saved Cultural Resources
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          Articles, textile tutorials, and oral histories bookmarked for your personal study.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-stone-500">Loading saved items...</div>
      ) : savedResources.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-[#E7E5DF] text-center space-y-3">
          <Bookmark className="w-8 h-8 text-stone-300 mx-auto" />
          <h3 className="font-editorial text-lg font-bold text-[#163D32]">
            No saved resources yet.
          </h3>
          <p className="text-xs text-stone-500">
            Click the bookmark icon on any cultural article in the library to save it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedResources.map((r) => (
            <ResourceCard
              key={r.id}
              resource={r}
              isSaved={true}
              onToggleSave={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};
