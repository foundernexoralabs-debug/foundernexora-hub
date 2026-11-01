// @polsia:user-owned — one icon per Renor room, shared by the capabilities page and its index.
import {
  Code2,
  Cpu,
  FolderKanban,
  Globe,
  KeyRound,
  type LucideIcon,
  MessageSquare,
  Mic,
  Youtube,
} from 'lucide-react';
import type { CapabilityIcon } from '@/lib/business/capabilities';

export const AREA_ICONS: Record<CapabilityIcon, LucideIcon> = {
  chat: MessageSquare,
  code: Code2,
  globe: Globe,
  folder: FolderKanban,
  mic: Mic,
  video: Youtube,
  cpu: Cpu,
  key: KeyRound,
};
