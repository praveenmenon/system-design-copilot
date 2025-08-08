import { Excalidraw } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'
import { useEffect } from 'react'

export default function SimpleExcalidraw() {
  useEffect(() => {
    console.log('SimpleExcalidraw component mounted')
  }, [])

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Excalidraw />
    </div>
  )
}