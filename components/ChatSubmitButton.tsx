import { IS_BROWSER } from "$fresh/runtime.ts";
import { Button, type ButtonProps } from "./Button.tsx";

export function ChatSubmitButton(props: ButtonProps) {
  // Destructure `class` from props to apply alongside Tailwind classes
  const { class: className, ...buttonProps } = props;

  return (
    <Button
      {...buttonProps}
      // Spread the rest of the buttonProps here
      disabled={!IS_BROWSER || props.disabled}
      class={`disabled:opacity-75 disabled:cursor-not-allowed p-2 ${className}`} // Apply external class here
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class={`icon icon-tabler icons-tabler-outline icon-tabler-arrow-narrow-up text-white`}
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 5v14" />
        <path d="M16 9l-4 -4l-4 4" />
      </svg>
    </Button>
  );
}
