interface SectionProps<T> {
  Header: React.ReactNode;
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactNode;
}

export function Section<T>({ Header, data, renderItem }: SectionProps<T>) {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-5 md:px-10">
      {Header}
      {/* Mobile: horizontal scroll; Desktop: wrapping grid */}
      <div className="flex flex-row flex-nowrap overflow-x-auto gap-4 mt-6 md:flex-wrap md:overflow-x-visible">
        {data.map((item, index) => renderItem({ item, index }))}
      </div>
    </div>
  );
}
