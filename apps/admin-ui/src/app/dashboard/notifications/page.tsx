import React from 'react';

const NotificationsPage = () => {
  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight capitalize'>
          notifications
        </h1>
        <p className='text-slate-500 dark:text-slate-400 font-medium'>
          Manage and monitor your ShopNex notifications here.
        </p>
      </div>

      <div className='h-[500px] rounded-[40px] bg-[#e0e5ec] dark:bg-[#1a1c20]
        shadow-[inset_15px_15px_30px_#bebebe,inset_-15px_-15px_30px_#ffffff]
        dark:shadow-[inset_15px_15px_30px_#0e0f11,inset_-15px_-15px_30px_#26292f]
        flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-800'>
        <p className='text-slate-400 font-bold uppercase tracking-[0.3em]'>notifications Content Placeholder</p>
      </div>
    </div>
  );
};

export default NotificationsPage;
