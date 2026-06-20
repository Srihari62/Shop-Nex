import Link from "next/link";
import React from "react";

interface Props {
  icon: React.ReactNode;
  title: string;
  isActive?: boolean;
  href?: string;
  onClick?: () => void;
}

const SidebarItem = ({ icon, title, isActive, href, onClick }: Props) => {
  const content = (
    <div
      onClick={onClick}
      className={`flex gap-2 w-full min-h-12 h-full items-center px-[13px] rounded-lg cursor-pointer transition hover:bg-[#2b2f31] 
    ${
      isActive &&
      "scale-[.98] bg-[#0f3158] fill-blue-200 hover:!bg-[#0f3158d6]"
    } `}
    >
      {icon}
      <h5 className="text-slate-200 text-lg">{title}</h5>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="my-2 block">
        {content}
      </Link>
    );
  }

  return <div className="my-2 block">{content}</div>;
};

export default SidebarItem;
