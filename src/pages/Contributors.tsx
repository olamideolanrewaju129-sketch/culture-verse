import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Contributor } from '../types';
import { Users, BookOpen, GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';

export const Contributors: React.FC = () => {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await api.getContributors();
        setContributors(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F0] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5EDE5] text-[#163D32] text-xs font-semibold">
            <Users className="w-3.5 h-3.5 text-[#D6A84F]" />
            <span>Living Indigenous Stewards</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#163D32]">
            Knowledge Keepers & Educators
          </h1>
          <p className="text-sm sm:text-base text-stone-600">
            Meet the community elders, master weavers, indigenous architectural restorers, and folklorists who safeguard and teach authentic African traditions.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-stone-500">Connecting with custodians...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contributors.map((ctb) => (
              <div
                key={ctb.id}
                className="cultural-card p-6 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={ctb.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200'}
                      alt={ctb.full_name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#D6A84F]"
                    />
                    <div>
                      <h3 className="font-editorial text-xl font-bold text-[#163D32]">
                        {ctb.full_name}
                      </h3>
                      <span className="text-xs font-semibold text-[#B85C38] capitalize">
                        {ctb.preferred_culture_name || 'Indigenous Custodian'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-4">
                    {ctb.biography}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E7E5DF] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-stone-500">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-[#D6A84F]" />
                      {ctb.resources_count} Archives
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-[#D6A84F]" />
                      {ctb.courses_count} Courses
                    </span>
                  </div>

                  <Link
                    to={`/contributors/${ctb.id}`}
                    className="font-bold text-[#163D32] hover:text-[#B85C38] flex items-center gap-1"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D6A84F]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
