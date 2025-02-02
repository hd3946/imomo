import { create } from 'zustand';

// 상태 인터페이스 정의
interface StoreState {
  count: number;
  inc: () => void;
}

// Zustand 스토어 생성
export const useStore = create<StoreState>((set) => ({
  count: 1,
  inc: () => set((state) => ({ count: state.count + 1 })),
}));
