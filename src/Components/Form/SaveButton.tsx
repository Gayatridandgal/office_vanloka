interface SaveButtonProps {
  onClick?: () => void;
  label: string;
}

const SaveButton = ({ label, onClick }: SaveButtonProps) => {
  return (
    <button
      type="submit"
      onClick={onClick}
      className={`bg-purple-200 text-purple-900 font-bold py-1 px-4 rounded-lg hover:bg-purple-300 uppercase transition-colors`}
    >
      {label}
    </button>
  );
};

export default SaveButton;
