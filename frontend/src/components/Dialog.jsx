import { AlertTriangle } from 'lucide-react'

export default function Dialog({ title, message, icon, actions }) {
  return (
    <div className="y2k-dialog mx-auto">
      <div className="y2k-title-bar">
        <div className="title-text">
          <span>{icon || <AlertTriangle size={12} />}</span>
          <span>{title}</span>
        </div>
      </div>
      <div className="y2k-dialog-body">{message}</div>
      {actions && <div className="y2k-dialog-actions">{actions}</div>}
    </div>
  )
}
