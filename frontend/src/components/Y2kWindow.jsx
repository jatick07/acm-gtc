import { Trash2 } from 'lucide-react'

// OS-style window with title bar + control squares.
export default function Y2kWindow({
  title,
  children,
  className = '',
  showControls = true,
  onTrash,
  titleIcon,
  rightSlot,
}) {
  return (
    <div className={`y2k-window w-full ${className}`}>
      <div className="y2k-title-bar">
        <div className="title-text">
          {titleIcon && <span>{titleIcon}</span>}
          <span>{title}</span>
          <span className="text-white/50 select-none">······</span>
        </div>
        <div className="flex items-center gap-2">
          {rightSlot && <div className="flex items-center gap-2">{rightSlot}</div>}
          {showControls && (
            <div className="y2k-controls">
              <span className="min" title="minimize">
                _
              </span>
              <span className="max" title="maximize">
                □
              </span>
              <span
                className="close"
                title="close"
                onClick={onTrash}
              >
                {onTrash && <Trash2 size={9} />}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="y2k-window-body">{children}</div>
    </div>
  )
}
