'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Sparkles, Stars } from '@react-three/drei'
import { type FormEvent, Suspense, useState, useRef, useEffect, useMemo } from 'react'
import { GlobeModel } from './GlobeModel'
import * as THREE from 'three'

// ─── 시네마틱 줌인 카메라 진입 효과 ──────────────────────────────────────────
function IntroCamera() {
  const finished = useRef(false)

  useFrame((state) => {
    if (finished.current) return

    const isMobile = state.size.width < 768
    const targetX = 0
    const targetY = isMobile ? 0.6 : 0.2
    const targetZ = isMobile ? 6.2 : 4.4

    const dx = Math.abs(state.camera.position.x - targetX)
    const dy = Math.abs(state.camera.position.y - targetY)
    const dz = Math.abs(state.camera.position.z - targetZ)

    if (dx < 0.02 && dy < 0.02 && dz < 0.02) {
      state.camera.position.set(targetX, targetY, targetZ)
      finished.current = true
      return
    }

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.04)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.04)
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.04)
  })
  return null
}

// ─── 더블클릭 핀 카메라 줌인 컨트롤러 ────────────────────────────────────────
interface CameraZoomControllerProps {
  target: THREE.Vector3 | null
  orbitRef: React.RefObject<any>
}

function CameraZoomController({ target, orbitRef }: CameraZoomControllerProps) {
  const progressRef = useRef(1) // 1 = 완료 상태 (초기 비활성)
  const startPosRef = useRef(new THREE.Vector3())
  const targetPosRef = useRef(new THREE.Vector3())
  const prevTargetRef = useRef<THREE.Vector3 | null>(null)

  useFrame((state) => {
    // 새 타겟 감지 → 줌 시작
    if (target && target !== prevTargetRef.current) {
      prevTargetRef.current = target
      progressRef.current = 0
      startPosRef.current.copy(state.camera.position)
      // 핀 방향 기준 3.2 단위 거리까지 줌인
      const dir = target.clone().normalize()
      targetPosRef.current.copy(dir.multiplyScalar(3.2))
      if (orbitRef.current) {
        orbitRef.current.enabled = false
      }
    }

    if (progressRef.current >= 1) return

    progressRef.current = Math.min(progressRef.current + 0.028, 1)
    // ease-out cubic
    const t = 1 - Math.pow(1 - progressRef.current, 3)
    state.camera.position.lerpVectors(startPosRef.current, targetPosRef.current, t)

    // 줌 완료 시 OrbitControls 복귀
    if (progressRef.current >= 1 && orbitRef.current) {
      orbitRef.current.enabled = true
    }
  })

  return null
}

// ─── 태양 Lens Flare 글로우 (경량화 버전) ───────────────────────────────────
function SunGlow() {
  const innerRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    // 서서히 맥박치는 내부 글로우
    const s = 1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.06
    if (innerRef.current) {
      innerRef.current.scale.setScalar(s)
    }
  })

  return (
    <group position={[7, 4, -14]}>
      {/* 태양 코어 */}
      <mesh>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshBasicMaterial color="#fffccc" />
      </mesh>

      {/* 내부 글로우 (맥박) */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.65, 8, 8]} />
        <meshBasicMaterial
          color="#ff9900"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// ─── 공전하는 ISS 위성 ────────────────────────────────────────────────────────
interface OrbitingSatelliteProps {
  orbitRadius?: number
  inclination?: number
  speed?: number
  initialPhase?: number
  color?: string
  panelColor?: string
  scale?: number
  beaconIntensity?: number
}

function OrbitingSatellite({
  orbitRadius = 2.25,
  inclination = Math.PI * 0.42,
  speed = 0.95,
  initialPhase = 0,
  color = '#9fb3c8',
  panelColor = '#1a3c6b',
  scale = 1,
  beaconIntensity = 0.4,
}: OrbitingSatelliteProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const angleRef = useRef(initialPhase)

  useFrame((_, delta) => {
    angleRef.current += delta * speed
    const a = angleRef.current

    const x = orbitRadius * Math.cos(a)
    const y = orbitRadius * Math.sin(a) * Math.sin(inclination)
    const z = orbitRadius * Math.sin(a) * Math.cos(inclination)
    groupRef.current.position.set(x, y, z)

    // 궤도 접선 방향으로 기체 방향 정렬
    const tx = -orbitRadius * Math.sin(a)
    const ty = orbitRadius * Math.cos(a) * Math.sin(inclination)
    const tz = orbitRadius * Math.cos(a) * Math.cos(inclination)
    const tangent = new THREE.Vector3(tx, ty, tz).normalize()
    const refUp = new THREE.Vector3(0, 1, 0)
    const right = new THREE.Vector3().crossVectors(tangent, refUp).normalize()
    const up = new THREE.Vector3().crossVectors(right, tangent).normalize()
    const m = new THREE.Matrix4().makeBasis(right, up, tangent.clone().negate())
    groupRef.current.setRotationFromMatrix(m)
  })

  return (
    <group ref={groupRef} scale={scale}>
      {/* 본체 */}
      <mesh>
        <boxGeometry args={[0.055, 0.025, 0.055]} />
        <meshStandardMaterial color={color} metalness={0.92} roughness={0.08} />
      </mesh>
      {/* 왼쪽 태양열 패널 */}
      <mesh position={[-0.11, 0, 0]}>
        <boxGeometry args={[0.14, 0.004, 0.057]} />
        <meshStandardMaterial
          color={panelColor}
          metalness={0.5}
          roughness={0.3}
          emissive={panelColor}
          emissiveIntensity={0.9}
        />
      </mesh>
      {/* 오른쪽 태양열 패널 */}
      <mesh position={[0.11, 0, 0]}>
        <boxGeometry args={[0.14, 0.004, 0.057]} />
        <meshStandardMaterial
          color={panelColor}
          metalness={0.5}
          roughness={0.3}
          emissive={panelColor}
          emissiveIntensity={0.9}
        />
      </mesh>
      {/* 빨간 항법등 */}
      {beaconIntensity > 0 && <pointLight color="#ff3333" intensity={beaconIntensity} distance={0.4} />}
    </group>
  )
}

const satellitesData = [
  {
    orbitRadius: 2.1,
    inclination: Math.PI * 0.15,
    speed: 0.8,
    initialPhase: 0,
    color: '#e2e8f0',
    panelColor: '#1e3a8a',
    scale: 0.9,
  },
  {
    orbitRadius: 2.3,
    inclination: Math.PI * 0.35,
    speed: 1.1,
    initialPhase: Math.PI * 0.5,
    color: '#cbd5e1',
    panelColor: '#0f766e',
    scale: 1.0,
  },
  {
    orbitRadius: 2.5,
    inclination: Math.PI * 0.55,
    speed: 0.6,
    initialPhase: Math.PI * 1.0,
    color: '#94a3b8',
    panelColor: '#b45309',
    scale: 0.85,
  },
  {
    orbitRadius: 2.2,
    inclination: Math.PI * -0.25,
    speed: 1.3,
    initialPhase: Math.PI * 1.5,
    color: '#9fb3c8',
    panelColor: '#0369a1',
    scale: 1.1,
  },
  {
    orbitRadius: 2.4,
    inclination: Math.PI * -0.45,
    speed: 0.7,
    initialPhase: Math.PI * 0.25,
    color: '#64748b',
    panelColor: '#6d28d9',
    scale: 0.95,
  },
  {
    orbitRadius: 2.6,
    inclination: Math.PI * 0.75,
    speed: 0.9,
    initialPhase: Math.PI * 0.75,
    color: '#cbd5e1',
    panelColor: '#be185d',
    scale: 0.8,
  },
  {
    orbitRadius: 2.05,
    inclination: Math.PI * 0.05,
    speed: 1.45,
    initialPhase: Math.PI * 0.12,
    color: '#f8fafc',
    panelColor: '#0e7490',
    scale: 0.72,
    beaconIntensity: 0.12,
  },
  {
    orbitRadius: 2.12,
    inclination: Math.PI * -0.08,
    speed: 1.25,
    initialPhase: Math.PI * 0.32,
    color: '#cbd5e1',
    panelColor: '#7c3aed',
    scale: 0.64,
    beaconIntensity: 0,
  },
  {
    orbitRadius: 2.18,
    inclination: Math.PI * 0.22,
    speed: 0.95,
    initialPhase: Math.PI * 0.64,
    color: '#e5e7eb',
    panelColor: '#15803d',
    scale: 0.7,
    beaconIntensity: 0,
  },
  {
    orbitRadius: 2.26,
    inclination: Math.PI * -0.34,
    speed: 1.6,
    initialPhase: Math.PI * 0.88,
    color: '#94a3b8',
    panelColor: '#be123c',
    scale: 0.58,
    beaconIntensity: 0.12,
  },
  {
    orbitRadius: 2.32,
    inclination: Math.PI * 0.48,
    speed: 0.72,
    initialPhase: Math.PI * 1.15,
    color: '#f1f5f9',
    panelColor: '#1d4ed8',
    scale: 0.68,
    beaconIntensity: 0,
  },
  {
    orbitRadius: 2.38,
    inclination: Math.PI * -0.58,
    speed: 1.05,
    initialPhase: Math.PI * 1.36,
    color: '#a8a29e',
    panelColor: '#ca8a04',
    scale: 0.62,
    beaconIntensity: 0,
  },
  {
    orbitRadius: 2.45,
    inclination: Math.PI * 0.68,
    speed: 0.82,
    initialPhase: Math.PI * 1.62,
    color: '#d1d5db',
    panelColor: '#c026d3',
    scale: 0.76,
    beaconIntensity: 0.1,
  },
  {
    orbitRadius: 2.52,
    inclination: Math.PI * -0.72,
    speed: 1.18,
    initialPhase: Math.PI * 1.82,
    color: '#e2e8f0',
    panelColor: '#047857',
    scale: 0.6,
    beaconIntensity: 0,
  },
  {
    orbitRadius: 2.58,
    inclination: Math.PI * 0.82,
    speed: 0.58,
    initialPhase: Math.PI * 0.18,
    color: '#cbd5e1',
    panelColor: '#ea580c',
    scale: 0.74,
    beaconIntensity: 0,
  },
  {
    orbitRadius: 2.65,
    inclination: Math.PI * -0.88,
    speed: 1.38,
    initialPhase: Math.PI * 0.42,
    color: '#94a3b8',
    panelColor: '#0891b2',
    scale: 0.57,
    beaconIntensity: 0.1,
  },
  {
    orbitRadius: 2.72,
    inclination: Math.PI * 0.12,
    speed: 0.66,
    initialPhase: Math.PI * 0.72,
    color: '#f8fafc',
    panelColor: '#4338ca',
    scale: 0.65,
    beaconIntensity: 0,
  },
  {
    orbitRadius: 2.78,
    inclination: Math.PI * -0.18,
    speed: 1.5,
    initialPhase: Math.PI * 0.96,
    color: '#cbd5e1',
    panelColor: '#0f766e',
    scale: 0.55,
    beaconIntensity: 0,
  },
  {
    orbitRadius: 2.84,
    inclination: Math.PI * 0.28,
    speed: 0.88,
    initialPhase: Math.PI * 1.22,
    color: '#e7e5e4',
    panelColor: '#9333ea',
    scale: 0.63,
    beaconIntensity: 0.08,
  },
  {
    orbitRadius: 2.9,
    inclination: Math.PI * -0.38,
    speed: 1.12,
    initialPhase: Math.PI * 1.46,
    color: '#dbeafe',
    panelColor: '#b91c1c',
    scale: 0.59,
    beaconIntensity: 0,
  },
  {
    orbitRadius: 2.96,
    inclination: Math.PI * 0.52,
    speed: 0.76,
    initialPhase: Math.PI * 1.7,
    color: '#f1f5f9',
    panelColor: '#0369a1',
    scale: 0.69,
    beaconIntensity: 0,
  },
  {
    orbitRadius: 3.02,
    inclination: Math.PI * -0.62,
    speed: 1.32,
    initialPhase: Math.PI * 1.9,
    color: '#a3a3a3',
    panelColor: '#65a30d',
    scale: 0.53,
    beaconIntensity: 0.08,
  },
  {
    orbitRadius: 3.08,
    inclination: Math.PI * 0.74,
    speed: 0.68,
    initialPhase: Math.PI * 0.08,
    color: '#e2e8f0',
    panelColor: '#db2777',
    scale: 0.61,
    beaconIntensity: 0,
  },
  {
    orbitRadius: 3.14,
    inclination: Math.PI * -0.78,
    speed: 1.22,
    initialPhase: Math.PI * 0.54,
    color: '#cbd5e1',
    panelColor: '#2563eb',
    scale: 0.56,
    beaconIntensity: 0,
  },
  {
    orbitRadius: 3.2,
    inclination: Math.PI * 0.92,
    speed: 0.84,
    initialPhase: Math.PI * 1.04,
    color: '#f8fafc',
    panelColor: '#a16207',
    scale: 0.66,
    beaconIntensity: 0.08,
  },
  {
    orbitRadius: 3.26,
    inclination: Math.PI * -0.94,
    speed: 1.08,
    initialPhase: Math.PI * 1.28,
    color: '#94a3b8',
    panelColor: '#0d9488',
    scale: 0.52,
    beaconIntensity: 0,
  },
  {
    orbitRadius: 3.32,
    inclination: Math.PI * 0.44,
    speed: 0.94,
    initialPhase: Math.PI * 1.58,
    color: '#e5e7eb',
    panelColor: '#e11d48',
    scale: 0.58,
    beaconIntensity: 0,
  },
  {
    orbitRadius: 3.38,
    inclination: Math.PI * -0.5,
    speed: 1.42,
    initialPhase: Math.PI * 1.78,
    color: '#cbd5e1',
    panelColor: '#7e22ce',
    scale: 0.54,
    beaconIntensity: 0.08,
  },
]

// ─── 공전하는 달 ──────────────────────────────────────────────────────────────
function OrbitingMoon() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const angleRef = useRef(Math.PI * 0.65)
  const ORBIT_RADIUS = 3.7
  const INCLINATION = Math.PI * 0.11

  useFrame((_, delta) => {
    angleRef.current += delta * 0.11
    const a = angleRef.current
    meshRef.current.position.set(
      ORBIT_RADIUS * Math.cos(a),
      ORBIT_RADIUS * Math.sin(a) * Math.sin(INCLINATION),
      ORBIT_RADIUS * Math.sin(a) * Math.cos(INCLINATION),
    )
    // 자전
    meshRef.current.rotation.y += delta * 0.18
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.17, 24, 24]} />
      <meshStandardMaterial color="#b0b0b0" roughness={0.96} metalness={0.0} />
    </mesh>
  )
}

// ─── 국가별 타임존 & 정보 ──────────────────────────────────────────────────────
const timezones: Record<string, string> = {
  '한국 (Seoul)': 'Asia/Seoul',
  '일본 (Tokyo)': 'Asia/Tokyo',
  '중국 (Beijing)': 'Asia/Shanghai',
  '베트남 (Hanoi)': 'Asia/Ho_Chi_Minh',
  '미국 (New York)': 'America/New_York',
}

const countryDetails: Record<string, { title: string; description: string; linkId: string; btnText: string }> = {
  '한국 (Seoul)': {
    title: '국내 웹 서비스 및 AI 에이전트 협업 설계',
    description:
      'Next.js 15와 Tailwind CSS 4 환경에서 AI 코딩 협업을 극대화하기 위한 프로젝트 포트폴리오를 설계하고 구축했습니다.',
    linkId: 'projects',
    btnText: '한국 프로젝트 보기',
  },
  '일본 (Tokyo)': {
    title: '글로벌 다국어 로컬라이제이션 연구',
    description:
      '다국어 번역 지원 및 아시아권 현지화에 맞춘 Next.js i18n 라우팅 기법과 최적화 기법을 학습 및 적용했습니다.',
    linkId: 'skills',
    btnText: '보유 기술 스택 확인',
  },
  '중국 (Beijing)': {
    title: '대용량 트래픽 렌더링 성능 최적화',
    description:
      '가상 스크롤(Virtual Scroll) 및 3D WebGL 컴포넌트 마운팅 시 프레임 공식 손실을 없애기 위한 메모리 누수 방지 기법을 구현했습니다.',
    linkId: 'about',
    btnText: '프로필 및 이력 보기',
  },
  '베트남 (Hanoi)': {
    title: '해외 아웃소싱 협업 및 실시간 데이터베이스 설계',
    description:
      'Supabase의 실시간 DB 동기화 시스템을 기반으로 동남아 협업 환경과의 실시간 채팅 및 알림 시스템을 연동했습니다.',
    linkId: 'contact',
    btnText: '협업 연락처 보기',
  },
  '미국 (New York)': {
    title: '글로벌 핀테크 인프라 및 결제 연동 플랫폼',
    description:
      'Stripe 결제 API와 다중 통화 지원 등 금융 인프라의 설계 철학을 연구하고 전자상거래 데모 플랫폼을 제작했습니다.',
    linkId: 'projects',
    btnText: '글로벌 전자상거래 프로젝트',
  },
}

// ─── 가상 글로벌 방문자 봇(Bot) 명단 ──────────────────────────────────────────
const virtualBots = [
  { name: 'Ji-hoon (Korea) 🇰🇷', color: '#f43f5e' },
  { name: 'Yuki (Japan) 🇯🇵', color: '#ec4899' },
  { name: 'Chen (China) 🇨🇳', color: '#f59e0b' },
  { name: 'Minh (Vietnam) 🇻🇳', color: '#10b981' },
  { name: 'Alice (USA) 🇺🇸', color: '#8b5cf6' },
  { name: 'Pierre (France) 🇫🇷', color: '#ef4444' },
  { name: 'Hans (Germany) 🇩🇪', color: '#eab308' },
  { name: 'Sofia (Brazil) 🇧🇷', color: '#3b82f6' },
  { name: 'Amina (Kenya) 🇰🇪', color: '#14b8a6' },
  { name: 'Omar (Egypt) 🇪🇬', color: '#f97316' },
  { name: 'Eva (Spain) 🇪🇸', color: '#e11d48' },
  { name: 'Luca (Italy) 🇮🇹', color: '#22c55e' },
  { name: 'Noah (Canada) 🇨🇦', color: '#ef4444' },
  { name: 'Maya (India) 🇮🇳', color: '#f59e0b' },
  { name: 'Liam (UK) 🇬🇧', color: '#2563eb' },
  { name: 'Emma (Australia) 🇦🇺', color: '#38bdf8' },
  { name: 'Noura (UAE) 🇦🇪', color: '#a855f7' },
  { name: 'Mateusz (Poland) 🇵🇱', color: '#dc2626' },
  { name: 'Ingrid (Norway) 🇳🇴', color: '#0ea5e9' },
  { name: 'Diego (Mexico) 🇲🇽', color: '#16a34a' },
  { name: 'Hana (Czechia) 🇨🇿', color: '#7c3aed' },
  { name: 'Leo (Argentina) 🇦🇷', color: '#06b6d4' },
  { name: 'Sara (Sweden) 🇸🇪', color: '#eab308' },
  { name: 'Anika (Germany) 🇩🇪', color: '#84cc16' },
  { name: 'Kenji (Japan) 🇯🇵', color: '#fb7185' },
  { name: 'Linh (Vietnam) 🇻🇳', color: '#34d399' },
  { name: 'Zola (South Africa) 🇿🇦', color: '#f43f5e' },
  { name: 'Mira (Turkey) 🇹🇷', color: '#b91c1c' },
  { name: 'Caleb (USA) 🇺🇸', color: '#6366f1' },
  { name: 'Theo (Greece) 🇬🇷', color: '#0284c7' },
  { name: 'Rina (Indonesia) 🇮🇩', color: '#f87171' },
  { name: 'Pavel (Ukraine) 🇺🇦', color: '#facc15' },
]

const BOT_ATTACKS_PER_TICK = 2
const BOT_ATTACK_INTERVAL_MS = 2800

// 유저가 선택 가능한 네온 컬러 팔레트
const colorPalette = [
  { hex: '#06b6d4', label: '사이언' },
  { hex: '#ec4899', label: '핫핑크' },
  { hex: '#f59e0b', label: '골드' },
  { hex: '#10b981', label: '에메랄드' },
  { hex: '#8b5cf6', label: '퍼플' },
  { hex: '#ef4444', label: '네온레드' },
]

interface TerritoryNote {
  id: string
  gx: number
  gy: number
  color: string
  name: string
  message: string
  createdAt: string
}

interface TerritoryClaim {
  gx: number
  gy: number
  color: string
  createdAt: string
}

const TERRITORY_NOTES_STORAGE_KEY = 'imomo-portfolio-territory-notes'
const TERRITORY_CLAIMS_STORAGE_KEY = 'imomo-portfolio-territory-claims'
const TERRITORY_NOTES_API_PATH = '/api/territory-notes'

function isUserTerritory(occupant: string): boolean {
  return occupant.includes('(나)')
}

function safeParseStoredList<T>(value: string | null): T[] {
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistLocalTerritoryNotes(notes: TerritoryNote[]) {
  window.localStorage.setItem(TERRITORY_NOTES_STORAGE_KEY, JSON.stringify(notes.slice(0, 20)))
}

export function ShowroomCanvas() {
  const [activeItem, setActiveItem] = useState<string | null>(null)
  const [isInteracting, setIsInteracting] = useState(false)
  const [zoomTarget, setZoomTarget] = useState<THREE.Vector3 | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [lastUserClaim, setLastUserClaim] = useState<{ gx: number; gy: number; color: string } | null>(null)
  const [claimDraft, setClaimDraft] = useState<{ gx: number; gy: number; color: string } | null>(null)
  const [territoryNotes, setTerritoryNotes] = useState<TerritoryNote[]>([])
  const [territoryNoteName, setTerritoryNoteName] = useState('방문자')
  const [territoryNoteMessage, setTerritoryNoteMessage] = useState('')
  const [territoryNoteStatus, setTerritoryNoteStatus] = useState('')
  const orbitRef = useRef<any>(null)

  // ─── 실시간 픽셀 땅따먹기 상태 관리 ─────────────────────────────────────────
  const [pixels, setPixels] = useState<Record<string, { color: string; occupant: string }>>({
    '126_37': { color: '#06b6d4', occupant: 'Ji-hoon (Korea) 🇰🇷' },
    '139_35': { color: '#ec4899', occupant: 'Yuki (Japan) 🇯🇵' },
    '116_39': { color: '#f59e0b', occupant: 'Chen (China) 🇨🇳' },
    '105_21': { color: '#10b981', occupant: 'Minh (Vietnam) 🇻🇳' },
    '286_40': { color: '#8b5cf6', occupant: 'Alice (USA) 🇺🇸' },
  })

  const [userColor, setUserColor] = useState('#06b6d4') // 유저 기본 네온 색상
  const [lastOccupant, setLastOccupant] = useState<string>('시스템 초기화 완료')

  // 1분마다 현지 시각 갱신
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const applyTerritoryNotesToGlobe = (notes: TerritoryNote[]) => {
    setPixels((prev) => {
      const next = { ...prev }
      notes.forEach((note) => {
        next[`${note.gx}_${note.gy}`] = {
          color: note.color,
          occupant: `${note.name} (방명록)`,
        }
      })
      return next
    })
  }

  useEffect(() => {
    const storedNotes = safeParseStoredList<TerritoryNote>(
      window.localStorage.getItem(TERRITORY_NOTES_STORAGE_KEY),
    ).slice(0, 20)
    const storedClaims = safeParseStoredList<TerritoryClaim>(
      window.localStorage.getItem(TERRITORY_CLAIMS_STORAGE_KEY),
    ).slice(0, 20)

    if (storedNotes.length > 0) {
      setTerritoryNotes(storedNotes)
      applyTerritoryNotesToGlobe(storedNotes)
    }

    if (storedClaims.length > 0) {
      setPixels((prev) => {
        const next = { ...prev }
        storedClaims.forEach((claim) => {
          next[`${claim.gx}_${claim.gy}`] = {
            color: claim.color,
            occupant: '이웃 방문자 (나) 👤',
          }
        })
        return next
      })

      const latestClaim = storedClaims[0]
      if (latestClaim) {
        setLastUserClaim(latestClaim)
        setClaimDraft(latestClaim)
        setTerritoryNoteStatus(`${latestClaim.gx},${latestClaim.gy} 영토를 불러왔습니다.`)
      }
    }

    const controller = new AbortController()

    fetch(TERRITORY_NOTES_API_PATH, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Remote notes unavailable: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        const remoteNotes = Array.isArray(data.notes) ? (data.notes as TerritoryNote[]).slice(0, 20) : []

        setTerritoryNotes(remoteNotes)
        applyTerritoryNotesToGlobe(remoteNotes)
        persistLocalTerritoryNotes(remoteNotes)

        if (remoteNotes.length > 0) {
          setTerritoryNoteStatus('공유 방명록을 불러왔습니다.')
        }
      })
      .catch(() => {
        if (storedNotes.length > 0) {
          setTerritoryNoteStatus('공유 저장소 대신 이 브라우저의 임시 기록을 표시 중입니다.')
        }
      })

    return () => controller.abort()
  }, [])

  // ─── 가상 글로벌 봇(Bot) 실시간 땅따먹기 타격 시뮬레이터 ────────────────────
  useEffect(() => {
    const botTimer = setInterval(() => {
      const strikes = Array.from({ length: BOT_ATTACKS_PER_TICK }, () => {
        const bot = virtualBots[Math.floor(Math.random() * virtualBots.length)]!

        // 전세계 대륙들이 주로 포진된 위경도 위주로 가중치 랜덤 타격
        // 경도: -180 ~ 180 (격자: 0 ~ 359)
        // 위도: -60 ~ 80 (격자: 10 ~ 150)
        const randomLon = Math.floor(Math.random() * 360)
        const randomLat = Math.floor(40 + Math.random() * 100) // 극지방 제외 대륙 근처 타격

        return {
          key: `${randomLon}_${randomLat}`,
          bot,
        }
      })

      setPixels((prev) => {
        const next = { ...prev }
        strikes.forEach(({ key, bot }) => {
          next[key] = { color: bot.color, occupant: bot.name }
        })
        return next
      })

      const commanders = strikes.map(({ bot }) => bot.name.split(' ')[0]).join(', ')
      setLastOccupant(`${commanders} 봇 연합이 ${strikes.length}개 영역 동시 점령!`)
    }, BOT_ATTACK_INTERVAL_MS)

    return () => clearInterval(botTimer)
  }, [])

  const handleScrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
  }

  const getLocalTime = (countryName: string): string => {
    const tz = timezones[countryName]
    if (!tz) return ''
    return currentTime.toLocaleTimeString('ko-KR', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  // ─── 유저가 직접 픽셀 점령 시 호출 ──────────────────────────────────────────
  const handleRegisterPixel = (gx: number, gy: number, color: string) => {
    const key = `${gx}_${gy}`
    setPixels((prev) => ({
      ...prev,
      [key]: { color, occupant: '이웃 방문자 (나) 👤' },
    }))
    const nextClaim: TerritoryClaim = { gx, gy, color, createdAt: new Date().toISOString() }
    const storedClaims = safeParseStoredList<TerritoryClaim>(window.localStorage.getItem(TERRITORY_CLAIMS_STORAGE_KEY))
    const withoutDuplicate = storedClaims.filter((claim) => claim.gx !== gx || claim.gy !== gy)
    const nextClaims = [nextClaim, ...withoutDuplicate].slice(0, 20)
    window.localStorage.setItem(TERRITORY_CLAIMS_STORAGE_KEY, JSON.stringify(nextClaims))
    setLastUserClaim({ gx, gy, color })
    setClaimDraft({ gx, gy, color })
    setLastOccupant(`방문자(나)님이 ${gx},${gy} 영토 점령!`)
    setTerritoryNoteStatus('점령 완료. 메시지를 쓰고 남기기를 누르세요.')
  }

  const handleTerritoryNoteSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!claimDraft) {
      setTerritoryNoteStatus('먼저 지구 표면을 클릭해서 영토를 점령해 주세요.')
      return
    }

    const trimmedMessage = territoryNoteMessage.trim()
    if (!trimmedMessage) {
      setTerritoryNoteStatus('방명록 메시지를 입력해 주세요.')
      return
    }

    const nextNote: TerritoryNote = {
      id: crypto.randomUUID(),
      gx: claimDraft.gx,
      gy: claimDraft.gy,
      color: claimDraft.color,
      name: territoryNoteName.trim() || '방문자',
      message: trimmedMessage,
      createdAt: new Date().toISOString(),
    }

    setTerritoryNoteStatus('공유 방명록에 저장 중...')

    try {
      const response = await fetch(TERRITORY_NOTES_API_PATH, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(nextNote),
      })

      if (!response.ok) {
        throw new Error(`Remote save failed: ${response.status}`)
      }

      const data = await response.json()
      const nextNotes = Array.isArray(data.notes)
        ? (data.notes as TerritoryNote[]).slice(0, 20)
        : [nextNote, ...territoryNotes].slice(0, 20)

      setTerritoryNotes(nextNotes)
      applyTerritoryNotesToGlobe(nextNotes)
      persistLocalTerritoryNotes(nextNotes)
      setTerritoryNoteStatus('공유 방명록에 남겼습니다.')
    } catch {
      const nextNotes = [nextNote, ...territoryNotes].slice(0, 20)

      setTerritoryNotes(nextNotes)
      applyTerritoryNotesToGlobe(nextNotes)
      persistLocalTerritoryNotes(nextNotes)
      setTerritoryNoteStatus('공유 저장소 연결 실패. 이 브라우저에 임시 저장했습니다.')
    } finally {
      setTerritoryNoteMessage('')
      setLastOccupant(`${nextNote.name}님이 ${nextNote.gx},${nextNote.gy}에 방명록을 남김!`)
    }
  }

  const myTerritoryCount = useMemo(
    () => Object.values(pixels).filter((pixel) => isUserTerritory(pixel.occupant)).length,
    [pixels],
  )

  const territoryNoteMap = useMemo(
    () =>
      territoryNotes.reduce<Record<string, { name: string; message: string }>>((notes, note) => {
        notes[`${note.gx}_${note.gy}`] = { name: note.name, message: note.message }
        return notes
      }, {}),
    [territoryNotes],
  )

  // 점령 컬러 통계 순위 계산
  const colorStats = useMemo(() => {
    const counts: Record<string, number> = {}
    Object.values(pixels).forEach((p) => {
      counts[p.color] = (counts[p.color] || 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [pixels])

  return (
    <div className="relative w-full h-[600px] md:h-[750px] overflow-hidden bg-[#030712] rounded-2xl border border-white/5 shadow-2xl">
      {/* 깊은 우주 성운 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0a0f24] to-black opacity-95 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-purple-950/20 via-transparent to-transparent pointer-events-none" />

      <Suspense
        fallback={
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent text-stripe-indigo">
            <div className="w-12 h-12 border-4 border-stripe-indigo border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-light animate-pulse stripe-body">3D 홀로그램 우주 공간 로드 중...</p>
          </div>
        }
      >
        <Canvas
          gl={{
            alpha: true,
            antialias: false, // 안티앨리어싱 비활성화로 GPU 픽셀 연산량 50% 절감
            powerPreference: 'high-performance', // 고성능 GPU 설정 명시
          }}
          onCreated={({ gl }) => {
            const canvasEl = gl.domElement
            const handleContextLost = (e: Event) => {
              e.preventDefault()
              console.warn('WebGL context lost. Restoring automatically...')
            }
            canvasEl.addEventListener('webglcontextlost', handleContextLost, false)
          }}
        >
          <PerspectiveCamera makeDefault position={[8, 6, 10]} fov={45} />

          {/* 시네마틱 진입 + 더블클릭 줌 컨트롤러 */}
          <IntroCamera />
          <CameraZoomController target={zoomTarget} orbitRef={orbitRef} />

          {/* 딥 스페이스 스타필드 (3000개 별로 증설) */}
          <Stars radius={120} depth={60} count={3000} factor={6} saturation={0.5} fade speed={0.8} />

          {/* 조명 세팅 */}
          <ambientLight intensity={0.75} />
          <directionalLight position={[5, 8, 5]} intensity={1.8} />
          <pointLight position={[-4, 4, -4]} intensity={3} color="#533afd" distance={10} />
          <pointLight position={[4, -4, 4]} intensity={2} color="#ec4899" distance={10} />

          {/* 파티클 은하수 장식 (각각 절반 개수로 다이어트) */}
          <Sparkles count={40} scale={[10, 8, 10]} size={1.2} speed={0.2} color="#a855f7" opacity={0.6} />
          <Sparkles count={20} scale={[8, 6, 8]} size={1.8} speed={0.3} color="#22d3ee" opacity={0.4} />

          {/* 태양 Lens Flare */}
          <SunGlow />

          {/* 공전 오브젝트 */}
          {satellitesData.map((sat, i) => (
            <OrbitingSatellite key={`sat-${i}`} {...sat} />
          ))}
          <OrbitingMoon />

          {/* 지구본 모델 (실시간 픽셀 땅따먹기 바인딩) */}
          <GlobeModel
            onSelectItem={setActiveItem}
            activeItem={activeItem}
            isInteracting={isInteracting}
            pixels={pixels}
            claimNotes={territoryNoteMap}
            userColor={userColor}
            onRegisterPixel={handleRegisterPixel}
            onCameraZoomTarget={(target) => {
              setZoomTarget(target)
              setTimeout(() => setZoomTarget(null), 2000)
            }}
          />

          {/* 카메라 조작 제어 */}
          <OrbitControls
            ref={orbitRef}
            enableDamping
            dampingFactor={0.05}
            minDistance={3.0}
            maxDistance={8.0}
            onStart={() => {
              setIsInteracting(true)
              setZoomTarget(null)
            }}
            onEnd={() => setIsInteracting(false)}
          />
        </Canvas>
      </Suspense>

      {/* 조작 안내 UI */}
      <div className="absolute top-4 left-4 p-4 rounded-xl bg-slate-900/85 backdrop-blur-md border border-white/10 pointer-events-none max-w-[300px]">
        <h4 className="text-xs font-semibold text-white tracking-wide uppercase stripe-body">Interactive 3D Globe</h4>
        <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed font-light stripe-body">
          🖱️ 드래그로 회전 · 클릭으로 정보 확인
          <br />
          <span className="text-cyan-400 font-medium animate-pulse drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
            🖱️ 지구 표면 클릭 시 픽셀 영토 점령 (직접 참여)
          </span>
          <br />
          🖱️ 핀 더블클릭으로 해당 국가 줌인
          <br />
          ⌨️ ← → 방향키로 핀 탐색 · ESC로 닫기
        </p>
      </div>

      {/* ─── 지구본 내부 영토 방명록 HUD ─── */}
      <div className="absolute top-4 right-4 z-20 w-[min(320px,calc(100%-32px))] rounded-2xl bg-slate-950/82 backdrop-blur-md border border-cyan-300/20 text-white shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold tracking-wider text-cyan-100 uppercase stripe-body">영토 방명록</h4>
              <p className="mt-1 text-[10px] text-slate-400 stripe-body">지구 표면을 점령하고 메시지를 남깁니다</p>
            </div>
            {claimDraft && (
              <span className="rounded-full bg-cyan-300/15 px-2 py-1 font-mono text-[10px] text-cyan-200 border border-cyan-300/20">
                {claimDraft.gx},{claimDraft.gy}
              </span>
            )}
          </div>
        </div>

        <form className="p-4 space-y-3" onSubmit={handleTerritoryNoteSubmit}>
          <input
            type="text"
            value={territoryNoteName}
            onChange={(event) => setTerritoryNoteName(event.target.value)}
            maxLength={24}
            className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-300/60"
            placeholder="이름"
          />
          <textarea
            value={territoryNoteMessage}
            onChange={(event) => setTerritoryNoteMessage(event.target.value)}
            rows={3}
            maxLength={90}
            className="w-full resize-none rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-xs leading-relaxed text-white placeholder:text-slate-500 outline-none focus:border-cyan-300/60"
            placeholder={claimDraft ? '점령한 영토에 남길 메시지' : '먼저 지구 표면을 클릭해 주세요'}
          />
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-[10px] text-cyan-100/70 stripe-body">
              {territoryNoteStatus || '클릭한 영토에 방명록이 연결됩니다'}
            </p>
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-cyan-300 px-3 py-2 text-[11px] font-semibold text-slate-950 transition-colors hover:bg-cyan-200"
            >
              {claimDraft ? '남기기' : '점령 먼저'}
            </button>
          </div>
        </form>

        {territoryNotes.length > 0 && (
          <div className="border-t border-white/10 p-4 pt-3">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-slate-400 stripe-body">
              최근 점령 메시지
            </p>
            <div className="space-y-2">
              {territoryNotes.slice(0, 2).map((note) => (
                <article key={note.id} className="rounded-lg border border-white/10 bg-white/[0.04] p-2.5">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="truncate text-[11px] font-medium text-white">{note.name}</span>
                    <span className="font-mono text-[10px] text-cyan-200">
                      {note.gx},{note.gy}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-[11px] leading-relaxed text-slate-300">{note.message}</p>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── 홀로그래픽 실시간 점령 전황판 UI (Holographic Land Board) ─── */}
      <div className="absolute bottom-4 left-4 p-4 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-white min-w-[260px] shadow-xl max-w-[280px]">
        <h4 className="text-xs font-semibold tracking-wider text-slate-300 uppercase stripe-body flex items-center gap-1.5">
          📡 실시간 홀로그램 점령 현황
        </h4>
        <div className="h-px bg-white/10 my-2" />

        {/* 알림 메시지 */}
        <p className="text-[10px] text-stripe-indigo font-light truncate stripe-body animate-pulse">{lastOccupant}</p>

        {/* 내 고유 점령 컬러 상시 노출 */}
        <div className="mt-3 flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-white/5">
          <span className="text-[10px] text-slate-400 font-light stripe-body">내 고유 컬러</span>
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2 py-1 rounded-md border border-cyan-500/20">
            <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] shadow-[0_0_8px_#06b6d4]" />
            <span className="text-[10.5px] text-[#06b6d4] font-medium tracking-wide stripe-body">네온 사이언 (나)</span>
          </div>
        </div>

        <div className="mt-2 p-2 rounded-lg bg-cyan-400/10 border border-cyan-300/25">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-cyan-100 font-light stripe-body">내 점령 영토</span>
            <span className="font-mono text-[12px] text-cyan-300 font-semibold">{myTerritoryCount} px</span>
          </div>
          <p className="mt-1 text-[10px] text-cyan-100/75 font-light stripe-body truncate">
            {lastUserClaim
              ? `최근 점령: ${lastUserClaim.gx},${lastUserClaim.gy}`
              : '지구 표면을 클릭하면 여기에 표시됩니다'}
          </p>
        </div>

        {/* 점령 순위 통계 */}
        <div className="mt-3.5 space-y-1.5">
          <div className="flex justify-between text-[9px] text-slate-400 font-light stripe-body">
            <span>컬러</span>
            <span>영토 개수</span>
          </div>
          {colorStats.slice(0, 3).map(([color, count], idx) => {
            const isMe = color === '#06b6d4'
            const botItem = virtualBots.find((b) => b.color === color)
            const palItem = colorPalette.find((c) => c.hex === color)
            const label = isMe
              ? '나 (방문자) 👤'
              : botItem
                ? `봇 • ${botItem.name.split(' ')[0]}`
                : palItem
                  ? `봇 • ${palItem.label}`
                  : '봇 • 기타'
            return (
              <div key={color} className="flex items-center justify-between text-xs font-light stripe-body">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: color,
                      boxShadow: isMe ? `0 0 6px ${color}` : 'none',
                    }}
                  />
                  <span className={`text-[11px] ${isMe ? 'text-cyan-400 font-normal' : 'text-slate-300'}`}>
                    {idx + 1}위 • {label}
                  </span>
                </div>
                <span className={`font-mono text-[11px] font-medium ${isMe ? 'text-cyan-400' : 'text-slate-300'}`}>
                  {count} px
                </span>
              </div>
            )
          })}
          <div className="text-[10px] text-slate-400 font-light text-right pt-1 border-t border-white/5">
            총 점령 영토: <span className="font-mono text-white font-medium">{Object.keys(pixels).length} px</span>
          </div>
        </div>
      </div>

      {/* 국가 상세 정보 카드 (실시간 현지 시각 포함) */}
      {activeItem && countryDetails[activeItem] && (
        <div className="absolute bottom-6 right-6 w-[calc(100%-48px)] md:w-[390px] p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-stripe-hairline shadow-2xl animate-fade-in z-20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stripe-indigo/10 text-stripe-indigo text-xs font-medium stripe-body">
                🌐 {activeItem}
              </span>
              {timezones[activeItem] && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-mono stripe-body">
                  🕐 현지 {getLocalTime(activeItem)}
                </span>
              )}
            </div>
            <button
              onClick={() => setActiveItem(null)}
              className="text-slate-400 hover:text-slate-600 text-xs stripe-body ml-2 shrink-0"
            >
              닫기
            </button>
          </div>
          <h3 className="text-base font-medium text-stripe-ink tracking-tight mb-2 stripe-body">
            {countryDetails[activeItem].title}
          </h3>
          <p className="text-xs text-stripe-ink-mute font-light leading-relaxed mb-4 stripe-body">
            {countryDetails[activeItem].description}
          </p>
          <button
            onClick={() => {
              if (activeItem && countryDetails[activeItem]) {
                handleScrollToSection(countryDetails[activeItem].linkId)
              }
            }}
            className="w-full py-2 bg-stripe-indigo hover:bg-stripe-indigo-deep text-white text-xs font-medium rounded-lg shadow-sm transition-colors duration-200 stripe-body"
          >
            {countryDetails[activeItem].btnText}
          </button>
        </div>
      )}
    </div>
  )
}
