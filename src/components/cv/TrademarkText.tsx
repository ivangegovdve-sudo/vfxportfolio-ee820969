import { Fragment, type ReactNode } from "react";

interface TrademarkTextProps {
  text: string;
  className?: string;
}

// Renders a stable registered mark while keeping the marked word + symbol unbroken.
const TrademarkText = ({ text, className }: TrademarkTextProps) => {
  // Support both literal "®" and escaped "\\u00AE" entered through editors.
  const normalizedText = text.split("\\u00AE").join("®");
  const parts = normalizedText.split("®");

  if (parts.length === 1) {
    return <span className={className}>{normalizedText}</span>;
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
      nodes.push(<TrademarkSup key={`tm-${index}`} />);
      return;
    }

    const [, leading, trailingWord] = match;
    if (leading) nodes.push(<Fragment key={`lead-${index}`}>{leading}</Fragment>);
    nodes.push(
      <span key={`nowrap-${index}`} className="inline-flex items-start whitespace-nowrap align-baseline">
        {trailingWord}
        <TrademarkSup />
      </span>
    );
  });

  return <span className={className}>{nodes}</span>;
};

const TrademarkSup = ({ className = "" }: { className?: string }) => (
  <sup
    className={`ml-[0.05em] text-[0.64em] leading-none font-semibold relative -top-[0.38em] ${className}`}
    aria-hidden="true"
  >
    ®
  </sup>
);

export default TrademarkText;
