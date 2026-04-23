import { X } from "lucide-react";
import React from "react";

const DeleteDiscountCodeModal = ({
  discount,
  onClose,
  onConfirm,
}: {
  discount: any;
  onClose: (e: boolean) => void;
  onConfirm?: any;
}) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg">
        <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-3">
          <h3 className="text-white text-xl font-semibold">
            Delete Discount Code
          </h3>
          <X
            className="text-gray-400 hover:text-white"
            size={22}
            onClick={() => onClose(false)}
          />
        </div>
        {/* warning message */}
        <p className="text-gray-300 mt-2">
          Are you sure you want to delete this discount code{" "}
          <span className="text-white font-semibold">
            {`"${discount?.discountCode}"`}
          </span>{" "}
          ? <br /> This Action Cannot Be Undone!
        </p>

        {/* action buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => onClose(false)}
            className="px-4 py-2 border border-gray-600 hover:bg-gray-700 text-gray-300 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-400 hover:bg-red-600 text-white rounded-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDiscountCodeModal;
