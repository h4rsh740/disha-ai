import { formatChatBlocks, formatInlineText } from '@/lib/chat-format';

function InlineText({ text }: { text: string }) {
  return formatInlineText(text).map((part, index) => {
    if (part.type === 'bold') return <strong key={index}>{part.text}</strong>;
    if (part.type === 'italic') return <em key={index}>{part.text}</em>;
    if (part.type === 'code') return <code key={index}>{part.text}</code>;
    return part.text;
  });
}

export function MessageContent({ content, className }: { content: string; className?: string }) {
  return (
    <div className={className}>
      {formatChatBlocks(content).map((block, index) => {
        if (block.type === 'code') return <pre key={index}><code>{block.text}</code></pre>;
        if (block.type === 'heading') {
          const Heading = block.level === 1 ? 'h3' : block.level === 2 ? 'h4' : 'h5';
          return <Heading key={index}><InlineText text={block.text} /></Heading>;
        }
        if (block.type === 'list') {
          const items = block.items.map((item, itemIndex) => <li key={itemIndex}><InlineText text={item} /></li>);
          return block.ordered ? <ol key={index} start={block.start}>{items}</ol> : <ul key={index}>{items}</ul>;
        }
        return <p key={index}><InlineText text={block.text} /></p>;
      })}
    </div>
  );
}
