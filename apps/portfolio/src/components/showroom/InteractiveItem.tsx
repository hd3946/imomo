'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface InteractiveItemProps {
  children: React.ReactNode
  name: string
  onClick: (name: string) => void
  hoverColor?: string
}

export function InteractiveItem({ children, name, onClick, hoverColor = '#06b6d4' }: InteractiveItemProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  // 간단한 마우스 호버 애니메이션 (살짝 위아래로 움직이거나 크기가 변하는 효과)
  useFrame((state) => {
    if (groupRef.current) {
      // 호버 시 살짝 떠오르는 부드러운 애니메이션
      const targetY = hovered ? 0.05 : 0
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1)
      
      // 호버 시 살짝 스케일업
      const targetScale = hovered ? 1.03 : 1
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.1))
    }
  })

  return (
    <group
      ref={groupRef}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={(e) => {
        setHovered(false)
        document.body.style.cursor = 'default'
      }}
      onClick={(e) => {
        e.stopPropagation()
        onClick(name)
      }}
    >
      {children}
      
      {/* 호버 시 오브젝트 주변에 은은한 링이나 빛 효과 추가 (시각적 힌트) */}
      {hovered && (
        <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.7, 32]} />
          <meshBasicMaterial color={hoverColor} side={THREE.DoubleSide} transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  )
}
