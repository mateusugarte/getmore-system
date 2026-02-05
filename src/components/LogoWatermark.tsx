export const LogoWatermark = () => {
  return (
    <div className="fixed inset-0 z-[-10] flex items-center justify-center pointer-events-none overflow-hidden">
      <img
        src="/logo.png"
        alt=""
        className="w-[50vw] max-w-[600px] h-auto opacity-[0.03] dark:opacity-[0.04] select-none"
        aria-hidden="true"
      />
    </div>
  );
};
