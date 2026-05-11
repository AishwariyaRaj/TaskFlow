import React from 'react'

const COLORS = [
  'from-indigo-600 to-violet-600',
  'from-blue-600 to-cyan-600',
  'from-emerald-600 to-teal-600',
  'from-rose-600 to-pink-600',
  'from-amber-600 to-orange-600',
  'from-fuchsia-600 to-purple-600',
]

function getColor(name = '') {
  const code = name.charCodeAt(0) || 0
  return COLORS[code % COLORS.length]
}

function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('')
}

export default function Avatar({ name = '', size = 'md', className = '' }) {
  const sizeClass = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-14 h-14 text-lg',
  }[size] || 'w-9 h-9 text-sm'

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white flex-shrink-0 bg-gradient-to-br ${getColor(name)} ${sizeClass} ${className}`}
      title={name}
    >
      {getInitials(name) || '?'}
    </div>
  )
}

export function AvatarGroup({ names = [], max = 3, size = 'sm' }) {
  const shown = names.slice(0, max)
  const rest = names.length - max

  return (
    <div className="flex items-center">
      {shown.map((name, i) => (
        <div key={i} style={{ marginLeft: i === 0 ? 0 : '-8px', zIndex: max - i }}>
          <Avatar name={name} size={size} className="ring-2 ring-[#22222e]" />
        </div>
      ))}
      {rest > 0 && (
        <div
          style={{ marginLeft: '-8px', zIndex: 0 }}
          className={`inline-flex items-center justify-center rounded-full text-[10px] font-semibold bg-[#2e2e3e] text-[#8b8ba8] ring-2 ring-[#22222e] ${
            size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'
          }`}
        >
          +{rest}
        </div>
      )}
    </div>
  )
}
