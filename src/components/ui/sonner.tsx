import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          // Default (success) toasts — use primary theme color
          toast:
            "group toast group-[.toaster]:bg-primary group-[.toaster]:text-primary-foreground group-[.toaster]:border-primary-deep group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
          title:
            "group-[.toast]:text-primary-foreground group-[.toast]:font-semibold",
          description:
            "group-[.toast]:text-primary-foreground/80",
          actionButton:
            "group-[.toast]:bg-primary-foreground group-[.toast]:text-primary group-[.toast]:font-semibold",
          cancelButton:
            "group-[.toast]:bg-primary-deep group-[.toast]:text-primary-foreground",
          closeButton:
            "group-[.toast]:bg-primary-deep group-[.toast]:text-primary-foreground group-[.toast]:border-primary-deep",
          icon: "group-[.toast]:text-primary-foreground",

          // Error toasts — always destructive red regardless of theme
          error:
            "!bg-destructive !text-destructive-foreground !border-destructive/60 !shadow-lg !rounded-xl",
          warning:
            "!bg-yellow-500 !text-white !border-yellow-600/60 !shadow-lg !rounded-xl",
          info:
            "!bg-blue-500 !text-white !border-blue-600/60 !shadow-lg !rounded-xl",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
