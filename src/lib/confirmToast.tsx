import toast from "react-hot-toast";

let isConfirmOpen = false;

export const confirmToast = (message: string, onConfirm: () => void) => {
  if (isConfirmOpen) return;

  isConfirmOpen = true;

  toast.custom(
    (t) => (
      <div
        className="bg-white shadow-md border px-4 py-3 rounded flex items-center gap-4"
        style={{ maxWidth: 320 }}
      >
        <div className="flex-1 text-sm text-gray-800">{message}</div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              isConfirmOpen = false;
              onConfirm();
            }}
            className="text-sm text-white bg-red-600 px-2 py-1 rounded hover:bg-red-700"
          >
            Да
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              isConfirmOpen = false;
            }}
            className="text-sm text-gray-500 hover:text-black"
          >
            Нет
          </button>
        </div>
      </div>
    ),
    {
      duration: Infinity,
      position: "top-center",
    }
  );
};
