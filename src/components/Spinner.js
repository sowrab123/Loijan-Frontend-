import { FaSpinner } from 'react-icons/fa';

export default function Spinner({ size = 'md', text = 'Loading...', className = '' }) {
  const getSize = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'md':
        return 'h-6 w-6';
      case 'lg':
        return 'h-8 w-8';
      case 'xl':
        return 'h-12 w-12';
      default:
        return 'h-6 w-6';
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex items-center space-x-3">
        <FaSpinner className={`animate-spin text-green-600 ${getSize()}`} />
        {text && <span className="text-gray-600">{text}</span>}
      </div>
    </div>
  );
} 