import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function Notifications(){
  const [items, setItems] = useState([])

  useEffect(()=>{ api.get('/workspaces').then(async (r)=>{
    const firstWorkspace = r.data?.[0]?.workspace?._id
    if (!firstWorkspace) return
    const n = await api.get(`/workspaces/${firstWorkspace}/notifications`)
    setItems(n.data)
  }).catch(()=>{}) }, [])

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Notifications</h3>
      <div className="space-y-2">
        {items.map(n => (
          <div key={n._id} className={`p-3 rounded border ${n.readAt ? 'bg-white' : 'bg-blue-50'}`}>
            <div className="font-medium">{n.title}</div>
            <div className="text-sm text-gray-600">{n.message}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
