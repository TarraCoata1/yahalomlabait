import type { ImgHTMLAttributes } from "react";

/**
 * Best-effort protection against casual image theft:
 * - blocks context menu (right-click → save)
 * - blocks native drag/save
 * - user-select none
 * - overlay div catches long-press-save on mobile
 *
 * Does NOT block screenshots — browsers/OS cannot reliably prevent that.
 */
type Props = ImgHTMLAttributes<HTMLImageElement> & {
  /** Wrapper class for the positioning box (overlay lives inside). */
  wrapperClassName?: string;
  /** Enable subtle diagonal watermark overlay. */
  watermark?: boolean;
};

export function ProtectedImg({
  wrapperClassName = "",
  watermark = false,
  className = "",
  alt = "",
  onContextMenu,
  onDragStart,
  ...rest
}: Props) {
  return (
    <div className={`relative ${wrapperClassName}`}>
      <img
        {...rest}
        alt={alt}
        draggable={false}
        onContextMenu={(e) => {
          e.preventDefault();
          onContextMenu?.(e);
        }}
        onDragStart={(e) => {
          e.preventDefault();
          onDragStart?.(e);
        }}
        className={className}
        style={{
          WebkitUserSelect: "none",
          userSelect: "none",
          WebkitTouchCallout: "none",
          WebkitUserDrag: "none",
          pointerEvents: "auto",
          ...(rest.style ?? {}),
        } as React.CSSProperties}
      />
      {/* Transparent overlay: catches long-press-save on mobile so users
         grab this div instead of the underlying img. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-auto"
        style={{ background: "transparent" }}
        onContextMenu={(e) => e.preventDefault()}
      />
      {watermark && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none select-none opacity-[0.06] mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-30deg, transparent 0 60px, currentColor 60px 62px)",
            color: "#b98a5e",
          }}
        >
          <div
            className="absolute inset-0 grid place-items-center font-serif text-4xl tracking-[0.4em]"
            style={{ transform: "rotate(-25deg)" }}
          >
            <span>יהלום לבית · יהלום לבית · יהלום לבית</span>
          </div>
        </div>
      )}
    </div>
  );
}
