interface SaveButtonProps {
  onClick?: () => void;
  label: string;
}

const SaveButton = ({ label, onClick }: SaveButtonProps) => {
  return (
    <button
      type="submit"
      onClick={onClick}
      className={`bg-green-400 text-purple-950 font-bold py-1 px-4 rounded-lg hover:bg-green-500 uppercase transition-colors`}
    >
      {label}
    </button>
  );
};

export default SaveButton;
