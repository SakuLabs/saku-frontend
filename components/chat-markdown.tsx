'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

/**
 * Renders assistant chat content as markdown, styled to sit inside a chat
 * bubble. Spacing is tuned so single-paragraph replies stay compact while
 * lists, tables, and code still read cleanly.
 */
export function ChatMarkdown({ children }: { children: string }) {
  return (
    <div
      className={cn(
        'space-y-2 text-sm leading-relaxed break-words',
        '[&_p]:m-0',
        '[&_ul]:m-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1',
        '[&_ol]:m-0 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1',
        '[&_li]:marker:text-white/40',
        '[&_a]:text-indigo-300 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-indigo-200',
        '[&_strong]:font-semibold [&_strong]:text-white',
        '[&_em]:italic',
        '[&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-white',
        '[&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-white',
        '[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-white',
        '[&_blockquote]:border-l-2 [&_blockquote]:border-white/20 [&_blockquote]:pl-3 [&_blockquote]:text-white/70',
        '[&_hr]:border-white/10',
        '[&_code]:rounded [&_code]:bg-black/30 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em] [&_code]:font-mono',
        '[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-black/30 [&_pre]:p-3',
        '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
        '[&_table]:w-full [&_table]:border-collapse [&_table]:text-xs',
        '[&_th]:border [&_th]:border-white/10 [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-semibold',
        '[&_td]:border [&_td]:border-white/10 [&_td]:px-2 [&_td]:py-1',
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a target="_blank" rel="noopener noreferrer" {...props} />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
