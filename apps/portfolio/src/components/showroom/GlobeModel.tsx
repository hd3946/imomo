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

const countries: CountryPin[] = [
  { name: '한국 (Seoul)', label: '🇰🇷 대한민국', lat: 37.5665, lon: 126.9780, color: '#06b6d4' },
  { name: '일본 (Tokyo)', label: '🇯🇵 日本 (Japan)', lat: 35.6762, lon: 139.6503, color: '#ec4899' },
  { name: '중국 (Beijing)', label: '🇨🇳 中国 (China)', lat: 39.9042, lon: 116.4074, color: '#f59e0b' },
  { name: '베트남 (Hanoi)', label: '🇻🇳 Việt Nam', lat: 21.0285, lon: 105.8542, color: '#10b981' },
  { name: '미국 (New York)', label: '🇺🇸 United States', lat: 40.7128, lon: -74.0060, color: '#8b5cf6' },
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
    [position, direction]
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
      <meshBasicMaterial
        color={color}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
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
      vel.push(
        (Math.random() - 0.5) * 0.6,
        (Math.random() - 0.5) * 0.6,
        (Math.random() - 0.5) * 0.6
      )
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
        position.z + (velocities[i * 3 + 2] ?? 0) * t * 1.8
      )
    }
    posAttr.needsUpdate = true
    ;(pointsRef.current.material as THREE.PointsMaterial).opacity = Math.pow(1 - progress, 1.8)
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={COUNT}
          itemSize={3}
        />
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
  userColor,
  onRegisterPixel,
  onCameraZoomTarget,
}: GlobeModelProps) {
  const globeGroupRef = useRef<THREE.Group>(null!)
  const cloudsRef = useRef<THREE.Mesh>(null!)
  const [hoveredPin, setHoveredPin] = useState<string | null>(null)
  const [hoveredPixel, setHoveredPixel] = useState<{ gx: number; gy: number; pos: THREE.Vector3 } | null>(null)
  const rotationSpeedRef = useRef(0.002)

  // 파티클 폭발 이펙트 목록
  const [explosions, setExplosions] = useState<{ id: number; position: THREE.Vector3; color: string }[]>([])
  const explosionIdRef = useRef(0)

  const globeRadius = 1.5

  // 텍스처 로딩
  const earthTexture = useTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg')
  const earthLights = useTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_lights_2048.png')
  const earthClouds = useTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png')

  earthTexture.colorSpace = THREE.SRGBColorSpace
  earthLights.colorSpace = THREE.SRGBColorSpace
  earthClouds.colorSpace = THREE.SRGBColorSpace

  // 아크 속도 랜덤화
  const arcSpeeds = useMemo(
    () => countries.slice(1).map(() => 0.18 + Math.random() * 0.38),
    []
  )

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

  // pixels 데이터 변경 감지 시 캔버스 다시 그리고 신규 픽셀 지점에 불꽃놀이 격발
  useEffect(() => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    Object.entries(pixels).forEach(([key, val]) => {
      const [gxStr, gyStr] = key.split('_')
      const gx = parseInt(gxStr || '0', 10)
      const gy = parseInt(gyStr || '0', 10)

      ctx.fillStyle = val.color
      ctx.fillRect(gx, gy, 1, 1) // 1x1 도트 픽셀 채우기

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
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += rotationSpeedRef.current
    }
  })

  // 지구 표면 마우스 단일 클릭 시 픽셀 점령 등록
  const handleGlobeClick = (e: any) => {
    e.stopPropagation()
    // 드래그(조작) 중이거나 교점이 없을 때는 점령 무시
    if (isInteracting || !e.point) return

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
  }

  // 핀 클릭
  const handlePinClick = (name: string, e: THREE.Event) => {
    (e as any).stopPropagation?.()
    const country = countries.find((c) => c.name === name)
    if (activeItem === name) {
      onSelectItem(null)
    } else {
      onSelectItem(name)
    }
  }

  // 핀 더블클릭 줌인
  const handlePinDoubleClick = (name: string, e: THREE.Event) => {
    (e as any).stopPropagation?.()
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

        {/* ② 구름 레이어 */}
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[globeRadius + 0.03, 64, 64]} />
          <meshStandardMaterial
            alphaMap={earthClouds}
            transparent
            color="#ffffff"
            opacity={0.35}
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
          <meshStandardMaterial
            color="#533afd"
            emissive="#533afd"
            emissiveIntensity={1.2}
            transparent
            opacity={0.4}
          />
        </mesh>

        {/* ─── 직접 점령 유도를 위한 마우스 호버 가이드 ─── */}
        {hoveredPixel && (
          <group position={hoveredPixel.pos}>
            <mesh>
              <sphereGeometry args={[0.03, 16, 16]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
              />
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

        {/* ⑤ 네온 아크 커넥션 */}
        {countries.slice(1).map((country, i) => {
          const destPos = convertLatLngToVector3(country.lat, country.lon, globeRadius)
          const isHighlighted =
            hoveredPin === country.name ||
            hoveredPin === '한국 (Seoul)' ||
            activeItem === country.name
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
                position={position}
                onPointerOver={(e) => {
                  e.stopPropagation()
                  setHoveredPin(country.name)
                  document.body.style.cursor = 'pointer'
                }}
                onPointerOut={() => {
                  setHoveredPin(null)
                  document.body.style.cursor = 'default'
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

              <mesh position={beamPosition} quaternion={quaternion}>
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

              <mesh position={position.clone().add(direction.clone().multiplyScalar(beamHeight))}>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshBasicMaterial color={country.color} />
              </mesh>

              <Html
                position={position.clone().add(direction.clone().multiplyScalar(0.2))}
                center
                distanceFactor={5.5}
              >
                <div
                  className={`
                    px-3 py-1.5 rounded-full border text-[11px] font-medium tracking-wide transition-all duration-300 pointer-events-none select-none whitespace-nowrap
                    backdrop-blur-md shadow-lg flex items-center gap-1.5
                    ${isHovered || isActive
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
                </div>
              </Html>
            </group>
          )
        })}
      </group>
    </>
  )
}
