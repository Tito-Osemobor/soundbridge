import Workspace from '@/features/transfer/Workspace';

export default function Hub() {
  return <Workspace mode={process.env.NEXT_PUBLIC_DEMO_ONLY === '1' ? 'demo' : 'real'} />;
}
