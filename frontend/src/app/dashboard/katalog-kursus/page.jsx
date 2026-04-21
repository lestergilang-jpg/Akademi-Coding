'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { FiBook, FiArrowRight, FiSearch, FiStar } from 'react-icons/fi';

function CourseCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden animate-pulse">
      <div className="h-40 bg-white/5" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-full" />
        <div className="h-3 bg-white/5 rounded w-2/3" />
        <div className="h-8 bg-white/10 rounded mt-4" />
      </div>
    </div>
  );
}

export default function KatalogKursusPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [myCourseIds, setMyCourseIds] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/courses'),
      api.get('/courses/my').catch(() => ({ data: { data: [] } }))
    ])
      .then(([coursesRes, myCoursesRes]) => {
        setAllCourses(coursesRes.data.data || []);
        const myCourses = myCoursesRes.data?.data || [];
        setMyCourseIds(myCourses.map(c => c.id));
      })
      .catch(() => toast.error('Gagal memuat katalog kursus.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = allCourses.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Katalog Kursus</h1>
          <p className="text-slate-400 text-sm mt-1">
            {loading ? 'Memuat...' : `${allCourses.length} kursus tersedia`}
          </p>
        </div>
        {/* Search */}
        <div className="sm:ml-auto relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Cari kursus..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9 py-2.5 text-sm w-full sm:w-64"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <CourseCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FiBook size={48} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">{search ? `Tidak ada hasil untuk "${search}"` : 'Belum ada kursus tersedia.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(c => {
            const hasAccess = myCourseIds.includes(c.id);
            return (
              <div key={c.id} className="glass-card flex flex-col overflow-hidden hover:border-brand-500/30 transition-all duration-300 group">
                {/* Thumbnail */}
                <div className="h-44 bg-slate-800 flex items-center justify-center relative overflow-hidden">
                  {c.thumbnail ? (
                    <img
                      src={c.thumbnail}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-900/40 to-accent-900/40" />
                      <FiBook size={52} className="text-white/30 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                    </>
                  )}
                  {hasAccess && (
                    <span className="absolute top-3 right-3 bg-green-500/20 border border-green-500/30 text-green-400 text-xs px-2 py-1 rounded-full font-medium z-10">
                      ✓ Sudah Beli
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-white font-bold text-base mb-2 line-clamp-2 leading-snug">{c.title}</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-3 flex-1">{c.description}</p>

                  {/* Meta */}
                  <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
                    <FiStar size={12} className="text-yellow-400" />
                    <span>Termasuk {c.lesson_count ?? '?'} Materi</span>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                    <span className="text-brand-400 font-bold text-lg">
                      Rp {parseInt(c.price).toLocaleString('id-ID')}
                    </span>
                    <button
                      onClick={() => router.push(`/dashboard/katalog-kursus/${c.id}`)}
                      className="btn-primary py-2 px-4 text-sm"
                    >
                      Lihat Detail <FiArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
