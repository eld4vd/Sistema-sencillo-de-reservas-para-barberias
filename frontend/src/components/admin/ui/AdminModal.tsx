import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface AdminModalProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  size?: "md" | "lg" | "xl" | "full";
  footer?: React.ReactNode;
}

const modalVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 24, scale: 0.96 },
};

const sizeStyles: Record<NonNullable<AdminModalProps["size"]>, { container: string; content: string; dialog: string }> = {
  md: {
    container: "max-h-[90vh]",
    dialog: "max-w-xl",
    content: "max-h-[60vh]",
  },
  lg: {
    container: "max-h-[90vh]",
    dialog: "max-w-3xl",
    content: "max-h-[60vh]",
  },
  xl: {
    container: "max-h-[92vh]",
    dialog: "max-w-5xl",
    content: "max-h-[72vh]",
  },
  full: {
    container: "max-h-[95vh]",
    dialog: "max-w-[96vw]",
    content: "max-h-[80vh]",
  },
};

const AdminModal = ({ open, title, children, onClose, size = "md", footer }: AdminModalProps) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.documentElement.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`relative w-full overflow-hidden rounded-3xl border border-gray-300 bg-white p-7 text-gray-900 shadow-[0_28px_80px_rgba(0,0,0,0.15)] ${
              sizeStyles[size]?.container ?? sizeStyles.md.container
            } ${sizeStyles[size]?.dialog ?? sizeStyles.md.dialog}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-blue-600">Gestión Sunsetz</p>
                <h3
                  id="modal-title"
                  className="mt-3 text-2xl font-bold text-gray-900"
                >
                  {title}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar modal"
                className="rounded-full border border-gray-300 px-4 py-1 text-xs uppercase tracking-[0.28em] text-gray-700 transition hover:border-blue-500 hover:text-blue-600"
              >
                Cerrar
              </button>
            </div>

            <div className={`${sizeStyles[size]?.content ?? sizeStyles.md.content} overflow-y-auto pr-1`}>{children}</div>

            {footer ? <div className="mt-6 flex justify-end gap-3">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default AdminModal;
