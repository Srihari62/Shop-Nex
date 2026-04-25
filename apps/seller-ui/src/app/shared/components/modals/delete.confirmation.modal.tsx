import React from "react";
import { AlertTriangle, X, RefreshCcw } from "lucide-react";

interface DeleteConfirmationModalProps {
  product: any;
  onClose: () => void;
  onConfirm?: () => void;
  onRestore?: () => void;
}

const DeleteConfirmationModal = ({
  product,
  onClose,
  onConfirm,
  onRestore,
}: DeleteConfirmationModalProps) => {
  if (!product) return null;

  const isRestoring = product?.isDeleted === true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#181824] w-full max-w-md rounded-2xl shadow-2xl border border-[#2d2d3f] overflow-hidden transform scale-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-[#2d2d3f]">
          <div
            className={`flex items-center gap-3 ${isRestoring ? "text-green-500" : "text-red-500"}`}
          >
            <div
              className={`p-2 rounded-full ${isRestoring ? "bg-green-500/10" : "bg-red-500/10"}`}
            >
              {isRestoring ? (
                <RefreshCcw size={24} />
              ) : (
                <AlertTriangle size={24} />
              )}
            </div>
            <h3 className="text-xl font-semibold text-white font-Poppins">
              {isRestoring ? "Restore Product" : "Delete Product"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-[#2d2d3f]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-300 text-base leading-relaxed">
            Are you sure you want to {isRestoring ? "restore" : "delete"}{" "}
            <span className="text-white font-semibold">
              "{product?.title || product?.name || "this product"}"
            </span>
            ?{" "}
            {isRestoring
              ? "This product will become active and visible in your shop again."
              : "This product will be moved to a **Delete State** and permanantly removed after **24Hs**. You can restore this product within 24hrs."}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-[#2d2d3f] bg-[#0B0A10]/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white bg-[#2d2d3f] hover:bg-[#3f3f5a] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={isRestoring ? onRestore : onConfirm}
            className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg shadow-lg transition-all flex items-center gap-2 ${
              isRestoring
                ? "bg-green-600 hover:bg-green-700 shadow-green-600/20"
                : "bg-red-600 hover:bg-red-700 shadow-red-600/20"
            }`}
          >
            {isRestoring ? "Yes, Restore Product" : "Yes, Delete Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
