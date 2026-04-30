import React from "react";
import { Controller, useFieldArray } from "react-hook-form";
import Input from "../input";
import { PlusCircle, Trash2 } from "lucide-react";

const CustomSpecifications = ({ control, errors }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "custom_specifications",
  });

  return (
    <div>
      <label className="block font-semibold text-gray-300 mb-1" htmlFor="">
        Custom Specifications
      </label>
      <div className="flex flex-col gap-3">
        {fields?.map((item, index) => (
          <div key={item.id} className="flex flex-col w-full">
            <div className="flex gap-2 items-center">
              <Controller
                name={`custom_specifications.${index}.name`}
                control={control}
                rules={{ required: "Specification name is required" }}
                render={({ field }) => (
                  <div className="flex-1">
                    <Input
                      label="Specification Name"
                      placeholder="e.g.., Battery Life, Weight, Material"
                      {...field}
                    />
                    {(errors as any).custom_specifications?.[index]?.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {(errors as any).custom_specifications[index].name.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                name={`custom_specifications.${index}.value`}
                control={control}
                rules={{ required: "Specification Value is required" }}
                render={({ field }) => (
                  <div className="flex-1">
                    <Input
                      label="Specification Value"
                      placeholder="e.g.., 4000mah, 1.5kg, Cotton"
                      {...field}
                    />
                    {(errors as any).custom_specifications?.[index]?.value && (
                      <p className="text-red-500 text-xs mt-1">
                        {(errors as any).custom_specifications[index].value.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <button
                type="button"
                className="text-red-500 hover:text-red-700 mt-6"
                onClick={() => remove(index)}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="flex items-center text-blue-500 hover:text-blue-600 mt-2"
          onClick={() => append({ name: "", value: "" })}
        >
          <PlusCircle size={20} className="mr-1" /> Add Specification
        </button>
      </div>
      {(errors as any).custom_specifications && !Array.isArray((errors as any).custom_specifications) && (
        <p className="text-red-500 text-xs mt-1">
          {(errors as any).custom_specifications.message}
        </p>
      )}
    </div>
  );
};

export default CustomSpecifications;
