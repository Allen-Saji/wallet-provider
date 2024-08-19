export const Button = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) => {
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="bg-purple-400 text-white hover:bg-purple-500 font-bold py-2 px-4 rounded"
      >
        {children}
      </button>
    </>
  );
};

export const DashboardButton = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) => {
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="px-8 py-4 bg-purple-500 text-white font-semibold text-lg rounded-lg hover:bg-purple-700 transition"
      >
        {children}
      </button>
    </>
  );
};
