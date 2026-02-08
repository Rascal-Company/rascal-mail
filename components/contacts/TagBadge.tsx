import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TagBadgeProps {
  tag: string;
  onRemove?: () => void;
}

export function TagBadge({ tag, onRemove }: TagBadgeProps) {
  return (
    <Badge variant="outline" className="gap-1">
      {tag}
      {onRemove && (
        <button onClick={onRemove} className="ml-1 hover:text-destructive">
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  );
}
