const announcements = [
  "🚚 Free shipping on orders over ৳5,000",
  "🔥 Flash Sale — Up to 50% off on selected gadgets",
  "📦 Cash on Delivery available nationwide",
  "⚡ New arrivals every week — Stay tuned!",
];

const TopBar = () => {
  return (
    <div className="bg-primary text-primary-foreground py-2 overflow-hidden">
      <div className="flex animate-slide-left whitespace-nowrap">
        {[...announcements, ...announcements].map((text, i) => (
          <span key={i} className="mx-8 text-xs sm:text-sm font-medium">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TopBar;
