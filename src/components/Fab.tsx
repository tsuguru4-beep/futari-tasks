import { Icon } from './Icon';

export function Fab({ label, onClick }: { label: string; onClick(): void }) {
  return (
    <button type="button" className="fab" onClick={onClick} aria-label={label}>
      <Icon name="plus" size={30} />
    </button>
  );
}
