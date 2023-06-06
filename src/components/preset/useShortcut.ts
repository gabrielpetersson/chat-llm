import { useEffect } from "react";
import { startNewConversation } from "../../state/conversations";
import { useAppDispatch } from "../../state/store";
import { useLiveQuery } from "dexie-react-hooks";
import { dbSelectPresets } from "../../db/db-selectors";

const SHORTCUTS: Record<string, string> = {
  KeyA: "a",
  KeyS: "s",
  KeyD: "d",
  KeyF: "f",
  Space: "Space",
};

export const usePresetShortcut = () => {
  const dispatch = useAppDispatch();
  const presets = useLiveQuery(() => dbSelectPresets(), []);

  useEffect(() => {
    if (presets == null) {
      return;
    }

    const getPresetId = (key: string): number | "default" | null => {
      const shortcut = SHORTCUTS[key];
      if (shortcut == null) {
        return null;
      }
      if (shortcut === "Space") {
        return "default";
      }
      const triggerPresets = presets.filter((p) => p.shortcut === shortcut);
      if (triggerPresets.length === 0) {
        return null;
      }
      // TODO(gab): don't allow setting same shortcuts in settings
      if (triggerPresets.length > 1) {
        window.alert(
          `Multiple shortcuts for '${shortcut}' is set. Keep only one!`
        );
      }
      return triggerPresets[0].id;
    };

    const onKeydown = (e: KeyboardEvent) => {
      if (!e.altKey) {
        return;
      }
      const presetId = getPresetId(e.code);
      if (presetId == null) {
        return;
      }
      dispatch(
        startNewConversation({
          openInNewPane: e.ctrlKey,
          presetId: presetId === "default" ? undefined : presetId,
        })
      );
    };
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, [dispatch, presets]);
};
