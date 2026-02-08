import { useShareIntent } from "@/hooks/useShareIntent";

export function ShareIntentHandler() {
  // This component just uses the hook to handle share intents
  // It doesn't render anything
  useShareIntent();
  return null;
}
