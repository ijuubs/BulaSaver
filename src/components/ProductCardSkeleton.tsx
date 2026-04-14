import React from 'react';

const ProductCardSkeleton: React.FC = () => {
  return (
    <article className="rounded-[2.5rem] bg-white border border-slate-100 shadow-sm p-5 h-full animate-pulse">
      <div className="h-40 w-full bg-slate-100 rounded-3xl mb-4"></div>
      <div className="h-6 w-3/4 bg-slate-100 rounded-lg mb-2"></div>
      <div className="h-4 w-1/2 bg-slate-100 rounded-lg mb-6"></div>
      <div className="h-10 w-full bg-slate-100 rounded-2xl"></div>
    </article>
  );
};

export default ProductCardSkeleton;
