import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import SEO from '../../components/common/SEO';
import { PUBLIC_ROUTE_SEO } from '../../utils/seoRoutesConfig';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import NoticeModal from '../../components/common/NoticeModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { NOTICE_CATEGORIES } from '../../utils/constants';
import { useFetch } from '../../hooks/useFetch';
import { getNoticesApi } from '../../services/noticeService';
import { formatDate } from '../../utils/formatDate';
import { FiCalendar, FiAlertCircle } from 'react-icons/fi';

const NoticeBoard = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [selectedNotice, setSelectedNotice] = useState(null);

  const { data, loading, error } = useFetch(
    () => getNoticesApi({ page, search, category, limit: 8 }),
    [page, search, category]
  );

  const noticesList = data?.data?.notices || data?.notices || [];
  const totalPages = data?.data?.pages || data?.pages || 1;

  const noticesSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.ssglobalpublicschool.com/' },
      { '@type': 'ListItem', position: 2, name: 'Notice Board', item: 'https://www.ssglobalpublicschool.com/notices' },
    ],
  };

  return (
    <main className="bg-[#F4EFE3] text-[#252821]">
      <SEO
        title={PUBLIC_ROUTE_SEO['/notices'].title}
        description={PUBLIC_ROUTE_SEO['/notices'].description}
        canonicalUrl={PUBLIC_ROUTE_SEO['/notices'].canonicalUrl}
        jsonLd={noticesSchema}
      />
      <PageHeader
        title="Official Notice Board"
        subtitle="Stay updated with official school circulars, exam date sheets, holiday announcements, and admissions."
        breadcrumb={[{ label: 'Notice Board' }]}
      />

      <section className="py-14 bg-[#F4EFE3] min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#EBE2CC] p-5 sm:p-6 rounded-sm border border-[#CFC5B1]">
            <SearchBar
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              onClear={() => setSearch('')}
              placeholder="Search notice by keyword..."
            />

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {NOTICE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setPage(1);
                  }}
                  className={`px-3.5 py-2 rounded-sm text-xs font-semibold transition-colors border ${
                    category === cat
                      ? 'bg-[#34483B] text-[#F4EFE3] border-[#34483B]'
                      : 'bg-[#F4EFE3] text-[#252821] border-[#CFC5B1] hover:bg-[#DED5C1]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading Circulars..." />
          ) : error ? (
            <div className="p-10 text-center bg-[#EBE2CC] rounded-sm border border-[#CFC5B1] text-[#55594E] text-sm font-medium">
              Information is temporarily unavailable. Please check again shortly.
            </div>
          ) : noticesList.length > 0 ? (
            <div className="space-y-6">
              <div className="bg-[#EBE2CC]/45 border border-[#CFC5B1] rounded-sm divide-y divide-[#CFC5B1]">
                {noticesList.map((notice) => (
                  <div
                    key={notice._id}
                    onClick={() => setSelectedNotice(notice)}
                    className="p-5 sm:p-6 hover:bg-[#EBE2CC] transition-colors cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="bg-[#34483B] text-[#F4EFE3] text-[10px] font-semibold px-2.5 py-0.5 rounded-sm uppercase tracking-wider">
                          {notice.category || 'General'}
                        </span>
                        {notice.isImportant && (
                          <span className="bg-[#7F2E2E] text-[#F4EFE3] text-[10px] font-semibold px-2.5 py-0.5 rounded-sm flex items-center gap-1 uppercase tracking-wider">
                            <FiAlertCircle /> Urgent / Important
                          </span>
                        )}
                        <span className="text-xs text-[#55594E] flex items-center gap-1">
                          <FiCalendar className="text-[#AD8746]" /> Published: {formatDate(notice.createdAt)}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-[#34483B] font-serif group-hover:text-[#AD8746] transition-colors">
                        {notice.title}
                      </h3>
                      <p className="text-sm text-[#55594E] line-clamp-2">{notice.description}</p>
                    </div>

                    <button className="shrink-0 px-4 py-2 bg-[#F4EFE3] border border-[#CFC5B1] text-[#34483B] font-semibold text-xs rounded-sm group-hover:bg-[#34483B] group-hover:text-[#F4EFE3] group-hover:border-[#34483B] transition-colors">
                      Read Full Circular
                    </button>
                  </div>
                ))}
              </div>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          ) : (
            <div className="p-12 text-center bg-[#EBE2CC] rounded-sm border border-[#CFC5B1] text-[#55594E] text-sm">
              No notices match your current search or category filter.
            </div>
          )}
        </div>
      </section>

      <NoticeModal notice={selectedNotice} onClose={() => setSelectedNotice(null)} />
    </main>
  );
};

export default NoticeBoard;
