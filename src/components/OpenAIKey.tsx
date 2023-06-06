import { FC } from "react";

interface OpenAIKeyInputProps {
  value: string;
  onChange: (s: string) => void;
}
export const OpenAIKeyInput: FC<OpenAIKeyInputProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="flex cursor-pointer items-center justify-center">
      <input
        value={value}
        type={"password"}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your key"
        className="text-input w-full shadow-[0_0_10px_rgba(0,0,0,0.10)] outline-none"
      />
    </div>
  );
};
