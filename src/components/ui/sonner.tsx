import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-right"
      closeButton={true}
      duration={4000}
      visibleToasts={5}
      expand={true}
      gap={10}
      toastOptions={{
        classNames: {
          toast:
            "group toast font-sans group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border group-[.toaster]:border-border/80 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-xl group-[.toaster]:p-3.5 group-[.toaster]:min-w-[320px] group-[.toaster]:max-w-[420px] transition-all",
          title:
            "group-[.toast]:text-foreground group-[.toast]:font-bold group-[.toast]:text-sm group-[.toast]:tracking-tight",
          description:
            "group-[.toast]:text-muted-foreground group-[.toast]:text-xs group-[.toast]:mt-1 leading-relaxed",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-semibold group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-xs hover:opacity-90 transition-opacity",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-xs",
          closeButton:
            "group-[.toast]:bg-background/80 group-[.toast]:text-muted-foreground hover:group-[.toast]:text-foreground group-[.toast]:border group-[.toast]:border-border/60 hover:group-[.toast]:border-border group-[.toast]:rounded-lg transition-all",
          icon: "group-[.toast]:w-5 group-[.toast]:h-5 group-[.toast]:mr-2 shrink-0",

          // Type-specific classes with React-Toastify left borders & icon hues
          success:
            "!border-l-[5px] !border-l-emerald-500 dark:!border-l-emerald-400 [&_[data-icon]]:text-emerald-500",
          error:
            "!border-l-[5px] !border-l-rose-500 dark:!border-l-rose-400 [&_[data-icon]]:text-rose-500",
          warning:
            "!border-l-[5px] !border-l-amber-500 dark:!border-l-amber-400 [&_[data-icon]]:text-amber-500",
          info:
            "!border-l-[5px] !border-l-sky-500 dark:!border-l-sky-400 [&_[data-icon]]:text-sky-500",
          default:
            "!border-l-[5px] !border-l-primary [&_[data-icon]]:text-primary",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
