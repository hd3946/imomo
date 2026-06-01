'use client'

import { useRef, useState, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture, Line, Html } from '@react-three/drei'
import * as THREE from 'three'

interface GlobeModelProps {
  onSelectItem: (name: string | null) => void
  activeItem: string | null
  isInteracting: boolean
  pixels: Record<string, { color: string; occupant: string }>
  claimNotes: Record<string, { name: string; message: string }>
  userColor: string
  onRegisterPixel: (gx: number, gy: number, color: string) => void
  onCameraZoomTarget?: (target: THREE.Vector3) => void
}

interface CountryPin {
  name: string
  label: string
  lat: number
  lon: number
  color: string
}

interface ClaimedTerritory {
  key: string
  gx: number
  gy: number
  color: string
  occupant: string
  position: THREE.Vector3
  direction: THREE.Vector3
  isLatest: boolean
}

const countries: CountryPin[] = [
  { name: '한국 (Seoul)', label: '🇰🇷 대한민국', lat: 37.5665, lon: 126.978, color: '#06b6d4' },
  { name: '일본 (Tokyo)', label: '🇯🇵 日本 (Japan)', lat: 35.6762, lon: 139.6503, color: '#ec4899' },
  { name: '중국 (Beijing)', label: '🇨🇳 中国 (China)', lat: 39.9042, lon: 116.4074, color: '#f59e0b' },
  { name: '베트남 (Hanoi)', label: '🇻🇳 Việt Nam', lat: 21.0285, lon: 105.8542, color: '#10b981' },
  { name: '미국 (New York)', label: '🇺🇸 United States', lat: 40.7128, lon: -74.006, color: '#8b5cf6' },
]

// 위도/경도 → 3D Vector3 변환
function convertLatLngToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  const x = -(radius * Math.sin(phi) * Math.sin(theta))
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.cos(theta)
  return new THREE.Vector3(x, y, z)
}

function isUserTerritory(occupant: string): boolean {
  return occupant.includes('(나)')
}

function drawTerritoryPatch(ctx: CanvasRenderingContext2D, gx: number, gy: number, color: string, isMine: boolean) {
  const size = isMine ? 5 : 3
  const half = Math.floor(size / 2)
  const x = Math.max(0, Math.min(ctx.canvas.width - size, gx - half))
  const y = Math.max(0, Math.min(ctx.canvas.height - size, gy - half))

  if (isMine) {
    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    ctx.fillRect(x - 1, y - 1, size + 2, size + 2)
  }

  ctx.fillStyle = color
  ctx.fillRect(x, y, size, size)
}

// ─── Ping 레이더 웨이브 링 ────────────────────────────────────────────────────
interface PingRingProps {
  position: THREE.Vector3
  color: string
  direction: THREE.Vector3
  delay: number
}

function PingRing({ position, color, direction, delay }: PingRingProps) {
  const ringRef = useRef<THREE.Mesh>(null!)
  const t = useRef(delay)

  const quaternion = useMemo(() => {
    const up = new THREE.Vector3(0, 1, 0)
    return new THREE.Quaternion().setFromUnitVectors(up, direction.clone().normalize())
  }, [direction])

  const offsetPos = useMemo(
    () => position.clone().add(direction.clone().normalize().multiplyScalar(0.02)),
    [position, direction],
  )

  useFrame((_, delta) => {
    t.current += delta * 0.7
    if (t.current > 1) {
      t.current = 0
    }

    const scale = t.current * 3 + 1
    const opacity = (1 - t.current) * 0.55

    if (ringRef.current) {
      ringRef.current.scale.setScalar(scale)
      ;(ringRef.current.material as THREE.MeshBasicMaterial).opacity = opacity
    }
  })

  return (
    <mesh ref={ringRef} position={offsetPos} quaternion={quaternion}>
      <ringGeometry args={[0.07, 0.095, 32]} />
      <meshBasicMaterial color={color} transparent depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

// ─── 핀 클릭/점령 파티클 폭발 이펙트 ───────────────────────────────────────────────
interface ParticleExplosionProps {
  position: THREE.Vector3
  color: string
  onDone: () => void
}

function ParticleExplosion({ position, color, onDone }: ParticleExplosionProps) {
  const pointsRef = useRef<THREE.Points>(null!)
  const timeRef = useRef(0)
  const DURATION = 0.9
  const COUNT = 28

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3)
    const vel: number[] = []
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = position.x
      pos[i * 3 + 1] = position.y
      pos[i * 3 + 2] = position.z
      vel.push((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6)
    }
    return { positions: pos, velocities: vel }
  }, [position])

  useFrame((_, delta) => {
    if (!pointsRef.current) return
    timeRef.current += delta
    if (timeRef.current > DURATION) {
      onDone()
      return
    }

    const progress = timeRef.current / DURATION
    const geo = pointsRef.current.geometry
    const posAttr = geo.getAttribute('position') as THREE.BufferAttribute

    for (let i = 0; i < COUNT; i++) {
      const t = 1 - Math.pow(1 - progress, 2)
      posAttr.setXYZ(
        i,
        position.x + (velocities[i * 3] ?? 0) * t * 1.8,
        position.y + (velocities[i * 3 + 1] ?? 0) * t * 1.8,
        position.z + (velocities[i * 3 + 2] ?? 0) * t * 1.8,
      )
    }
    posAttr.needsUpdate = true
    ;(pointsRef.current.material as THREE.PointsMaterial).opacity = Math.pow(1 - progress, 1.8)
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={COUNT} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.05}
        transparent
        opacity={1}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// ─── 네온 아크 커넥션 ─────────────────────────────────────────────────────────
interface NeonArcProps {
  start: THREE.Vector3
  end: THREE.Vector3
  color: string
  globeRadius: number
  isHighlighted: boolean
  speed: number
}

function NeonArc({ start, end, color, isHighlighted, speed }: NeonArcProps) {
  const pointsRef = useRef<THREE.Vector3[]>([])
  const curveRef = useRef<THREE.QuadraticBezierCurve3 | null>(null)
  const pulseRef = useRef<THREE.Mesh>(null!)
  const progress = useRef(Math.random())

  if (pointsRef.current.length === 0) {
    const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
    const distance = start.distanceTo(end)
    const altitude = distance * 0.42
    const normal = midPoint.clone().normalize()
    const controlPoint = midPoint.clone().add(normal.multiplyScalar(altitude))
    const curve = new THREE.QuadraticBezierCurve3(start, controlPoint, end)
    curveRef.current = curve
    pointsRef.current = curve.getPoints(48)
  }

  useFrame((state, delta) => {
    if (!pulseRef.current || !curveRef.current) return
    progress.current += delta * speed
    if (progress.current > 1) {
      progress.current = 0
    }
    const point = curveRef.current.getPointAt(progress.current)
    pulseRef.current.position.copy(point)

    if (isHighlighted) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.4
      pulseRef.current.scale.setScalar(pulse)
    } else {
      pulseRef.current.scale.setScalar(1)
    }
  })

  return (
    <group>
      <Line
        points={pointsRef.current}
        color={color}
        lineWidth={isHighlighted ? 3.0 : 1.5}
        transparent
        opacity={isHighlighted ? 0.85 : 0.4}
      />
      <mesh ref={pulseRef}>
        <sphereGeometry args={[isHighlighted ? 0.045 : 0.025, 8, 8]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  )
}

// ─── GlobeModel 메인 컴포넌트 ────────────────────────────────────────────────
export function GlobeModel({
  onSelectItem,
  activeItem,
  isInteracting,
  pixels,
  claimNotes,
  userColor,
  onRegisterPixel,
  onCameraZoomTarget,
}: GlobeModelProps) {
  const globeGroupRef = useRef<THREE.Group>(null!)
  const [hoveredPin, setHoveredPin] = useState<string | null>(null)
  const [hoveredClaimKey, setHoveredClaimKey] = useState<string | null>(null)
  const [selectedClaimKey, setSelectedClaimKey] = useState<string | null>(null)
  const [hoveredPixel, setHoveredPixel] = useState<{ gx: number; gy: number; pos: THREE.Vector3 } | null>(null)
  const rotationSpeedRef = useRef(0.002)
  const globePointerDownRef = useRef<{ x: number; y: number } | null>(null)

  // 파티클 폭발 이펙트 목록
  const [explosions, setExplosions] = useState<{ id: number; position: THREE.Vector3; color: string }[]>([])
  const explosionIdRef = useRef(0)

  const globeRadius = 1.5

  // 텍스처 로딩
  const earthTexture = useTexture(
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
  )
  const earthLights = useTexture(
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_lights_2048.png',
  )

  earthTexture.colorSpace = THREE.SRGBColorSpace
  earthLights.colorSpace = THREE.SRGBColorSpace

  // 아크 속도 랜덤화
  const arcSpeeds = useMemo(() => countries.slice(1).map(() => 0.18 + Math.random() * 0.38), [])

  // ─── 실시간 픽셀 그리기 캔버스 및 텍스처 ────────────────────────────────────
  const canvasSize = 360
  const canvas = useMemo(() => {
    const el = document.createElement('canvas')
    el.width = canvasSize
    el.height = canvasSize / 2 // 2:1 바둑판 비율
    const ctx = el.getContext('2d')
    if (ctx) {
      ctx.fillStyle = 'rgba(0,0,0,0)'
      ctx.fillRect(0, 0, el.width, el.height)
    }
    return el
  }, [])

  const canvasTexture = useMemo(() => {
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [canvas])

  const prevPixelsRef = useRef<Record<string, { color: string; occupant: string }>>({})

  const claimedTerritories = useMemo<ClaimedTerritory[]>(() => {
    const userClaims = Object.entries(pixels)
      .filter(([key, val]) => isUserTerritory(val.occupant) || claimNotes[key])
      .slice(-20)

    return userClaims.map(([key, val], index) => {
      const [gxStr, gyStr] = key.split('_')
      const gx = parseInt(gxStr || '0', 10)
      const gy = parseInt(gyStr || '0', 10)
      const lon = gx - 180 + 0.5
      const lat = 90 - gy - 0.5
      const position = convertLatLngToVector3(lat, lon, globeRadius + 0.07)
      const direction = position.clone().normalize()

      return {
        key,
        gx,
        gy,
        color: val.color,
        occupant: val.occupant,
        position,
        direction,
        isLatest: index === userClaims.length - 1,
      }
    })
  }, [pixels, claimNotes])

  // pixels 데이터 변경 감지 시 캔버스 다시 그리고 신규 픽셀 지점에 불꽃놀이 격발
  useEffect(() => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    Object.entries(pixels).forEach(([key, val]) => {
      const [gxStr, gyStr] = key.split('_')
      const gx = parseInt(gxStr || '0', 10)
      const gy = parseInt(gyStr || '0', 10)

      drawTerritoryPatch(ctx, gx, gy, val.color, isUserTerritory(val.occupant))

      // 직전 프레임에 없던 신규 픽셀 점령 감지 시 폭발 이펙트 뿜기
      if (!prevPixelsRef.current[key]) {
        // 격자(gx, gy) -> 위경도 역산
        const lon = gx - 180
        const lat = 90 - gy

        const localPos = convertLatLngToVector3(lat, lon, globeRadius)
        const worldPos = localPos.clone()
        if (globeGroupRef.current) {
          worldPos.applyMatrix4(globeGroupRef.current.matrixWorld)
        }

        const id = explosionIdRef.current++
        setExplosions((prev) => [...prev, { id, position: worldPos, color: val.color }])
      }
    })

    canvasTexture.needsUpdate = true
    prevPixelsRef.current = { ...pixels }
  }, [pixels, canvas, canvasTexture])

  // 키보드 이벤트 탐색 리스너
  useEffect(() => {
    const pinNames = countries.map((c) => c.name)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        const currentIndex = activeItem ? pinNames.indexOf(activeItem) : -1
        const nextIndex = (currentIndex + 1) % pinNames.length
        onSelectItem(pinNames[nextIndex] ?? null)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        const currentIndex = activeItem ? pinNames.indexOf(activeItem) : 0
        const prevIndex = (currentIndex - 1 + pinNames.length) % pinNames.length
        onSelectItem(pinNames[prevIndex] ?? null)
      } else if (e.key === 'Escape') {
        onSelectItem(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeItem, onSelectItem])

  // 매 프레임 자전 회전 보간
  useFrame((_, delta) => {
    const targetSpeed = isInteracting ? 0 : 0.0007
    rotationSpeedRef.current = THREE.MathUtils.lerp(rotationSpeedRef.current, targetSpeed, 0.08)

    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.y += rotationSpeedRef.current
      globeGroupRef.current.updateMatrixWorld()
    }
  })

  const handleGlobePointerDown = (e: any) => {
    globePointerDownRef.current = {
      x: e.nativeEvent?.clientX ?? 0,
      y: e.nativeEvent?.clientY ?? 0,
    }
  }

  const didDragBeforeGlobeClick = (e: any) => {
    if (typeof e.delta === 'number') {
      return e.delta > 8
    }

    const pointerDown = globePointerDownRef.current
    if (!pointerDown) return false

    const dx = (e.nativeEvent?.clientX ?? pointerDown.x) - pointerDown.x
    const dy = (e.nativeEvent?.clientY ?? pointerDown.y) - pointerDown.y
    return Math.hypot(dx, dy) > 8
  }

  // 지구 표면 마우스 단일 클릭 시 픽셀 점령 등록
  const handleGlobeClick = (e: any) => {
    e.stopPropagation()
    setSelectedClaimKey(null)
    if (didDragBeforeGlobeClick(e) || !e.point) {
      globePointerDownRef.current = null
      return
    }

    // 월드 클릭 좌표를 지구본 로컬 좌표로 변환
    const localPoint = e.point.clone()
    if (globeGroupRef.current) {
      globeGroupRef.current.worldToLocal(localPoint)
    }

    // 로컬 좌표 -> 구면 좌표 역산
    const phi = Math.acos(Math.max(-1, Math.min(1, localPoint.y / globeRadius)))
    const theta = Math.atan2(-localPoint.x, localPoint.z)

    let lon = (theta * 180) / Math.PI - 180
    let lat = 90 - (phi * 180) / Math.PI

    if (lon < -180) lon += 360
    if (lon > 180) lon -= 360

    // 격자 좌표 정형화
    const gx = Math.floor(lon + 180)
    const gy = Math.floor(90 - lat)

    if (gx >= 0 && gx < 360 && gy >= 0 && gy < 180) {
      onRegisterPixel(gx, gy, userColor)
    }

    globePointerDownRef.current = null
  }

  const showPinPointer = (name: string) => {
    setHoveredPin(name)
    document.body.style.cursor = 'pointer'
  }

  const clearPinPointer = () => {
    setHoveredPin(null)
    document.body.style.cursor = 'default'
  }

  const showClaimPointer = (key: string) => {
    setHoveredClaimKey(key)
    document.body.style.cursor = 'pointer'
  }

  const clearClaimPointer = () => {
    setHoveredClaimKey(null)
    document.body.style.cursor = 'default'
  }

  const handleClaimMarkerClick = (key: string, e: any) => {
    e.stopPropagation()
    setSelectedClaimKey((currentKey) => (currentKey === key ? null : key))
  }

  // 핀 클릭
  const handlePinClick = (name: string, e?: THREE.Event | MouseEvent) => {
    ;(e as any)?.stopPropagation?.()
    if (activeItem === name) {
      onSelectItem(null)
    } else {
      onSelectItem(name)
    }
  }

  // 핀 더블클릭 줌인
  const handlePinDoubleClick = (name: string, e?: THREE.Event | MouseEvent) => {
    ;(e as any)?.stopPropagation?.()
    const country = countries.find((c) => c.name === name)
    if (country && onCameraZoomTarget) {
      const localPos = convertLatLngToVector3(country.lat, country.lon, globeRadius)
      const worldPos = localPos.clone()
      if (globeGroupRef.current) {
        worldPos.applyMatrix4(globeGroupRef.current.matrixWorld)
      }
      onCameraZoomTarget(worldPos)
    }
  }

  const koreaPin = countries[0]!
  const koreaPos = convertLatLngToVector3(koreaPin.lat, koreaPin.lon, globeRadius)

  return (
    <>
      {/* 픽셀 점령/타격 파티클 폭발 이펙트 레이어 (세계좌표) */}
      {explosions.map((ex) => (
        <ParticleExplosion
          key={ex.id}
          position={ex.position}
          color={ex.color}
          onDone={() => setExplosions((prev) => prev.filter((e) => e.id !== ex.id))}
        />
      ))}

      <group ref={globeGroupRef}>
        {/* ① 지구본 코어 구체 */}
        <mesh
          onPointerDown={handleGlobePointerDown}
          onClick={handleGlobeClick}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'crosshair'
          }}
          onPointerOut={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'default'
            setHoveredPixel(null)
          }}
          onPointerMove={(e) => {
            e.stopPropagation()
            if (isInteracting || !e.point) {
              setHoveredPixel(null)
              return
            }

            const localPoint = e.point.clone()
            if (globeGroupRef.current) {
              globeGroupRef.current.worldToLocal(localPoint)
            }

            const phi = Math.acos(Math.max(-1, Math.min(1, localPoint.y / globeRadius)))
            const theta = Math.atan2(-localPoint.x, localPoint.z)

            let lon = (theta * 180) / Math.PI - 180
            let lat = 90 - (phi * 180) / Math.PI

            if (lon < -180) lon += 360
            if (lon > 180) lon -= 360

            const gx = Math.floor(lon + 180)
            const gy = Math.floor(90 - lat)

            if (gx >= 0 && gx < 360 && gy >= 0 && gy < 180) {
              const fitPos = convertLatLngToVector3(lat, lon, globeRadius + 0.01)
              setHoveredPixel({ gx, gy, pos: fitPos })
            } else {
              setHoveredPixel(null)
            }
          }}
        >
          <sphereGeometry args={[globeRadius, 64, 64]} />
          <meshStandardMaterial
            map={earthTexture}
            color="#ffffff"
            roughness={0.2}
            metalness={0.7}
            emissive="#fbbf24"
            emissiveMap={earthLights}
            emissiveIntensity={2.8}
            transparent
            opacity={0.98}
          />
        </mesh>

        {/* ─── 실시간 픽셀 점령 맵 오버레이 구체 ─── */}
        <mesh>
          <sphereGeometry args={[globeRadius + 0.005, 64, 64]} />
          <meshBasicMaterial
            map={canvasTexture}
            transparent
            opacity={0.85}
            depthWrite={false}
            blending={THREE.NormalBlending}
          />
        </mesh>

        {/* ③ 대기광 아우라 */}
        <mesh>
          <sphereGeometry args={[globeRadius + 0.08, 32, 32]} />
          <meshBasicMaterial
            color="#6366f1"
            transparent
            opacity={0.25}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
          />
        </mesh>

        {/* ④ 적도 네온 링 */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[globeRadius + 0.04, globeRadius + 0.06, 64]} />
          <meshStandardMaterial color="#533afd" emissive="#533afd" emissiveIntensity={1.2} transparent opacity={0.4} />
        </mesh>

        {/* ─── 직접 점령 유도를 위한 마우스 호버 가이드 ─── */}
        {hoveredPixel && (
          <group position={hoveredPixel.pos}>
            <mesh>
              <sphereGeometry args={[0.03, 16, 16]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.04, 0.06, 32]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.5}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )}

        {/* ─── 점령 영토 기반 방명록 표식 ─── */}
        {claimedTerritories.map((territory) => {
          const note = claimNotes[territory.key]
          const isSelected = selectedClaimKey === territory.key
          const isHovered = hoveredClaimKey === territory.key
          const isFocused = isSelected || isHovered || territory.isLatest
          const markerSize = isFocused ? 0.07 : 0.046
          const ringOuter = isFocused ? 0.145 : 0.108
          const labelText = note
            ? note.message
            : `${territory.occupant} 점령 영토 ${territory.gx},${territory.gy}`

          return (
            <group key={`claim-${territory.key}`} position={territory.position}>
              <mesh
                onPointerOver={(e) => {
                  e.stopPropagation()
                  showClaimPointer(territory.key)
                }}
                onPointerOut={(e) => {
                  e.stopPropagation()
                  clearClaimPointer()
                }}
                onClick={(e) => handleClaimMarkerClick(territory.key, e)}
              >
                <sphereGeometry args={[markerSize, 16, 16]} />
                <meshBasicMaterial
                  color={territory.color}
                  transparent
                  opacity={isFocused ? 1 : 0.82}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
              <mesh
                quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), territory.direction)}
                onPointerOver={(e) => {
                  e.stopPropagation()
                  showClaimPointer(territory.key)
                }}
                onPointerOut={(e) => {
                  e.stopPropagation()
                  clearClaimPointer()
                }}
                onClick={(e) => handleClaimMarkerClick(territory.key, e)}
              >
                <ringGeometry args={[0.08, ringOuter, 32]} />
                <meshBasicMaterial
                  color={note ? '#ffffff' : territory.color}
                  transparent
                  opacity={isFocused ? 0.86 : 0.48}
                  side={THREE.DoubleSide}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
              <mesh
                position={territory.direction.clone().multiplyScalar(0.04)}
                onPointerOver={(e) => {
                  e.stopPropagation()
                  showClaimPointer(territory.key)
                }}
                onPointerOut={(e) => {
                  e.stopPropagation()
                  clearClaimPointer()
                }}
                onClick={(e) => handleClaimMarkerClick(territory.key, e)}
              >
                <sphereGeometry args={[0.14, 12, 12]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
              {isFocused && (
                <Html position={territory.direction.clone().multiplyScalar(0.24)} center distanceFactor={5.6}>
                  <div className="max-w-[260px] rounded-xl border border-cyan-200/45 bg-slate-950/92 px-3 py-2 text-white shadow-[0_0_20px_rgba(34,211,238,0.42)] backdrop-blur-md select-none pointer-events-none">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="truncate text-[10px] font-semibold text-cyan-100">
                        {note ? note.name : territory.occupant}
                      </span>
                      <span className="shrink-0 font-mono text-[9px] text-cyan-200/80">
                        {territory.gx},{territory.gy}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-[10.5px] leading-relaxed text-slate-200">{labelText}</p>
                  </div>
                </Html>
              )}
            </group>
          )
        })}

        {/* ⑤ 네온 아크 커넥션 */}
        {countries.slice(1).map((country, i) => {
          const destPos = convertLatLngToVector3(country.lat, country.lon, globeRadius)
          const isHighlighted =
            hoveredPin === country.name || hoveredPin === '한국 (Seoul)' || activeItem === country.name
          return (
            <NeonArc
              key={`arc-${country.name}`}
              start={koreaPos}
              end={destPos}
              color={country.color}
              globeRadius={globeRadius}
              isHighlighted={isHighlighted}
              speed={arcSpeeds[i] ?? 0.3}
            />
          )
        })}

        {/* ⑥ 국가 핀 + 레이더 링 + 빔 + 라벨 */}
        {countries.map((country) => {
          const position = convertLatLngToVector3(country.lat, country.lon, globeRadius)
          const direction = position.clone().normalize()
          const beamHeight = 1.6
          const beamPosition = position.clone().add(direction.clone().multiplyScalar(beamHeight / 2))
          const up = new THREE.Vector3(0, 1, 0)
          const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction)

          const isHovered = hoveredPin === country.name
          const isActive = activeItem === country.name

          return (
            <group key={country.name}>
              <PingRing position={position} color={country.color} direction={direction} delay={0} />
              <PingRing position={position} color={country.color} direction={direction} delay={0.5} />

              <mesh
                position={position.clone().add(direction.clone().multiplyScalar(0.08))}
                onPointerOver={(e) => {
                  e.stopPropagation()
                  showPinPointer(country.name)
                }}
                onPointerOut={(e) => {
                  e.stopPropagation()
                  clearPinPointer()
                }}
                onClick={(e) => handlePinClick(country.name, e as unknown as THREE.Event)}
                onDoubleClick={(e) => handlePinDoubleClick(country.name, e as unknown as THREE.Event)}
              >
                <sphereGeometry args={[0.24, 16, 16]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>

              <mesh
                position={position}
                onPointerOver={(e) => {
                  e.stopPropagation()
                  showPinPointer(country.name)
                }}
                onPointerOut={(e) => {
                  e.stopPropagation()
                  clearPinPointer()
                }}
                onClick={(e) => handlePinClick(country.name, e as unknown as THREE.Event)}
                onDoubleClick={(e) => handlePinDoubleClick(country.name, e as unknown as THREE.Event)}
              >
                <sphereGeometry args={[isHovered || isActive ? 0.12 : 0.075, 16, 16]} />
                <meshStandardMaterial
                  color={country.color}
                  emissive={country.color}
                  emissiveIntensity={isHovered || isActive ? 4.5 : 2.0}
                />
              </mesh>

              <mesh
                position={beamPosition}
                quaternion={quaternion}
                onPointerOver={(e) => {
                  e.stopPropagation()
                  showPinPointer(country.name)
                }}
                onPointerOut={(e) => {
                  e.stopPropagation()
                  clearPinPointer()
                }}
                onClick={(e) => handlePinClick(country.name, e as unknown as THREE.Event)}
                onDoubleClick={(e) => handlePinDoubleClick(country.name, e as unknown as THREE.Event)}
              >
                <cylinderGeometry args={[0.012, 0.018, beamHeight, 8, 1, true]} />
                <meshStandardMaterial
                  color={country.color}
                  emissive={country.color}
                  emissiveIntensity={isHovered || isActive ? 5.5 : 2.5}
                  transparent
                  opacity={isHovered || isActive ? 0.95 : 0.55}
                  side={THREE.DoubleSide}
                />
              </mesh>

              <mesh
                position={position.clone().add(direction.clone().multiplyScalar(beamHeight))}
                onPointerOver={(e) => {
                  e.stopPropagation()
                  showPinPointer(country.name)
                }}
                onPointerOut={(e) => {
                  e.stopPropagation()
                  clearPinPointer()
                }}
                onClick={(e) => handlePinClick(country.name, e as unknown as THREE.Event)}
                onDoubleClick={(e) => handlePinDoubleClick(country.name, e as unknown as THREE.Event)}
              >
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshBasicMaterial color={country.color} />
              </mesh>

              <Html position={position.clone().add(direction.clone().multiplyScalar(0.2))} center distanceFactor={5.5}>
                <button
                  type="button"
                  onPointerEnter={() => showPinPointer(country.name)}
                  onPointerLeave={clearPinPointer}
                  onClick={(e) => handlePinClick(country.name, e.nativeEvent)}
                  onDoubleClick={(e) => handlePinDoubleClick(country.name, e.nativeEvent)}
                  aria-pressed={isActive}
                  aria-label={`${country.label} 핀 정보 열기`}
                  className={`
                    px-3 py-1.5 rounded-full border text-[11px] font-medium tracking-wide transition-all duration-300 select-none whitespace-nowrap cursor-pointer
                    backdrop-blur-md shadow-lg flex items-center gap-1.5
                    ${
                      isHovered || isActive
                        ? 'scale-110 opacity-100 bg-slate-900/90 text-white border-white/30'
                        : 'scale-90 opacity-75 bg-slate-950/70 text-slate-300 border-white/10'
                    }
                  `}
                  style={{
                    borderLeftColor: country.color,
                    borderLeftWidth: '3px',
                    boxShadow: isHovered || isActive ? `0 0 14px ${country.color}55` : 'none',
                  }}
                >
                  <span>{country.label}</span>
                </button>
              </Html>
            </group>
          )
        })}
      </group>
    </>
  )
}
