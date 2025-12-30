import React, { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import Input from "../input";
import { Plus, X } from "lucide-react";

const CustomProperties = ({ control, errors }: any) => {
  const [properties, setProperties] = useState<
    { label: string; values: string[] }[]
  >([]);
  const [newLabel, setNewLabel] = useState("");
  const [newValues, setNewValues] = useState("");

  return (
    <div>
      <div className="flex flex-col gap-3">
        <Controller
          name={`custom_properties`}
          control={control}
          render={({ field }) => {
            useEffect(() => {
              field.onChange(properties);
            }, [properties]);

            const addProperty = () => {
              if (!newLabel.trim()) return;
              setProperties([...properties, { label: newLabel, values: [] }]);
              setNewLabel("");
            };

            const addValue = (index: number) => {
              if (!newValues.trim()) return;
              const updatedProperties = [...properties];
              updatedProperties[index].values.push(newValues);
              setProperties(updatedProperties);
              setNewValues("");
            };

            const removeProperty = (index: number) => {
              setProperties(properties.filter((_, i) => i !== index));
            };

            return (
              <div className="mt-2">
                <label className=" block font-semibold text-gray-300 mb-1">
                  Custom Properties
                </label>
                <div className="flex flex-col gap-3">
                  {/* {Existing Properties} */}
                  {properties.map((property, index) => (
                    <div
                      key={index}
                      className="border border-gray-700 p-3 rounded-lg bg-gray-900"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">
                          {property.label}
                        </span>
                        <button
                          onClick={() => removeProperty(index)}
                          type="button"
                        >
                          <X size={18} className="text-red-500" />
                        </button>
                      </div>
                      {/*  Add Values to property*/}
                      <div className="mt-2 gap-2 flex items-center">
                        <input
                          type="text"
                          value={newValues}
                          placeholder="Enter Value"
                          onChange={(e) => setNewValues(e.target.value)}
                          className="border outline-none border-gray-700 bg-gray-800 p-2 rounded-md text-white w-full"
                        />
                        <button
                          type="button"
                          onClick={() => addValue(index)}
                          className="bg-blue-500  hover:bg-blue-700 text-white px-3 py-1 rounded-md"
                        >
                          Add
                        </button>
                      </div>

                      {/* Show Values */}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {property.values.map((value, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-gray-700 text-white rounded-md text-sm"
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {/* Add New Property */}
                  <div className="flex gap-2 items-center mt-1">
                    <Input
                      placeholder="Enter Property Label(e.g., Color, Material)"
                      value={newLabel}
                      onChange={(e: any) => setNewLabel(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={addProperty}
                      className="bg-blue-500  text-white  px-3 py-2 rounded-md flex items-center"
                    >
                      <Plus size={16} />
                      Add
                    </button>
                  </div>
                </div>
                {errors.custom_properties && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.custom_properties.message as string}
                  </p>
                )}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};

export default CustomProperties;
