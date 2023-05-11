import clsx from "clsx";
import { FC, useState, MouseEventHandler } from "react";
import { Preset } from "../../db";

interface PresetSettings {
  originalPreset?: Preset;
  onSubmit: (preset: Omit<Preset, "id" | "ts">) => void;
  onClose: () => void;
}
export const PresetSettings: FC<PresetSettings> = ({
  originalPreset,
  onSubmit,
  onClose,
}) => {
  const [title, setTitle] = useState(originalPreset?.title ?? "");
  const [temprature, setTemprature] = useState(
    originalPreset?.temprature ?? "1.0"
  );
  const [shortcut, setShortcut] = useState(originalPreset?.shortcut ?? null);
  const [systemPrompt, setSystemPrompt] = useState(
    originalPreset?.systemPrompt ?? ""
  );
  const [model, setGptVersion] = useState<"gpt-4" | "gpt-3.5-turbo">(
    originalPreset?.models[0] ?? "gpt-4"
  );

  const t = Number(temprature);
  const isFaultyTemprature = Number.isNaN(t) || t < 0 || t > 1;

  const handleSubmit = () => {
    onSubmit({
      title,
      models: [model],
      systemPrompt,
      temprature: t,
      ...(shortcut != null && { shortcut }),
    });
    onClose();
  };

  const handleClickDropshadow: MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const disable = title === "" || isFaultyTemprature;
  return (
    <div
      className="fixed left-0 top-0 flex h-screen w-screen cursor-pointer items-center justify-center bg-[rgba(0,0,0,0.4)]"
      onClick={handleClickDropshadow}
    >
      <div className="flex w-[500px] cursor-auto flex-col rounded bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="select-none text-[16px] font-medium">Title</div>
          <div
            className="flex h-8 w-8 cursor-pointer select-none items-center justify-center rounded hover:bg-gray-100 active:bg-gray-200"
            onClick={onClose}
          >
            <span className="material-symbols-outlined material-fat">
              close
            </span>
          </div>
        </div>
        <input
          type="text"
          className="text-input mb-4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="mb-2 select-none text-[16px] font-medium">Model</div>
        <div className="mb-4 flex h-[40px] w-full select-none rounded border border-dark-gray">
          <button
            onClick={() => setGptVersion("gpt-4")}
            className={clsx(
              "flex flex-1 items-center justify-center text-[13px]",
              model === "gpt-4" && "bg-dark-gray text-white"
            )}
          >
            GPT 4
          </button>
          <button
            onClick={() => setGptVersion("gpt-3.5-turbo")}
            className={clsx(
              "flex flex-1 items-center justify-center text-[13px]",
              model === "gpt-3.5-turbo" && "bg-dark-gray text-white"
            )}
          >
            GPT 3.5
          </button>
        </div>
        <div className="mb-2 select-none text-[16px] font-medium">
          {"Temprature (0-1)"}
        </div>
        <input
          type="text"
          className={clsx(
            "text-input mb-4",
            isFaultyTemprature && "!border-red"
          )}
          value={temprature}
          onChange={(e) => setTemprature(e.target.value)}
        />
        <div className="mb-1 select-none text-[16px] font-medium">
          {`Shortcut: ${
            shortcut != null ? `⌥ + ${shortcut.toUpperCase()}` : "None"
          }`}
        </div>
        <div className="mb-4 flex h-[40px] w-full select-none rounded border border-dark-gray">
          <button
            onClick={() => setShortcut((p) => (p === "a" ? null : "a"))}
            className={clsx(
              "flex flex-1 items-center justify-center text-[13px]",
              shortcut === "a" && "bg-dark-gray text-white"
            )}
          >
            A
          </button>
          <button
            onClick={() => setShortcut((p) => (p === "s" ? null : "s"))}
            className={clsx(
              "flex flex-1 items-center justify-center text-[13px]",
              shortcut === "s" && "bg-dark-gray text-white"
            )}
          >
            S
          </button>
          <button
            onClick={() => setShortcut((p) => (p === "d" ? null : "d"))}
            className={clsx(
              "flex flex-1 items-center justify-center text-[13px]",
              shortcut === "d" && "bg-dark-gray text-white"
            )}
          >
            D
          </button>
          <button
            onClick={() => setShortcut((p) => (p === "f" ? null : "f"))}
            className={clsx(
              "flex flex-1 items-center justify-center text-[13px]",
              shortcut === "f" && "bg-dark-gray text-white"
            )}
          >
            F
          </button>
        </div>
        <div className="mb-2 select-none text-[16px] font-medium">
          System prompt
        </div>
        <textarea
          value={systemPrompt}
          className="text-input mb-4 min-h-[100px] py-2"
          onChange={(e) => setSystemPrompt(e.target.value)}
        />
        <button
          disabled={disable}
          className={
            "h-[40px] rounded bg-dark-gray text-[16px] text-white enabled:hover:bg-dark-gray-hovered enabled:active:bg-dark-gray-active disabled:opacity-80"
          }
          onClick={handleSubmit}
        >
          {originalPreset == null ? "Create chat config" : "Update chat config"}
        </button>
      </div>
    </div>
  );
};
