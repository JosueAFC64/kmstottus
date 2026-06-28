'use client';

import Link from 'next/link';
import { Icon } from '@/components/ui';

interface FAQListItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  status: string;
  view_count: number;
  upvotes: number;
  downvotes: number;
  display_order: number;
  created_at: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
  area?: {
    id: string;
    name: string;
  };
}

interface RelatedFAQsProps {
  faqs: FAQListItem[];
  currentCategory: string;
}

export default function RelatedFAQs({ faqs, currentCategory }: RelatedFAQsProps) {
  if (faqs.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-[#dee2e6] p-5">
        <h3 className="font-semibold text-[#212529] mb-3 flex items-center gap-2">
          <Icon.Question className="w-5 h-5 text-[#1a472a]" />
          Preguntas relacionadas
        </h3>
        <p className="text-sm text-[#868e96]">
          No hay preguntas relacionadas todavía.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-[#dee2e6] overflow-hidden sticky top-6">
      <div className="p-4 border-b border-[#dee2e6] bg-[#f8f9fa]">
        <h3 className="font-semibold text-[#212529] flex items-center gap-2">
          <Icon.Question className="w-5 h-5 text-[#1a472a]" />
          Preguntas relacionadas
        </h3>
        {currentCategory && (
          <p className="text-xs text-[#868e96] mt-1">
            De la categoría: {currentCategory}
          </p>
        )}
      </div>
      <div className="divide-y divide-[#dee2e6]">
        {faqs.map((faq) => (
          <Link
            key={faq.id}
            href={`/dashboard/faqs/${faq.id}`}
            className="block p-4 hover:bg-[#f8f9fa] transition-colors group"
          >
            <h4 className="text-sm font-medium text-[#495057] group-hover:text-[#1a472a] transition-colors line-clamp-2 mb-2">
              {faq.question}
            </h4>
            <div className="flex items-center gap-3 text-xs text-[#868e96]">
              {faq.category && (
                <span className="px-2 py-0.5 bg-[#e9ecef] rounded text-[#868e96]">
                  {faq.category}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Icon.Eye className="w-3 h-3" />
                {faq.view_count}
              </span>
            </div>
          </Link>
        ))}
      </div>
      <div className="p-3 border-t border-[#dee2e6]">
        <Link
          href={`/dashboard/faqs?category=${encodeURIComponent(currentCategory)}`}
          className="text-sm text-[#1a472a] hover:underline flex items-center gap-1"
        >
          Ver todas las de {currentCategory}
          <Icon.ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
