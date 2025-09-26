"use client"

import { useState, useEffect, useRef, FC } from "react"
import {
  BookmarkIcon,
  TrashIcon,
  ClockIcon,
  AcademicCapIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline"

// --- TYPE DEFINITIONS ---

interface Summary {
  id: string;
  title: string;
  content: string;
  subject: string;
  detailLevel: 'short' | 'medium' | 'detailed';
  createdAt: string;
}

interface SummaryCardProps {
  summary: Summary;
  onDelete: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  isBookmarked: boolean;
}

// Extend the global Window interface to inform TypeScript about the external libraries
declare global {
  interface Window {
    marked: {
      parse: (markdown: string, options?: object) => string;
    };
    renderMathInElement: (element: HTMLElement, options?: object) => void;
  }
}

// --- HELPER FUNCTIONS ---

const formatDate = (dateString: string): string => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const truncateText = (text: string, length: number): string => {
  const plainText = text.replace(/(\*\*|##|###|`|\-|\*|\||\$\$)/g, "").replace(/\s+/g, ' ');
  if (!plainText || plainText.length <= length) return plainText;
  return plainText.substring(0, length) + "...";
};


export const SummaryCard: FC<SummaryCardProps> = ({ summary, onDelete, onToggleBookmark, isBookmarked }) => {
  const [expanded, setExpanded] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = () => {
    onDelete(summary.id)
    setShowDeleteConfirm(false)
  }

  const getDetailLevelColor = (level: Summary['detailLevel']): string => {
    switch (level) {
      case "short":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "detailed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }
  
  const getDetailLevelLabel = (level: Summary['detailLevel']): string => {
    if (!level) return "Standard";
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  const MarkdownRenderer: FC<{ content: string }> = ({ content }) => {
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const element = contentRef.current;
      if (!element) return;

      if (window.marked && window.renderMathInElement) {
        element.innerHTML = window.marked.parse(content, { gfm: true, breaks: true });
        window.renderMathInElement(element, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
          ],
          throwOnError: false
        });
      } else {
        element.textContent = content;
        console.warn("Marked.js or KaTeX not found. Please add the required script tags to your index.html.");
      }
    }, [content]);

    return <div ref={contentRef} className="prose dark:prose-invert max-w-none prose-table:w-full prose-table:border prose-table:border-gray-300 prose-thead:bg-gray-50 dark:prose-thead:bg-gray-700 prose-th:border prose-th:px-4 prose-th:py-2 prose-th:text-left prose-td:border prose-td:px-4 prose-td:py-2" />;
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{summary.title}</h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <AcademicCapIcon className="w-4 h-4" />
                <span>{summary.subject}</span>
              </div>
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-4 h-4" />
                <span>{formatDate(summary.createdAt)}</span>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getDetailLevelColor(summary.detailLevel)}`}>
                {getDetailLevelLabel(summary.detailLevel)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => onToggleBookmark(summary.id)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isBookmarked ? (
                <BookmarkIcon className="w-5 h-5 text-yellow-500 fill-current" />
              ) : (
                <BookmarkIcon className="w-5 h-5 text-gray-400" />
              )}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-600 dark:text-red-400"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
          {expanded ? (
            <MarkdownRenderer content={summary.content} />
          ) : (
            <p className="whitespace-pre-wrap">{truncateText(summary.content, 400)}</p>
          )}
          {summary.content.length > 400 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 text-sm mt-4 font-medium no-underline hover:underline"
            >
              {expanded ? (
                <><ChevronUpIcon className="w-4 h-4" /><span>Show less</span></>
              ) : (
                <><ChevronDownIcon className="w-4 h-4" /><span>Show more</span></>
              )}
            </button>
          )}
        </div>

        {/* Footer Section */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">{summary.content.split(/\s+/).length} words</div>
          <div className="flex items-center space-x-2">
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Export</button>
            <button className="text-sm text-green-600 dark:text-green-400 hover:underline">Share</button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delete Summary?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete "{summary.title}"? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

