

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  itemName?: string; // e.g. "locations", "staff", "items"
}

export const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  itemName = "items",
}: PaginationProps) => {
  return (
    <div className="bg-linear-to-r from-slate-50 to-blue-50 px-6 py-1 border-t-2 border-slate-200">
      <div className="flex items-center justify-between">
        {/* Left Side: Info */}
        <div className="flex items-center gap-3">
          <p className="text-sm text-slate-700 uppercase font-bold">
            Page {currentPage} of {totalPages}
          </p>
          <span className="px-3 py-1.5 bg-linear-to-r from-indigo-100 to-blue-100 text-indigo-700 rounded-lg text-xs font-bold uppercase shadow-sm border border-indigo-200">
            {totalItems} {itemName}
          </span>
        </div>

        {/* Right Side: Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="px-4 py-2.5 text-xs font-bold uppercase bg-white border-2 border-slate-300 rounded-lg hover:bg-indigo-50 hover:border-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            First
          </button>
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-5 py-2.5 text-xs font-bold uppercase bg-white border-2 border-slate-300 rounded-lg hover:bg-indigo-50 hover:border-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-5 py-2.5 text-xs font-bold uppercase bg-white border-2 border-slate-300 rounded-lg hover:bg-indigo-50 hover:border-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Next
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="px-4 py-2.5 text-xs font-bold uppercase bg-white border-2 border-slate-300 rounded-lg hover:bg-indigo-50 hover:border-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
};