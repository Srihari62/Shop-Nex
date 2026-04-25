import React from "react";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

const SectionTitle = ({ title, subtitle }: SectionTitleProps) => {
  return (
    <div className="flex flex-col gap-2 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
          {title}
        </h2>
        {/* Decorative line that appears on slightly larger screens */}
        <div className="hidden sm:block h-1 bg-gradient-to-r from-indigo-500 to-transparent flex-grow max-w-[80px] rounded-full mt-2 opacity-80"></div>
      </div>
      {subtitle && (
        <p className="text-base md:text-lg text-gray-500 font-medium max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionTitle;
