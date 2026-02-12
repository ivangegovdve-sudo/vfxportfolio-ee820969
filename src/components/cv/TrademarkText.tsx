import { Fragment, type ReactNode } from "react";

interface TrademarkTextProps {
  text: string;
  className?: string;
}

// Renders a subtle superscript registered mark while keeping the marked word unbroken.
const TrademarkText = ({ text, className }: TrademarkTextProps) => {
  const parts = text.split("\u00AE");

  if (parts.length === 1) {
    return <span className={className}>{text}</span>;
  }

  const nodes: ReactNode[] = [];

  parts.forEach((part, index) => {
    const isLast = index === parts.length - 1;

    if (isLast) {
      if (part) nodes.push(<Fragment key={`tail-${index}`}>{part}</Fragment>);
      return;
    }

    const match = part.match(/^(.*?)([^\s]+)$/s);

    if (!match) {
      if (part) nodes.push(<Fragment key={`part-${index}`}>{part}</Fragment>);
      nodes.push(
        <sup key={`tm-${index}`} className="text-[0.72em] align-super leading-none">
          \u00AE
        </sup>
      );
      return;
    }

    const [, leading, trailingWord] = match;
    if (leading) nodes.push(<Fragment key={`lead-${index}`}>{leading}</Fragment>);
    nodes.push(
      <span key={`nowrap-${index}`} className="whitespace-nowrap">
        {trailingWord}
        <sup className="text-[0.72em] align-super leading-none">\u00AE</sup>
      </span>
    );
  });

  return <span className={className}>{nodes}</span>;
};

export default TrademarkText;
