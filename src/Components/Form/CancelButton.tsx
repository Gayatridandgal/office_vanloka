interface SaveButtonProps {
  onClick?: () => void;
  label: string;
}

const CancelButton = ({ label, onClick }: SaveButtonProps) => {
  return (
    <button
      type="submit"
      onClick={onClick}
      className={`bg-gray-400 text-purple-950 font-bold py-1 px-4 rounded-lg hover:bg-gray-500 uppercase transition-colors`}
    >
      {label}
    </button>
  );
};

export default CancelButton;
